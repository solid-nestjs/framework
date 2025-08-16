# Args Helper Mixins

The Args Helper Mixins feature provides powerful utilities to reduce boilerplate code when creating DTO classes for filtering, sorting, and grouping operations in your NestJS applications. This feature supports both REST API and GraphQL implementations with automatic type inference and decorator application.

## Overview

Traditional DTO creation requires extensive boilerplate code:

```typescript
// Before: Manual DTO creation with lots of boilerplate
export class ProductWhereFields {
  @ApiProperty({ type: () => StringFilter, required: false })
  @Field(() => StringFilter, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => StringFilter)
  name?: StringFilter;

  @ApiProperty({ type: () => NumberFilter, required: false })
  @Field(() => NumberFilter, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => NumberFilter)
  price?: NumberFilter;

  // ... many more fields with repetitive decorators
}
```

With Args Helper Mixins, this becomes:

```typescript
// After: Simple configuration-driven approach
const ProductWhere = createWhereFields(Product, {
  name: true,          // Auto-infers StringFilter
  price: true,         // Auto-infers NumberFilter
  description: {       // Full configuration when needed
    type: StringFilter,
    description: "Filter by product description"
  }
});
```

## Features

- **🎯 Auto Type Inference**: Automatically detects property types and maps them to appropriate filter types
- **📝 Flexible Configuration**: Simple `true`, explicit types, or full object configuration
- **🔄 Multi-Package Support**: Separate implementations for REST API, GraphQL, and hybrid applications
- **🎨 Decorator Composition**: Automatic application of Swagger and GraphQL decorators
- **✅ Validation Integration**: Built-in class-validator decorators
- **📊 Enum Support**: Automatic enum detection with proper handling
- **🔗 Logical Operators**: Built-in `_and` and `_or` support for complex queries

## Installation

The args helper mixins are included in the core packages:

```bash
# For REST API only
npm install @solid-nestjs/rest-api

# For GraphQL only  
npm install @solid-nestjs/graphql

# For REST + GraphQL hybrid
npm install @solid-nestjs/rest-graphql
```

## Quick Start

### 1. Basic WhereFields Helper

```typescript
import { createWhereFields } from '@solid-nestjs/rest-graphql';

// Entity
class Product {
  id: number;
  name: string;
  price: number;
  createdAt: Date;
  isActive: boolean;
  status: ProductStatus;
}

// Create WhereFields with auto-inference
const ProductWhere = createWhereFields(Product, {
  name: true,           // → StringFilter
  price: true,          // → NumberFilter  
  createdAt: true,      // → DateFilter
  isActive: true,       // → Boolean
  status: true          // → StringFilter (enum auto-detected)
});
```

### 2. OrderByFields Helper

```typescript
import { createOrderByFields } from '@solid-nestjs/rest-graphql';

const ProductOrderBy = createOrderByFields(Product, {
  name: true,
  price: true,
  createdAt: {
    description: "Sort by creation date"
  }
});
```

### 3. GroupByFields Helper

```typescript
import { createGroupByFields } from '@solid-nestjs/rest-graphql';

const ProductGroupBy = createGroupByFields(Product, {
  category: true,
  supplier: true,
  status: {
    description: "Group by product status"
  }
});
```

### 4. Using in FindArgs

```typescript
export class FindProductArgs extends FindArgsFrom({
  whereType: ProductWhere,
  orderByType: ProductOrderBy,
  groupByType: ProductGroupBy
}) {}
```

## Configuration Options

### Field Configuration Types

#### Simple Configuration
```typescript
const config = {
  name: true  // Auto-infer type: String → StringFilter
};
```

#### Explicit Type
```typescript
const config = {
  name: StringFilter  // Explicit filter type
};
```

#### Full Configuration
```typescript
const config = {
  name: {
    type: StringFilter,
    description: "Filter by product name",
    required: false,
    example: { contains: "laptop" },
    deprecated: false
  }
};
```

#### Enum Configuration
```typescript
enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

const config = {
  status: {
    enum: ProductStatus,
    enumName: 'ProductStatus',
    description: "Filter by product status"
  }
};
```

### Class Configuration Options

```typescript
const ProductWhere = createWhereFields(Product, fieldConfig, {
  name: 'CustomProductWhere',
  description: 'Custom filtering for products',
  isAbstract: false,
  decorators: [CustomDecorator()],
  metadata: { version: '1.0' }
});
```

