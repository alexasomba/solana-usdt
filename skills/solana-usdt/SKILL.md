---
name: solana-usdt
description: Guidelines and code examples for using the solana-usdt library to manage balances, create transfers, and handle payments on Solana. Use this skill when the user asks to integrate, configure, or troubleshoot the solana-usdt client, fetch USDT balances, build/simulate USDT transfers, create payment requests, verify transactions, or poll for confirmations. The library leverages the new @solana/kit and @solana-program/token.
user-invocable: true
license: MIT
compatibility: Requires Node.js 22+, typescript
metadata:
  author: alexasomba
  version: 0.2.0
---

# Solana USDT SDK Skill

A developer-friendly SDK for USDT balance retrieval, transfer quotes, payments, and transaction verification on Solana, built on top of the modern `@solana/kit` and `@solana-program/token`.

## Core Features & Usage

### 1. Client Instantiation

Always import `createSolanaUsdt` and configure it with an RPC URL and a `signer` (which must be a `TransactionSigner` from `@solana/kit`).

```typescript
import { createSolanaUsdt, generateKeyPairSigner } from "solana-usdt";

// Instantiate the SDK client
const signer = await generateKeyPairSigner();
const client = createSolanaUsdt({
  rpcUrl: "https://api.devnet.solana.com",
  signer,
  commitment: "confirmed", // 'processed' | 'confirmed' | 'finalized'
});
```

### 2. Balances Module

Fetch USDT balances for any Solana wallet address. Returns the balance in both `bigint` (raw) and `displayAmount` (formatted string).

```typescript
const balance = await client.balances.retrieve({
  owner: "AddressOrPublicKeyString",
});

console.log(`Balance: ${balance.displayAmount} USDT (raw: ${balance.amount})`);
```

### 3. Transfers Module

#### Fetching a Transfer Quote

Before executing a transfer, request a quote to estimate fee lamports and determine if the recipient's Associated Token Account (ATA) needs to be created.

```typescript
const quote = await client.transfers.quote({
  to: "RecipientAddressString",
  amount: "10.50", // accepts string, number, bigint, or TokenAmountInput
});

console.log(`Will create ATA: ${quote.willCreateRecipientAta}`);
console.log(`Estimated fee: ${quote.estimatedFeeLamports} lamports`);
```

#### Creating a Transfer

Send USDT to another address. Supports idempotency key for safe retries and custom memo reference keys.

```typescript
const transfer = await client.transfers.create({
  to: "RecipientAddressString",
  amount: "10.50",
  reference: "MyPaymentRef123", // optional Solana Pay reference key
  idempotencyKey: "unique-uuid-string", // optional
  createRecipientAta: true, // optional (defaults to true)
});

console.log(`Transaction Signature: ${transfer.signature}`);
```

### 4. Payments Module (Solana Pay)

#### Create a Payment Request

Generate a payment request structure containing the destination, mint, amount, reference, and a formatted memo string.

```typescript
const request = client.payments.createRequest({
  amount: "10.50",
  recipient: "RecipientAddressString",
  reference: "UniqueRefString",
  metadata: { orderId: "456" },
});
```

#### Verify a Payment

Verify if a transaction signature or reference key contains a valid transfer matching the payment requirements.

```typescript
const verified = await client.payments.verify({
  reference: "UniqueRefString",
  recipient: "RecipientAddressString",
  amount: "10.50",
});

if (verified.found) {
  console.log(`Payment confirmed in slot: ${verified.slot}`);
}
```

#### Monitor Payments

Poll or inspect transactions for a recipient address using a cursor-based approach.

```typescript
const monitorResult = await client.payments.monitor({
  recipient: "RecipientAddressString",
  limit: 10,
});
```

### 5. Transactions Module

Wait for or poll for transaction confirmation status.

```typescript
const status = await client.transactions.wait({
  signature: "SignatureString",
  commitment: "confirmed",
  timeoutMs: 60000,
});
```

## Best Practices & Pitfalls

- **Idempotency Store**: Implement custom `IdempotencyStore` for production to avoid double-spend/double-transfer scenarios on retry.
- **Node.js Environment**: The SDK is fully platform-agnostic (works in browser and Node.js) and uses standard `globalThis.crypto` for UUID generation.
- **Commitment Level**: Prefer `confirmed` or `finalized` commitment levels for balance checks and transfer verification to avoid race conditions.
