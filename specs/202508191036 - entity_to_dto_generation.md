# Entity-to-DTO Code Generation

**Version**: v0.3.0 (planned)  
**Date**: August 19, 2025  
**Type**: Feature Specification  
**Status**: Planning

## Overview

This feature introduces an automatic DTO generation helper/mixin that creates Data Transfer Objects from Entity classes. Similar to NestJS's `PickType` utility, this helper allows developers to select specific properties from an entity and automatically generate a DTO class with proper validation, Swagger, and GraphQL decorators.

## Objectives

1. **Reduce boilerplate code** when creating DTOs from entities
2. **Maintain consistency** between entity properties and DTOs
3. **Automatic validation inference** based on entity field types
4. **Preserve decorator configurations** from entity to DTO
5. **Support selective property picking** with sensible defaults

## API Design

### Basic Usage

```typescript
import { GenerateDtoFromEntity } from '@solid-nestjs/common';
import { Product } from '../entities/product.entity';

// Generate DTO with specific properties
@SolidInput()
export class CreateProductDto extends GenerateDtoFromEntity(Product, ['name', 'description', 'price']) {
  // Additional custom properties can be added here
}

// Generate DTO with all flat properties (excluding 'id')
@SolidInput()
export class UpdateProductDto extends GenerateDtoFromEntity(Product) {
  // Automatically includes: name, description, price, stock
  // Excludes: id, supplier (relation), createdAt, updatedAt, deletedAt
}
```

### Advanced Usage with Extensions

```typescript
@SolidInput()
export class CreateProductWithSupplierDto extends GenerateDtoFromEntity(Product, ['name', 'price']) {
  // Inherited properties: name, price (with all their decorators)
  
  // Add complex/relational properties manually
  @SolidField({
    description: 'Product supplier'
  })
  supplier: SupplierDto;
  
  // Add additional properties
  @SolidField({
    description: 'Initial stock quantity',
    min: 0
  })
  initialStock: number;
}
```

## Property Selection Rules

### Included Property Types (Flat Types)
- `string`
- `number` 
- `boolean`
- `Date`

### Excluded Property Types
- Arrays (e.g., `string[]`, `Product[]`)
- Objects/Relations (e.g., `Supplier`, custom objects)
- Complex types (e.g., `any`, union types, interfaces)

### Default Behavior
When no properties are specified:
1. Include all flat-type properties
2. Exclude `id` property by default
3. Exclude timestamp fields (`createdAt`, `updatedAt`, `deletedAt`)
4. Exclude all relational fields

## Decorator Transfer Rules

### Automatic Transfer
The following decorators and configurations are automatically transferred from entity to DTO:

1. **SOLID Framework Decorators**:
   - `@SolidField` configurations (all options)
   - Validation rules and constraints
   - Description and metadata

2. **Native NestJS Decorators**:
   - `@ApiProperty()` (Swagger) - with all its options
   - `@Field()` (GraphQL) - with all its options
   - `@Prop()` (GraphQL) - with all its options
   - Class-validator decorators (`@IsString()`, `@IsEmail()`, etc.)

3. **Decorator Metadata**:
   - All Swagger metadata (API_MODEL_PROPERTIES)
   - All GraphQL metadata (field types, descriptions)
   - All validation metadata

4. **Validation Inference**:
   Based on the type and configuration, appropriate class-validator decorators are applied if not already present:
   - String → `@IsString()`, `@IsNotEmpty()`
   - Number → `@IsNumber()` or `@IsInt()`
   - Boolean → `@IsBoolean()`
   - Date → `@IsDate()`
   - Optional fields → `@IsOptional()`

### Not Transferred
- TypeORM-specific decorators (`@Column`, `@ManyToOne`, etc.)
- Relation decorators (`@SolidManyToOne`, `@SolidOneToMany`, etc.)
- ID decorators (`@SolidId`)
- Timestamp decorators (`@SolidCreatedAt`, `@SolidUpdatedAt`, `@SolidDeletedAt`)

## Implementation Details

### Package-Specific Implementations

The helper will be implemented in three different packages to support different use cases:

1. **`packages-core/rest-api`**: For REST API with Swagger support
2. **`packages-core/graphql`**: For GraphQL APIs
3. **`packages-core/rest-graphql`**: Combined REST and GraphQL support

### Helper Function Signature

```typescript
export function GenerateDtoFromEntity<TEntity extends object>(
  EntityClass: Type<TEntity>,
  properties?: (keyof TEntity)[]
): Type<Partial<TEntity>>;
```

### Internal Process

