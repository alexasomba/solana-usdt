# Task 2 Report: Canonical generic API, errors, and prefixes

## Completed scope

- Added the canonical `createSolanaPayments` and `createReadOnlySolanaPayments` factories, returning `SolanaPaymentsClient` and `SolanaPaymentsReadOnlyClient`.
- Preserved `createSolanaUsdt` and `createReadOnlySolanaUsdt` as deprecated aliases of the canonical factories.
- Added `SolanaPaymentsError` and `SolanaPaymentsErrorCode` as canonical names while preserving `SolanaUsdtError`, `SolanaUsdtErrorCode`, and `isSolanaUsdtError` as deprecated aliases.
- Updated all SDK internals to construct and recognize the canonical error class.
- Propagated `ClientContext.referencePrefix` through transfer reference generation and memo instruction creation. Payment request generation and payment memo parsing continue to use the resolved prefix.
- Preserved the USDT default prefix exactly as `solana-usdt`.

## TDD evidence

1. Added compatibility tests, then ran `pnpm exec vp test run test/compatibility.test.ts`.
   - Red: failed because `createReadOnlySolanaPayments` and `SolanaPaymentsError` were absent.
2. Added the custom transfer-memo-prefix regression test, temporarily restored the legacy hard-coded prefix, and ran `pnpm exec vp test run test/token-config.test.ts`.
   - Red: expected `custom-payments:invoice_123`; received `solana-usdt:invoice_123`.
3. Restored the context-derived implementation and ran focused tests.
   - Green: 5 files, 22 tests passed.

## Tests and validation

- `pnpm exec vp test run test/compatibility.test.ts test/token-config.test.ts test/idempotency.test.ts test/payments.test.ts test/errors.test.ts` — passed: 5 files, 22 tests.
- `pnpm exec vp check` — passed: formatting, lint, and type checking.
- `pnpm exec vp test` — passed: 8 files, 33 tests.
- `pnpm exec vpr repo:build` — passed: TypeScript validation and package build.

## Self-review

- Verified the old factory and error constructors are aliases of the new canonical exports, preserving runtime compatibility.
- Verified generic and deprecated client types resolve to the same module shape.
- Verified custom prefixes cover request memos, transfer memo instructions, and transaction memo parsing; existing USDT memo expectations remain covered.
- Verified no internal production import still constructs `SolanaUsdtError`.
- No concerns identified.
