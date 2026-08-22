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
  SolanaUsdtClient,
  SolanaUsdtClientOptions,
  SolanaUsdtReadOnlyClient,
  SolanaUsdtReadOnlyClientOptions,
} from "./types.js";

export function createSolanaPayments(options: SolanaPaymentsClientOptions): SolanaUsdtClient {
  const ctx = createContext(options);
  return {
    balances: createBalancesModule(ctx),
    transfers: createTransfersModule(ctx),
    payments: createPaymentsModule(ctx),
    transactions: createTransactionsModule(ctx),
  };
}

export function createSolanaUsdt(options: SolanaUsdtClientOptions): SolanaUsdtClient {
  return createSolanaPayments(options);
}

export function createReadOnlySolanaUsdt(
  options: SolanaUsdtReadOnlyClientOptions,
): SolanaUsdtReadOnlyClient {
  const ctx = createContext(options);
  return {
    balances: createBalancesModule(ctx),
    payments: createPaymentsModule(ctx),
    transactions: createTransactionsModule(ctx),
  };
}
