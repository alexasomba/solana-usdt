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
      typecheck: {
        command: "tsc -p tsconfig.json --noEmit",
      },
      check: {
        command: "vp check",
      },
      build: {
        command: "vp pack",
        dependsOn: ["typecheck"],
      },
      test: {
        command: "vp test run",
        dependsOn: ["build"],
      },
    },
  },
  staged: {
    "*": "vp check --fix",
  },
  fmt: {},
  lint: { options: { typeAware: true, typeCheck: true } },
});
