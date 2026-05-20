# solana-usdt — Skill Spec

A developer-friendly Node.js SDK for USDT balance retrieval, transfer quotes, payments, and transaction verification on Solana. The library is built on top of the modern `@solana/kit` and `@solana-program/token`.

## Domains

| Domain                  | Description                                                                                     | Skills      |
| ----------------------- | ----------------------------------------------------------------------------------------------- | ----------- |
| Solana USDT Integration | Interacting with the Solana USDT SDK to fetch balances, execute transfers, and verify payments. | solana-usdt |

## Skill Inventory

| Skill       | Type | Domain                  | What it covers                                                                                                                                 | Failure modes |
| ----------- | ---- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| solana-usdt | core | solana-usdt-integration | Client creation, balances retrieval, quoting and executing transfers, payment request creation and verification, transaction wait and polling. | 3             |

## Failure Mode Inventory

### solana-usdt (3 failure modes)

| #   | Mistake                                                         | Priority | Source              | Cross-skill? |
| --- | --------------------------------------------------------------- | -------- | ------------------- | ------------ |
| 1   | Using incorrect decimals or failing to parse raw bigint amounts | HIGH     | src/amounts.ts      | —            |
| 2   | Not handling idempotency for retries on network failures        | CRITICAL | src/transfers.ts    | —            |
| 3   | Polling transaction status with too short of a timeout          | HIGH     | src/transactions.ts | —            |

## Tensions

None.

## Cross-References

None.

## Subsystems & Reference Candidates

| Skill       | Subsystems | Reference candidates |
| ----------- | ---------- | -------------------- |
| solana-usdt | —          | —                    |

## Recommended Skill File Structure

- **Core skills:** `skills/solana-usdt/SKILL.md`
- **Framework skills:** None
- **Lifecycle skills:** None
- **Composition skills:** None
- **Reference files:** None

## Composition Opportunities

| Library     | Integration points                                  | Composition skill needed? |
| ----------- | --------------------------------------------------- | ------------------------- |
| @solana/kit | Client signer configuration, transaction signatures | No                        |
