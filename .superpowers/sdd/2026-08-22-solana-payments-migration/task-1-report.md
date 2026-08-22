# Task 1 Report: Generic Token Configuration

## Scope

Implemented generic token configuration for the existing Solana client while preserving the legacy USDT defaults and factory names for Task 1 compatibility.

## Changes

- Added `SolanaToken`.
- Added `SolanaPaymentsClientOptions` and `SolanaPaymentsReadOnlyClientOptions`, with legacy option type aliases retained.
- Added `SOLANA_USDT` with the official USDT mint, 6 decimals, `USDT`, and `solana-usdt` prefix.
- Added `DEFAULT_GENERIC_REFERENCE_PREFIX = "solana-payments"`.
- Resolved configuration in the order `token` → legacy `mint`/`decimals` → USDT defaults.
- Added `ClientContext.referencePrefix`.
- Validated decimals as integers from 0 through 18 and rejected empty reference prefixes.
- Updated payment request generation and memo parsing to use the resolved prefix.
- Added focused tests for USDT defaults and custom token configuration.

## TDD evidence

The focused test was written before production changes. The initial red run failed because `SOLANA_USDT` was undefined and the custom token was not resolved. After implementation, the focused tests passed.

## Verification

- Focused and existing client/payment tests: 3 files, 16 tests passed.
- `pnpm exec vp check`: formatting, lint, and type checks passed.
- Full test suite: 7 files, 26 tests passed.
- `git diff --check`: passed.

## Concerns

- `vp` is available through the project-local toolchain but not directly on PATH; commands were run as `pnpm exec vp ...`.
- Canonical `createSolanaPayments` factory names and generic error aliases remain scoped to Task 2 of the migration plan.

## Task review fix

The token tests now exercise the canonical `createSolanaPayments` factory. Task 1 adds only the minimal generic factory export; the existing USDT factory delegates to it. Task 2 remains responsible for canonical client/error types, deprecated aliases, and broader reference handling.

Added Vitest coverage for rejecting decimals outside 0 through 18 and rejecting an empty token reference prefix.

Fix verification:

- Corrected focused red run failed with `createSolanaPayments is not a function` before the factory export.
- Corrected focused green run: 1 file, 4 tests passed.
- Relevant suite: 3 files, 18 tests passed.
- `pnpm exec vp check`: passed.
- `git diff --check`: passed.
