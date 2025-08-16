# Task 3: OrderByFields Helper Implementation

**Related Spec**: [Args Helper Mixins](../../specs/202508161706%20-%20args_helper_mixins.md)  
**Status**: Pending  
**Priority**: High  
**Dependencies**: Task 1 (Core Infrastructure)

## Objective

Implement the `createOrderByFields` helper function in all three protocol packages with consistent configuration pattern matching the WhereFields helper.

## Scope

### Files to Create

1. **packages-core/rest-api/src/helpers/args-helpers/create-orderby-fields.helper.ts**
   - REST-specific implementation

2. **packages-core/graphql/src/helpers/args-helpers/create-orderby-fields.helper.ts**
   - GraphQL-specific implementation

3. **packages-core/rest-graphql/src/helpers/args-helpers/create-orderby-fields.helper.ts**
   - Hybrid implementation

## Implementation Details

### REST API Implementation

```typescript
// packages-core/rest-api/src/helpers/args-helpers/create-orderby-fields.helper.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';
import { OrderByTypes } from '@solid-nestjs/common';
import { 
  generateBaseClass, 
  parseFieldConfig 
} from '@solid-nestjs/common/helpers/args-helpers';

export function createOrderByFields<T>(
  entity: Type<T>,
  config: OrderByFieldsConfig<T>,
  options?: ClassOptions
): Type<OrderBy<T>> {
  const className = options?.name || `${entity.name}OrderByFields`;
  
  // Generate base class
  const BaseClass = generateBaseClass({
    className,
    metadata: options?.metadata
  });
  
  // Add fields dynamically
  for (const [field, fieldConfig] of Object.entries(config)) {
    const parsedConfig = parseOrderByConfig(fieldConfig);
    
    // Add property
    Reflect.defineProperty(BaseClass.prototype, field, {
      writable: true,
      enumerable: true,
      configurable: true
    });
    
    // Apply REST decorators
    ApiProperty({
      enum: OrderByTypes,
      required: false,
      description: parsedConfig.description || `Order by ${field}`
    })(BaseClass.prototype, field);
    
    IsOptional()(BaseClass.prototype, field);
    IsEnum(OrderByTypes)(BaseClass.prototype, field);
  }
  
  return BaseClass;
}

function parseOrderByConfig(config: true | OrderByFieldConfig): ParsedConfig {
  if (config === true) {
    return {};
  }
  return config;
}
```

### GraphQL Implementation

```typescript
// packages-core/graphql/src/helpers/args-helpers/create-orderby-fields.helper.ts
import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsEnum } from 'class-validator';
import { OrderByTypes } from '@solid-nestjs/graphql';

export function createOrderByFields<T>(
  entity: Type<T>,
  config: OrderByFieldsConfig<T>,
  options?: ClassOptions
): Type<OrderBy<T>> {
  const className = options?.name || `${entity.name}OrderByFields`;
  
  @InputType(className, {
    isAbstract: options?.isAbstract ?? true,
    description: options?.description
  })
  class OrderByClass {
    // Fields added dynamically
  }
  
  // Add fields with GraphQL decorators
  for (const [field, fieldConfig] of Object.entries(config)) {
    const parsedConfig = parseOrderByConfig(fieldConfig);
    
    Field(() => OrderByTypes, {
      nullable: true,
      description: parsedConfig.description || `Order by ${field}`
    })(OrderByClass.prototype, field);
    
    IsOptional()(OrderByClass.prototype, field);
    IsEnum(OrderByTypes)(OrderByClass.prototype, field);
  }
  
  return OrderByClass;
}
```

### Hybrid Implementation

```typescript
// packages-core/rest-graphql/src/helpers/args-helpers/create-orderby-fields.helper.ts
// Combines both REST and GraphQL decorators
export function createOrderByFields<T>(
  entity: Type<T>,
  config: OrderByFieldsConfig<T>,
  options?: ClassOptions
): Type<OrderBy<T>> {
  // Apply both @ApiProperty and @Field decorators
  // Similar structure to above but with both decorator sets
}
```

## Configuration Pattern

```typescript
// Consistent with WhereFields pattern
const OrderByFields = createOrderByFields(Entity, {
  // Simple enable
  id: true,
  
  // With custom description
  name: {
    description: "Sort by entity name",
    required: false
  },
  
  createdAt: true,
  updatedAt: true
});
```

## Key Features

1. **Consistent API**: Same configuration pattern as WhereFields
2. **Simple Configuration**: Use `true` for default behavior
3. **Custom Descriptions**: Support custom documentation
4. **Enum Validation**: Automatic OrderByTypes enum validation

## Testing Requirements

1. **Unit Tests**:
   - Test simple boolean configuration
   - Test object configuration with descriptions
   - Test class-level options
   - Test decorator application

2. **Test Files**:
   - `packages-core/rest-api/__tests__/helpers/args-helpers/create-orderby-fields.helper.spec.ts`
   - `packages-core/graphql/__tests__/helpers/args-helpers/create-orderby-fields.helper.spec.ts`
   - `packages-core/rest-graphql/__tests__/helpers/args-helpers/create-orderby-fields.helper.spec.ts`

## Acceptance Criteria

- [ ] Helper functions implemented in all three packages
- [ ] Configuration pattern matches WhereFields helper
- [ ] OrderByTypes enum properly applied to all fields
- [ ] Custom descriptions are correctly applied
- [ ] Class-level options work as expected
- [ ] Unit tests pass with good coverage
- [ ] Integration works with FindArgsFrom mixin

## Notes

- Maintain consistency with WhereFields configuration pattern
- All fields should accept OrderByTypes enum (ASC/DESC)
- Ensure compatibility with existing OrderBy interface

---
*Task created: 2025-08-16 17:34*  
*Last updated: 2025-08-16 17:34*