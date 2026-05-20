# Implement Digest

## Key Decisions

- Used a direct Kit-based implementation instead of Gill.
- Implemented payment references with Memo strings formatted as `solana-usdt:{reference}`.
- Kept verification tolerant of common parsed transaction response shapes from RPC providers.
- Fee quote is approximate in v1 because reliable fee simulation requires provider-specific support and a fully formed message.

## Artifacts Produced

- Package scaffold: `package.json`, TypeScript configs, Vitest config, README, license, gitignore.
- SDK modules: balances, transfers, payments, transactions, retry, idempotency, errors, and types.
- Test coverage: amount helpers, idempotency, client factory behavior, quote behavior, payment verification, errors, LiteSVM local runtime transfer flow, and read-only public mainnet RPC smoke.

## Open Risks

- Funded local-validator/devnet/mainnet smoke behavior still needs to be executed against the target RPC provider before production funds.
- Parsed transaction verification may need provider-specific hardening after testing against target RPC providers.
- Fee quotes remain approximate until a simulation-backed fee estimator is added.

## Handoff Notes

- Verification passed with `node_modules/.bin/tsc -p tsconfig.json --noEmit`, `vp test run`, `pnpm run test:integration`, `vp pack`, and `SOLANA_RPC_URL=https://api.mainnet.solana.com pnpm run smoke:mainnet`.
- Production hardening fixed ATA-aware monitoring/verification and idempotency replay after submitted-but-unconfirmed sends.
- Focus code review on provider-specific parsed transaction shapes and the final funded RPC smoke run.
