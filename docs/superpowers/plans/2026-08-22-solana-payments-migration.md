# Solana Payments Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generalize the existing `solana-usdt` SDK into `solana-payments`, then publish a separate `better-auth-solana-payments` plugin for authenticated one-time payment intents.

**Architecture:** The existing SDK gains a generic token descriptor, canonical generic names, and deprecated USDT aliases. The Better Auth package is an independent plugin using a read-only SDK client, persisted payment intents, exact on-chain verification, and typed endpoints. The SDK is published before the auth package consumes it.

**Tech Stack:** TypeScript, Node.js 22+, pnpm 11, Vite+, Vitest, Oxlint, Oxfmt, tsdown, `@solana/kit`, Better Auth, `better-call`, and Zod.

**Spec:** `docs/superpowers/specs/2026-08-22-solana-payments-design.md`

## Global Constraints

- SDK package: `solana-payments`; Better Auth package: `better-auth-solana-payments`.
- `SOLANA_USDT` remains the default: mint `Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB`, 6 decimals, prefix `solana-usdt`.
- Keep deprecated `createSolanaUsdt`, `createReadOnlySolanaUsdt`, `SolanaUsdtClient`, and `SolanaUsdtError` aliases.
- Keep legacy `mint` and `decimals` options and existing `solana-usdt:` memo verification.
- Native SOL, automatic recurring billing, custodial subscriptions, native webhooks, wallet sign-in, and a monorepo are out of scope.
- Every behavior change starts with a failing Vitest test.
- Before release, run `vp check`, `vp test`, `vp pack`, packed type checks, and `publint`.
- Never place private keys in the Better Auth plugin.

---

## Phase 1: Generalize and publish the SDK

### Task 1: Add generic token configuration

**Files:**

- Modify: `src/constants.ts`
- Modify: `src/types.ts`
- Modify: `src/context.ts`
- Create: `test/token-config.test.ts`

**Produces:** `SolanaToken`, `SolanaPaymentsClientOptions`, `SolanaPaymentsReadOnlyClientOptions`, `SOLANA_USDT`, and `ClientContext.referencePrefix`.

- [ ] **Step 1: Write the failing tests**

Use tests named `defaults the generic client to USDT` and `uses a custom token and reference prefix`. The first must create a generic client, create a payment request for amount `"1"`, and assert the USDT mint, 6 decimals, and a `solana-usdt:` memo. The second must pass mint `So11111111111111111111111111111111111111112`, decimals 9, symbol `CUSTOM`, and prefix `custom-payments`, then assert all three values on the request.

- [ ] **Step 2: Run the focused test and confirm the expected missing-export failure**

Run: `vp test run test/token-config.test.ts`

Expected: FAIL because the generic factory and token types are not exported.

- [ ] **Step 3: Implement the token descriptor and context resolution**

Add this interface to `src/types.ts`:

    export interface SolanaToken {
      mint: AddressInput;
      decimals: number;
      symbol?: string;
      referencePrefix?: string;
    }

Add `SOLANA_USDT` and `DEFAULT_GENERIC_REFERENCE_PREFIX = "solana-payments"`. Resolve `options.token` first, then legacy `mint`/`decimals`, then USDT defaults. Store resolved mint, decimals, and reference prefix on `ClientContext`. Validate decimals as an integer from 0 through 18 and reject an empty prefix.

- [ ] **Step 4: Run focused and existing client tests**

Run: `vp test run test/token-config.test.ts test/client.test.ts test/payments.test.ts`

Expected: PASS, including existing USDT behavior.

- [ ] **Step 5: Commit**

  git add src/constants.ts src/types.ts src/context.ts test/token-config.test.ts
  git commit -m "feat: add generic Solana token configuration"

### Task 2: Add canonical generic factories, errors, and prefix handling

**Files:**

- Modify: `src/index.ts`
- Modify: `src/types.ts`
- Modify: `src/errors.ts`
- Modify: `src/idempotency.ts`
- Modify: `src/payments.ts`
- Modify: internal files importing `SolanaUsdtError`
- Create: `test/compatibility.test.ts`
- Modify: `test/errors.test.ts`
- Modify: `test/idempotency.test.ts`

**Produces:** `createSolanaPayments`, `createReadOnlySolanaPayments`, `SolanaPaymentsClient`, `SolanaPaymentsReadOnlyClient`, and `SolanaPaymentsError`.

