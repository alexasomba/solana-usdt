# Changelog

## [0.4.0](https://github.com/alexasomba/solana-payments/compare/v0.3.4...v0.4.0) (2026-08-22)


### Features

* add generic Solana payments API ([5883435](https://github.com/alexasomba/solana-payments/commit/58834357b8e72ba9392d44d3c473de80523856ea))
* add generic Solana token configuration ([48c8357](https://github.com/alexasomba/solana-payments/commit/48c83570b2c17d3b61415463b761d8ae5e1cad76))
* rename SDK to solana-payments ([11246ef](https://github.com/alexasomba/solana-payments/commit/11246ef844bd868428b774648e1fb196d96891d0))


### Bug Fixes

* cover canonical token configuration ([9285251](https://github.com/alexasomba/solana-payments/commit/92852519214285bce81e76157424bbf9413bc8d5))
* ignore release-managed changelog formatting ([8468615](https://github.com/alexasomba/solana-payments/commit/84686156445f2575e53f47ea99d5ee07b2da700a))
* preserve npm trusted publisher workflow ([27336ed](https://github.com/alexasomba/solana-payments/commit/27336ed05b5a3a48ee6c4d5e12b33cc6ed6a48ef))
* update vite dependency to use catalog and enhance formatting options ([95d4951](https://github.com/alexasomba/solana-payments/commit/95d4951fdf778e42f650299687ec70d324ec193a))


### Documentation

* add Solana payments implementation plan ([870a6a3](https://github.com/alexasomba/solana-payments/commit/870a6a3d89fc83d7efae0560d875f3267dacf3ea))
* design solana payments migration ([1444c3f](https://github.com/alexasomba/solana-payments/commit/1444c3feb72f636286776933de1b598326efd833))

## [0.4.0](https://github.com/alexasomba/solana-payments/releases/tag/v0.4.0) (2026-08-22)

### Features

* rename the SDK to `solana-payments` and add generic Solana payment APIs

### Migration

* Install `solana-payments` instead of `solana-usdt` and use `createSolanaPayments` or `createReadOnlySolanaPayments` for new code.
* Deprecated `createSolanaUsdt`, `createReadOnlySolanaUsdt`, `SolanaUsdtClient`, and `SolanaUsdtError` aliases remain available until a future major release.
* `SOLANA_USDT` remains the default preset and preserves the `solana-usdt:` memo prefix, so existing payment references continue to verify.

## [0.3.4](https://github.com/alexasomba/solana-usdt/compare/v0.3.3...v0.3.4) (2026-08-22)


### Bug Fixes

* automate solana-usdt npm releases ([59290d5](https://github.com/alexasomba/solana-usdt/commit/59290d5d15279f62e78b2d34ef7c5ee749e1e145))
* keep skill metadata in release updates ([c171e78](https://github.com/alexasomba/solana-usdt/commit/c171e785fff1a5156adffe175f2e6044cba5f1db))


### Miscellaneous Chores

* update pnpm workspace dependencies and adjust vitest import ([587df1f](https://github.com/alexasomba/solana-usdt/commit/587df1f22c408b7d330cb44a27c3ab3ae1c584b2))

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
