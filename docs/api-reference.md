# API Reference

Comprehensive reference for each SOLID NestJS package.

---

## @solid-nestjs/common

Base package — zero ORM/web-framework dependencies.

### Interfaces

| Name | Description |
|---|---|
| `Context` | Request-scoped data bag (empty interface, meant to be extended) |
| `Entity<IdType>` | Base entity contract: `{ id: IdType }` |
| `IdTypeFrom<T>` | Extracts `IdType` from `Entity<IdType>` |
| `Constructor<T>` | `new (...args: any[]) => T` |
| `DeepPartial<T>` | Recursive `?` on all properties |
| `DataService<Id, E, F, C>` | Read-only service: `findAll`, `findOne`, `groupBy` |
| `CudService<Id, E, CI, UI, F, C>` | Write service: `create`, `update`, `remove` |
| `CrudService<Id, E, CI, UI, F, C>` | Full CRUD (extends `DataService` + `CudService`) |
| `SoftDeletableCudService<...>` | Adds `softRemove`, `hardRemove`, `recover` |
| `SoftDeletableCrudService<...>` | Full CRUD with soft deletion |

### Input Interfaces

| Interface | Description |
|---|---|
| `FindArgs<T>` | `{ pagination?, where?, orderBy? }` |
| `Where<T>` | Recursive filter with `_and`/`_or` operators |
| `OrderBy<T>` | `{ [K]?: OrderByTypes }` |
| `PaginationRequest` | `{ skip?, take?, page?, limit? }` |
| `GroupByArgs<T>` | `FindArgs<T>` + `{ groupBy: GroupByRequest<T> }` |
| `GroupByRequest<T>` | `{ fields: GroupBy<T>; aggregates: AggregateField[] }` |

### Output Interfaces

| Interface | Description |
|---|---|
| `PaginationResult` | `{ total, count, limit?, page, pageCount, hasNextPage, hasPreviousPage }` |
| `GroupResult<T>` | `{ key: Record<string, any>; aggregates: Record<string, any> }` |
| `GroupedPaginationResult<T>` | `{ groups: GroupResult<T>[]; pagination: PaginationResult }` |

### Filter Types

```typescript
interface StringFilter {
  _eq?, _neq?, _in?, _startswith?, _notstartswith?,
  _endswith?, _notendswith?, _contains?, _notcontains?,
  _like?, _notlike?: string;
}
interface NumberFilter {
  _eq?, _neq?, _gt?, _gte?, _lt?, _lte?, _in?,
  _between?, _notbetween?: number;
}
interface DateFilter {
  _eq?, _neq?, _gt?, _gte?, _lt?, _lte?, _in?,
  _between?, _notbetween?: Date;
}
```

### Enums

| Enum | Members |
|---|---|
| `StandardActions` | `Create`, `Update`, `Remove`, `Recover` |
| `OrderByTypes` | `ASC`, `DESC` |
| `AggregateFunctionTypes` | `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`, `COUNT_DISTINCT` |

### Utility Types

| Type | Purpose |
|---|---|
| `Prettify<T>` | Flattens intersection types for better IDE display |
| `UnionToIntersection<U>` | Converts union types to intersection |
| `PickPrimitive<T>` | Filters to primitives only |
| `InferDtoType<T>` | Extracts DTO types for type inference |

### Decorators (common)

| Decorator | Purpose |
|---|---|
| `@SolidEntity()` | Marks a class as a SOLID entity |
| `@SolidInput()` | Marks a class as a SOLID input DTO |
| `@SolidId()` | Marks the primary key field |
| `@SolidField(options?)` | Configures field metadata |
| `@SolidRelation(options?)` | Configures relation metadata |
| `@SolidOneToMany()`, `@SolidManyToOne()`, `@SolidOneToOne()`, `@SolidManyToMany()` | Relation type decorators |
| `@SolidTimestamp()` | Timestamp field marker |
| `@SolidCreatedAt()` | Auto-managed creation timestamp |
| `@SolidUpdatedAt()` | Auto-managed update timestamp |
| `@SolidDeletedAt()` | Soft-delete timestamp |
| `@CurrentContext()` | Parameter decorator — injects `Context` |
| `@IgnoreArg()` | Excludes a field from DTO generation |
| `@WrappedBy(wrapperFn, options?)` | Wraps a method call with a function (used by `@Transactional`) |