- [ ] **Step 1: Write failing compatibility tests**

Test that the canonical factories expose transfers and payment methods. Test that the old factories still return clients and that `SolanaUsdtError === SolanaPaymentsError`.

- [ ] **Step 2: Run the focused test and confirm it fails**

Run: `vp test run test/compatibility.test.ts`

Expected: FAIL because the canonical names do not exist.

- [ ] **Step 3: Implement canonical names and deprecated aliases**

Rename the implementation class to `SolanaPaymentsError`, export `SolanaUsdtError` as the same class, rename factory implementations, alias the old factory names, rename generic client interfaces, and alias the old interfaces. Update internal error construction to use the canonical class.

- [ ] **Step 4: Thread `ctx.referencePrefix` through payment operations**

Use the resolved prefix for reference generation, memo creation, memo parsing, and mismatch errors. Keep the USDT preset default exactly `solana-usdt`; pass custom prefixes to `createReference`, `createMemo`, and `parseMemoReference`.

- [ ] **Step 5: Run focused and full tests**

Run: `vp test run test/compatibility.test.ts test/token-config.test.ts test/idempotency.test.ts test/payments.test.ts test/errors.test.ts`, then `vp test`.

Expected: all tests pass and existing `solana-usdt:` expectations remain green.

- [ ] **Step 6: Commit**

  git add src test
  git commit -m "feat: add generic Solana payments API"

### Task 3: Rename package metadata, docs, and skill

**Files:**

- Modify: `package.json`
- Modify: `README.md`
- Modify: `release-please-config.json`
- Rename: `skills/solana-usdt/` to `skills/solana-payments/`
- Modify: `skills/solana-payments/SKILL.md`
- Modify: `examples/smoke.mjs`
- Modify: `CHANGELOG.md`

**Produces:** A package whose npm, GitHub, README, Release Please, examples, and skill identity are `solana-payments`.

- [ ] **Step 1: Update package identity**

Set `name` to `solana-payments`, successor version to `0.4.0`, update description, homepage, bugs, repository, keywords, and Release Please package name. Preserve build, test, provenance, engine, files, and package-manager settings.

- [ ] **Step 2: Rename and regenerate the skill**

Run `git mv skills/solana-usdt skills/solana-payments` and `pnpm prepare`. Update frontmatter, imports, install commands, and examples to generic names. Add a migration note for deprecated USDT names.

- [ ] **Step 3: Update README and smoke example**

Document importing `SOLANA_USDT` and `createSolanaPayments` from `solana-payments`, the package migration, compatibility aliases, and unchanged memo-prefix behavior.

- [ ] **Step 4: Run all SDK quality gates**

Run `vp check`, `vp test`, `vp pack`, `pnpm run lint:package`, and `pnpm run lint:types`. Expected: all commands exit 0 and the packed artifact exposes generic names plus aliases.

- [ ] **Step 5: Commit**

  git add package.json README.md release-please-config.json skills examples CHANGELOG.md
  git commit -m "feat: rename SDK to solana-payments"

### Task 4: Publish the SDK successor and deprecate the old package

**Files:**

- Modify: `README.md`
- Modify: `CHANGELOG.md`

**Produces:** Public `solana-payments@0.4.0`, renamed GitHub repository, and an npm deprecation message for `solana-usdt`.

- [ ] **Step 1: Verify target availability**

Run `npm view solana-payments name version`. Expected: package not found. If it exists, stop and inspect ownership before publishing.

- [ ] **Step 2: Rename the GitHub repository and remote**

Run `gh repo rename solana-payments --repo alexasomba/solana-usdt --yes`, then `git remote set-url origin https://github.com/alexasomba/solana-payments.git` and `git remote -v`.

- [ ] **Step 3: Publish and verify the successor**

Run `pnpm publish --access public --provenance`, then `npm view solana-payments@0.4.0 version`.

- [ ] **Step 4: Deprecate the old npm package**

Run `npm deprecate solana-usdt@"*" "Package renamed to solana-payments. Install solana-payments and follow the migration guide."`, then `npm view solana-usdt deprecated`.

- [ ] **Step 5: Push and commit release documentation**

Run `git push -u origin codex/solana-payments-migration`. Commit generated docs with message `docs: publish Solana payments migration guidance`.

