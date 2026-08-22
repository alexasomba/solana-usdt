## Development Workflow

### Branching, CI, and Releases

- Branches: `main` + `feat/X`, `fix/X`, `chore/X`.
- CI: GitHub Actions (tests/build) -> CF Workers Builds (deploy).
- Release: Release Please (CHANGELOG, SemVer, GitHub tags).

### Issue Tracking

Use **GitHub Issues**.

- Meaningful work -> new issue.
- PRs -> `Fixes #123`.
- Small PRs -> 1 issue map.

### Landing the Plane (Session Completion)

End session -> do ALL steps. Done = `git push` success.

**MANDATORY WORKFLOW:**

1. **File issues** - Open items.
2. **Quality gates** - `vp check --fix`, `vp test`, `vpr repo:build`.
3. **Update issues** - Close done, update WIP.
4. **PUSH TO REMOTE**:
   ```bash
   git pull --rebase
   git status
   git add -A
   git commit -m "..."  # if changes
   git push
   git status  # Must show "up to date"
   ```
5. **Clean up** - Drop stashes/remote branches.
6. **Verify** - All pushed.
7. **Hand off** - Context for next agent.

**CRITICAL RULES:**

- No push = not done.
- Never stop before push. Local code = lost code.
- You push. Never ask user to push.
- Push fail -> fix + retry -> success. changelog, repo-wide SemVer releases, GitHub releases, and `vX.Y.Z` tags.

<!-- SPECKIT START -->

For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan

<!-- SPECKIT END -->

<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Built-in Commands vs Scripts

`vp <name>` runs a built-in command. `vp run <name>` runs a `package.json` script or a `vite.config.ts` task. Scripts cannot overwrite built-ins, so `vp dev` and `vp run dev` may do different things. Check `package.json` and `vite.config.ts` first, and run `vp run <name>` when the project defines a script or task with that name.

## Tool Versions

Run `vp toolchain` to show versions and relationships in the active Vite+
release. Add a tool name to select part of the graph. For example, run
`vp toolchain vite`. Use `--global` to ignore the local `vite-plus` package. Use
`vp why <package>` to show the package-manager dependency graph.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->
