# Tasks: Solana USDT Node SDK

**Input**: Design documents from `/specs/001-solana-usdt-sdk/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Vitest tests are required for public API behavior.

## Phase 1: Setup

- [x] T001 Create package scaffold in `package.json`, `tsconfig.json`, `tsconfig.build.json`, `vitest.config.ts`, `.gitignore`, `LICENSE`
- [x] T002 Add README usage documentation in `README.md`

## Phase 2: Foundational

- [x] T003 [P] Implement constants, amount parsing, and address/context helpers in `src/constants.ts`, `src/amounts.ts`, `src/context.ts`
- [x] T004 [P] Implement structured errors, retry, RPC wrapper, and idempotency in `src/errors.ts`, `src/retry.ts`, `src/rpc.ts`, `src/idempotency.ts`
- [x] T005 Define public API types in `src/types.ts`

## Phase 3: User Story 1 - Retrieve USDT balances

- [x] T006 [US1] Implement ATA derivation and token account balance reads in `src/token.ts`
- [x] T007 [US1] Implement `balances.retrieve` in `src/balances.ts`
- [x] T008 [P] [US1] Add balance and quote tests in `test/client.test.ts`

## Phase 4: User Story 2 - Send USDT transfers

- [x] T009 [US2] Implement transfer quotes and instruction construction in `src/transfers.ts`
- [x] T010 [US2] Implement transaction signing, sending, confirmation, and idempotency reuse in `src/transfers.ts`, `src/transactions.ts`
- [x] T011 [P] [US2] Add idempotency and error tests in `test/idempotency.test.ts`, `test/errors.test.ts`

## Phase 5: User Story 3 - Verify and monitor payments

- [x] T012 [US3] Implement payment request creation, signature verification, and monitor polling in `src/payments.ts`
- [x] T013 [P] [US3] Add payment verification tests in `test/payments.test.ts`

## Phase 6: Polish

- [x] T014 Export all public modules and Kit signer helpers in `src/index.ts`
- [x] T015 Add amount helper tests in `test/amounts.test.ts`
- [ ] T016 Run `pnpm install`, `pnpm typecheck`, `pnpm test`, and `pnpm build`
