import { describe, expect, it } from "vite-plus/test";
import { createSolanaUsdt, SOLANA_USDT } from "../src/index.js";

describe("token configuration", () => {
  it("defaults the generic client to USDT", () => {
    const client = createSolanaUsdt({
      rpcUrl: "http://localhost:8899",
      rpc: {},
    });

    const request = client.payments.createRequest({ amount: "1" });

    expect(request.mint).toBe(SOLANA_USDT.mint);
    expect(request.decimals).toBe(6);
    expect(request.memo).toMatch(/^solana-usdt:/);
  });

  it("uses a custom token and reference prefix", () => {
    const client = createSolanaUsdt({
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
});
