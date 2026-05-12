# Repository Guidelines

## Project Structure & Module Organization

This monorepo powers the SOLID NestJS Framework. Runtime packages live under `packages-core/*` (REST, GraphQL, TypeORM, common). Bundled outputs ship from `packages-bundles/*`, developer tooling from `packages-tools/*`, and generated demos under `apps-examples/*`. Root `src/` contains lightweight orchestrators, `specs/` stores feature specs, `tasks/` tracks implementation plans, `docs/` holds architectural references, and `scripts/` centralizes automation.

## Build, Test, and Development Commands

Run `npm install` once, then rely on workspace-aware scripts. `npm run build` compiles everything; follow up with `npm run build -w <workspace>` after modifying any core package. `npm run test`, `npm run test:watch`, `npm run test:coverage`, `npm run test:e2e`, and `npm run test:workspaces` cover automated checks. Keep formatting consistent with `npm run format` and double-check via `npm run format:check`.

**Critical workflow:** after changing any core package, you must rebuild before testing in example apps. Example apps consume the compiled `dist/` of core packages, not source.

```bash
npm run build -w packages-core/common   # after editing common
npm run test:e2e -w apps-examples/simple-crud-app   # then verify
```

## Package Dependency Restrictions

Core packages enforce strict separation. Violating these breaks the modular architecture:

| Package | Prohibited | Allowed |
|---|---|---|
| `packages-core/common` | `@nestjs/swagger`, `@nestjs/graphql`, `typeorm` | Only `@nestjs/common`, `@nestjs/core` |
| `packages-core/rest-api` | `@nestjs/graphql`, `typeorm` | `@nestjs/swagger`, `@solid-nestjs/common` |
| `packages-core/graphql` | `@nestjs/swagger`, `typeorm` | `@nestjs/graphql`, `@solid-nestjs/common` |
| `packages-core/rest-graphql` | `typeorm` | `@nestjs/swagger`, `@nestjs/graphql`, other core packages |
| `packages-core/typeorm` | `@nestjs/swagger`, `@nestjs/graphql` | `typeorm`, `@nestjs/typeorm`, `@solid-nestjs/common` |

Only `packages-core/rest-graphql` may combine REST and GraphQL. Bundle packages in `packages-bundles/` may combine anything.

## Operational Guardrails

This is a CommonJS project (tsconfig: `"module": "CommonJS"`). On Linux/Mac use the bash helper; on Windows use the PowerShell equivalent:

```bash
bash scripts/cleanup-ports.sh 3000        # Linux/Mac — clear port before start:dev
powershell -File scripts/cleanup-ports.ps1 -Port 3000  # Windows equivalent
```

SNEST CLI test apps belong in `packages-tools/cli/test-output/<app-name>/` (default to SQLite). This directory is gitignored.

## Coding Style & Naming Conventions

Prettier enforces 2-space indentation, semicolons, single quotes, 80-character width, and LF endings (`.gitattributes` enforces LF for `.ts/.js/.json/.md`). Class names finish with domain suffixes such as `Service`, `Resolver`, or `Controller` aligned with their directories. Place test helpers in `__tests__/helpers` so bundles stay lean.

## Testing Guidelines

Core packages keep unit specs alongside source in `__tests__/` directories (`packages-core/*/src/**/__tests__/*.spec.ts`) and favor focused, table-driven cases.

**Unit test quirks:**
- `jest.setup.js` stubs all `console.*` methods (log silently suppressed)
- Requires `reflect-metadata` for decorator support
- Timeout: 30s. Module name mapping resolves `@solid-nestjs/<pkg>` to source.

Example apps must host **only** E2E suites in `apps-examples/*/test/*.e2e-spec.ts`; never add unit tests there.

**E2E test quirks:**
- `jest-e2e.config.js` runs serially (`maxWorkers: 1`) with `forceExit` and `detectOpenHandles`
- `jest-e2e.setup.js` injects a 100ms delay after each test to prevent DB connection issues
- Tracks unhandled promise rejections to surface async leaks
- Timeout: 60s

To run E2E for a single app: `npm run test:e2e -w apps-examples/<app>`
To run all tests across workspaces: `npm run test:workspaces`

## Planning & Collaboration

All planning, spec, and task docs must be in English. New feature work starts with a spec named `specs/yyyyMMddhhmm - feature-name.md`; request approval before moving on. Once accepted, create linked task notes under `tasks/yyyyMMddhhmm - feature-name/yyyyMMddhhmm - task-name.md`, ask again before implementation, and keep both documents updated as progress lands.

## Documentation Conventions

Documentation lives under [`docs/`](docs/README.md) in a flat structure indexed by category. When implementing a new feature, you must create or update the corresponding document following that structure. If the feature spans a topic that does not fit any existing file, add a new well-named `.md` file and register it in `docs/README.md`. Do not leave features undocumented.

## Commit & Pull Request Guidelines

Commitlint enforces Conventional Commits (`feat`, `fix`, `docs`, `chore`, etc.); scope by workspace, e.g. `feat(rest-api): add pagination mixin`. PRs need a concise summary, linked tickets, impacted workspaces, and test evidence or CLI transcripts. Provide API/UI diffs with samples or screenshots and retain a conventional message even on squash merges.

## Versioning & Release Workflow

Lerna scripts (`npm run version:patch|minor|major|prerelease`, `npm run publish*`) are maintainer-only. Run `npm run format:check` and `npm run test:coverage` before tagging releases, and document schema or contract changes in the relevant `docs/*.md` file to keep adapters aligned.