---

## Phase 2: Build and publish the Better Auth plugin

### Task 5: Scaffold the new Better Auth repository

**Files:**

- Create: `../better-auth-solana-payments/package.json`
- Create: `../better-auth-solana-payments/pnpm-workspace.yaml`
- Create: `../better-auth-solana-payments/tsconfig.json`
- Create: `../better-auth-solana-payments/tsconfig.build.json`
- Create: `../better-auth-solana-payments/tsconfig.pack.json`
- Create: `../better-auth-solana-payments/vite.config.ts`
- Create: `../better-auth-solana-payments/vitest.config.ts`
- Create: `../better-auth-solana-payments/src/version.ts`
- Create: `../better-auth-solana-payments/src/index.ts`
- Create: `../better-auth-solana-payments/src/client.ts`
- Create: `../better-auth-solana-payments/test/package-exports.test.ts`
- Create: `../better-auth-solana-payments/README.md`

**Produces:** Package `better-auth-solana-payments@0.1.0` with server and client entry points.

- [ ] **Step 1: Create the GitHub repository and checkout**

Run `gh repo create alexasomba/better-auth-solana-payments --public --description "One-time Solana payment integration for Better Auth" --clone` from the parent workspace. If it already exists, clone it into `../better-auth-solana-payments` without overwriting files.

- [ ] **Step 2: Add package metadata and exports**

Use `better-auth` and `solana-payments` as peer dependencies; use `better-call`, `defu`, and `zod` as runtime dependencies. Export `.` from `src/index.ts` and `./client` from `src/client.ts`, with Node 22 and pnpm 11 floors.

- [ ] **Step 3: Run the export test red, then implement minimal exports**

Run `vp test run test/package-exports.test.ts`. Expected first: FAIL because `solanaPayments` and `solanaPaymentsClient` are missing. Add those exports and `PACKAGE_VERSION = "0.1.0"`, rerun, and expect PASS.

- [ ] **Step 4: Add initial README and commit**

Document installation, server/client setup, and the one-time payment flow. Commit with `chore: scaffold Better Auth Solana payments package`.

### Task 6: Implement payment schema, store, and ownership

**Files:**

- Create: `../better-auth-solana-payments/src/types.ts`
- Create: `../better-auth-solana-payments/src/schema.ts`
- Create: `../better-auth-solana-payments/src/store.ts`
- Create: `../better-auth-solana-payments/test/schema.test.ts`
- Create: `../better-auth-solana-payments/test/store.test.ts`

**Produces:** `SolanaPaymentStatus`, `SolanaPayment`, `SolanaPaymentsOptions`, `getSchema`, and adapter-backed store methods.

- [ ] **Step 1: Write failing schema and store tests**

Test that `getSchema()` exposes `solanaPayment` with `reference`, `referenceType`, `referenceId`, `amount`, `mint`, `decimals`, `recipient`, `status`, `expiresAt`, `createdAt`, and `updatedAt`. Test statuses exactly `pending | paid | expired | failed`, decimal-string amounts, and idempotent paid updates.

- [ ] **Step 2: Run focused tests and confirm failure**

Run `vp test run test/schema.test.ts test/store.test.ts`. Expected: FAIL because types, schema, and store are missing.

- [ ] **Step 3: Implement precise public records**

Define `SolanaPaymentStatus = "pending" | "paid" | "expired" | "failed"`. Define `SolanaPayment` with string `amount` and `slot`, token `mint` and `decimals`, owner type/id, recipient, status, optional signature/metadata, and date fields. Store base-unit amounts and slots as strings to avoid number rounding.

- [ ] **Step 4: Implement store methods and ownership**

Implement `create`, `findById`, `findByReference`, `markPaid`, and `markExpired`. `markPaid` updates only pending records and returns the existing paid record on repetition. Require the session user; for `organizationId`, require the organization plugin and verify a member record before reading or writing.

- [ ] **Step 5: Run tests and commit**

Run `vp test run test/schema.test.ts test/store.test.ts`; expected PASS. Commit with `feat: add Solana payment persistence`.

### Task 7: Implement server endpoints and exact verification

**Files:**

- Create: `../better-auth-solana-payments/src/routes.ts`
- Modify: `../better-auth-solana-payments/src/index.ts`
- Modify: `../better-auth-solana-payments/src/types.ts`
- Create: `../better-auth-solana-payments/test/routes.test.ts`
- Create: `../better-auth-solana-payments/test/plugin.test.ts`

