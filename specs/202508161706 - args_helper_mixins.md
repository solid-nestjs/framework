# Args Helper Mixins Specification

## Overview

This specification outlines the implementation of helper mixins to reduce boilerplate code in DTO creation for filtering, sorting, and grouping operations in the SOLID NestJS Framework. The feature maintains the current architecture while significantly improving developer experience.

## Problem Statement

Currently, developers must manually write extensive boilerplate code for each entity's query DTOs:

- **WhereFields**: ~10-15 lines of decorators per field for filtering
- **OrderByFields**: ~8-10 lines of decorators per field for sorting  
- **GroupByFields**: ~6-8 lines of decorators per field for grouping

For an entity with 10 fields, this can result in 200+ lines of repetitive code that must be maintained and kept in sync with the entity definition.

## Proposed Solution

Introduce helper mixins that automatically generate the required DTO classes while maintaining full type safety and decorator support:

```typescript
// Before: 50+ lines of boilerplate
// After: 10 lines with helpers
const FindClientWhere = createWhereFields(Client, {
  id: true,
  firstName: true,
  lastName: true,
  email: true
});
```

## Technical Design

### 1. Core Helper Functions

#### createWhereFields

```typescript
function createWhereFields<T>(
  entity: Type<T>,
  config: WhereFieldsConfig<T>,
  options?: ClassOptions
): Type<Where<T>>
```

**Configuration Options:**
- `config`: Field-level configuration
  - `true`: Auto-infer filter type from entity metadata
  - `FilterType`: Explicitly specify filter type (StringFilter, NumberFilter, DateFilter)
  - `Object`: Full configuration with type, description, and decorator options
- `options`: Class-level configuration (optional)
  - `name`: Custom class name
  - `description`: Class description for documentation
  - `isAbstract`: Whether the class is abstract
  - `decorators`: Additional decorators to apply to the class
  - `metadata`: Custom metadata to attach

**Type Inference Rules:**
- `string` fields → `StringFilter`
- `number` fields → `NumberFilter`
- `Date` fields → `DateFilter`
- `boolean` fields → `Boolean` (direct type, no filter wrapper)

#### createOrderByFields

```typescript
function createOrderByFields<T>(
  entity: Type<T>,
  config: OrderByFieldsConfig<T>,
  options?: ClassOptions
): Type<OrderBy<T>>
```

**Configuration Options:**
- `config`: Field-level configuration
  - `true`: Enable ordering with default description
  - `Object`: Custom description and decorator options
- `options`: Class-level configuration (optional)

#### createGroupByFields

```typescript
function createGroupByFields<T>(
  entity: Type<T>,
  config: GroupByFieldsConfig<T>,
  options?: ClassOptions
): Type<GroupBy<T>>
```

**Configuration Options:**
- `config`: Field-level configuration
  - `true`: Enable grouping with default description
  - `Object`: Custom description and decorator options
  - `Type`: Reference to nested GroupByFields for relations
- `options`: Class-level configuration (optional)

#### GroupByArgsFrom (Mixin)

```typescript
function GroupByArgsFrom<T>({
  findArgsType: Type<FindArgs<T>>,
  groupByRequestType: Type<GroupByRequest<T>>
}): Type<GroupByArgs<T>>
```

**Configuration Options:**
- `findArgsType`: The base FindArgs class to extend from
- `groupByRequestType`: The GroupByRequest class containing fields and aggregates configuration

This mixin automatically:
- Extends the provided FindArgs class
- Implements `GroupByArgs<T>` interface
- Adds the `groupBy` property with proper decorators
- Applies validation decorators (`@ValidateNested`, `@Type`)

### 2. Configuration Types

```typescript
type FieldConfig = 
  | true                           // Simple enable with auto-inference
  | Type<any>                      // Explicit type
  | {                              // Full configuration
      type?: Type<any>;
      description?: string;
      required?: boolean;
      example?: any;
      deprecated?: boolean;
    };

type WhereFieldsConfig<T> = {
  [K in keyof T]?: FieldConfig;
};

type OrderByFieldsConfig<T> = {
  [K in keyof T]?: true | {
    description?: string;
    required?: boolean;
  };
};

type GroupByFieldsConfig<T> = {
  [K in keyof T]?: true | Type<any> | {
    description?: string;
    required?: boolean;
  };
};

interface ClassOptions {
  name?: string;                  // Custom class name
  description?: string;            // Class description for Swagger/GraphQL
  isAbstract?: boolean;           // For @InputType({ isAbstract: true })
  decorators?: PropertyDecorator[]; // Additional decorators to apply
  metadata?: Record<string, any>; // Custom metadata
  extends?: Type<any>;            // Base class to extend
}
```

