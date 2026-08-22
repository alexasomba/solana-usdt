import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: ["./src/index.ts"],
    format: ["esm"],
    platform: "node",
    dts: { build: true, incremental: false },
    clean: true,
    tsconfig: "./tsconfig.pack.json",
    deps: {
      neverBundle: ["@solana/kit", "@solana-program/token", "@solana-program/memo"],
    },
  },
  run: {
    tasks: {
      "repo:build": {
        command: "vp pack",
        dependsOn: ["typecheck"],
      },
    },
  },
  staged: {
    "*": "vp check --fix",
  },
  fmt: { ignorePatterns: ["CHANGELOG.md"] },
  lint: { options: { typeAware: true, typeCheck: true } },
});
