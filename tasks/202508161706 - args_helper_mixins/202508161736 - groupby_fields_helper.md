# Task 4: GroupByFields Helper Implementation

**Related Spec**: [Args Helper Mixins](../../specs/202508161706%20-%20args_helper_mixins.md)  
**Status**: Pending  
**Priority**: High  
**Dependencies**: Task 1 (Core Infrastructure)

## Objective

Implement the `createGroupByFields` helper function in all three protocol packages, supporting nested relation composition.

## Scope

### Files to Create

1. **packages-core/rest-api/src/helpers/args-helpers/create-groupby-fields.helper.ts**
   - REST-specific implementation

2. **packages-core/graphql/src/helpers/args-helpers/create-groupby-fields.helper.ts**
   - GraphQL-specific implementation

3. **packages-core/rest-graphql/src/helpers/args-helpers/create-groupby-fields.helper.ts**
   - Hybrid implementation

## Implementation Details

### REST API Implementation

```typescript
// packages-core/rest-api/src/helpers/args-helpers/create-groupby-fields.helper.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export function createGroupByFields<T>(
  entity: Type<T>,
  config: GroupByFieldsConfig<T>,
  options?: ClassOptions
): Type<GroupBy<T>> {
  const className = options?.name || `${entity.name}GroupByFields`;
  
  // Generate base class
  const BaseClass = generateBaseClass({
    className,
    metadata: options?.metadata
  });
  
  // Add fields dynamically
  for (const [field, fieldConfig] of Object.entries(config)) {
    const parsedConfig = parseGroupByConfig(fieldConfig);
    
    // Determine field type
    let fieldType: any;
    if (typeof fieldConfig === 'function') {
      // It's a nested GroupByFields class
      fieldType = fieldConfig;
    } else if (typeof fieldConfig === 'object' && fieldConfig.type) {
      fieldType = fieldConfig.type;
    } else {
      // Simple boolean field
      fieldType = Boolean;
    }
    
    // Add property
    Reflect.defineProperty(BaseClass.prototype, field, {
      writable: true,
      enumerable: true,
      configurable: true
    });
    
    // Apply decorators based on field type
    if (fieldType === Boolean) {
      ApiProperty({
        type: Boolean,
        required: false,
        description: parsedConfig.description || `Group by ${field}`
      })(BaseClass.prototype, field);
      
      IsOptional()(BaseClass.prototype, field);
    } else {
      // Nested GroupByFields
      ApiProperty({
        type: () => fieldType,
        required: false,
        description: parsedConfig.description || `Group by ${field} fields`
      })(BaseClass.prototype, field);
      
      IsOptional()(BaseClass.prototype, field);
      ValidateNested()(BaseClass.prototype, field);
      Type(() => fieldType)(BaseClass.prototype, field);
    }
  }
  
  return BaseClass;
}

function parseGroupByConfig(config: GroupByFieldConfig): ParsedConfig {
  if (config === true) {
    return { type: Boolean };
  }
  if (typeof config === 'function') {
    return { type: config };
  }
  return config;
}
```

### GraphQL Implementation

```typescript
// packages-core/graphql/src/helpers/args-helpers/create-groupby-fields.helper.ts
import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export function createGroupByFields<T>(
  entity: Type<T>,
  config: GroupByFieldsConfig<T>,
  options?: ClassOptions
): Type<GroupBy<T>> {
  const className = options?.name || `${entity.name}GroupByFields`;
  
  @InputType(className, {
    isAbstract: options?.isAbstract ?? false,
    description: options?.description
  })
  class GroupByClass {
    // Fields added dynamically
  }
  
  for (const [field, fieldConfig] of Object.entries(config)) {
    const parsedConfig = parseGroupByConfig(fieldConfig);
    const fieldType = parsedConfig.type || Boolean;
    
    // Apply GraphQL decorators
    if (fieldType === Boolean) {
      Field(() => Boolean, {
        nullable: true,
        description: parsedConfig.description || `Group by ${field}`
      })(GroupByClass.prototype, field);
      
      IsOptional()(GroupByClass.prototype, field);
    } else {
      // Nested GroupByFields
      Field(() => fieldType, {
        nullable: true,
        description: parsedConfig.description || `Group by ${field} fields`
      })(GroupByClass.prototype, field);
      
      IsOptional()(GroupByClass.prototype, field);
      ValidateNested()(GroupByClass.prototype, field);
      Type(() => fieldType)(GroupByClass.prototype, field);
    }
  }
  
  return GroupByClass;
}
```

## Usage Examples

### Simple Fields

```typescript
const ProductGroupByFields = createGroupByFields(Product, {
  name: true,
  category: true,
  price: true
});
```

### Nested Relations

```typescript
// First create nested GroupBy
const SupplierGroupByFields = createGroupByFields(Supplier, {
  name: true,
  country: true
});

// Then use in parent
const ProductGroupByFields = createGroupByFields(Product, {
  name: true,
  price: true,
  supplier: SupplierGroupByFields  // Nested relation
});
```

### With Custom Options

```typescript
const ProductGroupByFields = createGroupByFields(
  Product,
  {
    name: true,
    category: {
      description: "Group by product category"
    },
    supplier: SupplierGroupByFields
  },
  {
    name: 'ProductGroupByInput',
    description: 'Fields for grouping products'
  }
);
```

## Key Features

1. **Boolean Fields**: Simple fields use boolean type
2. **Nested Support**: Support for nested GroupByFields classes
3. **Type Detection**: Automatic detection of field vs nested type
4. **Consistent API**: Same configuration pattern as other helpers

## Testing Requirements

1. **Unit Tests**:
   - Test simple boolean fields
   - Test nested GroupByFields composition
   - Test mixed configuration (simple + nested)
   - Test class-level options

2. **Test Files**:
   - `packages-core/rest-api/__tests__/helpers/args-helpers/create-groupby-fields.helper.spec.ts`
   - `packages-core/graphql/__tests__/helpers/args-helpers/create-groupby-fields.helper.spec.ts`
   - `packages-core/rest-graphql/__tests__/helpers/args-helpers/create-groupby-fields.helper.spec.ts`

## Acceptance Criteria

- [ ] Helper functions implemented in all three packages
- [ ] Support for simple boolean fields
- [ ] Support for nested GroupByFields composition
- [ ] Custom descriptions properly applied
- [ ] Class-level options work correctly
- [ ] Proper validation decorators for nested fields
- [ ] Unit tests pass with good coverage
- [ ] Works with GroupByRequest and GroupByArgs

## Notes

- Boolean fields indicate "group by this field"
- Nested fields allow grouping by related entity fields
- Ensure proper validation for nested structures

---
*Task created: 2025-08-16 17:36*  
*Last updated: 2025-08-16 17:36*