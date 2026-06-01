# Quickstart: Solana USDT Node SDK

## Install

```bash
pnpm add solana-usdt
```

## Create a Client

```ts
import {
  createKeyPairSignerFromBytes,
  createReadOnlySolanaUsdt,
  createSolanaUsdt,
} from "solana-usdt";

const signer = await createKeyPairSignerFromBytes(secretKeyBytes);

const solanaUsdt = createSolanaUsdt({
  rpcUrl: process.env.SOLANA_RPC_URL!,
  signer,
  commitment: "confirmed",
});
```

For payment-only checkout flows, use a read-only client and skip keypair generation:

```ts
const payments = createReadOnlySolanaUsdt({
  rpcUrl: process.env.SOLANA_RPC_URL!,
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
