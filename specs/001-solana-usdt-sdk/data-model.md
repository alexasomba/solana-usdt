# Data Model: Solana USDT Node SDK

## TransferResult

- `signature`: Solana transaction signature returned by RPC.
- `reference`: Memo-backed reference for reconciliation.
- `idempotencyKey`: Optional key used to dedupe transfer sends.
- `mint`: SPL mint address.
- `amount`: Base-unit bigint.
- `displayAmount`: Decimal string for humans/logs.
- `sourceTokenAccount`: Sender associated token account.
- `destinationTokenAccount`: Recipient associated token account.
- `slot`: Confirmation slot when available.
- `confirmationStatus`: Transaction status returned by RPC.

## PaymentRequest

- `reference`: Generated or caller-supplied payment reference.
- `recipient`: Optional expected wallet or token account owner.
- `mint`: Expected mint.
- `amount`: Expected base units.
- `displayAmount`: Expected decimal amount.
- `decimals`: Mint decimals used for parsing.
- `memo`: On-chain memo string to match.
- `metadata`: Caller-owned off-chain metadata.
- `createdAt`: ISO timestamp.

## VerifiedPayment

- `found`: Whether a match was found.
- `reference`: Parsed memo reference.
- `signature`: Source transaction signature.
- `recipient`: Parsed destination token account when available.
- `amount`: Parsed transfer amount.
- `displayAmount`: Decimal string.
- `slot`: Confirmation slot.
- `confirmationStatus`: RPC confirmation status.
- `memo`: Raw memo instruction text.

## SolanaUsdtError

- `code`: Stable SDK error code.
- `message`: Human-readable message.
- `endpoint`: RPC method when applicable.
- `signature`: Transaction signature when applicable.
- `slot`: Slot when applicable.
- `logs`: Transaction logs when available.
- `retryable`: Whether retrying may succeed.
- `cause`: Original thrown value.
- `meta`: Structured extra context.
