# Research: Solana USDT Node SDK

## Decisions

- Use `@solana/kit` as the SDK foundation because Solana's official JavaScript docs position it as the modern TypeScript SDK.
- Use `@solana-program/token` for SPL Token generated instruction builders and associated token PDA derivation.
- Use `@solana-program/memo` to attach payment references on-chain.
- Keep Gill out of v1 to minimize abstraction layers; add an adapter later if it improves ergonomics.
- Implement monitoring as polling because Solana does not provide Paystack-style HTTP webhooks.

## Package Versions

- `@solana/kit@6.9.0`
- `@solana-program/token@0.13.0`
- `@solana-program/memo@0.11.0`
- `typescript@^5.9.3`
- `vitest@^4.0.13`

## Risks

- RPC providers may throttle or return transient transport failures, so all RPC calls are wrapped in bounded retry logic.
- Parsed transaction formats can vary between RPC providers; verification accepts common parsed Memo and `transferChecked` shapes.
- Mainnet USDT transfers require real SOL for fees and rent; integration tests must use mint override on local/devnet.
