# Quickstart: Solana USDT Node SDK

## Install

```bash
pnpm add solana-usd
```

## Create a Client

```ts
import { createKeyPairSignerFromBytes, createSolanaUsdt } from "solana-usd";

const signer = await createKeyPairSignerFromBytes(secretKeyBytes);

const solanaUsdt = createSolanaUsdt({
  rpcUrl: process.env.SOLANA_RPC_URL!,
  signer,
  commitment: "confirmed",
});
```

## Balance

```ts
const balance = await solanaUsdt.balances.retrieve({
  owner: signer.address,
});
```

## Transfer

```ts
const transfer = await solanaUsdt.transfers.create({
  to: "RecipientWalletAddressHere",
  amount: "25.00",
  reference: "invoice_123",
  idempotencyKey: "invoice_123",
});
```

## Payment Verification

```ts
const verified = await solanaUsdt.payments.verify({
  signature: transfer.signature,
  reference: "invoice_123",
  amount: "25.00",
});
```
