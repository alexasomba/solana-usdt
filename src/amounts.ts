import { SolanaPaymentsError } from "./errors.js";

export type TokenAmountInput = string | number | bigint;

export function parseTokenAmount(amount: TokenAmountInput, decimals: number): bigint {
  if (!Number.isInteger(decimals) || decimals < 0) {
    throw new SolanaPaymentsError({
      code: "INVALID_AMOUNT",
      message: "Token decimals must be a non-negative integer.",
    });
  }

  if (typeof amount === "bigint") {
    if (amount < 0n) throw invalidAmount("Amount must be greater than or equal to zero.");
    return amount;
  }

  const raw = String(amount).trim();
  if (raw === "" || raw.startsWith("-") || raw.includes("e") || raw.includes("E")) {
    throw invalidAmount("Amount must be a positive decimal string, number, or bigint.");
  }

  const match = /^(\d+)(?:\.(\d+))?$/.exec(raw);
  if (!match) throw invalidAmount("Amount must be a base-10 decimal value.");

  const whole = match[1] ?? "0";
  const fraction = match[2] ?? "";
  if (fraction.length > decimals) {
    throw invalidAmount(`Amount has more than ${decimals} decimal places.`);
  }

  const multiplier = 10n ** BigInt(decimals);
  const wholeUnits = BigInt(whole) * multiplier;
  const fractionUnits = BigInt((fraction + "0".repeat(decimals)).slice(0, decimals) || "0");
  return wholeUnits + fractionUnits;
}

export function formatTokenAmount(amount: bigint | string | number, decimals: number): string {
  const value = BigInt(amount);
  const multiplier = 10n ** BigInt(decimals);
  const whole = value / multiplier;
  const fraction = value % multiplier;
  if (decimals === 0) return whole.toString();

  const fractionText = fraction.toString().padStart(decimals, "0").replace(/0+$/, "");
  return fractionText === "" ? whole.toString() : `${whole.toString()}.${fractionText}`;
}

function invalidAmount(message: string): SolanaPaymentsError {
  return new SolanaPaymentsError({ code: "INVALID_AMOUNT", message });
}
