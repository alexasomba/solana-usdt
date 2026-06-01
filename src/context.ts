import { address, createSolanaRpc, type Address, type TransactionSigner } from "@solana/kit";
import { DEFAULT_COMMITMENT, SOLANA_USDT_DECIMALS, SOLANA_USDT_MINT_ADDRESS } from "./constants.js";
import { SolanaUsdtError } from "./errors.js";
import type { AddressInput, ClientContext, SolanaUsdtClientOptions } from "./types.js";

export function createContext(options: SolanaUsdtClientOptions): ClientContext {
  const mint =
    options.mint === undefined ? SOLANA_USDT_MINT_ADDRESS : normalizeAddress(options.mint);
  return {
    rpcUrl: options.rpcUrl,
    rpc:
      options.rpc ??
      (createSolanaRpc(
        options.rpcUrl as never,
        options.fetch ? ({ fetch: options.fetch } as never) : undefined,
      ) as never),
    signer: options.signer,
    commitment: options.commitment ?? DEFAULT_COMMITMENT,
    timeoutMs: options.timeoutMs,
    retry: options.retry,
    mint,
    decimals: options.decimals ?? SOLANA_USDT_DECIMALS,
    idempotencyStore: options.idempotencyStore,
  };
}

export function normalizeAddress(value: AddressInput, field = "address"): Address {
  try {
    return typeof value === "string" ? address(value) : value;
  } catch (error) {
    throw new SolanaUsdtError({
      code: "INVALID_ADDRESS",
      message: `Invalid Solana ${field}.`,
      cause: error,
    });
  }
}

export function requireSigner(ctx: ClientContext, operation: string): TransactionSigner {
  if (!ctx.signer) {
    throw new SolanaUsdtError({
      code: "SIGNER_REQUIRED",
      message: `${operation} requires a TransactionSigner. Configure signer on createSolanaUsdt(...) before calling transfer APIs.`,
    });
  }
  return ctx.signer;
}
