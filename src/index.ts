export * from "./amounts.js";
export * from "./balances.js";
export * from "./constants.js";
export * from "./errors.js";
export * from "./idempotency.js";
export * from "./payments.js";
export * from "./retry.js";
export * from "./transactions.js";
export * from "./transfers.js";
export * from "./types.js";

export {
  createKeyPairSignerFromBytes,
  createKeyPairSignerFromPrivateKeyBytes,
  createNoopSigner,
  createSignerFromKeyPair,
  generateKeyPairSigner,
  type TransactionSigner,
} from "@solana/kit";

import { createBalancesModule } from "./balances.js";
import { createContext } from "./context.js";
import { createPaymentsModule } from "./payments.js";
import { createTransactionsModule } from "./transactions.js";
import { createTransfersModule } from "./transfers.js";
import type {
  SolanaPaymentsClientOptions,
  SolanaPaymentsClient,
  SolanaPaymentsReadOnlyClient,
  SolanaPaymentsReadOnlyClientOptions,
} from "./types.js";

export function createSolanaPayments(options: SolanaPaymentsClientOptions): SolanaPaymentsClient {
  const ctx = createContext(options);
  return {
    balances: createBalancesModule(ctx),
    transfers: createTransfersModule(ctx),
    payments: createPaymentsModule(ctx),
    transactions: createTransactionsModule(ctx),
  };
}

export function createReadOnlySolanaPayments(
  options: SolanaPaymentsReadOnlyClientOptions,
): SolanaPaymentsReadOnlyClient {
  const ctx = createContext(options);
  return {
    balances: createBalancesModule(ctx),
    payments: createPaymentsModule(ctx),
    transactions: createTransactionsModule(ctx),
  };
}

/** @deprecated Use createSolanaPayments instead. */
export const createSolanaUsdt: typeof createSolanaPayments = createSolanaPayments;
/** @deprecated Use createReadOnlySolanaPayments instead. */
export const createReadOnlySolanaUsdt: typeof createReadOnlySolanaPayments =
  createReadOnlySolanaPayments;
