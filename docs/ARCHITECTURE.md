# Architecture Decision Records (ADRs)

This document contains the key architectural decisions made during the development of the SOLID NestJS Framework.

## Table of Contents

- [ADR-001: Framework Architecture](#adr-001-framework-architecture)
- [ADR-002: Mixin-Based Design](#adr-002-mixin-based-design)
- [ADR-003: Package Structure](#adr-003-package-structure)
- [ADR-004: TypeScript-First Approach](#adr-004-typescript-first-approach)
- [ADR-005: Transaction Management](#adr-005-transaction-management)
- [ADR-006: Configuration Structure](#adr-006-configuration-structure)
- [ADR-007: Soft Deletion Strategy](#adr-007-soft-deletion-strategy)
- [ADR-008: Bulk Operations Design](#adr-008-bulk-operations-design)

---

## ADR-001: Framework Architecture

**Status:** Accepted  
**Date:** 2024-01-15  
**Decision Maker(s):** Core Team

### Context

We needed to design a NestJS framework that provides automatic CRUD generation while maintaining flexibility, type safety, and following SOLID principles. The framework should be extensible and not lock developers into specific patterns.

### Decision

We chose a **composition-over-inheritance** architecture using mixins and structure builders:

- **Structure Builders**: Define configuration for services and controllers
- **Mixins**: Generate classes with CRUD functionality based on structures
- **Layered Architecture**: Separate common, ORM-specific, and API-specific concerns

### Consequences

**Positive:**

- High flexibility and extensibility
- Better testability through composition
- Clear separation of concerns
- Type safety throughout the framework
- Easy to extend with new ORMs (Prisma, Mongoose, etc.)

**Negative:**

- Slightly more complex initial setup compared to decorator-based approaches
- Learning curve for developers unfamiliar with mixin patterns

**Mitigation:**

- Comprehensive documentation and examples
- TypeScript IntelliSense support for better developer experience

---

## ADR-002: Mixin-Based Design

**Status:** Accepted  
**Date:** 2024-01-20  
**Decision Maker(s):** Core Team

### Context

We evaluated several approaches for generating CRUD functionality:

1. Inheritance-based (traditional OOP)
2. Decorator-based (like @nestjsx/crud)
3. Mixin-based (composition)
4. Factory-based

### Decision

We chose **mixin-based design** with factory functions like `CrudServiceFrom()` and `CrudControllerFrom()`.

```typescript
// Mixin approach
export class ProductsService extends CrudServiceFrom(serviceStructure) {}
export class ProductsController extends CrudControllerFrom(
  controllerStructure,
) {}
```

### Alternatives Considered

1. **Decorator-based approach**:

   ```typescript
   @Crud({ entity: Product })
   export class ProductsController {}
   ```

   - Rejected: Less flexible, harder to test, couples configuration to implementation

2. **Pure inheritance**:
   ```typescript
   export class ProductsService extends BaseCrudService<Product> {}
   ```
   - Rejected: Violates composition over inheritance, less flexible

### Consequences

**Positive:**

- Enables multiple inheritance patterns
- Better type inference
- Easy to compose multiple behaviors
- Testable through dependency injection
- Flexible structure configuration

**Negative:**

- More verbose than decorator approach
- Requires understanding of TypeScript mixins

---

## ADR-003: Package Structure

**Status:** Accepted  
**Date:** 2024-01-25  
**Decision Maker(s):** Core Team

### Context

We needed to decide how to organize the framework code to support multiple ORMs and API types while maintaining modularity and avoiding bloated dependencies.

### Decision

We chose a **multi-package monorepo structure**:

```
@solid-nestjs/common      # Common interfaces, types, utilities
@solid-nestjs/typeorm     # TypeORM-specific implementations
@solid-nestjs/rest-api    # REST API controllers and Swagger
@solid-nestjs/graphql     # GraphQL resolvers (future)
@solid-nestjs/prisma      # Prisma implementations (future)
```

### Alternatives Considered

1. **Single package approach**:

   - Rejected: Would create bloated dependencies, users would install unused ORM adapters

2. **Framework-per-ORM approach**:
   - Rejected: Would duplicate common functionality, harder to maintain consistency

### Consequences

**Positive:**

- Users only install what they need
- Clear separation of concerns
- Easy to add new ORM support
- Independent versioning possible
- Smaller bundle sizes

**Negative:**

- More complex build and release process
- Need to maintain compatibility between packages
- More complex dependency management

**Mitigation:**

- Shared build tooling and CI/CD
- Semantic versioning with compatibility guarantees
- Comprehensive integration testing

---

## ADR-004: TypeScript-First Approach

**Status:** Accepted  
**Date:** 2024-02-01  
**Decision Maker(s):** Core Team

### Context

We needed to decide the level of TypeScript support and whether to support JavaScript usage.

### Decision

We chose a **TypeScript-first approach** with strong type safety:

- All framework code written in TypeScript
- Comprehensive type definitions
- Generic types for entities and DTOs
- Runtime type validation through class-validator
- No JavaScript compatibility layer

### Alternatives Considered

1. **JavaScript-first with TypeScript definitions**:

   - Rejected: Would compromise type safety benefits

2. **TypeScript with JavaScript compatibility**:
   - Rejected: Would add complexity and testing overhead

### Consequences

**Positive:**

- Excellent IntelliSense and IDE support
- Compile-time error detection
- Better refactoring capabilities
- Self-documenting code through types
- Better developer experience

**Negative:**

- Excludes JavaScript-only projects
- Requires TypeScript knowledge
- Slightly more complex build process

**Mitigation:**

- Comprehensive documentation with examples
- TypeScript learning resources in docs
- Clear error messages for type mismatches

---

## ADR-005: Transaction Management

**Status:** Accepted  
**Date:** 2024-02-10  
**Decision Maker(s):** Core Team

### Context

We needed to design transaction management that is:

- Easy to use by default
- Configurable for advanced use cases
- Compatible with different ORMs
- Supports nested transactions
- Handles error cases gracefully

### Decision

We chose a **context-based transaction management** approach:

```typescript
// Automatic transaction wrapping
export const serviceStructure = CrudServiceStructure({
  entityType: Product,
  // ...
  functions: {
    create: { transactional: true },
    update: { transactional: true }
  }
});

// Manual transaction control
async customOperation(context: Context) {
  return this.runInTransaction(context, async (transactionContext) => {
    await this.create(transactionContext, data1);
    await this.update(transactionContext, id, data2);
  });
}
```

### Alternative Use

**Decorator-based transactions**:

```typescript
@Transaction()
async createProduct(context:Context) {
 //everything in here is executed in the same transaction
}
```

- This decorator can be used over any function implemented inside a DataService or CrudService.

### Consequences

**Positive:**

- Flexible transaction control
- Supports nested transactions
- Easy to test with mock contexts
- ORM-agnostic design
- Configurable isolation levels

**Negative:**

- Context parameter required for all methods
- Learning curve for transaction patterns

**Mitigation:**

- Clear documentation with examples
- TypeScript types enforce correct usage
- Helper methods for common patterns

---

## ADR-006: Configuration Structure

**Status:** Accepted  
**Date:** 2024-02-15  
**Decision Maker(s):** Core Team

### Context

We needed a configuration approach that is:

- Type-safe
- Flexible for different use cases
- Reusable between services and controllers
- Easy to test and mock
- Supports inheritance and composition

### Decision

We chose **structure builder pattern** with separate service and controller structures:

```typescript
// Service structure - defines data operations
export const serviceStructure = CrudServiceStructure({
  entityType: Product,
  createInputType: CreateProductDto,
  updateInputType: UpdateProductDto,
  findArgsType: FindProductArgs,
  relationsConfig: {
    /* ... */
  },
  functions: {
    /* ... */
  },
});

// Controller structure - extends service structure with API concerns
export const controllerStructure = CrudControllerStructure({
  ...serviceStructure,
  serviceType: ProductsService,
  operations: {
    /* ... */
  },
  routeConfig: {
    /* ... */
  },
});
```

### Alternatives Considered

1. **Single configuration object**:

   ```typescript
   const config = { service: {}, controller: {} };
   ```

   - Rejected: Mixes concerns, harder to reuse

2. **Class-based configuration**:

   ```typescript
   class ProductConfig extends BaseConfig {}
   ```

   - Rejected: Less flexible, harder to compose

3. **Decorator-based configuration**:
   - Rejected: Runtime configuration, less type-safe

### Consequences

**Positive:**

- Clear separation of concerns
- Type-safe configuration
- Reusable structures
- Easy to test and mock
- Supports composition and inheritance
- IntelliSense support

**Negative:**

- Slightly more verbose
- Two configuration objects to maintain
- Learning curve for structure pattern

**Mitigation:**

- Helper functions for common configurations
- Comprehensive examples and documentation
- TypeScript types guide correct usage

---

## ADR-007: Soft Deletion Strategy

**Status:** Accepted  
**Date:** 2024-03-01  
**Decision Maker(s):** Core Team

### Context

We needed to design a comprehensive soft deletion system that:

- Supports both automatic and explicit soft deletion
- Maintains data integrity with related entities
- Provides recovery capabilities
- Works seamlessly with existing CRUD operations
- Supports both REST and GraphQL APIs

### Decision

We chose a **TypeORM-native soft deletion approach** with enhanced framework integration:

```typescript
// Entity configuration with TypeORM's DeleteDateColumn
@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @DeleteDateColumn()
  deletedAt?: Date;
}

// Service operations
const service = CrudServiceFrom(structure);
await service.remove(context, id); // Auto-detects soft delete capability
await service.softRemove(context, id); // Explicit soft delete
await service.hardRemove(context, id); // Permanent deletion
await service.recover(context, id); // Recovery operation
```

### Design Principles

1. **Automatic Detection**: Framework automatically detects entities with `@DeleteDateColumn`
2. **Explicit Control**: Developers can explicitly choose soft vs hard deletion
3. **Recovery Support**: Built-in recovery operations for soft-deleted entities
4. **Cascade Handling**: Proper cascade behavior for related entities
5. **API Consistency**: Same patterns work for REST and GraphQL

### Implementation Details

#### Service Layer

- `remove()` method auto-detects soft delete capability
- `softRemove()` for explicit soft deletion
- `hardRemove()` for permanent deletion
- `recover()` for restoring soft-deleted entities
- Comprehensive lifecycle hooks for each operation

#### Controller Layer

- `DELETE /entities/:id` (auto-detects soft delete)
- `DELETE /entities/soft/:id` (explicit soft delete)
- `DELETE /entities/hard/:id` (permanent delete)
- `PATCH /entities/recover/:id` (recovery)

#### GraphQL Layer

- `removeEntity(id)` mutation (auto-detects)
- `softRemoveEntity(id)` mutation (explicit)
- `hardRemoveEntity(id)` mutation (permanent)
- `recoverEntity(id)` mutation (recovery)

### Alternatives Considered

1. **Flag-based soft deletion**:

   ```typescript
   @Column({ default: false })
   isDeleted: boolean;
   ```

   - Rejected: Less intuitive than timestamp-based approach, harder to implement cascade behavior

2. **Separate archive tables**:

   ```typescript
   // Move deleted entities to separate tables
   ProductArchive, SupplierArchive, etc.
   ```

   - Rejected: Complicates relationship handling, makes recovery more complex

3. **Status-based deletion**:
   ```typescript
   @Column({ type: 'enum', enum: EntityStatus })
   status: EntityStatus; // ACTIVE, DELETED, ARCHIVED
   ```
   - Rejected: Mixes business logic with deletion state, less flexible

### Consequences

**Positive:**

- Leverages TypeORM's built-in soft deletion capabilities
- Maintains referential integrity
- Simple and intuitive API
- Automatic cascade handling
- Consistent behavior across REST and GraphQL
- Easy to query soft-deleted entities when needed
- Audit-friendly with deletion timestamps

**Negative:**

- Requires careful handling of queries to avoid accidentally including soft-deleted entities
- Slight performance overhead for queries (need WHERE deletedAt IS NULL)
- Database storage continues to grow with soft-deleted entities

**Mitigation:**

- Framework automatically filters soft-deleted entities in queries
- Provide explicit methods for including soft-deleted entities when needed
- Implement data archival strategies for old soft-deleted entities
- Use database indexing strategies to optimize performance

---

## ADR-008: Bulk Operations Design

**Status:** Accepted  
**Date:** 2024-03-15  
**Decision Maker(s):** Core Team

### Context

We needed to provide efficient bulk operation capabilities for:

- High-performance data manipulation
- Batch processing scenarios
- Administrative operations
- Data migration tasks
- Mass updates and deletions

The solution needed to support transactions, proper error handling, and lifecycle hooks while maintaining type safety and framework consistency.

### Decision

We chose a **service-level bulk operations approach** with optional controller endpoints:

```typescript
// Service-level bulk operations
const insertResult = await service.bulkInsert(context, entities);
const updateResult = await service.bulkUpdate(context, updates, where);
const removeResult = await service.bulkRemove(context, where); // Respects soft delete
const deleteResult = await service.bulkDelete(context, where); // Hard delete
const recoverResult = await service.bulkRecover(context, where); // Recovery

// Controller-level custom endpoints
@Post('bulk')
async bulkCreate(@Body() entities: CreateDto[]): Promise<{ ids: string[] }> {
  return this.service.bulkInsert(context, entities);
}
```

### Design Principles

1. **Service-First**: Core bulk operations implemented at service level
2. **Type Safety**: Full TypeScript support with proper type inference
3. **Transaction Support**: All bulk operations run in transactions by default
4. **Lifecycle Hooks**: Before/after hooks for each bulk operation
5. **Flexible Endpoints**: Controllers can expose custom bulk endpoints as needed
6. **Error Handling**: Comprehensive error handling with rollback capabilities
7. **Performance**: Direct query builder usage for optimal performance

### Implementation Details

#### Available Operations

```typescript
interface BulkOperations {
  bulkInsert(context, entities[]): Promise<{ ids: string[] }>;
  bulkUpdate(context, updates, where): Promise<{ affected: number }>;
  bulkRemove(context, where): Promise<{ affected: number }>; // Soft delete if supported
  bulkDelete(context, where): Promise<{ affected: number }>; // Hard delete
  bulkRecover(context, where): Promise<{ affected: number }>; // Recovery
}
```

#### Lifecycle Hooks

```typescript
// Before/after hooks for each operation
beforeBulkInsert(context, repository, entities): Promise<void>;
afterBulkInsert(context, repository, entities): Promise<void>;

beforeBulkUpdate(context, repository, updates, where): Promise<void>;
afterBulkUpdate(context, repository, affectedCount, updates, where): Promise<void>;

beforeBulkRemove(context, repository, where): Promise<void>;
afterBulkRemove(context, repository, affectedCount, where): Promise<void>;

beforeBulkDelete(context, repository, where): Promise<void>;
afterBulkDelete(context, repository, affectedCount, where): Promise<void>;

beforeBulkRecover(context, repository, where): Promise<void>;
afterBulkRecover(context, repository, affectedCount, where): Promise<void>;
```

#### Configuration

```typescript
const serviceStructure = CrudServiceStructure({
  entityType: Product,
  // ...
  functions: {
    bulkInsert: {
      transactional: true,
      isolationLevel: 'READ_COMMITTED',
    },
    bulkUpdate: {
      transactional: true,
      lockMode: 'pessimistic_write',
    },
    bulkRemove: {
      transactional: true,
    },
    bulkDelete: {
      transactional: true,
    },
    bulkRecover: {
      transactional: true,
    },
  },
});
```

### Alternatives Considered

1. **ORM-based bulk operations**:

   ```typescript
   await repository.save(entities); // For bulk insert
   await repository.update(where, updates); // For bulk update
   ```

   - Rejected: Performance issues with large datasets, limited lifecycle hook support

2. **Queue-based bulk operations**:

   ```typescript
   await bulkQueue.add('bulkInsert', { entities });
   ```

   - Rejected: Adds complexity, makes error handling more difficult, not suitable for all use cases

3. **Streaming-based operations**:

   ```typescript
   const stream = service.bulkInsertStream();
   entities.forEach(entity => stream.write(entity));
   ```

   - Considered for future implementation: Good for very large datasets but adds API complexity

4. **Dedicated bulk operation controllers**:
   ```typescript
   @Controller('bulk-operations')
   export class BulkOperationsController
   ```
   - Rejected: Separates bulk operations from entity controllers, less intuitive

### Consequences

**Positive:**

- High performance through direct query builder usage
- Consistent API patterns with regular CRUD operations
- Proper transaction support with rollback capabilities
- Comprehensive lifecycle hooks for custom logic
- Type-safe operations with full IntelliSense support
- Flexible controller integration
- Works seamlessly with soft deletion

**Negative:**

- More complex than simple ORM operations
- Requires careful error handling for partial failures
- Memory usage considerations for very large datasets
- Additional testing complexity

**Mitigation:**

- Comprehensive documentation with examples
- Built-in error handling with detailed error messages
- Memory optimization through streaming (future enhancement)
- Extensive test coverage for bulk operations
- Performance monitoring and optimization guidelines

### Integration with Soft Deletion

Bulk operations respect soft deletion settings:

- `bulkRemove()` performs soft delete if entity supports it, hard delete otherwise
- `bulkDelete()` always performs hard delete
- `bulkRecover()` only available for entities with soft deletion support
- Proper cascade handling for related entities

### Performance Considerations

- Operations use TypeORM QueryBuilder for optimal performance
- Transactions ensure data consistency
- Batch processing for very large datasets
- Database-specific optimizations where applicable
- Memory management for large result sets

---

## Future ADRs

### Planned Decisions

1. **ADR-009: GraphQL Integration** - How to integrate GraphQL resolvers
2. **ADR-010: Caching Strategy** - Built-in caching mechanisms
3. **ADR-011: Event System** - Domain events and event sourcing
4. **ADR-012: Multi-tenancy Support** - Tenant isolation strategies
5. **ADR-013: Performance Monitoring** - Built-in performance tracking
6. **ADR-014: Data Archival Strategy** - Handling old soft-deleted entities
7. **ADR-015: Bulk Operation Streaming** - Streaming for very large datasets

### Review Process

ADRs should be reviewed:

- When new major features are added
- When architectural decisions need to be reconsidered
- When community feedback suggests alternative approaches
- Before major version releases

Each ADR should include:

- Clear context and problem statement
- Decision made and rationale
- Alternatives considered
- Consequences (positive and negative)
- Mitigation strategies for negative consequences
- Success metrics where applicable

---

## References

- [Architecture Decision Records (ADRs) format](https://github.com/joelparkerhenderson/architecture-decision-record)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeScript Mixins](https://www.typescriptlang.org/docs/handbook/mixins.html)
