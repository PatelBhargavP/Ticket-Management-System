# Agent Guidelines

This repository contains two separate applications:

- Root app: the main Next.js application in `/`.
- MCP chat client: a separate Vite React application in `mcp-chat-client/`.

Treat them as separate apps that share one repository. Changes in one app should not assume build, lint, environment variables, routing, or runtime behavior from the other app.

## Required Checks

Before handing off changes, run the checks that match the files you touched:

```sh
npm run lint
npm run typecheck
npm --prefix mcp-chat-client run lint
npm --prefix mcp-chat-client run typecheck
```

The repo pre-commit hook runs lint and typecheck only for staged JS/TS files in the affected app. Do not bypass failing checks by weakening rules unless the rule is demonstrably wrong for this codebase and the change is documented.

## TypeScript Standards

- Keep strict typing intact. Both apps use strict TypeScript settings; new code should satisfy them without broad casts.
- Prefer `unknown` over `any` for untrusted or dynamic data, then narrow with runtime checks, schema validation, or helper functions.
- Avoid implicit `any`, unsafe object indexing, and untyped callback parameters.
- Use `import type` / `export type` for type-only imports and exports, especially in the Vite app where type-only imports avoid accidental runtime bundling.
- Model API payloads, server action results, component props, and database transformation shapes explicitly.
- Keep `null` and `undefined` handling deliberate. Check optional values before rendering, serializing, or passing them to typed APIs.
- Avoid silencing TypeScript with `as`, non-null assertions, or `eslint-disable` comments unless the invariant is local, obvious, and explained.

## DRY And Maintainability

- Follow DRY: do not duplicate validation, casting, request handling, or UI formatting logic when an existing helper or component can express the same behavior clearly.
- Prefer small shared helpers for repeated transformations, but do not introduce abstractions for one-off code.
- Keep functions focused. A function should generally either fetch, transform, validate, or render, not hide all of those concerns at once.
- Reuse existing UI components and local conventions before adding new patterns.
- Keep names specific to the domain: projects, tickets, statuses, priorities, API keys, transactions, and agent chat flows.

## Next.js Root App

The root app uses Next.js App Router conventions. The App Router is file-system based and uses React Server Components, Suspense, and Server Functions.

- Prefer Server Components by default. Add `"use client"` only when a component needs browser state, effects, event handlers, browser APIs, or client-only libraries.
- Keep server actions and route handlers typed at their boundaries. Validate incoming data before writing to the database.
- Do not import client-only modules into server-only files.
- Do not embed secrets, private tokens, connection strings, API keys, or privileged environment variables in Client Components or browser-bound code. Anything in a `"use client"` file, Vite client file, or `NEXT_PUBLIC_*` / `VITE_*` variable can be exposed to users.
- Keep secret access server-side in route handlers, server actions, server utilities, or backend services. Pass only the minimum non-sensitive derived data to Client Components.
- Keep route files, page files, layout files, and metadata exports aligned with Next.js file conventions.
- Avoid relying on generated `.next` artifacts. Source files and config should be the source of truth.
- Preserve the root ESLint setup based on Next.js flat config and Core Web Vitals guidance.
- When editing database models or utilities, consider both runtime behavior and serialized response shape. Mongoose documents, lean results, ObjectIds, and Date values often need explicit conversion.

## Vite MCP Chat Client

The `mcp-chat-client` app is a separate Vite React app.

- Remember that Vite transpiles TypeScript but does not typecheck during normal dev transforms. Type errors must be caught with `npm --prefix mcp-chat-client run typecheck`.
- Keep `tsc -b` passing. The client uses project references through `tsconfig.json`, `tsconfig.app.json`, and `tsconfig.node.json`.
- Use Vite-friendly TypeScript patterns: type-only imports for types, isolated-module-safe code, and explicit environment variable access through `import.meta.env`.
- Never place secrets in the Vite client. Vite-exposed environment variables are bundled for the browser when using the configured public prefix, so client code must only receive public URLs, public feature flags, or user-provided credentials intended for that session.
- Keep dynamic UI rendering defensive. Agent-produced schemas can be incomplete or malformed, so render unknown data with safe narrowing and graceful fallbacks.
- Avoid unnecessary Vite plugins, broad barrel imports, and heavyweight startup work. Vite performance depends on doing less work per requested module.

## Linting Rules And Hooks

- Unused imports and unused variables are lint errors. Remove them instead of prefixing with `_` unless the parameter is required by an external signature.
- Existing warnings may remain warnings, but new code should avoid adding more warnings.
- The `prepare` script in both apps sets `core.hooksPath` to `.githooks` when `git` is available and the install is inside a Git worktree.
- `.githooks/pre-commit` first runs any executable default Git pre-commit hook, then runs lint and typecheck for staged JS/TS files only. It skips apps that have no staged JS/TS changes.

## Review Guardrails

When reviewing changes in this repo, check:

- Does the change affect the root app, `mcp-chat-client`, or both?
- Were the correct lint and typecheck commands run for the affected app?
- Are route handlers, server actions, and UI components using explicit types at boundaries?
- Could any secret, credential, private endpoint, token, or privileged environment variable be exposed to browser code?
- Are dynamic values narrowed before use instead of cast broadly?
- Did the change add duplicated logic that belongs in an existing helper, component, or schema?
- Does the change preserve Next.js server/client component boundaries?
- Does the Vite client still typecheck independently of the root app?
- Are generated files, caches, build output, and unrelated formatting churn excluded?
- Are existing user changes preserved? Do not revert unrelated dirty work.

## Sources Behind These Rules

- Next.js App Router docs describe the App Router as file-system based and built on React features such as Server Components, Suspense, and Server Functions.
- Next.js production guidance recommends ESLint and TypeScript tooling to catch issues early.
- Vite docs state that Vite transpiles TypeScript but does not perform type checking, so type checking must happen through IDE/build checks such as `tsc --noEmit`.
- TypeScript docs recommend enabling strict checks for new codebases and call out `noImplicitAny` and `strictNullChecks` as important safety flags.