**Produces:** `solanaPayments(options)` and endpoints `createPayment`, `verifyPayment`, and `getPayment`.

- [ ] **Step 1: Write failing endpoint tests**

Cover creation with configured recipient/token, rejection of amount or recipient mismatch, expired intents, unauthorized ownership, organization membership, and repeated verification. Use an in-memory adapter and deterministic read-only SDK client.

- [ ] **Step 2: Run endpoint tests red**

Run `vp test run test/routes.test.ts test/plugin.test.ts`. Expected: FAIL because routes and plugin registration are missing.

- [ ] **Step 3: Implement configuration and create-payment**

Use options `{ client: SolanaPaymentsReadOnlyClient; recipient: AddressInput; paymentExpirationMs?: number; onPaymentComplete?: callback }`. Default expiration is 30 minutes. Normalize the recipient during construction. Accept amount, metadata, and optional organization ID; never accept recipient or mint from the request. Generate a reference, construct a Solana Pay URL, and persist before returning.

- [ ] **Step 4: Implement verify-payment and get-payment**

Verify using stored reference, amount, and recipient. Require `found === true`, atomically transition pending to paid, store signature and slot, and invoke the callback only on the transition. Repeated verification returns the stored paid result. Mark expired pending records before returning them from get-payment.

- [ ] **Step 5: Register plugin metadata and stable errors**

Use plugin ID `solanaPayments`, paths `POST /solana-payments/create-payment`, `POST /solana-payments/verify-payment`, and `GET /solana-payments/payment`. Define errors for missing session, unauthorized payment, expired payment, invalid payment, and mismatch. Expose `getSchema(options)`.

- [ ] **Step 6: Run tests and commit**

Run `vp test run test/routes.test.ts test/plugin.test.ts`; expected PASS. Commit with `feat: add Better Auth Solana payment endpoints`.

### Task 8: Implement client plugin, docs, CI, and release

**Files:**

- Modify: `../better-auth-solana-payments/src/client.ts`
- Modify: `../better-auth-solana-payments/README.md`
- Create: `../better-auth-solana-payments/test/client.test.ts`
- Create: `../better-auth-solana-payments/.github/workflows/ci.yml`
- Create: `../better-auth-solana-payments/.github/workflows/release-please.yml`
- Create: `../better-auth-solana-payments/release-please-config.json`

**Produces:** Typed client actions, complete docs, CI, Release Please, and a public npm package.

- [ ] **Step 1: Write the failing client test**

Assert that `solanaPaymentsClient()` registers ID `solanaPayments`, maps create and verify to POST, maps get to GET, and exposes `payment.create`, `payment.verify`, and `payment.get`.

- [ ] **Step 2: Run red, implement, and run green**

Run `vp test run test/client.test.ts`; expected first: FAIL because `src/client.ts` is missing. Implement Better Auth client module augmentation and fetch actions, rerun, and expect PASS.

- [ ] **Step 3: Complete README**

Document server/client setup, create/verify flow, decimal-string amounts, server-controlled recipient/token, RPC verification, no private keys, and no recurring subscriptions.

- [ ] **Step 4: Add CI and Release Please**

CI runs `vp check`, `vp test`, `vp pack`, `pnpm run lint:package`, and `pnpm run lint:types` on Node 22. Release Please uses package name `better-auth-solana-payments` and updates `CHANGELOG.md` and `src/version.ts`.

- [ ] **Step 5: Run full checks and publish**

Run `vp check`, `vp test`, `vp pack`, `pnpm run lint:package`, `pnpm run lint:types`, verify `npm view better-auth-solana-payments name version` reports an unused name, publish with `pnpm publish --access public --provenance`, and verify `npm view better-auth-solana-payments@0.1.0 version`.

- [ ] **Step 6: Push and verify clean public packages**

Run `git push -u origin main` in the new repository. In a temporary directory run `pnpm add solana-payments better-auth-solana-payments better-auth` and compile smoke imports of `SOLANA_USDT`, `createSolanaPayments`, `solanaPayments`, and `solanaPaymentsClient`. Record published versions, repository URLs, old-package deprecation status, and tests requiring live RPC credentials.
