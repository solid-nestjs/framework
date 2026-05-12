# Architecture Overview

The SOLID NestJS Framework generates CRUD applications from typed configuration objects, following SOLID principles and a composition-over-inheritance design.

## Monorepo Structure

```
framework/
├── packages-core/       # Core runtime packages (independent, modular)
│   ├── common/          # Shared interfaces, utilities, decorators, types
│   ├── typeorm/         # TypeORM-specific service implementations
│   ├── rest-api/        # REST controller mixins + Swagger
│   ├── graphql/         # GraphQL resolver mixins
│   └── rest-graphql/    # Combined REST + GraphQL utilities
├── packages-bundles/    # Bundled combinations for easy installation
│   ├── typeorm-crud/         # REST + TypeORM
│   ├── typeorm-graphql-crud/ # GraphQL + TypeORM
│   └── typeorm-hybrid-crud/  # REST + GraphQL + TypeORM
├── packages-tools/      # Developer tooling (CLI, generators)
├── apps-examples/       # Demo applications (E2E tested)
├── specs/               # Feature specifications
├── tasks/               # Implementation task plans
└── docs/                # Architecture & API documentation
```

**Why this structure:** Users install only what they need. Core packages stay lean — a GraphQL user never pulls in Swagger dependencies. Bundle packages provide convenience all-in-ones.

## Core Design: Mixin-Based Composition

The framework rejects traditional inheritance in favor of **TypeScript mixins** — factory functions that return classes from configuration objects. This replaces `extends BaseCrudService` with `extends CrudServiceFrom(config)`.

```typescript
// Service: extend a mixin, not a base class
export class ProductsService extends CrudServiceFrom(serviceStructure) {}

// Controller: same pattern, different factory
export class ProductsController extends CrudControllerFrom(controllerStructure) {}
```

**Why mixins over inheritance:**
- Multiple behaviors compose without deep hierarchy
- Stronger type inference (TypeScript tracks the exact return type)
- Configuration stays decoupled from implementation
- Easy to test — inject configuration rather than mock inherited methods
- New ORMs (Prisma, Mongoose) plug in as new mixin factories

## Structure Builder Pattern

Configuration flows through a two-layer builder:

```
CrudServiceStructure(config) → service structure object
CrudControllerStructure({ ...serviceStructure, ...apiConfig }) → controller structure object
```

The service structure defines **data operations** — entity type, DTOs, find args, relation config, transactional flags. The controller structure extends it with **API concerns** — service type, exposed operations, route paths, guards.

```typescript
const serviceStructure = CrudServiceStructure({
  entityType: Product,
  createInputType: CreateProductDto,
  updateInputType: UpdateProductDto,
  findArgsType: FindProductArgs,
  relationsConfig: { relations: { category: true } },
  functions: {
    create: { transactional: true },
    bulkInsert: { transactional: true },
  },
});

const controllerStructure = CrudControllerStructure({
  ...serviceStructure,
  serviceType: ProductsService,
  operations: {
    findAll: true,
    create: { decorators: [() => UseGuards(AdminGuard)] },
  },
  routeConfig: { path: 'products' },
});
```

**Why structures over decorators:** Type-safe, reusable, testable, and composable. The same service structure feeds both REST and GraphQL controllers.

## Package Dependency Restrictions

Core packages enforce strict separation. Only bundle packages may combine everything.

| Package | Prohibited | Allowed |
|---|---|---|
| `packages-core/common` | `@nestjs/swagger`, `@nestjs/graphql`, `typeorm` | `@nestjs/common`, `@nestjs/core` |
| `packages-core/rest-api` | `@nestjs/graphql`, `typeorm` | `@nestjs/swagger`, `@solid-nestjs/common` |
| `packages-core/graphql` | `@nestjs/swagger`, `typeorm` | `@nestjs/graphql`, `@solid-nestjs/common` |
| `packages-core/rest-graphql` | `typeorm` | `@nestjs/swagger`, `@nestjs/graphql`, other core |
| `packages-core/typeorm` | `@nestjs/swagger`, `@nestjs/graphql` | `typeorm`, `@nestjs/typeorm`, `@solid-nestjs/common` |

The `common` package stays technology-agnostic. Specialized packages never cross-reference each other's technologies. Only `rest-graphql` combines REST and GraphQL — and never TypeORM.

## Context-Based Transaction Management

Every CRUD operation receives a `Context` object. Transactions are managed through the context, not global state:

```typescript
// Automatic: flagged per operation in the structure
functions: { create: { transactional: true } }

// Manual: wrap multiple operations
async transferFunds(context: Context) {
  return this.runInTransaction(context, async (tx) => {
    await this.debit(tx, fromAccount, amount);
    await this.credit(tx, toAccount, amount);
  });
}

// Decorator-based (on any DataService/CrudService method)
@Transaction()
async complexOperation(context: Context) { ... }
```

**Why context-based:** ORM-agnostic, supports nested transactions, testable with mock contexts, and avoids global transaction state.

## Unified Decorator System

SOLID Decorators apply TypeORM, GraphQL, Swagger, and validation decorators from a single declaration:

```typescript
@SolidEntity()
export class Product {
  @SolidId({ generated: 'uuid', description: 'Product ID' })
  id: string;

  @SolidField({ description: 'Product price', precision: 10, scale: 2, min: 0 })
  price: number;
}
```

One `@SolidField()` replaces 4+ decorators. Adapters auto-register when their packages are installed — no manual setup. See [solid-decorators.md](solid-decorators.md) for full reference.

## Soft Deletion & Bulk Operations

- **Soft delete**: Add `@SolidDeletedAt()` to an entity. The framework auto-detects and makes `remove()` a soft delete. Use `hardRemove()` for permanent deletion, `recover()` for restoration.
- **Bulk operations**: `bulkInsert`, `bulkUpdate`, `bulkRemove`, `bulkDelete`, `bulkRecover` — all transactional with lifecycle hooks (`beforeBulkInsert`, `afterBulkUpdate`, etc.).

## Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Composition mechanism | TypeScript mixins via factory functions | Flexible, type-safe, testable |
| Configuration | Structure builder objects (not decorators) | Decouples config from class, composable between service/controller |
| Package organization | Enforced separation by concern | Users don't pull unused ORM/API deps; common stays pure |
| Type safety | TypeScript-first, no JS compat layer | Compile-time safety, rich IntelliSense |
| Transactions | Context-based (`runInTransaction`) | ORM-agnostic, supports nesting, testable |
| Soft deletion | TypeORM `DeleteDateColumn` with framework integration | Leverages native DB features, auto-detected, cascade support |
| Bulk operations | Service-level with QueryBuilder | High performance, transactional, lifecycle hooks |
| Unified decorators | Adapter plugin system | One decorator → all technologies; adapters auto-register from installed packages |

## Further Reading

- [SOLID Decorators Reference](solid-decorators.md) — `@SolidEntity`, `@SolidField`, `@SolidRelation`, etc.
- [Validation Guide](validation.md) — Automatic validation inference and adapter customization
