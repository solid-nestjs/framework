# Task 7: Update Example Application

**Feature**: Entity-to-DTO Code Generation  
**Task ID**: 202508191043  
**Status**: Pending  
**Estimated Time**: 2 hours  
**Dependencies**: Task 6  

## Objective

Update the advanced-hybrid-crud-app example to demonstrate the new GenerateDtoFromEntity helper.

## Requirements

1. **Target Application**: `apps-examples/advanced-hybrid-crud-app`

2. **Updates Required**:
   - Refactor existing DTOs to use GenerateDtoFromEntity
   - Create examples of different usage patterns
   - Add E2E tests to verify functionality

## Implementation Steps

### 1. Update Product DTOs

**Location**: `apps-examples/advanced-hybrid-crud-app/src/products/dto/inputs/`

**create-product.dto.ts** - Refactor to use helper:
```typescript
import { SolidInput, SolidField, GenerateDtoFromEntity } from '@solid-nestjs/common';
import { Product } from '../../entities/product.entity';

// Before: Manual DTO creation
// After: Using GenerateDtoFromEntity

@SolidInput()
export class CreateProductBaseDto extends GenerateDtoFromEntity(
  Product, 
  ['name', 'description', 'price', 'stock']
) {
  // All properties inherited with validations
}

// Extended version with supplier
@SolidInput()
export class CreateProductDto extends CreateProductBaseDto {
  @SolidField({
    description: 'Product supplier'
  })
  supplier: ProductSupplierDto;
}
```

**update-product.dto.ts** - Use default selection:
```typescript
@SolidInput()
export class UpdateProductDto extends GenerateDtoFromEntity(Product) {
  // Automatically includes all flat properties except id
  // Inherits: name, description, price, stock
}
```

### 2. Update Client DTOs

**Location**: `apps-examples/advanced-hybrid-crud-app/src/clients/dto/inputs/`

```typescript
@SolidInput()
export class CreateClientDto extends GenerateDtoFromEntity(
  Client,
  ['name', 'email', 'phone', 'address']
) {
  // Demonstrates selection of specific properties
}
```

### 3. Create Mixed Example

Create a new example showing advanced usage:

```typescript
// products/dto/inputs/create-product-advanced.dto.ts

@SolidInput()
export class CreateProductAdvancedDto extends GenerateDtoFromEntity(
  Product,
  ['name', 'price'] // Only inherit these
) {
  // Add custom properties
  @SolidField({
    description: 'Initial stock quantity',
    min: 0,
    integer: true
  })
  initialStock: number;
  
  @SolidField({
    description: 'Product categories',
    minSize: 1,
    maxSize: 5
  })
  categories: string[];
  
  @SolidField({
    description: 'Supplier information'
  })
  supplier: ProductSupplierDto;
}
```

### 4. Update E2E Tests

**Location**: `apps-examples/advanced-hybrid-crud-app/test/`

Add tests to verify:
- Generated DTOs work with REST endpoints
- Generated DTOs work with GraphQL mutations
- Validation rules are properly applied
- Error messages are correct

```typescript
describe('Generated DTOs', () => {
  it('should validate required fields', async () => {
    const response = await request(app.getHttpServer())
      .post('/products')
      .send({
        // Missing required 'name' field
        price: 100
      })
      .expect(400);
    
    expect(response.body.message).toContain('name should not be empty');
  });
  
  it('should apply transferred validations', async () => {
    const response = await request(app.getHttpServer())
      .post('/products')
      .send({
        name: 'ab', // Too short (minLength: 3)
        price: -10  // Negative (positive: true)
      })
      .expect(400);
    
    expect(response.body.message).toContain('name must be longer');
    expect(response.body.message).toContain('price must be a positive number');
  });
});
```

### 5. Performance Verification

Ensure no performance regression:
- Application starts normally
- No circular dependency issues
- Metadata is properly registered

## Documentation Updates

Update the app's README to explain:
- How GenerateDtoFromEntity is used
- Benefits demonstrated
- Different usage patterns shown

## Success Criteria

- [ ] Existing functionality still works
- [ ] At least 3 DTOs refactored to use helper
- [ ] E2E tests pass with generated DTOs
- [ ] Performance is not degraded
- [ ] Examples demonstrate various usage patterns