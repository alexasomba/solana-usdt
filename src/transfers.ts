import {
  getCreateAssociatedTokenIdempotentInstruction,
  getTransferCheckedInstruction,
} from "@solana-program/token";
import { getAddMemoInstruction } from "@solana-program/memo";
import {
  appendTransactionMessageInstructions,
  createTransactionMessage,
  getBase64EncodedWireTransaction,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
  type Instruction,
} from "@solana/kit";
import { formatTokenAmount, parseTokenAmount } from "./amounts.js";
import { normalizeAddress } from "./context.js";
import { DEFAULT_REFERENCE_PREFIX } from "./constants.js";
import { SolanaUsdtError } from "./errors.js";
import { createMemo, createReference } from "./idempotency.js";
import { callRpc, getPath, requireRpcMethod } from "./rpc.js";
import { getAssociatedTokenAddress, getTokenAccountAmount } from "./token.js";
import { waitForTransaction } from "./transactions.js";
import type {
  ClientContext,
  TransferCreateInput,
  TransferQuote,
  TransferQuoteInput,
  TransferResult,
} from "./types.js";

const APPROX_SIGNATURE_FEE_LAMPORTS = 5_000n;
const APPROX_ATA_RENT_LAMPORTS = 2_039_280n;

export function createTransfersModule(ctx: ClientContext) {
  return {
    async quote(input: TransferQuoteInput): Promise<TransferQuote> {
      const destinationOwner = normalizeAddress(input.to, "recipient");
      const amount = parseTokenAmount(input.amount, ctx.decimals);
      const sourceTokenAccount = await getAssociatedTokenAddress(ctx.signer.address, ctx.mint);
      const destinationTokenAccount = await getAssociatedTokenAddress(destinationOwner, ctx.mint);
      const destination = await getTokenAccountAmount(ctx, destinationTokenAccount);
      const willCreateRecipientAta = !destination.exists;

      return {
        to: destinationOwner,
        mint: ctx.mint,
        amount,
        displayAmount: formatTokenAmount(amount, ctx.decimals),
        sourceTokenAccount,
        destinationTokenAccount,
        recipientAtaExists: destination.exists,
        willCreateRecipientAta,
        estimatedFeeLamports:
          APPROX_SIGNATURE_FEE_LAMPORTS + (willCreateRecipientAta ? APPROX_ATA_RENT_LAMPORTS : 0n),
        feeEstimateType: "approximate",
      };
    },

    async create(input: TransferCreateInput): Promise<TransferResult> {
      return createTransfer(ctx, input);
    },
  };
}

export async function createTransfer(
  ctx: ClientContext,
  input: TransferCreateInput,
): Promise<TransferResult> {
  if (input.idempotencyKey && ctx.idempotencyStore) {
    const existing = await ctx.idempotencyStore.get(input.idempotencyKey);
    if (existing) return existing.result;
  }

  const reference =
    input.reference ?? input.idempotencyKey ?? createReference(DEFAULT_REFERENCE_PREFIX);
  const destinationOwner = normalizeAddress(input.to, "recipient");
  const amount = parseTokenAmount(input.amount, ctx.decimals);
  const sourceTokenAccount = await getAssociatedTokenAddress(ctx.signer.address, ctx.mint);
  const destinationTokenAccount = await getAssociatedTokenAddress(destinationOwner, ctx.mint);
  const instructions = await buildTransferInstructions(ctx, {
    amount,
    destinationOwner,
    destinationTokenAccount,
    reference,
    sourceTokenAccount,
    createRecipientAta: input.createRecipientAta ?? true,
  });

  const latestBlockhash = await getLatestBlockhash(ctx);
  const message = appendTransactionMessageInstructions(
    instructions,
    setTransactionMessageLifetimeUsingBlockhash(
      latestBlockhash,
      setTransactionMessageFeePayerSigner(ctx.signer, createTransactionMessage({ version: 0 })),
    ),
  );
  const signedTransaction = await signTransactionMessageWithSigners(message);
  const wireTransaction = getBase64EncodedWireTransaction(signedTransaction);
  const sendTransaction = requireRpcMethod(ctx, "sendTransaction");
  const signature = String(
    await callRpc(ctx, "sendTransaction", () =>
      sendTransaction
        .call(ctx.rpc, wireTransaction, {
          encoding: "base64",
          preflightCommitment: ctx.commitment,
          maxRetries: ctx.retry?.retries,
        })
        .send(),
    ),
  );
  const status = await waitForTransaction(ctx, { signature });

  const result: TransferResult = {
    signature,
    reference,
    idempotencyKey: input.idempotencyKey,
    mint: ctx.mint,
    amount,
    displayAmount: formatTokenAmount(amount, ctx.decimals),
    sourceTokenAccount,
    destinationTokenAccount,
    slot: status.slot,
    confirmationStatus: status.confirmationStatus,
  };

  if (input.idempotencyKey && ctx.idempotencyStore) {
    await ctx.idempotencyStore.set(input.idempotencyKey, {
      key: input.idempotencyKey,
      reference,
      result,
      createdAt: new Date().toISOString(),
    });
  }

  return result;
}

export async function buildTransferInstructions(
  ctx: ClientContext,
  input: {
    amount: bigint;
    createRecipientAta: boolean;
    destinationOwner: string;
    destinationTokenAccount: string;
    reference: string;
    sourceTokenAccount: string;
  },
): Promise<Instruction[]> {
  if (input.amount <= 0n) {
    throw new SolanaUsdtError({
      code: "INVALID_AMOUNT",
      message: "Transfer amount must be greater than zero.",
    });
  }

  const instructions: Instruction[] = [];
  if (input.createRecipientAta) {
    instructions.push(
      getCreateAssociatedTokenIdempotentInstruction({
        payer: ctx.signer,
        ata: normalizeAddress(input.destinationTokenAccount, "destination token account"),
        owner: normalizeAddress(input.destinationOwner, "destination owner"),
        mint: ctx.mint,
      }),
    );
  }

  instructions.push(
    getTransferCheckedInstruction({
      source: normalizeAddress(input.sourceTokenAccount, "source token account"),
      mint: ctx.mint,
      destination: normalizeAddress(input.destinationTokenAccount, "destination token account"),
      authority: ctx.signer,
      amount: input.amount,
      decimals: ctx.decimals,
    }),
  );

  instructions.push(
    getAddMemoInstruction({ memo: createMemo(input.reference, DEFAULT_REFERENCE_PREFIX) }),
  );
  return instructions;
}

async function getLatestBlockhash(
  ctx: ClientContext,
): Promise<{ blockhash: never; lastValidBlockHeight: bigint }> {
  const getLatestBlockhashRpc = requireRpcMethod(ctx, "getLatestBlockhash");
  const response = await callRpc<unknown>(ctx, "getLatestBlockhash", () =>
    getLatestBlockhashRpc.call(ctx.rpc, { commitment: ctx.commitment }).send(),
  );
  const value = getPath(response, ["value"]) ?? response;
  const blockhash = getPath(value, ["blockhash"]);
  const lastValidBlockHeight = getPath(value, ["lastValidBlockHeight"]);
  if (
    typeof blockhash !== "string" ||
    (typeof lastValidBlockHeight !== "number" && typeof lastValidBlockHeight !== "bigint")
  ) {
    throw new SolanaUsdtError({
      code: "RPC_ERROR",
      message: "RPC getLatestBlockhash response did not include a blockhash lifetime.",
      endpoint: "getLatestBlockhash",
    });
  }
  return {
    blockhash: blockhash as never,
    lastValidBlockHeight: BigInt(lastValidBlockHeight),
  };
}
