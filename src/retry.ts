import { SolanaUsdtError } from "./errors.js";

export interface RetryOptions {
  retries?: number | undefined;
  minDelayMs?: number | undefined;
  maxDelayMs?: number | undefined;
  retryableErrorCodes?: readonly string[] | undefined;
}

const DEFAULT_RETRYABLE_CODES = [
  "ETIMEDOUT",
  "ECONNRESET",
  "ECONNREFUSED",
  "EAI_AGAIN",
  "UND_ERR_CONNECT_TIMEOUT",
  "UND_ERR_HEADERS_TIMEOUT",
] as const;

export function isRetryableRpcError(
  error: unknown,
  retryableCodes: readonly string[] = DEFAULT_RETRYABLE_CODES,
): boolean {
  if (error instanceof SolanaUsdtError) return error.retryable;
  if (typeof error !== "object" || error === null) return false;
  const code = "code" in error ? String((error as { code?: unknown }).code) : undefined;
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  return Boolean(
    (code && retryableCodes.includes(code)) ||
    message.includes("429") ||
    message.includes("rate limit") ||
    message.includes("timeout") ||
    message.includes("blockhash not found"),
  );
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions | undefined,
  shouldRetry: (error: unknown) => boolean = (error) =>
    isRetryableRpcError(error, options?.retryableErrorCodes),
): Promise<T> {
  const retries = options?.retries ?? 2;
  const minDelayMs = options?.minDelayMs ?? 250;
  const maxDelayMs = options?.maxDelayMs ?? 2_000;

  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt >= retries || !shouldRetry(error)) throw error;
      const backoff = Math.min(maxDelayMs, minDelayMs * 2 ** attempt);
      const jitter = 0.5 + Math.random();
      await sleep(Math.floor(backoff * jitter));
    }
  }
  throw lastError;
}

export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number | undefined,
  endpoint?: string,
): Promise<T> {
  if (timeoutMs === undefined || timeoutMs <= 0) return promise;

  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(
        new SolanaUsdtError({
          code: "RPC_TIMEOUT",
          message: `RPC request timed out after ${timeoutMs}ms.`,
          endpoint,
          retryable: true,
        }),
      );
    }, timeoutMs);
  });

  return Promise.race([promise, timeout]).finally(() => {
    if (timer !== undefined) clearTimeout(timer);
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