### 3. Implementation Details

#### Type Analysis with Reflection

The helpers will use TypeScript's Reflection API to:
1. Retrieve property types directly from entity class
2. Identify relation types and targets
3. Determine appropriate filter types

```typescript
// Internal implementation using Reflection
function getPropertyType(entity: Type<any>, propertyName: string): any {
  const type = Reflect.getMetadata('design:type', entity.prototype, propertyName);
  return type;
}

function inferFilterType(entity: Type<any>, propertyName: string): Type<any> {
  const type = Reflect.getMetadata('design:type', entity.prototype, propertyName);
  
  if (type === String) return StringFilter;
  if (type === Number) return NumberFilter;
  if (type === Date) return DateFilter;
  if (type === Boolean) return Boolean;
  
  // Default fallback
  return StringFilter;
}
```

#### Dynamic Class Generation

Classes will be generated at runtime with proper decorators:

```typescript
function createWhereFields<T>(
  entity: Type<T>, 
  config: WhereFieldsConfig<T>,
  options?: ClassOptions
) {
  // Apply class-level decorators based on options
  const className = options?.name || `${entity.name}WhereFields`;
  const classDecorators = [
    InputType({ 
      isAbstract: options?.isAbstract ?? true,
      description: options?.description 
    }),
    ...(options?.decorators || [])
  ];
  
  @applyDecorators(...classDecorators)
  class GeneratedWhereClass implements Where<T> {
    // Properties added dynamically based on config
  }
  
  // Set custom metadata if provided
  if (options?.metadata) {
    for (const [key, value] of Object.entries(options.metadata)) {
      Reflect.defineMetadata(key, value, GeneratedWhereClass);
    }
  }
  
  // Add fields based on config
  for (const [field, fieldConfig] of Object.entries(config)) {
    const filterType = inferFilterType(entity, field, fieldConfig);
    addDecoratedProperty(GeneratedWhereClass, field, filterType, fieldConfig);
  }
  
  return GeneratedWhereClass;
}
```

### 4. Relation Handling

For relations, developers can compose helpers:

```typescript
// Supplier GroupBy fields
const SupplierGroupByFields = createGroupByFields(Supplier, {
  name: true,
  contactEmail: true
});

// Product GroupBy fields with nested supplier
const ProductGroupByFields = createGroupByFields(Product, {
  name: true,
  price: true,
  supplier: SupplierGroupByFields  // Composition of helpers
});
```

## Usage Examples

### Basic Usage

```typescript
// REST API only
import { createWhereFields, createOrderByFields } from '@solid-nestjs/rest-api';

// GraphQL only  
import { createWhereFields, createOrderByFields } from '@solid-nestjs/graphql';

// Hybrid (REST + GraphQL)
import { createWhereFields, createOrderByFields } from '@solid-nestjs/rest-graphql';

// Simple auto-inference
const FindProductWhere = createWhereFields(Product, {
  id: true,           // → StringFilter (UUID)
  name: true,         // → StringFilter
  price: true,        // → NumberFilter
  createdAt: true,    // → DateFilter
  isActive: true      // → Boolean
});

// With explicit types
const FindProductWhere = createWhereFields(Product, {
  name: StringFilter,
  price: NumberFilter,
  description: {
    type: StringFilter,
    description: "Filter by product description",
    required: false
  }
});

// With class-level options
const FindProductWhere = createWhereFields(
  Product,
  {
    name: true,
    price: true,
    category: true
  },
  {
    name: 'ProductWhereInput',
    description: 'Input type for filtering products',
    isAbstract: true,
    metadata: { customKey: 'customValue' }
  }
);
```

### Complete DTO Definition

#### REST API Application
```typescript
// find-client-args.dto.ts (REST only)
import { createWhereFields, createOrderByFields, FindArgsFrom } from '@solid-nestjs/rest-api';
import { Client } from '../entities/client.entity';

const FindClientWhere = createWhereFields(Client, {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  city: true,
  country: true
});

const FindClientOrderBy = createOrderByFields(Client, {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  createdAt: true
});

export class FindClientArgs extends FindArgsFrom({
  whereType: FindClientWhere,
  orderByType: FindClientOrderBy
}) {}
```

