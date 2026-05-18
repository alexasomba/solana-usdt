import { describe, expect, it } from "vite-plus/test";
import { generateKeyPairSigner } from "@solana/kit";
import { createSolanaUsdt, MemoryIdempotencyStore, type TransferResult } from "../src/index.js";

function sendable<T>(value: T) {
  return { send: async () => value };
}

describe("createSolanaUsdt", () => {
  it("retrieves zero balance for a missing associated token account", async () => {
    const signer = await generateKeyPairSigner();
    const client = createSolanaUsdt({
      rpcUrl: "http://localhost:8899",
      signer,
      rpc: {
        getAccountInfo: () => sendable({ context: { slot: 123 }, value: null }),
      },
    });

    const balance = await client.balances.retrieve({ owner: signer.address });
    expect(balance.amount).toBe(0n);
    expect(balance.displayAmount).toBe("0");
    expect(balance.slot).toBe(123n);
  });

  it("quotes ATA creation for recipients without token accounts", async () => {
    const signer = await generateKeyPairSigner();
    const recipient = await generateKeyPairSigner();
    const client = createSolanaUsdt({
      rpcUrl: "http://localhost:8899",
      signer,
      rpc: {
        getAccountInfo: () => sendable({ context: { slot: 1 }, value: null }),
      },
    });

    const quote = await client.transfers.quote({ to: recipient.address, amount: "1.25" });
    expect(quote.amount).toBe(1_250_000n);
    expect(quote.willCreateRecipientAta).toBe(true);
    expect(quote.estimatedFeeLamports).toBeGreaterThan(5_000n);
  });

  it("returns an existing idempotent transfer result without resending", async () => {
    const signer = await generateKeyPairSigner();
    const recipient = await generateKeyPairSigner();
    const result: TransferResult = {
      signature: "sig",
      reference: "ref",
      idempotencyKey: "idem",
      mint: "mint",
      amount: 1n,
      displayAmount: "0.000001",
      sourceTokenAccount: "source",
      destinationTokenAccount: "dest",
    };
    const store = new MemoryIdempotencyStore<TransferResult>();
    store.set("idem", {
      key: "idem",
      reference: "ref",
      result,
      createdAt: new Date(0).toISOString(),
    });

    const client = createSolanaUsdt({
      rpcUrl: "http://localhost:8899",
      signer,
      idempotencyStore: store,
      rpc: {},
    });

    await expect(
      client.transfers.create({ to: recipient.address, amount: "1", idempotencyKey: "idem" }),
    ).resolves.toBe(result);
  });
});