## Type Inference

The system automatically maps TypeScript types to appropriate filter types:

| TypeScript Type | Filter Type |
|-----------------|-------------|
| `string` | `StringFilter` |
| `number` | `NumberFilter` |
| `Date` | `DateFilter` |
| `boolean` | `Boolean` |
| `enum` | `StringFilter` |

### Custom Type Mapping

Register custom filter types in each package:

```typescript
// In your app initialization
import { FilterTypeRegistry } from '@solid-nestjs/common';

FilterTypeRegistry.register({
  StringFilter: MyCustomStringFilter,
  NumberFilter: MyCustomNumberFilter,
  DateFilter: MyCustomDateFilter
});
```

## Package-Specific Usage

### REST API Only (`@solid-nestjs/rest-api`)

```typescript
import { createWhereFields } from '@solid-nestjs/rest-api';

const ProductWhere = createWhereFields(Product, {
  name: true,
  price: true
});
// Generates class with @ApiProperty decorators only
```

### GraphQL Only (`@solid-nestjs/graphql`)

```typescript
import { createWhereFields } from '@solid-nestjs/graphql';

const ProductWhere = createWhereFields(Product, {
  name: true,
  price: true
});
// Generates class with @Field decorators only
```

### Hybrid REST + GraphQL (`@solid-nestjs/rest-graphql`)

```typescript
import { createWhereFields } from '@solid-nestjs/rest-graphql';

const ProductWhere = createWhereFields(Product, {
  name: true,
  price: true
});
// Generates class with both @ApiProperty and @Field decorators
```

## Advanced Features

### GroupByArgsFrom Mixin

Create GroupBy classes from existing FindArgs:

```typescript
import { GroupByArgsFrom } from '@solid-nestjs/rest-graphql';

export class FindProductArgs {
  where?: ProductWhere;
  orderBy?: ProductOrderBy;
  take?: number;
}

const ProductGroupByFromArgs = GroupByArgsFrom({
  findArgsType: FindProductArgs,
  groupByFields: ['category', 'supplier', 'status'],
  className: 'ProductGroupByFromFindArgs'
});
```

### Logical Operators

WhereFields automatically include logical operators:

```typescript
// Generated WhereFields includes:
interface ProductWhere {
  name?: StringFilter;
  price?: NumberFilter;
  _and?: ProductWhere[];  // Automatic
  _or?: ProductWhere[];   // Automatic
}
```

### Complex Queries

```typescript
const query = {
  where: {
    _and: [
      { name: { contains: 'laptop' } },
      { price: { gte: 500 } }
    ],
    _or: [
      { status: { equals: 'ACTIVE' } },
      { category: { equals: 'ELECTRONICS' } }
    ]
  }
};
```

## Error Handling

The helpers include comprehensive validation:

```typescript
// This will throw an error
const ProductWhere = createWhereFields(Product, {
  nonExistentField: true  // Error: Property doesn't exist on Product
});

// This will throw an error
const config = {
  name: {
    invalidOption: true  // Error: Invalid configuration key
  }
};
```

## Performance Considerations

- **Runtime Generation**: Classes are generated at application startup, not per request
- **Metadata Caching**: Type reflection results are cached for performance
- **Memory Efficient**: Generated classes share prototypes to minimize memory usage

## Migration Guide

### From Manual DTOs

```typescript
// Before
export class ProductWhereFields {
  @ApiProperty({ type: () => StringFilter, required: false })
  @Field(() => StringFilter, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => StringFilter)
  name?: StringFilter;
}

// After
const ProductWhere = createWhereFields(Product, {
  name: true
});
```

### From Other DTO Generators

1. Replace your existing DTO generation with args helpers
2. Update imports to use the appropriate package
3. Configure field mappings using the configuration object
4. Test that decorators are applied correctly

## Best Practices

### 1. Organize Helpers by Domain
```typescript
// src/products/dto/product.args.ts
export const ProductWhere = createWhereFields(Product, {
  name: true,
  price: true,
  category: true
});

export const ProductOrderBy = createOrderByFields(Product, {
  name: true,
  price: true,
  createdAt: true
});
```