#### GraphQL Application
```typescript
// find-client-args.dto.ts (GraphQL only)
import { createWhereFields, createOrderByFields, FindArgsFrom } from '@solid-nestjs/graphql';
import { Client } from '../entities/client.entity';

const FindClientWhere = createWhereFields(Client, {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  city: true,
  country: true
});

const FindClientOrderBy = createOrderByFields(Client, {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  createdAt: true
});

@ArgsType()  // GraphQL decorator
export class FindClientArgs extends FindArgsFrom({
  whereType: FindClientWhere,
  orderByType: FindClientOrderBy
}) {}
```

#### Hybrid Application (REST + GraphQL)
```typescript
// find-client-args.dto.ts (Hybrid)
import { createWhereFields, createOrderByFields, FindArgsFrom } from '@solid-nestjs/rest-graphql';
import { Client } from '../entities/client.entity';

const FindClientWhere = createWhereFields(Client, {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  city: true,
  country: true
});

const FindClientOrderBy = createOrderByFields(Client, {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  createdAt: true
});

@ArgsType()  // Works for both REST and GraphQL
export class FindClientArgs extends FindArgsFrom({
  whereType: FindClientWhere,
  orderByType: FindClientOrderBy
}) {}
```

### GroupBy with Relations

```typescript
// Import from appropriate package based on application type
import { createGroupByFields, GroupByArgsFrom } from '@solid-nestjs/rest-graphql'; // or /rest-api or /graphql

// Before (manual approach):
/*
@ArgsType()
export class GroupedProductArgs extends FindProductArgs implements GroupByArgs<Product> {
  @ValidateNested()
  @Type(() => ProductGroupByRequest)
  groupBy!: ProductGroupByRequest;
}
*/

// After (with helper):
// Nested GroupBy fields
const SupplierGroupByFields = createGroupByFields(Supplier, {
  name: true,
  contactEmail: true,
  country: true
});

const ProductGroupByFields = createGroupByFields(Product, {
  name: true,
  price: true,
  category: true,
  supplier: SupplierGroupByFields  // Nested relation
});

const ProductGroupByRequest = createGroupByRequest({
  fields: ProductGroupByFields
});

// Simple one-liner with helper mixin
@ArgsType()
export class GroupedProductArgs extends GroupByArgsFrom({
  findArgsType: FindProductArgs,
  groupByRequestType: ProductGroupByRequest
}) {}
```

## Migration Strategy

### Phase 1: Parallel Implementation
- Implement helper functions alongside existing manual DTOs
- No breaking changes to current code
- Allow gradual adoption

### Phase 2: Documentation & Examples
- Update documentation with helper usage
- Convert example applications to use helpers
- Provide migration guide

### Phase 3: Tooling Support
- CLI command to auto-convert existing DTOs to helper format
- VS Code snippets for common patterns
- Validation utilities

## Benefits

1. **Reduced Boilerplate**: 80-90% reduction in DTO code
2. **Type Safety**: Full TypeScript support with compile-time checking
3. **Maintainability**: Single source of truth (entity definition)
4. **Developer Experience**: Intuitive API with auto-inference
5. **Backwards Compatible**: Works alongside existing manual DTOs
6. **Flexible**: Supports simple to complex configurations
7. **Consistent API**: All DTOs use similar helper patterns

## Task Breakdown

Tasks for implementation are documented in `tasks/202508161706 - args_helper_mixins/` folder:

- [ ] [Task 1: Core infrastructure and shared logic](../tasks/202508161706%20-%20args_helper_mixins/202508161730%20-%20core_infrastructure.md)
- [ ] [Task 2: WhereFields helper implementation](../tasks/202508161706%20-%20args_helper_mixins/202508161732%20-%20where_fields_helper.md)
- [ ] [Task 3: OrderByFields helper implementation](../tasks/202508161706%20-%20args_helper_mixins/202508161734%20-%20orderby_fields_helper.md)
- [ ] [Task 4: GroupByFields helper implementation](../tasks/202508161706%20-%20args_helper_mixins/202508161736%20-%20groupby_fields_helper.md)
- [ ] [Task 5: GroupByArgsFrom mixin implementation](../tasks/202508161706%20-%20args_helper_mixins/202508161738%20-%20groupby_args_mixin.md)
- [ ] [Task 6: Testing suite](../tasks/202508161706%20-%20args_helper_mixins/202508161740%20-%20testing_suite.md)
- [ ] [Task 7: Documentation and examples](../tasks/202508161706%20-%20args_helper_mixins/202508161742%20-%20documentation_examples.md)

