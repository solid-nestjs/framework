# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is the SOLID NestJS Framework - a powerful, modular framework for building scalable NestJS applications with automatic CRUD generation, advanced query capabilities, and extensible architecture. It follows SOLID principles and provides clean, maintainable architecture for enterprise-grade applications.

## Development Commands

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

# Advanced hybrid with GraphQL soft deletion
npm run start:dev -w apps-examples/advanced-hybrid-crud-app

# Composite key GraphQL example
npm run start:dev -w apps-examples/composite-key-graphql-app
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

### Service Tests

- Use `TestingModule` with repository mocking
- Test lifecycle hooks and custom methods
- Mock context objects for transaction testing

### Controller Tests

- Test HTTP endpoints with supertest for E2E tests
- Mock service methods for unit tests
- Test authentication and authorization flows

### E2E Tests

- Each example app has E2E tests in `test/` folder
- Use `jest-e2e.config.js` configuration
- Test complete CRUD workflows including soft deletion

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

- after planning always create a file in the 'tasks' folder with the following naming convention: "yyyyMMddhhmm - title", in that file you must add the summary of what was planned, and the task list to be executed (you must check them when they are finished).
