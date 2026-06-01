# Changelog

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