### Metadata & DTO Generators

The package includes a metadata storage system (`MetadataStorage`) and DTO generator helpers (`DtoGeneratorBaseHelper`) that automatically create input/output types from entity metadata.

---

## @solid-nestjs/typeorm

TypeORM integration — mixins and transaction utilities.

### Mixins

| Factory | Returns |
|---|---|
| `DataServiceFrom(structure)` | `DataService` class |
| `DataServiceExtendedFrom(structure)` | `DataService` class + plugin support |
| `CrudServiceFrom(structure)` | `CrudService` class |
| `CrudServiceExtendedFrom(structure)` | `CrudService` class + plugin support |

```typescript
const structure = CrudServiceStructure({
  entityType: Product,
  createInputType: CreateProductDto,
  updateInputType: UpdateProductDto,
  findArgsType: FindProductArgs,
});

export class ProductsService extends CrudServiceFrom(structure) {}
```

### Structure Configuration

```typescript
CrudServiceStructure({
  entityType, createInputType, updateInputType, findArgsType,
  relationsConfig?: {
    mainAlias?: string;
    relations?: { [key]: boolean | { relations?: ... } };
  },
  lockMode?: LockMode,
  functions?: {
    findAll?: OperationConfig;
    findOne?: OperationConfig;
    create?: OperationConfig;
    update?: OperationConfig;
    remove?: OperationConfig;
    softRemove?: OperationConfig;
    hardRemove?: OperationConfig;
    recover?: OperationConfig;
    bulkInsert?: OperationConfig;
    bulkUpdate?: OperationConfig;
    bulkRemove?: OperationConfig;
    bulkDelete?: OperationConfig;
    bulkRecover?: OperationConfig;
  },
  eventHandlers?: { /* before/after hooks */ },
  plugins?: ServicePlugin[],
})

interface OperationConfig {
  relationsConfig?: RelationsConfig;
  lockMode?: LockMode;
  transactional?: boolean;
  isolationLevel?: IsolationLevel;
  decorators?: MethodDecorator[];
}
```

### Lock Modes

`optimistic` | `pessimistic_read` | `pessimistic_write` | `dirty_read` | `pessimistic_partial_write` | `pessimistic_write_or_fail` | `for_no_key_update`

### Isolation Levels

`READ_UNCOMMITTED` | `READ_COMMITTED` | `REPEATABLE_READ` | `SERIALIZABLE`

### Decorators (typeorm)

| Decorator | Purpose |
|---|---|
| `@Transactional(options?)` | Wraps method in DB transaction |
| `@AutoIncrement<T>('field')` | Auto-increments a composite key field |

### Service Helpers

| Function | Description |
|---|---|
| `runInTransaction(context, dataSource, fn, isolationLevel?)` | Manual transaction runner |
| `getEntityManager(context)` | Extracts TypeORM `EntityManager` from context |
| `getRepository(context, entityType)` | Gets TypeORM `Repository` |
| `getQueryBuilder(context, entityType, alias?)` | Gets TypeORM `SelectQueryBuilder` |

### Bulk Operation Result Types

```typescript
interface BulkInsertResult { ids: (string | number)[]; }
interface BulkUpdateResult { affected?: number; }
interface BulkRemoveResult { affected?: number; }
interface BulkDeleteResult { affected?: number; }
interface BulkRecoverResult { affected?: number; }
```

### Seeder System

| Class | Purpose |
|---|---|
| `BaseSeeder` | Extend to create database seeders |
| `SeederService` | Orchestrates seed execution |

---

## @solid-nestjs/rest-api

REST API layer — controller mixins and Swagger integration.

### Mixins

| Factory | Returns |
|---|---|
| `DataControllerFrom(structure)` | `DataController` with GET endpoints |
| `DataControllerExtendedFrom(structure)` | `DataController` + plugin support |
| `CrudControllerFrom(structure)` | Full CRUD REST controller |
| `CrudControllerExtendedFrom(structure)` | CRUD controller + plugin support |

```typescript
const structure = CrudControllerStructure({
  ...serviceStructure,
  serviceType: ProductsService,
  operations: {
    findAll: { summary: 'Get all', description: '...' },
    create: { decorators: [() => UseGuards(AdminGuard)] },
    update: true,
    remove: true, // soft delete by default
    softRemove: true,
    hardRemove: true,
    recover: true,
  },
  classDecorators: [() => UseGuards(JwtAuthGuard)],
  routeConfig: { path: 'products', version: '1' },
});

@Controller('products')
export class ProductsController extends CrudControllerFrom(structure) {}
```