### 2. Use Explicit Types for Complex Cases
```typescript
const ProductWhere = createWhereFields(Product, {
  name: true,                    // Simple case
  customField: CustomFilter,     // Complex case
  enumField: {                   // Enum case
    enum: MyEnum,
    description: "Custom description"
  }
});
```

### 3. Consistent Naming Conventions
```typescript
// Consistent naming pattern
const ProductWhere = createWhereFields(Product, config);
const ProductOrderBy = createOrderByFields(Product, config);
const ProductGroupBy = createGroupByFields(Product, config);
```

### 4. Leverage TypeScript Inference
```typescript
// TypeScript will infer the correct type
const config = {
  name: true,
  price: true
} as const;

const ProductWhere = createWhereFields(Product, config);
```

## Troubleshooting

### Common Issues

1. **"Type not registered" Error**
   ```typescript
   // Solution: Register filter types
   FilterTypeRegistry.register({
     StringFilter,
     NumberFilter,
     DateFilter
   });
   ```

2. **"Could not infer type" Warning**
   ```typescript
   // Solution: Use explicit type configuration
   const config = {
     complexField: {
       type: CustomFilter
     }
   };
   ```

3. **Decorator Not Applied**
   ```typescript
   // Ensure you're using the correct package
   import { createWhereFields } from '@solid-nestjs/rest-graphql'; // For both
   import { createWhereFields } from '@solid-nestjs/rest-api';     // REST only
   import { createWhereFields } from '@solid-nestjs/graphql';      // GraphQL only
   ```

### Debug Mode

Enable debug logging to see what's happening:

```typescript
// Add to your main.ts
if (process.env.NODE_ENV === 'development') {
  console.log('Generated WhereFields:', ProductWhere);
}
```

## API Reference

### createWhereFields<T>(entity, config, options?)

Creates a WhereFields class for filtering.

**Parameters:**
- `entity: Type<T>` - The entity class
- `config: WhereFieldsConfig<T>` - Field configuration
- `options?: ClassOptions` - Optional class configuration

**Returns:** `Type<Where<T>>`

### createOrderByFields<T>(entity, config, options?)

Creates an OrderByFields class for sorting.

**Parameters:**
- `entity: Type<T>` - The entity class  
- `config: OrderByFieldsConfig<T>` - Field configuration
- `options?: ClassOptions` - Optional class configuration

**Returns:** `Type<OrderBy<T>>`

### createGroupByFields<T>(entity, config, options?)

Creates a GroupByFields class for grouping.

**Parameters:**
- `entity: Type<T>` - The entity class
- `config: GroupByFieldsConfig<T>` - Field configuration  
- `options?: ClassOptions` - Optional class configuration

**Returns:** `Type<GroupBy<T>>`

### GroupByArgsFrom<T>(config)

Creates a GroupBy class from existing FindArgs.

**Parameters:**
- `config: GroupByArgsFromConfig` - Configuration with FindArgs type and fields

**Returns:** `Type<any>`

## Examples

### Complete Product CRUD Example

```typescript
// entities/product.entity.ts
export class Product {
  id: number;
  name: string;
  price: number;
  category: string;
  isActive: boolean;
  createdAt: Date;
  status: ProductStatus;
}

// dto/product.args.ts
import { createWhereFields, createOrderByFields } from '@solid-nestjs/rest-graphql';

export const ProductWhere = createWhereFields(Product, {
  name: true,
  price: true,
  category: true,
  isActive: true,
  status: {
    enum: ProductStatus,
    description: "Filter by product status"
  }
});

export const ProductOrderBy = createOrderByFields(Product, {
  name: true,
  price: true,
  createdAt: true
});

export class FindProductArgs extends FindArgsFrom({
  whereType: ProductWhere,
  orderByType: ProductOrderBy
}) {}

// controllers/products.controller.ts
@Controller('products')
export class ProductsController {
  @Get()
  findAll(@Query() args: FindProductArgs) {
    return this.productsService.findAll(args);
  }
}

// resolvers/products.resolver.ts
@Resolver(() => Product)
export class ProductsResolver {
  @Query(() => [Product])
  products(@Args() args: FindProductArgs) {
    return this.productsService.findAll(args);
  }
}
```

This documentation provides comprehensive coverage of the Args Helper Mixins feature, from basic usage to advanced scenarios and troubleshooting.