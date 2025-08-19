# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is the SOLID NestJS Framework - a powerful, modular framework for building scalable NestJS applications with automatic CRUD generation, advanced query capabilities, and extensible architecture. It follows SOLID principles and provides clean, maintainable architecture for enterprise-grade applications.

## Development Commands

### Port Management & Process Cleanup

Before running development servers, use these utilities to avoid port conflicts:

```bash
# Clean up specific port (default: 3000)
.\scripts\cleanup-ports.ps1 -Port 3000

# Safe start with automatic cleanup and timeout
.\scripts\safe-start-dev.ps1 -Port 3000 -Workspace "apps-examples/simple-crud-app" -Timeout 30

# Clean up ports using bash script
.\scripts\cleanup-ports.sh 3000
```

**Important for Claude Code**: Always clean up ports before running `npm run start:dev` to avoid orphaned processes occupying ports.

**Claude Code Workflow**:

1. Before running any `npm run start:dev` command, first run: `powershell -ExecutionPolicy Bypass -File ".\scripts\cleanup-ports.ps1" -Port [PORT_NUMBER]`
2. After testing or when done, run: `powershell -ExecutionPolicy Bypass -File ".\scripts\kill-all-node-except-claude.ps1"`
3. Always use timeout with `npm run start:dev` commands to prevent indefinite hanging: `timeout 30 npm run start:dev`
4. **CRITICAL**: When making changes to core packages (`packages-core/*`), always run `npm run build` to each modified package to compile the packages before testing in example apps (`apps-examples/*`)

### Testing

```bash
# Run all unit tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run tests in debug mode
npm run test:debug

# Run end-to-end tests
npm run test:e2e

# Run E2E tests with coverage
npm run test:e2e:coverage

# Run E2E tests in watch mode
npm run test:e2e:watch

# Run tests in all workspaces
npm run test:workspaces
```

### Building

```bash
# Build all packages
npm run build

# Build specific workspace package
npm run build -w packages-core/common
```

### Formatting

```bash
# Format all files
npm run format

# Check formatting without fixing
npm run format:check

# Format all workspaces
npm run format:workspaces
```

### Versioning and Publishing

```bash
# Create patch version
npm run version:patch

# Create minor version
npm run version:minor

# Create major version
npm run version:major

# Create prerelease version
npm run version:prerelease

# Publish packages
npm run publish

# Publish in CI environment
npm run publish:ci

# Version and publish in one step
npm run version-and-publish
```

### Running Examples

```bash
# Simple CRUD REST API example
npm run start:dev -w apps-examples/simple-crud-app

# Simple GraphQL CRUD example
npm run start:dev -w apps-examples/simple-graphql-crud-app

# Hybrid REST + GraphQL example
npm run start:dev -w apps-examples/simple-hybrid-crud-app

# Advanced CRUD with soft deletion and bulk operations
npm run start:dev -w apps-examples/advanced-crud-app

# Advanced hybrid with comprehensive database support (SQLite + SQL Server + PostgreSQL + MySQL)
npm run start:dev -w apps-examples/advanced-hybrid-crud-app

# Composite key GraphQL example
npm run start:dev -w apps-examples/composite-key-graphql-app
```

### Database Support in Examples

The **advanced-hybrid-crud-app** showcases comprehensive multi-database support:

```bash
# SQLite (default - no setup required)
cd apps-examples/advanced-hybrid-crud-app
npm run start:dev

# SQL Server with Docker
cd apps-examples/advanced-hybrid-crud-app
docker-compose up -d sqlserver
# Update .env: DB_TYPE=mssql
npm run start:dev

# PostgreSQL with Docker
cd apps-examples/advanced-hybrid-crud-app
docker-compose up -d postgres
# Update .env: DB_TYPE=postgres
npm run start:dev

# MySQL with Docker
cd apps-examples/advanced-hybrid-crud-app
docker-compose up -d mysql
# Update .env: DB_TYPE=mysql
npm run start:dev
```

### Database Testing Commands

```bash
# Test all databases (from advanced-hybrid-crud-app directory)
npm run test:e2e:sqlite     # ✅ 102/102 tests pass
npm run test:e2e:sqlserver  # ✅ 97/102 tests pass (5 bulk tests skipped)
npm run test:e2e:postgres   # ✅ 97/102 tests pass (5 bulk tests skipped)
npm run test:e2e:mysql      # ✅ 97/102 tests pass (5 bulk tests skipped)
```