1. **Metadata Extraction**:
   - Read SOLID field metadata from `MetadataStorage`
   - Extract Swagger metadata using `DECORATORS.API_MODEL_PROPERTIES`
   - Extract GraphQL metadata using GraphQL's reflection API
   - Extract validation metadata from class-validator
   - Extract TypeScript type information using Reflect API
   
2. **Property Filtering**:
   - If properties array provided: validate and use specified properties
   - If no properties: collect all flat properties except 'id' and timestamps
   
3. **Class Generation**:
   - Create new class using TypeScript mixins
   - Apply property descriptors from entity
   
4. **Decorator Application** (package-specific):
   - **rest-api**: Transfer `@ApiProperty()` decorators and validation
   - **graphql**: Transfer `@Field()` decorators and validation
   - **rest-graphql**: Transfer both Swagger and GraphQL decorators
   - All packages: Transfer @SolidField configurations if present
   - All packages: Apply validation decorators based on type

## Examples

### Example 1: Simple Create DTO

**Entity:**
```typescript
@SolidEntity()
export class Product {
  @SolidId()
  id: string;
  
  @SolidField({ description: 'Product name', minLength: 3, maxLength: 100 })
  name: string;
  
  @SolidField({ description: 'Product price', positive: true })
  price: number;
  
  @SolidManyToOne(() => Supplier)
  supplier: Supplier;
}
```

**Generated DTO:**
```typescript
@SolidInput()
export class CreateProductDto extends GenerateDtoFromEntity(Product, ['name', 'price']) {
  // Automatically has:
  // - name: string with @IsString(), @IsNotEmpty(), @MinLength(3), @MaxLength(100)
  // - price: number with @IsNumber(), @IsPositive()
}
```

### Example 2: Update DTO with All Properties

```typescript
@SolidInput()
export class UpdateProductDto extends GenerateDtoFromEntity(Product) {
  // Automatically includes all flat properties except 'id'
  // name, description, price, stock - all with their validations
}
```

### Example 3: Extended DTO with Relations

```typescript
@SolidInput()
export class CreateProductFullDto extends GenerateDtoFromEntity(Product, ['name', 'description', 'price']) {
  @SolidField({
    description: 'Product supplier',
    nested: true
  })
  supplier: CreateSupplierDto;
  
  @SolidField({
    description: 'Product tags',
    minSize: 1
  })
  tags: string[];
}
```

## Benefits

1. **Code Reduction**: 60-70% less boilerplate for DTO creation
2. **Type Safety**: Full TypeScript support with proper typing
3. **Consistency**: Entity and DTO properties stay synchronized
4. **Validation**: Automatic validation based on entity field types
5. **Flexibility**: Can be extended with additional properties
6. **Maintainability**: Changes to entity automatically reflect in DTOs

## Migration Path

### Before (Manual DTO Creation)
```typescript
@SolidInput()
export class CreateProductDto {
  @SolidField({ description: 'Product name', minLength: 3 })
  name: string;
  
  @SolidField({ description: 'Product description' })
  description: string;
  
  @SolidField({ description: 'Product price', positive: true })
  price: number;
}
```

### After (Generated DTO)
```typescript
@SolidInput()
export class CreateProductDto extends GenerateDtoFromEntity(Product, ['name', 'description', 'price']) {
  // All properties and validations automatically inherited
}
```

## Testing Requirements

1. **Unit Tests**:
   - Property selection logic
   - Type filtering (flat vs complex)
   - Decorator transfer
   - Validation inference
   - Default property selection

2. **Integration Tests**:
   - Generated DTOs work with validation pipes
   - GraphQL schema generation
   - Swagger documentation generation
   - TypeORM compatibility

3. **E2E Tests**:
   - Complete CRUD operations with generated DTOs
   - Validation behavior in API endpoints

## Documentation Requirements

1. Update main documentation with usage examples
2. Add to DECORATORS_AUTOMATIC_VALIDATION_INFERENCE.md
3. Create migration guide for existing projects
4. Add examples in sample applications

## Implementation Timeline

1. **Phase 1**: Core helper implementation (2 days)
2. **Phase 2**: Validation and decorator transfer (1 day)
3. **Phase 3**: Testing and bug fixes (1 day)
4. **Phase 4**: Documentation and examples (1 day)

## Open Questions

1. Should we support partial property selection with wildcards? (e.g., 'price*' for all price-related fields)
2. Should timestamp fields have a separate option to include/exclude them?
3. Should we provide a way to exclude specific validations during transfer?

## Future Enhancements

1. Support for custom transformation during property transfer
2. Ability to rename properties during generation
3. Support for generating multiple DTOs from one entity with presets
4. IDE plugin for auto-completion of property names