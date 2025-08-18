# Task 2: WhereFields Helper Implementation

**Related Spec**: [Args Helper Mixins](../../specs/202508161706%20-%20args_helper_mixins.md)  
**Status**: Pending  
**Priority**: High  
**Dependencies**: Task 1 (Core Infrastructure)

## Objective

Implement the `createWhereFields` helper function in all three protocol packages (rest-api, graphql, rest-graphql) with appropriate decorators for each.

## Scope

### Files to Create

1. **packages-core/rest-api/src/helpers/args-helpers/create-where-fields.helper.ts**
   - REST-specific implementation with Swagger decorators

2. **packages-core/graphql/src/helpers/args-helpers/create-where-fields.helper.ts**
   - GraphQL-specific implementation with GraphQL decorators

3. **packages-core/rest-graphql/src/helpers/args-helpers/create-where-fields.helper.ts**
   - Hybrid implementation with both decorator sets

## Implementation Details

### REST API Implementation

```typescript
// packages-core/rest-api/src/helpers/args-helpers/create-where-fields.helper.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { 
  inferFilterType, 
  generateBaseClass, 
  parseFieldConfig 
} from '@solid-nestjs/common/helpers/args-helpers';

export function createWhereFields<T>(
  entity: Type<T>,
  config: WhereFieldsConfig<T>,
  options?: ClassOptions
): Type<Where<T>> {
  const className = options?.name || `${entity.name}WhereFields`;
  
  // Generate base class
  const BaseClass = generateBaseClass({
    className,
    metadata: options?.metadata
  });
  
  // Add fields dynamically
  for (const [field, fieldConfig] of Object.entries(config)) {
    const parsedConfig = parseFieldConfig(fieldConfig);
    const filterType = inferFilterType(entity, field, parsedConfig);
    
    // Add property with decorators
    Reflect.defineProperty(BaseClass.prototype, field, {
      writable: true,
      enumerable: true,
      configurable: true
    });
    
    // Apply REST decorators
    ApiProperty({
      type: () => filterType,
      required: false,
      description: parsedConfig.description || `Filter by ${field}`
    })(BaseClass.prototype, field);
    
    IsOptional()(BaseClass.prototype, field);
    ValidateNested()(BaseClass.prototype, field);
    Type(() => filterType)(BaseClass.prototype, field);
  }
  
  // Add _and and _or fields for complex queries
  addLogicalOperators(BaseClass, className);
  
  return BaseClass;
}
```

### GraphQL Implementation

```typescript
// packages-core/graphql/src/helpers/args-helpers/create-where-fields.helper.ts
import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export function createWhereFields<T>(
  entity: Type<T>,
  config: WhereFieldsConfig<T>,
  options?: ClassOptions
): Type<Where<T>> {
  const className = options?.name || `${entity.name}WhereFields`;
  
  // Apply GraphQL decorator to class
  @InputType(className, { 
    isAbstract: options?.isAbstract ?? true,
    description: options?.description 
  })
  class WhereClass {
    // Class will be populated dynamically
  }
  
  // Add fields with GraphQL decorators
  for (const [field, fieldConfig] of Object.entries(config)) {
    const parsedConfig = parseFieldConfig(fieldConfig);
    const filterType = inferFilterType(entity, field, parsedConfig);
    
    // Apply GraphQL field decorator
    Field(() => filterType, {
      nullable: true,
      description: parsedConfig.description || `Filter by ${field}`
    })(WhereClass.prototype, field);
    
    IsOptional()(WhereClass.prototype, field);
    ValidateNested()(WhereClass.prototype, field);
    Type(() => filterType)(WhereClass.prototype, field);
  }
  
  // Add _and and _or fields
  addLogicalOperatorsGraphQL(WhereClass);
  
  return WhereClass;
}
```

### Hybrid Implementation

```typescript
// packages-core/rest-graphql/src/helpers/args-helpers/create-where-fields.helper.ts
export function createWhereFields<T>(
  entity: Type<T>,
  config: WhereFieldsConfig<T>,
  options?: ClassOptions
): Type<Where<T>> {
  // Combines both REST and GraphQL decorators
  // Implementation details combining both approaches
}
```

## Key Features

1. **Auto-inference**: Automatically detect filter types from entity metadata
2. **Logical Operators**: Add `_and` and `_or` fields for complex queries
3. **Customization**: Support for custom descriptions and metadata
4. **Type Safety**: Maintain full TypeScript type checking

## Testing Requirements

1. **Unit Tests per Package**:
   - Test auto-inference for all data types
   - Test explicit type configuration
   - Test logical operators generation
   - Test custom options application

2. **Test Files**:
   - `packages-core/rest-api/__tests__/helpers/args-helpers/create-where-fields.helper.spec.ts`
   - `packages-core/graphql/__tests__/helpers/args-helpers/create-where-fields.helper.spec.ts`
   - `packages-core/rest-graphql/__tests__/helpers/args-helpers/create-where-fields.helper.spec.ts`

## Acceptance Criteria

- [ ] Helper functions implemented in all three packages
- [ ] Auto-inference works for String, Number, Date, Boolean types
- [ ] Logical operators (_and, _or) are properly added
- [ ] Custom options (name, description, metadata) are applied
- [ ] All decorators are correctly applied based on package
- [ ] Unit tests pass with good coverage
- [ ] Integration works with existing FindArgsFrom mixin

## Notes

- Ensure consistency across all three implementations
- Maintain compatibility with existing Where interface
- Consider performance of dynamic class generation

---
*Task created: 2025-08-16 17:32*  
*Last updated: 2025-08-16 17:32*