## Architecture

### Package Structure

This is a monorepo with multiple packages organized as:

- **`packages-core/`** - Core framework packages

  - `common/` - Common interfaces, utilities, decorators, and types
  - `typeorm/` - TypeORM-specific service implementations and helpers
  - `rest-api/` - REST API controller mixins with Swagger integration
  - `graphql/` - GraphQL resolver mixins and utilities
  - `rest-graphql/` - Combined REST and GraphQL utilities

- **`packages-bundles/`** - Bundled packages for easy installation

  - `typeorm-crud/` - REST API with TypeORM bundle
  - `typeorm-graphql-crud/` - GraphQL with TypeORM bundle
  - `typeorm-hybrid-crud/` - REST + GraphQL with TypeORM bundle

- **`apps-examples/`** - Example applications demonstrating framework usage

### Package Dependency Restrictions

**CRITICAL**: The core packages must maintain strict dependency separation to preserve modular architecture:

| Package                      | ❌ PROHIBITED Dependencies                      | ✅ ALLOWED Dependencies                                   |
| ---------------------------- | ----------------------------------------------- | --------------------------------------------------------- |
| `packages-core/common`       | `@nestjs/swagger`, `@nestjs/graphql`, `typeorm` | Only `@nestjs/common`, `@nestjs/core`                     |
| `packages-core/rest-api`     | `@nestjs/graphql`, `typeorm`                    | `@nestjs/swagger`, `@solid-nestjs/common`                 |
| `packages-core/graphql`      | `@nestjs/swagger`, `typeorm`                    | `@nestjs/graphql`, `@solid-nestjs/common`                 |
| `packages-core/rest-graphql` | `typeorm`                                       | `@nestjs/swagger`, `@nestjs/graphql`, other core packages |
| `packages-core/typeorm`      | `@nestjs/swagger`, `@nestjs/graphql`            | `typeorm`, `@nestjs/typeorm`, `@solid-nestjs/common`      |

**Rules**:

1. The `common` package must remain technology-agnostic and contain only shared utilities
2. Specialized packages (`rest-api`, `graphql`, `typeorm`) must not cross-reference each other's technologies
3. Only `rest-graphql` may combine REST and GraphQL technologies, but never TypeORM
4. Bundle packages in `packages-bundles/` may combine any core packages as needed
5. Always verify dependency compliance before adding new imports or dependencies

### Design Patterns

1. **Mixin-Based Architecture**: Uses TypeScript mixins for composable functionality
2. **Structure Builders**: Configuration objects define service and controller behavior
3. **Context Pattern**: All operations receive a Context object for transaction/user info
4. **SOLID Principles**: Clear separation of concerns with dependency injection

### Key Concepts

#### Service Structure Pattern

Services are built using `CrudServiceStructure()` and mixins:

```typescript
export const serviceStructure = CrudServiceStructure({
  entityType: Product,
  createInputType: CreateProductDto,
  updateInputType: UpdateProductDto,
  findArgsType: FindProductArgs,
  relationsConfig: { relations: { supplier: true } },
});

export class ProductsService extends CrudServiceFrom(serviceStructure) {}
```

#### Controller Structure Pattern

Controllers extend services with API-specific concerns:

```typescript
const controllerStructure = CrudControllerStructure({
  ...serviceStructure,
  serviceType: ProductsService,
  operations: {
    findAll: true,
    create: { decorators: [() => UseGuards(AdminGuard)] },
  },
});

export class ProductsController extends CrudControllerFrom(
  controllerStructure,
) {}
```

#### Context-Based Operations

All operations use Context for transaction and user information:

```typescript
async create(context: Context, createInput: CreateProductDto): Promise<Product> {
  return this.runInTransaction(context, async (transactionContext) => {
    // All operations in this block share the same transaction
  });
}
```

### Soft Deletion & Bulk Operations

The framework provides comprehensive soft deletion and bulk operation support:

- **Soft Deletion**: Automatic detection of `@DeleteDateColumn()` entities
- **Recovery**: Built-in recovery operations for soft-deleted entities
- **Bulk Operations**: `bulkInsert`, `bulkUpdate`, `bulkRemove`, `bulkDelete`, `bulkRecover`
- **Cascade Support**: Proper handling of related entities in all operations

