import { describe, expect, it } from "vite-plus/test";
import { createSolanaPayments, SOLANA_USDT } from "../src/index.js";

describe("token configuration", () => {
  it("defaults the generic client to USDT", () => {
    const client = createSolanaPayments({
      rpcUrl: "http://localhost:8899",
      rpc: {},
    });

    const request = client.payments.createRequest({ amount: "1" });

    expect(request.mint).toBe(SOLANA_USDT.mint);
    expect(request.decimals).toBe(6);
    expect(request.memo).toMatch(/^solana-usdt:/);
  });

  it("uses a custom token and reference prefix", () => {
    const client = createSolanaPayments({
      rpcUrl: "http://localhost:8899",
      rpc: {},
      token: {
        mint: "So11111111111111111111111111111111111111112",
        decimals: 9,
        symbol: "CUSTOM",
        referencePrefix: "custom-payments",
      },
    });

    const request = client.payments.createRequest({ amount: "1" });

    expect(request.mint).toBe("So11111111111111111111111111111111111111112");
    expect(request.decimals).toBe(9);
    expect(request.memo).toMatch(/^custom-payments:/);
  });

  it("rejects token decimals outside the supported range", () => {
    expect(() =>
      createSolanaPayments({
        rpcUrl: "http://localhost:8899",
        rpc: {},
        token: { mint: SOLANA_USDT.mint, decimals: 19 },
      }),
    ).toThrow("Token decimals must be an integer from 0 through 18.");
  });

  it("rejects an empty token reference prefix", () => {
    expect(() =>
      createSolanaPayments({
        rpcUrl: "http://localhost:8899",
        rpc: {},
        token: { mint: SOLANA_USDT.mint, decimals: 6, referencePrefix: "" },
      }),
    ).toThrow("Token reference prefix must not be empty.");
  });
});
