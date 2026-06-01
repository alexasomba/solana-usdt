# Changelog

## 0.3.3 - 2026-06-01

### Changed

- Updated the npm publish workflow to use npm trusted publishing through GitHub Actions OIDC instead of a long-lived npm token.

## 0.3.2 - 2026-06-01

### Changed

- Added a GitHub Actions npm publish workflow for provenance-backed releases.
- Enabled npm provenance in `publishConfig` so future publishes must include provenance.
- Normalized the package repository URL used by npm provenance checks.

## 0.3.1 - 2026-06-01

### Documentation

- Added README instructions for loading the packaged `solana-usdt` agent skill from npm packages.

## 0.3.0 - 2026-06-01

### Added

- Added `createReadOnlySolanaUsdt()` for balances, payment requests, payment verification, monitoring, and transaction lookup without keypair generation.
- Added `payments.toSolanaPayUrl()` and the standalone `toSolanaPayUrl()` helper for canonical Solana Pay payment request URLs.
- Added configurable reference verification scan depth with `limit`, `cursor`, `maxPages`, and `verified.scan` diagnostics.
- Re-exported Solana Kit's `createNoopSigner()` for advanced external-signing compatibility.

### Changed

- Made the root `signer` option optional for read-only modules while keeping transfer APIs behind an explicit `TransactionSigner`.
- Updated README, quickstart, and packaged skill guidance for payment-only serverless checkout integrations.
- Fixed the Vite+ `repo:build` task configuration so the required release build gate can run.