## File Organization

### Entity Files

- Entities go in `entities/` folders within each domain module
- Use TypeORM decorators with proper column types
- Include `@DeleteDateColumn()` for soft deletion support
- Add proper indexes for performance

### DTO Files

- DTOs in `dto/` folders organized by `args/`, `inputs/` subfolders
- `args/` for query arguments (FindArgs classes)
- `inputs/` for create/update DTOs
- Use class-validator decorators for validation
- Include Swagger `@ApiProperty()` decorators

### Service Files

- Define service structure as exported constant
- Extend from `CrudServiceFrom(serviceStructure)`
- Override lifecycle hooks as needed
- Use `@Transactional()` decorator for complex operations

### Controller Files

- Define controller structure extending service structure
- Extend from `CrudControllerFrom(controllerStructure)`
- Add custom endpoints as needed
- Use appropriate guards and decorators

## Testing Patterns

**CRITICAL**: Different testing strategies for different parts of the monorepo:

### Core Packages Testing

**Unit Tests for Core Packages** (`packages-core/*`):

- Place unit tests in `src/` alongside source code using `*.spec.ts` suffix
- Test individual functions, classes, and helpers in isolation
- Use Jest with `rootDir: "src"` configuration
- Focus on testing reusable framework components and utilities
- Mock external dependencies and test pure logic

### Example Applications Testing

**E2E Tests Only for Example Apps** (`apps-examples/*`):

- Example applications should ONLY have E2E tests in `test/` folder
- Use `*.e2e-spec.ts` suffix for E2E test files
- Test complete user workflows and integration scenarios
- Use `jest-e2e.config.js` configuration separate from unit tests
- Focus on demonstrating framework functionality end-to-end
- **NEVER** add unit tests to example applications

### Test File Organization

- **Core Packages**: `packages-core/*/src/**/*.spec.ts` (unit tests)
- **Example Apps**: `apps-examples/*/test/*.e2e-spec.ts` (E2E tests only)
- **Test Utilities**: Place in respective `test/` folders with `.helper.ts` or `.util.ts`

### Testing Commands

- **Core Unit Tests**: `npm run test -w packages-core/[package-name]`
- **Example E2E Tests**: `npm run test:e2e -w apps-examples/[app-name]`
- **All Tests**: `npm run test:workspaces` (runs all unit and E2E tests)

### What to Test Where

- **Unit Test in Core**: Helpers, mixins, utilities, validators, decorators
- **E2E Test in Apps**: Complete CRUD workflows, API endpoints, GraphQL queries, database operations

## Common Workflows

### Adding New Entity

1. Create entity class with proper decorators
2. Create DTOs for create/update/find operations
3. Define service structure and create service class
4. Define controller structure and create controller class
5. Register in module with TypeOrmModule.forFeature()
6. Add tests for all layers

### Implementing Soft Deletion

1. Add `@DeleteDateColumn()` to entity
2. Framework automatically detects and enables soft deletion
3. Operations like `remove()` become soft deletes by default
4. Use `hardRemove()` for permanent deletion
5. Use `recover()` for restoration

### Adding Bulk Operations

1. Bulk methods are available automatically in services
2. Create custom controller endpoints as needed
3. Use lifecycle hooks for validation and business logic
4. Ensure proper transaction handling

## Important Notes

- All database operations should go through the service layer
- Use the Context pattern consistently for transactions
- Leverage TypeScript types for better IntelliSense
- Follow the mixin pattern rather than traditional inheritance
- Test both individual and bulk operations thoroughly
- Use proper error handling with NestJS exception filters
- Implement proper validation with class-validator
- Document APIs with Swagger decorators

# Important in Planning and execution:

- the planning, tasks and documentation files must always be in english.
- when we plan a new feature you must make a document in the 'specs' folder with this naming convetion: "yyyyMMddhhmm - spec_name", after you make that specification document you must ask If it's okay before taking the next step.
- after making the 'spec' document and getting the 'ok' to continue, you must make a new doc for all the task planned (inside 'tasks/yyyyMMddhhmm - spec_name' folder) with the following naming convention: "yyyyMMddhhmm - task_name".
- after creating the tasks you must ask for the 'ok' to continue with the implementation.
- spec and task docs must be linked, and must be updated every time there is some progress in the implementation of the new feature.
