import crypto from "node:crypto";

export interface IdempotencyRecord<T = unknown> {
  key: string;
  reference: string;
  result: T;
  createdAt: string;
}

export interface IdempotencyStore<T = unknown> {
  get(key: string): Promise<IdempotencyRecord<T> | undefined> | IdempotencyRecord<T> | undefined;
  set(key: string, record: IdempotencyRecord<T>): Promise<void> | void;
}

export class MemoryIdempotencyStore<T = unknown> implements IdempotencyStore<T> {
  private readonly records = new Map<string, IdempotencyRecord<T>>();

  get(key: string): IdempotencyRecord<T> | undefined {
    return this.records.get(key);
  }

  set(key: string, record: IdempotencyRecord<T>): void {
    this.records.set(key, record);
  }
}

export function createReference(prefix = "solana-usdt"): string {
  const id =
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : crypto.randomBytes(16).toString("hex");
  return `${prefix}_${id}`;
}

export function createMemo(reference: string, prefix = "solana-usdt"): string {
  return `${prefix}:${reference}`;
}

export function parseMemoReference(memo: string, prefix = "solana-usdt"): string | undefined {
  const marker = `${prefix}:`;
  return memo.startsWith(marker) ? memo.slice(marker.length) : undefined;
}