### Structure Builders

`CrudControllerStructure(config)` | `DataControllerStructure(config)` — both accept `operations`, `classDecorators`, `parameterDecorators`, `routeConfig`, `plugins`, and service types.

### Operations Config

Each operation can be `boolean` or an object with:
- `summary?: string` — Swagger summary
- `description?: string` — Swagger description
- `decorators?: MethodDecorator[]` — Additional method decorators (e.g., guards)
- `response?: ApiResponseOptions` — Swagger response config

### Decorators (rest-api)

| Decorator | Purpose |
|---|---|
| `@TransformFromJson()` | Transforms query params from JSON string to object |
| `@ApiResponses()` | Generates standard Swagger responses for CRUD |

### Pre-built DTOs

| Class | Package |
|---|---|
| `DefaultFindArgs<T>` | `@solid-nestjs/rest-api` |
| `StringFilterInput` | `@solid-nestjs/rest-api` |
| `NumberFilterInput` | `@solid-nestjs/rest-api` |
| `DateFilterInput` | `@solid-nestjs/rest-api` |
| `PaginationRequestInput` | `@solid-nestjs/rest-api` |
| `PaginationResultOutput` | `@solid-nestjs/rest-api` |
| `GroupedPaginationResultOutput` | `@solid-nestjs/rest-api` |

---

## @solid-nestjs/graphql

GraphQL layer — resolver mixins.

### Mixins

| Factory | Returns |
|---|---|
| `DataResolverFrom(structure)` | `DataResolver` with queries |
| `DataResolverExtendedFrom(structure)` | `DataResolver` + plugin support |
| `CrudResolverFrom(structure)` | Full CRUD resolver (queries + mutations) |
| `CrudResolverExtendedFrom(structure)` | CRUD resolver + plugin support |

```typescript
const structure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: ProductsService,
  operations: {
    findAll: true,
    findOne: true,
    create: true,
    update: true,
    remove: true,
    softRemove: true,
    hardRemove: true,
    recover: true,
  },
});

@Resolver(() => Product)
export class ProductsResolver extends CrudResolverFrom(structure) {}
```

### Structure Builders

`CrudResolverStructure(config)` | `DataResolverStructure(config)` — follow the same pattern as REST controllers.

### Scalars

| Scalar | Purpose |
|---|---|
| `JSONScalar` | Custom GraphQL scalar for JSON objects |

---

## @solid-nestjs/rest-graphql

Hybrid REST + GraphQL package — combines controller and resolver mixins in one package.

### Mixins

| Factory | Description |
|---|---|
| `DataControllerFrom` | REST data controller (same API as rest-api) |
| `DataControllerExtendedFrom` | REST data controller + plugins |
| `CrudControllerFrom` | REST CRUD controller |
| `CrudControllerExtendedFrom` | REST CRUD controller + plugins |
| `DataResolverFrom` | GraphQL data resolver (same API as graphql) |
| `DataResolverExtendedFrom` | GraphQL data resolver + plugins |
| `CrudResolverFrom` | GraphQL CRUD resolver |
| `CrudResolverExtendedFrom` | GraphQL CRUD resolver + plugins |

---

## Bundle Packages

Convenience packages combining core packages.

| Bundle | Includes |
|---|---|
| `@solid-nestjs/typeorm-crud` | common + typeorm + rest-api |
| `@solid-nestjs/typeorm-graphql-crud` | common + typeorm + graphql |
| `@solid-nestjs/typeorm-hybrid-crud` | common + typeorm + rest-api + graphql + rest-graphql |

---

## Exception Types

| Exception | Package | Description |
|---|---|---|
| `CrudException` | common | Base CRUD error |
| `EntityNotFoundException` | common | Entity not found |
| `SoftDeletionException` | common | Soft-deletion related error |
| `BulkOperationException` | common | Bulk operation failure |
| `ValidationException` | common | Validation error |

---

## Configuration Defaults

```typescript
const DEFAULTS = {
  pagination: { defaultLimit: 20, maxLimit: 100 },
  relations: { maxDepth: 3 },
  transactions: { isolationLevel: 'READ_COMMITTED' },
  locks: { timeout: 10000 },
};
```
