# Solana Payments Migration Design

**Date:** 2026-08-22

## Goal

Rename and generalize the existing `solana-usdt` SDK into `solana-payments`, then build a separate `better-auth-solana-payments` package for authenticated one-time payment intents and entitlement management.

## Scope

### In scope

- Rename the existing SDK repository and npm package identity to `solana-payments`.
- Make the SDK token-configurable for SPL-token payments.
- Keep Solana USDT as the first built-in token preset.
- Provide canonical generic factories, client types, and error types.
- Preserve source compatibility through deprecated USDT aliases.
- Preserve existing `solana-usdt:` memo references by default.
- Create a separate Better Auth plugin for one-time payment creation, verification, and status tracking.
- Store payment intents in Better Auth's database and associate them with users or organizations.
- Publish migration documentation and deprecate the old npm package.

### Out of scope

- Native SOL payments in the first release.
- Automatic recurring charges or custodial subscription billing.
- A Solana wallet sign-in flow; that belongs to the existing `better-auth-solana` package.
- Native Solana webhooks. Verification is performed by RPC polling, with external indexer adapters deferred.
- A shared monorepo for the two npm packages.

## Package identities

| Existing      | New                           | Role                                  |
| ------------- | ----------------------------- | ------------------------------------- |
| `solana-usdt` | `solana-payments`             | Generic Solana SPL-token payment SDK  |
| —             | `better-auth-solana-payments` | Better Auth server/client integration |

The GitHub repository currently named `solana-usdt` will be renamed to `solana-payments` in place to preserve history. The old npm package cannot be renamed; it will remain installable and be marked deprecated after the replacement package is published.

## SDK design

### Token configuration

The SDK will expose a token descriptor and a USDT preset:

```ts
export interface SolanaToken {
  mint: AddressInput;
  decimals: number;
  symbol?: string;
  referencePrefix?: string;
}

export const SOLANA_USDT: SolanaToken = {
  mint: SOLANA_USDT_MINT,
  decimals: SOLANA_USDT_DECIMALS,
  symbol: "USDT",
  referencePrefix: "solana-usdt",
};
```

`SolanaPaymentsClientOptions` will accept `token?: SolanaToken`, defaulting to `SOLANA_USDT`. The existing `mint` and `decimals` options remain supported as deprecated compatibility inputs and continue to override the default when `token` is not supplied. The internal context will carry the resolved token mint, decimals, and reference prefix.

### Canonical API

The public entry point will expose:

```ts
createSolanaPayments(options: SolanaPaymentsClientOptions): SolanaPaymentsClient;
createReadOnlySolanaPayments(
  options: SolanaPaymentsReadOnlyClientOptions,
): SolanaPaymentsReadOnlyClient;
```

Existing names remain available as deprecated aliases:

```ts
createSolanaUsdt: typeof createSolanaPayments;
createReadOnlySolanaUsdt: typeof createReadOnlySolanaPayments;
```

The generic client will retain the current balances, transfers, payments, and transactions module shape. `SolanaUsdtClient` and `SolanaUsdtReadOnlyClient` become deprecated aliases of the generic client types.

### Errors and references

`SolanaPaymentsError` becomes the canonical error class and `SolanaUsdtError` remains a deprecated alias. Error codes and error metadata remain stable.

Reference generation and memo parsing will use the resolved token's `referencePrefix`. The USDT preset defaults to `solana-usdt`, so existing references continue to verify. A custom token can supply its own prefix; if omitted, the generic default will be `solana-payments`.

### Compatibility rules

- Existing USDT factory calls continue to compile and run.
- Existing `mint`/`decimals` options continue to work.
- Existing transaction verification continues to recognize `solana-usdt:` memos.
- Existing `solana-usdt` package consumers are not forced to upgrade immediately.
- New documentation uses `solana-payments` and generic names.
- Deprecated aliases are documented with migration examples and are removed only in a future major release.

## Better Auth plugin design

The Better Auth plugin will be implemented in a new repository named `better-auth-solana-payments`, following the existing Paystack plugin's TypeScript, Vite+, endpoint, schema, and client-plugin conventions without copying subscription-specific behavior.

### Server configuration

The plugin will accept a read-only or full `solana-payments` client, a server-controlled recipient wallet, and an optional token preset. Verification will use the configured client and will never require a private key.

The recipient and token are server-controlled. Request bodies may select an amount and metadata, but cannot override the configured recipient or mint.

### Payment flow

1. An authenticated user or organization calls `createPayment` with an amount and optional metadata.
2. The server creates a unique payment intent and reference, stores the expected amount, mint, decimals, recipient, owner, and expiration, and returns a Solana Pay URL.
3. The client submits the payment through a Solana wallet.
4. The client calls `verifyPayment` with the payment ID and optional transaction signature.
5. The server verifies the transaction against the stored reference, amount, mint, and recipient using the SDK.
6. The server atomically marks the payment as paid and returns the verified transaction details. Repeated verification returns the same paid result without duplicating entitlement effects.

### Endpoints

The initial plugin will expose:

- `POST /solana-payments/create-payment`
- `POST /solana-payments/verify-payment`
- `GET /solana-payments/payment`

The client plugin will provide typed actions for creating, verifying, and retrieving payment intents.

### Persistence

The plugin will add a `solanaPayment` model containing:

- payment ID
- reference
- owner type and owner ID (`user` or `organization`)
- amount in base units
- token mint and decimals
- recipient
- status
- transaction signature and slot when verified
- metadata
- expiration, creation, and update timestamps

Payment references will be unique. Verification will reject mismatched amount, mint, recipient, or reference. Ownership checks will prevent users from reading or verifying another user's payment intent.

### Entitlements

The first release will expose verified payment records and completion callbacks/hooks. It will not invent a subscription model. Applications can map a paid record to their own access or entitlement system; a later release may add product catalogs, credits, or time-limited access after those semantics are specified.

## Testing strategy

### SDK

- Add failing tests for custom token configuration and generic factory names.
- Verify USDT preset defaults and deprecated aliases.
- Verify custom reference prefixes and unchanged `solana-usdt:` compatibility.
- Preserve and rerun the existing unit and LiteSVM integration suites.
- Run `vp check`, `vp test`, package build, and packed-package type checks.

### Better Auth plugin

- Test schema shape and endpoint registration.
- Test payment creation ownership and server-controlled recipient/token fields.
- Test verification success, mismatch rejection, idempotent repeated verification, expired payments, and unauthorized access.
- Test client action typing and packed package exports.
- Run the full Vite+ check and test suite before publication.

## Release and migration

1. Implement and verify the generic SDK in the existing repository.
2. Rename the GitHub repository to `solana-payments`.
3. Publish `solana-payments` as the successor package.
4. Publish a final compatibility/deprecation update for `solana-usdt` or deprecate the existing package with a migration message.
5. Create and publish `better-auth-solana-payments`.
6. Add README migration instructions, package links, examples, and release notes.

The new SDK package will use the next successor version after the current `0.3.3` line, while the Better Auth integration will begin at `0.1.0`.