## Package Structure

The helpers will be implemented across four packages with shared logic in `common`:

### Common Package (Shared Logic)
```
packages-core/common/
├── src/
│   ├── helpers/
│   │   ├── args-helpers/
│   │   │   ├── type-inference.helper.ts      # Type reflection logic
│   │   │   ├── field-config.helper.ts        # Configuration parsing
│   │   │   ├── class-generator.helper.ts     # Base class generation
│   │   │   └── index.ts
│   │   └── index.ts
└── __tests__/
    └── helpers/
        └── args-helpers/
```
**Shared logic**: Type inference, reflection utilities, base class generation

### REST API Package
```
packages-core/rest-api/
├── src/
│   ├── helpers/
│   │   ├── args-helpers/
│   │   │   ├── create-where-fields.helper.ts
│   │   │   ├── create-orderby-fields.helper.ts
│   │   │   ├── create-groupby-fields.helper.ts
│   │   │   └── index.ts
│   │   └── index.ts
└── __tests__/
    └── helpers/
        └── args-helpers/
```
**Decorators applied**: `@ApiProperty`, `@IsOptional`, `@ValidateNested`, `@Type`
**Imports from**: `@solid-nestjs/common` for shared logic

### GraphQL Package
```
packages-core/graphql/
├── src/
│   ├── helpers/
│   │   ├── args-helpers/
│   │   │   ├── create-where-fields.helper.ts
│   │   │   ├── create-orderby-fields.helper.ts
│   │   │   ├── create-groupby-fields.helper.ts
│   │   │   └── index.ts
│   │   └── index.ts
└── __tests__/
    └── helpers/
        └── args-helpers/
```
**Decorators applied**: `@Field`, `@InputType`, `@ArgsType`
**Imports from**: `@solid-nestjs/common` for shared logic

### REST-GraphQL Hybrid Package
```
packages-core/rest-graphql/
├── src/
│   ├── helpers/
│   │   ├── args-helpers/
│   │   │   ├── create-where-fields.helper.ts
│   │   │   ├── create-orderby-fields.helper.ts
│   │   │   ├── create-groupby-fields.helper.ts
│   │   │   └── index.ts
│   │   └── index.ts
└── __tests__/
    └── helpers/
        └── args-helpers/
```
**Decorators applied**: Both REST (`@ApiProperty`) and GraphQL (`@Field`, `@InputType`) decorators
**Imports from**: `@solid-nestjs/common` for shared logic

## Testing Strategy

### Unit Tests
- Type inference accuracy
- Decorator application
- Configuration parsing
- Edge cases handling

### Integration Tests
- Compatibility with existing FindArgsFrom
- GraphQL resolver integration
- REST controller integration
- Database query generation

### E2E Tests
- Full CRUD operations with helper-generated DTOs
- Performance comparison with manual DTOs
- Migration scenarios

## Performance Considerations

1. **Runtime Generation**: Classes are generated once and cached
2. **Reflection Access**: Direct property type access via Reflect.getMetadata
3. **Bundle Size**: Minimal impact as logic runs at startup
4. **Type Checking**: No runtime overhead after generation

## Future Enhancements

1. **VS Code Extension**: Auto-complete for field configurations
2. **CLI Generator**: Command to scaffold DTOs from entities
3. **Schema Validation**: Runtime validation of configurations
4. **Custom Filters**: Support for custom filter types
5. **Bulk Operations**: Helpers for bulk operation DTOs

## Success Metrics

- 80%+ reduction in DTO boilerplate code
- Zero breaking changes to existing code
- 100% type safety maintained
- Adoption in 50%+ of new projects within 3 months

## Conclusion

The Args Helper Mixins feature provides a powerful solution to reduce boilerplate while maintaining the framework's principles of type safety and flexibility. By leveraging TypeScript's type system and TypeORM's metadata, we can provide an intuitive API that significantly improves developer experience without sacrificing functionality.

---

*Document created: 2025-08-16 17:06*  
*Status: Awaiting Approval*  
*Next Step: Create task breakdown upon approval*