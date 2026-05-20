# Feature Specification: Solana USDT Node SDK

**Feature Branch**: `001-solana-usdt-sdk`

**Created**: 2026-05-18

**Status**: Approved for implementation

**Input**: Build a Paystack-style TypeScript SDK for Solana USDT balances, transfers, payment requests, verification, retries, idempotency, and typed errors using Solana Kit.

## User Scenarios & Testing

### User Story 1 - Retrieve USDT balances (Priority: P1)

Backend developers can retrieve a wallet's USDT balance without manually deriving associated token accounts or parsing SPL Token account data.

**Why this priority**: Balance lookup is the minimum useful SDK capability and validates the core Solana RPC wiring.

**Independent Test**: Mock `getAccountInfo` for an associated token account and verify the SDK returns base units, display amount, owner, mint, token account, and slot.

**Acceptance Scenarios**:

1. **Given** a wallet with no USDT associated token account, **When** `balances.retrieve` is called, **Then** the SDK returns amount `0n` and the derived token account address.
2. **Given** a wallet with a parsed USDT token account, **When** `balances.retrieve` is called, **Then** the SDK returns the parsed amount and decimal display string.

---

### User Story 2 - Send USDT transfers (Priority: P1)

Backend developers can send USDT with a server-side Kit signer, automatic recipient ATA creation, retryable RPC calls, and a memo reference.

**Why this priority**: Transfers are the package's primary value proposition.

**Independent Test**: Mock RPC blockhash, send, and status calls; verify the transfer response includes signature, reference, source ATA, destination ATA, and confirmation status.

**Acceptance Scenarios**:

1. **Given** a server signer and recipient wallet, **When** `transfers.create` is called with amount and no reference, **Then** the SDK generates a reference, builds ATA + transfer + memo instructions, sends the transaction, and waits for confirmation.
2. **Given** an idempotency key with a stored result, **When** `transfers.create` is called again with the same key, **Then** the SDK returns the stored result without resending.

---

### User Story 3 - Verify and monitor payments (Priority: P2)

Developers can create off-chain payment requests and verify incoming USDT transfers by memo reference or transaction signature.

**Why this priority**: This maps Solana transaction behavior into the payment-SDK workflow expected from `paystack-node`.

**Independent Test**: Mock parsed transaction responses with SPL Token and Memo instructions, then verify reference, amount, recipient, slot, and status matching.

**Acceptance Scenarios**:

1. **Given** a payment request reference, **When** a matching signature is verified, **Then** the SDK returns a found payment with amount and memo reference.
2. **Given** a recipient wallet and cursor, **When** `payments.monitor` is called, **Then** the SDK scans recent signatures and returns matching parsed USDT payments.

### Edge Cases

- Invalid Solana addresses fail before RPC calls with `SolanaUsdtError`.
- Amounts with more decimals than the configured mint reject with `INVALID_AMOUNT`.
- RPC timeouts and transient failures are retried using configurable exponential backoff.
- Transaction status with `err` throws `TRANSACTION_FAILED`.
- Verification mismatches for reference, recipient, or amount throw `PAYMENT_MISMATCH`.

## Requirements

### Functional Requirements

- **FR-001**: The package MUST expose `createSolanaUsdt(options)` as the primary factory.
- **FR-002**: The client MUST default to Solana USDT mint `Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB` and `6` decimals.
- **FR-003**: The client MUST allow mint and decimal overrides for local/devnet tests.
- **FR-004**: The SDK MUST retrieve balances using associated token account derivation.
- **FR-005**: The SDK MUST build USDT transfers using SPL Token `TransferChecked`.
- **FR-006**: Transfers MUST attach a Memo instruction containing the payment reference.
- **FR-007**: Transfers MUST support optional idempotency storage.
- **FR-008**: Payment verification MUST support signature-based lookup and reference-based monitoring.
- **FR-009**: All SDK errors MUST normalize to `SolanaUsdtError`.
- **FR-010**: The package MUST ship TypeScript declarations and ESM output.

### Key Entities

- **TransferResult**: Sent transaction signature, reference, amount, mint, source/destination token accounts, and confirmation metadata.
- **PaymentRequest**: Off-chain expected payment with reference, amount, recipient, mint, memo, and metadata.
- **VerifiedPayment**: Parsed on-chain payment candidate with signature, reference, amount, recipient, slot, and status.
- **SolanaUsdtError**: Structured SDK error with stable code, endpoint, signature, slot, logs, retryability, and cause.

## Success Criteria

### Measurable Outcomes

- **SC-001**: TypeScript consumers can import the package, create a client, and call every public module with inferred types.
- **SC-002**: Unit tests cover amount parsing, idempotency, balance lookup, quotes, payment request creation, verification, retries, and structured errors.
- **SC-003**: `pnpm typecheck`, `pnpm test`, and `pnpm build` pass locally.
- **SC-004**: The README includes working usage examples for setup, balance lookup, transfer creation, and payment verification.

## Assumptions

- V1 targets server-side Node.js and receives a Kit-compatible signer from the application.
- Gill is not used in v1.
- Native HTTP webhooks are out of scope; monitoring is implemented as polling over Solana RPC.
- The SDK does not persist private keys.
