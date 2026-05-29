# Lint And Typecheck Hooks

This change adds repository-level pre-commit validation for both applications in this repo:

- the root Next.js application
- the Vite app in `mcp-chat-client`

## Package Scripts

The root `package.json` now includes:

```json
"lint": "eslint .",
"typecheck": "tsc --noEmit",
"prepare": "if command -v git >/dev/null 2>&1 && git rev-parse --git-dir >/dev/null 2>&1; then git config core.hooksPath .githooks; fi"
```

The `mcp-chat-client/package.json` now includes:

```json
"lint": "eslint .",
"typecheck": "tsc -b",
"prepare": "if command -v git >/dev/null 2>&1 && git rev-parse --git-dir >/dev/null 2>&1; then git config core.hooksPath .githooks; fi"
```

The `prepare` script runs after `npm install`. It first checks that `git` exists and that the install is happening inside a Git worktree, then sets the repository hook path to `.githooks`.

## Pre-Commit Hook

The new `.githooks/pre-commit` hook:

1. Runs any executable default `.git/hooks/pre-commit` hook first.
2. Detects staged files from Git.
3. Runs lint only for staged root app JS/TS files.
4. Runs TypeScript typecheck only for staged root app TypeScript files.
5. Runs lint only for staged `mcp-chat-client` JS/TS files.
6. Runs TypeScript typecheck only for staged `mcp-chat-client` TypeScript files.

This makes TypeScript-only errors, such as editor/build diagnostics that ESLint does not catch, block commits before they reach the repository.

## Lint And Type Fixes

The current lint/type fixes include:

- Replaced the root `next lint` command with `eslint .`.
- Updated the root ESLint config to use Next.js flat config exports directly.
- Promoted unused imports and unused variables to lint errors.
- Fixed React hook ordering and hook naming issues.
- Fixed JSX apostrophe escaping.
- Fixed `MessageBubble.tsx` and `DynamicRenderer.tsx` TypeScript errors caused by `unknown` values in JSX conditionals.
- Added the missing `text` UI component type in `mcp-chat-client`.
- Removed stale generated `.next` type validators from root TypeScript checking.
- Removed the existing unused imports, unused callback parameters, and unused local variables that were blocking the stricter lint rule.

Root lint still reports warnings, but exits successfully with zero errors.
