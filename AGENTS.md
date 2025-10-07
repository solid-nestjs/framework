# Repository Guidelines

## Project Structure & Module Organization

This monorepo powers the SOLID NestJS Framework. Runtime packages live under `packages-core/*` (REST, GraphQL, TypeORM, common). Bundled outputs ship from `packages-bundles/*`, developer tooling from `packages-tools/*`, and generated demos under `apps-examples/*`. Root `src/` contains lightweight orchestrators, `specs/` stores feature specs, `tasks/` tracks implementation plans, `docs/` holds architectural references, and `scripts/` centralizes automation.

## Build, Test, and Development Commands

Run `npm install` once, then rely on workspace-aware scripts. `npm run build` compiles everything; follow up with `npm run build -w <workspace>` after modifying any core package. `npm run test`, `npm run test:watch`, `npm run test:coverage`, `npm run test:e2e`, and `npm run test:workspaces` cover automated checks. Keep formatting consistent with `npm run format` and double-check via `npm run format:check`.

## Operational Guardrails

Always clear ports before `npm run start:dev`:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\cleanup-ports.ps1 -Port 3000
```

End sessions with `powershell -ExecutionPolicy Bypass -File .\scripts\kill-all-node-except-claude.ps1`, and prefer `timeout 30 npm run start:dev -w apps-examples/simple-crud-app`. SNEST CLI test apps belong in `packages-tools/cli/test-output/<app-name>/` (default to SQLite). Bash equivalents live under `scripts/*.sh` for non-Windows shells.

## Coding Style & Naming Conventions

The codebase is TypeScript-first with ES modules. Prettier enforces 2-space indentation, semicolons, single quotes, 80-character width, and LF endings. Class names finish with domain suffixes such as `Service`, `Resolver`, or `Controller` aligned with their directories. Place test helpers in `__tests__/helpers` so bundles stay lean.

## Testing Guidelines

Core packages keep unit specs alongside source (`packages-core/*/src/**/*.spec.ts`) and favor focused, table-driven cases. Example apps must host only E2E suites in `apps-examples/*/test/*.e2e-spec.ts`; never add unit tests there. Reuse dataset factories, run `npm run test:e2e -w apps-examples/<app>` for scenario validation, and capture coverage deltas via `npm run test:coverage` before merges.

## Planning & Collaboration

All planning, spec, and task docs must be in English. New feature work starts with a spec named `specs/yyyyMMddhhmm - feature-name.md`; request approval before moving on. Once accepted, create linked task notes under `tasks/yyyyMMddhhmm - feature-name/yyyyMMddhhmm - task-name.md`, ask again before implementation, and keep both documents updated as progress lands.

## Commit & Pull Request Guidelines

Commitlint enforces Conventional Commits (`feat`, `fix`, `docs`, `chore`, etc.); scope by workspace, e.g. `feat(rest-api): add pagination mixin`. PRs need a concise summary, linked tickets, impacted workspaces, and test evidence or CLI transcripts. Provide API/UI diffs with samples or screenshots and retain a conventional message even on squash merges.

## Versioning & Release Workflow

Lerna scripts (`npm run version:patch|minor|major|prerelease`, `npm run publish*`) are maintainer-only. Run `npm run format:check` and `npm run test:coverage` before tagging releases, and document schema or contract changes in the relevant `docs/*.md` file to keep adapters aligned.
