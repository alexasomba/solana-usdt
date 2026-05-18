import { formatTokenAmount, parseTokenAmount } from "./amounts.js";
import { normalizeAddress } from "./context.js";
import { DEFAULT_REFERENCE_PREFIX } from "./constants.js";
import { SolanaUsdtError } from "./errors.js";
import { createMemo, createReference, parseMemoReference } from "./idempotency.js";
import { callRpc, getPath, requireRpcMethod } from "./rpc.js";
import { retrieveTransaction } from "./transactions.js";
import type {
  ClientContext,
  PaymentCreateRequestInput,
  PaymentMonitorInput,
  PaymentMonitorResult,
  PaymentRequest,
  PaymentVerifyInput,
  VerifiedPayment,
} from "./types.js";

export function createPaymentsModule(ctx: ClientContext) {
  return {
    createRequest(input: PaymentCreateRequestInput): PaymentRequest {
      const amount = parseTokenAmount(input.amount, ctx.decimals);
      const reference = input.reference ?? createReference(DEFAULT_REFERENCE_PREFIX);
      return {
        reference,
        recipient: input.recipient ? normalizeAddress(input.recipient, "recipient") : undefined,
        mint: ctx.mint,
        amount,
        displayAmount: formatTokenAmount(amount, ctx.decimals),
        decimals: ctx.decimals,
        memo: createMemo(reference, DEFAULT_REFERENCE_PREFIX),
        metadata: input.metadata,
        createdAt: new Date().toISOString(),
      };
    },

    async verify(input: PaymentVerifyInput): Promise<VerifiedPayment> {
      if (!input.signature && !input.reference) {
        throw new SolanaUsdtError({
          code: "PAYMENT_NOT_FOUND",
          message: "Provide either a transaction signature or memo reference to verify a payment.",
        });
      }
      if (input.signature) {
        const payment = await verifySignature(ctx, input.signature, input);
        if (payment) return payment;
      }
      if (input.reference && input.recipient) {
        const monitored = await monitorPayments(ctx, { recipient: input.recipient, limit: 20 });
        const payment = monitored.payments.find(
          (candidate) => candidate.reference === input.reference,
        );
        if (payment) return assertExpectedPayment(ctx, payment, input);
      }
      return { found: false, reference: input.reference, signature: input.signature };
    },

    async monitor(input: PaymentMonitorInput): Promise<PaymentMonitorResult> {
      return monitorPayments(ctx, input);
    },
  };
}

async function verifySignature(
  ctx: ClientContext,
  signature: string,
  input: PaymentVerifyInput,
): Promise<VerifiedPayment | undefined> {
  const status = await retrieveTransaction(ctx, signature);
  const payment = extractVerifiedPayment(ctx, status.transaction, signature);
  if (!payment) return undefined;
  payment.slot = status.slot;
  payment.confirmationStatus = status.confirmationStatus;
  return assertExpectedPayment(ctx, payment, input);
}

async function monitorPayments(
  ctx: ClientContext,
  input: PaymentMonitorInput,
): Promise<PaymentMonitorResult> {
  const recipient = normalizeAddress(input.recipient, "recipient");
  const getSignaturesForAddress = requireRpcMethod(ctx, "getSignaturesForAddress");
  const signatures = await callRpc<unknown[]>(ctx, "getSignaturesForAddress", async () => {
    const response = await getSignaturesForAddress
      .call(ctx.rpc, recipient, {
        before: input.cursor,
        limit: input.limit ?? 20,
      })
      .send();
    return Array.isArray(response) ? response : [];
  });

  const payments: VerifiedPayment[] = [];
  for (const row of signatures) {
    const signature =
      typeof row === "object" && row !== null
        ? (row as Record<string, unknown>).signature
        : undefined;
    if (typeof signature !== "string") continue;
    const status = await retrieveTransaction(ctx, signature);
    const payment = extractVerifiedPayment(ctx, status.transaction, signature);
    if (payment) {
      payment.slot = status.slot;
      payment.confirmationStatus = status.confirmationStatus;
      payments.push(payment);
    }
  }

  const last = signatures.at(-1);
  const cursor =
    typeof last === "object" && last !== null
      ? (last as Record<string, unknown>).signature
      : undefined;
  return { cursor: typeof cursor === "string" ? cursor : undefined, payments };
}

function assertExpectedPayment(
  ctx: ClientContext,
  payment: VerifiedPayment,
  input: PaymentVerifyInput,
): VerifiedPayment {
  if (input.reference && payment.reference !== input.reference) {
    throw mismatch("Payment reference did not match.", payment);
  }
  if (input.amount !== undefined) {
    const expectedAmount = parseTokenAmount(input.amount, ctx.decimals);
    if (payment.amount !== expectedAmount) throw mismatch("Payment amount did not match.", payment);
  }
  if (input.recipient) {
    const recipient = normalizeAddress(input.recipient, "recipient");
    if (payment.recipient && payment.recipient !== recipient)
      throw mismatch("Payment recipient did not match.", payment);
  }
  return { ...payment, found: true };
}

function extractVerifiedPayment(
  ctx: ClientContext,
  transactionResponse: unknown,
  signature: string,
): VerifiedPayment | undefined {
  const tx = getPath(transactionResponse, ["transaction"]) ?? transactionResponse;
  const message = getPath(tx, ["message"]) ?? getPath(tx, ["transaction", "message"]);
  const instructions = getPath(message, ["instructions"]);
  if (!Array.isArray(instructions)) return undefined;

  let memo: string | undefined;
  let reference: string | undefined;
  let recipient: string | undefined;
  let amount: bigint | undefined;

  for (const instruction of instructions) {
    const parsedType = getPath(instruction, ["parsed", "type"]);
    const parsedInfo = getPath(instruction, ["parsed", "info"]);
    const program = getPath(instruction, ["program"]);
    if (program === "spl-memo") {
      const parsed = getPath(instruction, ["parsed"]);
      memo =
        typeof parsed === "string" ? parsed : typeof parsedInfo === "string" ? parsedInfo : memo;
      if (memo) reference = parseMemoReference(memo, DEFAULT_REFERENCE_PREFIX) ?? reference;
    }
    if (parsedType === "transferChecked" && typeof parsedInfo === "object" && parsedInfo !== null) {
      const info = parsedInfo as Record<string, unknown>;
      if (info.mint === ctx.mint) {
        recipient = typeof info.destination === "string" ? info.destination : recipient;
        const rawAmount = getPath(info, ["tokenAmount", "amount"]) ?? info.amount;
        if (
          typeof rawAmount === "string" ||
          typeof rawAmount === "number" ||
          typeof rawAmount === "bigint"
        ) {
          amount = BigInt(rawAmount);
        }
      }
    }
  }

  if (!reference && !amount) return undefined;
  return {
    found: true,
    signature,
    reference,
    recipient,
    amount,
    displayAmount: amount === undefined ? undefined : formatTokenAmount(amount, ctx.decimals),
    memo,
  };
}

function mismatch(message: string, payment: VerifiedPayment): SolanaUsdtError {
  return new SolanaUsdtError({
    code: "PAYMENT_MISMATCH",
    message,
    signature: payment.signature,
    slot: payment.slot,
    meta: { payment },
  });
}
