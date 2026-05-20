export type SolanaUsdtErrorCode =
  | "INVALID_ADDRESS"
  | "INVALID_AMOUNT"
  | "RPC_ERROR"
  | "RPC_TIMEOUT"
  | "TRANSACTION_FAILED"
  | "TRANSACTION_TIMEOUT"
  | "PAYMENT_NOT_FOUND"
  | "PAYMENT_MISMATCH"
  | "IDEMPOTENCY_CONFLICT";

export class SolanaUsdtError extends Error {
  public readonly code: SolanaUsdtErrorCode;
  public readonly endpoint: string | undefined;
  public readonly signature: string | undefined;
  public readonly slot: bigint | undefined;
  public readonly logs: readonly string[] | undefined;
  public readonly retryable: boolean;
  public override readonly cause: unknown;
  public readonly meta: Record<string, unknown> | undefined;

  constructor(options: {
    code: SolanaUsdtErrorCode;
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
    this.name = "SolanaUsdtError";
    this.code = options.code;
    this.endpoint = options.endpoint;
    this.signature = options.signature;
    this.slot = typeof options.slot === "number" ? BigInt(options.slot) : options.slot;
    this.logs = options.logs;
    this.retryable = options.retryable ?? false;
    this.cause = options.cause;
    this.meta = options.meta;

    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, SolanaUsdtError);
    }
  }
}

export function isSolanaUsdtError(error: unknown): error is SolanaUsdtError {
  return error instanceof SolanaUsdtError;
}

export function normalizeError(
  error: unknown,
  fallback: {
    code: SolanaUsdtErrorCode;
    message: string;
    endpoint?: string | undefined;
    signature?: string | undefined;
    retryable?: boolean | undefined;
  },
): SolanaUsdtError {
  if (error instanceof SolanaUsdtError) return error;
  const message = error instanceof Error && error.message ? error.message : fallback.message;
  return new SolanaUsdtError({
    ...fallback,
    message,
    cause: error,
  });
}
