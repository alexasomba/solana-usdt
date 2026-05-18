import { describe, expect, it } from "vite-plus/test";
import { generateKeyPairSigner } from "@solana/kit";
import { createSolanaUsdt, SOLANA_USDT_MINT } from "../src/index.js";

function sendable<T>(value: T) {
  return { send: async () => value };
}

describe("payments", () => {
  it("creates payment requests with memo references", async () => {
    const signer = await generateKeyPairSigner();
    const client = createSolanaUsdt({
      rpcUrl: "http://localhost:8899",
      signer,
      rpc: {},
    });

    const request = client.payments.createRequest({
      amount: "12.34",
      recipient: signer.address,
      reference: "invoice_123",
      metadata: { customer: "cus_1" },
    });

    expect(request.amount).toBe(12_340_000n);
    expect(request.memo).toBe("solana-usdt:invoice_123");
    expect(request.mint).toBe(SOLANA_USDT_MINT);
  });

  it("verifies a payment by signature and memo reference", async () => {
    const signer = await generateKeyPairSigner();
    const tx = {
      transaction: {
        message: {
          instructions: [
            { program: "spl-memo", parsed: "solana-usdt:invoice_123" },
            {
              parsed: {
                type: "transferChecked",
                info: {
                  mint: SOLANA_USDT_MINT,
                  destination: "destAta",
                  tokenAmount: { amount: "12340000" },
                },
              },
            },
          ],
        },
      },
    };
    const client = createSolanaUsdt({
      rpcUrl: "http://localhost:8899",
      signer,
      rpc: {
        getSignatureStatuses: () =>
          sendable({ value: [{ slot: 55, confirmationStatus: "confirmed", err: null }] }),
        getTransaction: () => sendable(tx),
      },
    });

    const verified = await client.payments.verify({
      signature: "sig",
      reference: "invoice_123",
      amount: "12.34",
    });
    expect(verified.found).toBe(true);
    expect(verified.reference).toBe("invoice_123");
    expect(verified.amount).toBe(12_340_000n);
    expect(verified.slot).toBe(55n);
  });

  it("verifies recipient wallets against their associated token account destination", async () => {
    const signer = await generateKeyPairSigner();
    const recipient = await generateKeyPairSigner();
    const quoteClient = createSolanaUsdt({
      rpcUrl: "http://localhost:8899",
      signer,
      rpc: {
        getAccountInfo: () => sendable({ value: null }),
      },
    });
    const quote = await quoteClient.transfers.quote({ to: recipient.address, amount: "12.34" });
    const tx = {
      transaction: {
        message: {
          instructions: [
            { program: "spl-memo", parsed: "solana-usdt:invoice_123" },
            {
              parsed: {
                type: "transferChecked",
                info: {
                  mint: SOLANA_USDT_MINT,
                  destination: quote.destinationTokenAccount,
                  tokenAmount: { amount: "12340000" },
                },
              },
            },
          ],
        },
      },
    };
    const client = createSolanaUsdt({
      rpcUrl: "http://localhost:8899",
      signer,
      rpc: {
        getSignatureStatuses: () =>
          sendable({ value: [{ slot: 55, confirmationStatus: "confirmed", err: null }] }),
        getTransaction: () => sendable(tx),
      },
    });

    const verified = await client.payments.verify({
      signature: "sig",
      reference: "invoice_123",
      recipient: recipient.address,
      amount: "12.34",
    });
    expect(verified.recipient).toBe(recipient.address);
    expect(verified.recipientTokenAccount).toBe(quote.destinationTokenAccount);
  });

  it("monitors the recipient associated token account rather than the wallet address", async () => {
    const signer = await generateKeyPairSigner();
    const recipient = await generateKeyPairSigner();
    const quoteClient = createSolanaUsdt({
      rpcUrl: "http://localhost:8899",
      signer,
      rpc: {
        getAccountInfo: () => sendable({ value: null }),
      },
    });
    const quote = await quoteClient.transfers.quote({ to: recipient.address, amount: "12.34" });
    let scannedAddress: unknown;
    const tx = {
      transaction: {
        message: {
          instructions: [
            { program: "spl-memo", parsed: "solana-usdt:invoice_123" },
            {
              parsed: {
                type: "transferChecked",
                info: {
                  mint: SOLANA_USDT_MINT,
                  destination: quote.destinationTokenAccount,
                  tokenAmount: { amount: "12340000" },
                },
              },
            },
          ],
        },
      },
    };
    const client = createSolanaUsdt({
      rpcUrl: "http://localhost:8899",
      signer,
      rpc: {
        getSignaturesForAddress: (address) => {
          scannedAddress = address;
          return sendable([{ signature: "sig" }]);
        },
        getSignatureStatuses: () =>
          sendable({ value: [{ slot: 55, confirmationStatus: "confirmed", err: null }] }),
        getTransaction: () => sendable(tx),
      },
    });

    const monitored = await client.payments.monitor({ recipient: recipient.address });
    expect(scannedAddress).toBe(quote.destinationTokenAccount);
    expect(monitored.payments).toHaveLength(1);
    expect(monitored.payments[0]?.recipient).toBe(recipient.address);
    expect(monitored.payments[0]?.recipientTokenAccount).toBe(quote.destinationTokenAccount);
  });
});
