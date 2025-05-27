# Architecture Decision Records (ADRs)

This document contains the key architectural decisions made during the development of the SOLID NestJS Framework.

## Table of Contents

- [ADR-001: Framework Architecture](#adr-001-framework-architecture)
- [ADR-002: Mixin-Based Design](#adr-002-mixin-based-design)
- [ADR-003: Package Structure](#adr-003-package-structure)
- [ADR-004: TypeScript-First Approach](#adr-004-typescript-first-approach)
- [ADR-005: Transaction Management](#adr-005-transaction-management)
- [ADR-006: Configuration Structure](#adr-006-configuration-structure)

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
export class ProductsController extends CrudControllerFrom(controllerStructure) {}
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
  relationsConfig: { /* ... */ },
  functions: { /* ... */ }
});

// Controller structure - extends service structure with API concerns
export const controllerStructure = CrudControllerStructure({
  ...serviceStructure,
  serviceType: ProductsService,
  operations: { /* ... */ },
  routeConfig: { /* ... */ }
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

## Future ADRs

### Planned Decisions

1. **ADR-007: GraphQL Integration** - How to integrate GraphQL resolvers
2. **ADR-008: Caching Strategy** - Built-in caching mechanisms
3. **ADR-009: Event System** - Domain events and event sourcing
4. **ADR-010: Multi-tenancy Support** - Tenant isolation strategies
5. **ADR-011: Performance Monitoring** - Built-in performance tracking

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
