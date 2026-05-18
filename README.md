# @alexasomba/solana-usdt-node

TypeScript SDK for USDT balances, transfers, and payment verification on Solana.
It wraps Solana Kit, SPL Token, and Memo instructions behind a Paystack-style
factory API.

```ts
import { createSolanaUsdt, createKeyPairSignerFromBytes } from "@alexasomba/solana-usdt-node";

const signer = await createKeyPairSignerFromBytes(secretKeyBytes);

const solanaUsdt = createSolanaUsdt({
  rpcUrl: process.env.SOLANA_RPC_URL!,
  signer,
  commitment: "confirmed",
});

const balance = await solanaUsdt.balances.retrieve({
  owner: signer.address,
});

const transfer = await solanaUsdt.transfers.create({
  to: "RecipientWalletAddressHere",
  amount: "10.50",
});
```

## Features

- Defaults to Solana USDT mint `Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB`
- Allows mint/decimal override for devnet and local validator tests
- Retrieves USDT balances via associated token accounts
- Creates idempotent recipient ATAs before transfers
- Sends `TransferChecked` with Solana Memo references
- Verifies payments by signature or memo reference
- Provides polling monitor helpers for incoming payments
- Normalizes RPC and transaction errors into `SolanaUsdtError`

## API

```ts
const client = createSolanaUsdt({
  rpcUrl: "https://api.mainnet-beta.solana.com",
  signer,
  retry: { retries: 3 },
  timeoutMs: 30_000,
});

await client.balances.retrieve({ owner });
await client.transfers.quote({ to, amount: "25" });
await client.transfers.create({ to, amount: "25", reference: "invoice_123" });
await client.payments.createRequest({ amount: "25", recipient: owner });
await client.payments.verify({ reference: "invoice_123", recipient: owner });
await client.payments.monitor({ recipient: owner, limit: 10 });
await client.transactions.retrieve({ signature });
await client.transactions.wait({ signature });
```

## Development

```bash
pnpm install
pnpm test
pnpm typecheck
pnpm build
```
