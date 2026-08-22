export type SolanaPaymentsErrorCode =
  | "INVALID_ADDRESS"
  | "INVALID_INPUT"
  | "INVALID_AMOUNT"
  | "RPC_ERROR"
  | "SIGNER_REQUIRED"
  | "RPC_TIMEOUT"
  | "TRANSACTION_FAILED"
  | "TRANSACTION_TIMEOUT"
  | "PAYMENT_NOT_FOUND"
  | "PAYMENT_MISMATCH"
  | "IDEMPOTENCY_CONFLICT";

export type SolanaUsdtErrorCode = SolanaPaymentsErrorCode;

export class SolanaPaymentsError extends Error {
  public readonly code: SolanaPaymentsErrorCode;
  public readonly endpoint: string | undefined;
  public readonly signature: string | undefined;
  public readonly slot: bigint | undefined;
  public readonly logs: readonly string[] | undefined;
  public readonly retryable: boolean;
  public override readonly cause: unknown;
  public readonly meta: Record<string, unknown> | undefined;

  constructor(options: {
    code: SolanaPaymentsErrorCode;
    message: string;
    endpoint?: string | undefined;
    signature?: string | undefined;
    slot?: bigint | number | undefined;
    logs?: readonly string[] | undefined;
    retryable?: boolean | undefined;
    cause?: unknown;
    meta?: Record<string, unknown> | undefined;
  }) {
    const suffix = options.signature ? ` (signature: ${options.signature})` : "";
    super(`${options.message}${suffix}`, { cause: options.cause });
    this.name = "SolanaPaymentsError";
    this.code = options.code;
    this.endpoint = options.endpoint;
    this.signature = options.signature;
    this.slot = typeof options.slot === "number" ? BigInt(options.slot) : options.slot;
    this.logs = options.logs;
    this.retryable = options.retryable ?? false;
    this.cause = options.cause;
    this.meta = options.meta;

    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, SolanaPaymentsError);
    }
  }
}

export function isSolanaPaymentsError(error: unknown): error is SolanaPaymentsError {
  return error instanceof SolanaPaymentsError;
}

/** @deprecated Use SolanaPaymentsError instead. */
export { SolanaPaymentsError as SolanaUsdtError };
/** @deprecated Use isSolanaPaymentsError instead. */
export const isSolanaUsdtError = isSolanaPaymentsError;

export function normalizeError(
  error: unknown,
  fallback: {
    code: SolanaPaymentsErrorCode;
    message: string;
    endpoint?: string | undefined;
    signature?: string | undefined;
    retryable?: boolean | undefined;
  },
): SolanaPaymentsError {
  if (error instanceof SolanaPaymentsError) return error;
  const message = error instanceof Error && error.message ? error.message : fallback.message;
  return new SolanaPaymentsError({
    ...fallback,
    message,
    cause: error,
  });
}
