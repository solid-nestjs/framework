# GROUP BY Feature Documentation

## Overview

The GROUP BY feature provides powerful data aggregation capabilities for the SOLID NestJS Framework, supporting both REST API and GraphQL protocols. This feature allows you to group entities by specific fields and apply aggregation functions to calculate statistics across grouped data.

## Key Features

- **Universal Protocol Support**: Works seamlessly with both REST API and GraphQL
- **Comprehensive Aggregations**: Support for COUNT, SUM, AVG, MIN, MAX functions
- **Nested Field Grouping**: Group by related entity fields (e.g., `supplier.name`)
- **Pagination Integration**: Full pagination support for grouped results
- **Type Safety**: Complete TypeScript support with proper type inference
- **Soft Deletion Awareness**: Respects soft deletion settings automatically

## Quick Start

### REST API Usage

```typescript
// Group products by supplier name with aggregations
GET /products/grouped?groupBy={"fields":{"supplier":{"name":true}},"aggregates":[{"field":"price","function":"AVG","alias":"avgPrice"}]}
```

### GraphQL Usage

```graphql
query {
  productsGrouped(
    groupBy: {
      fields: { supplier: { name: true } }
      aggregates: [
        { field: "price", function: AVG, alias: "avgPrice" }
      ]
    }
  ) {
    groups {
      key
      aggregates
    }
    pagination {
      total
      count
    }
  }
}
```

## Implementation Guide

### Step 1: Define GROUP BY DTOs

Create unified DTOs that work with both REST and GraphQL:

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { Field, InputType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

@InputType('ProductGroupByFields')
export class ProductGroupByFields {
  @ApiProperty({ required: false, description: 'Group by product name' })
  @Field(() => Boolean, { nullable: true, description: 'Group by product name' })
  @IsOptional()
  name?: boolean;

  @ApiProperty({ required: false, description: 'Group by product price' })
  @Field(() => Boolean, { nullable: true, description: 'Group by product price' })
  @IsOptional()
  price?: boolean;

  @ApiProperty({
    type: SupplierGroupByFields,
    required: false,
    description: 'Group by supplier fields',
  })
  @Field(() => SupplierGroupByFields, {
    nullable: true,
    description: 'Group by supplier fields',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SupplierGroupByFields)
  supplier?: SupplierGroupByFields;
}
```

### Step 2: Configure Service Structure

No changes needed - GROUP BY is automatically available in all services that extend from `CrudServiceFrom`:

```typescript
export const serviceStructure = CrudServiceStructure({
  entityType: Product,
  createInputType: CreateProductDto,
  updateInputType: UpdateProductDto,
  findArgsType: FindProductArgs,
  relationsConfig: { relations: { supplier: true } },
});

export class ProductsService extends CrudServiceFrom(serviceStructure) {}
```

### Step 3: Configure REST Controller

Add GROUP BY support to your REST controller:

```typescript
import { GroupedProductArgsRest } from './dto';

const controllerStructure = CrudControllerStructure({
  ...serviceStructure,
  serviceType: ProductsService,
  groupByArgsType: GroupedProductArgsRest, // Add this line
  operations: {
    findAll: true,
    findOne: true,
    findAllGrouped: true, // Enable GROUP BY endpoint
    // ... other operations
  },
});

export class ProductsController extends CrudControllerFrom(controllerStructure) {}
```

### Step 4: Configure GraphQL Resolver

Add GROUP BY support to your GraphQL resolver:

```typescript
import { GroupedProductArgsGraphQL } from './dto';

const resolverStructure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: ProductsService,
  groupByArgsType: GroupedProductArgsGraphQL, // Add this line
  operations: {
    findAll: true,
    findOne: true,
    findAllGrouped: true, // Enable GROUP BY query
    // ... other operations
  },
});

export class ProductsResolver extends CrudResolverFrom(resolverStructure) {}
```

## Aggregation Functions

The framework supports five aggregation functions:

| Function | Description | Example Use Case |
|----------|-------------|------------------|
| `COUNT` | Count of records in group | Number of products per category |
| `SUM` | Sum of numeric values | Total inventory value |
| `AVG` | Average of numeric values | Average price per category |
| `MIN` | Minimum value in group | Lowest price in category |
| `MAX` | Maximum value in group | Highest price in category |

### Aggregation Examples

```typescript
// REST API
const groupByQuery = {
  fields: { category: true },
  aggregates: [
    { field: "price", function: "AVG", alias: "averagePrice" },
    { field: "stock", function: "SUM", alias: "totalStock" },
    { field: "name", function: "COUNT", alias: "productCount" }
  ]
};
```

```graphql
# GraphQL
query {
  productsGrouped(
    groupBy: {
      fields: { category: true }
      aggregates: [
        { field: "price", function: AVG, alias: "averagePrice" }
        { field: "stock", function: SUM, alias: "totalStock" }
        { field: "name", function: COUNT, alias: "productCount" }
      ]
    }
  ) {
    groups {
      key
      aggregates
    }
  }
}
```

## Nested Field Grouping

Group by fields from related entities:

```typescript
// Group by supplier name and contact email
const groupByQuery = {
  fields: {
    supplier: {
      name: true,
      contactEmail: true
    }
  },
  aggregates: [
    { field: "price", function: "AVG", alias: "avgPrice" }
  ]
};
```

## Pagination Support

GROUP BY queries support full pagination:

```typescript
// REST API with pagination
GET /products/grouped?groupBy={"fields":{"name":true}}&pagination={"limit":10,"page":2}
```

```graphql
# GraphQL with pagination
query {
  productsGrouped(
    groupBy: { fields: { name: true } }
    pagination: { limit: 10, page: 2 }
  ) {
    groups { key, aggregates }
    pagination {
      total
      count
      page
      limit
      pageCount
      hasNextPage
      hasPreviousPage
    }
  }
}
```

## Response Format

The GROUP BY feature returns results with `key` and `aggregates` as JSON objects (not strings), providing direct access to grouped data without requiring JSON parsing.

### REST API Response

```json
{
  "groups": [
    {
      "key": {"supplier_name": "Electronics Corp"},
      "aggregates": {"avgPrice": 850.50, "totalStock": 25}
    }
  ],
  "pagination": {
    "total": 2,
    "count": 2,
    "page": 1,
    "limit": null,
    "pageCount": 1
  }
}
```

### GraphQL Response

```json
{
  "data": {
    "productsGrouped": {
      "groups": [
        {
          "key": {"supplier_name": "Electronics Corp"},
          "aggregates": {"avgPrice": 850.50, "totalStock": 25}
        }
      ],
      "pagination": {
        "total": 2,
        "count": 2,
        "page": 1,
        "limit": null,
        "pageCount": 1
      }
    }
  }
}
```

### JSON Scalar Implementation

The framework uses a custom `GraphQLJSON` scalar type to handle complex object serialization/deserialization automatically. This eliminates the need for manual JSON string parsing and provides a cleaner developer experience.

## Best Practices

### 1. Use Proper Indexing

Ensure your database has appropriate indexes for GROUP BY fields:

```typescript
@Entity()
@Index(['supplier', 'category']) // Composite index for grouping
export class Product {
  @ManyToOne(() => Supplier)
  supplier: Supplier;
  
  @Column()
  category: string;
}
```

### 2. Limit Result Sets

Always use pagination for GROUP BY queries that might return many groups:

```typescript
const result = await service.findAllGrouped(context, {
  groupBy: { fields: { name: true } },
  pagination: { limit: 50 } // Prevent memory issues
});
```

### 3. Validate Aggregation Fields

Ensure aggregation fields are numeric when using SUM, AVG, MIN, MAX:

```typescript
@Column('decimal', { precision: 10, scale: 2 })
price: number; // Suitable for numeric aggregations

@Column()
name: string; // Only suitable for COUNT
```

### 4. Use Aliases

Always provide meaningful aliases for aggregations:

```typescript
{
  field: "price",
  function: "AVG",
  alias: "averagePrice" // Clear, descriptive alias
}
```

## Advanced Usage

### Multiple Field Grouping

```typescript
// Group by multiple fields
const groupByQuery = {
  fields: {
    category: true,
    supplier: { name: true }
  },
  aggregates: [
    { field: "price", function: "AVG", alias: "avgPrice" }
  ]
};
```

### Complex Aggregations

```typescript
// Multiple aggregations on same field
const groupByQuery = {
  fields: { category: true },
  aggregates: [
    { field: "price", function: "MIN", alias: "minPrice" },
    { field: "price", function: "MAX", alias: "maxPrice" },
    { field: "price", function: "AVG", alias: "avgPrice" },
    { field: "stock", function: "SUM", alias: "totalStock" }
  ]
};
```

## Error Handling

Common errors and solutions:

### Invalid Aggregation Field

```typescript
// Error: Cannot aggregate non-numeric field with SUM
{
  field: "name", // String field
  function: "SUM" // Numeric function
}

// Solution: Use COUNT for string fields
{
  field: "name",
  function: "COUNT"
}
```

### Missing Relations

```typescript
// Error: Cannot group by supplier.name without relation config
const serviceStructure = CrudServiceStructure({
  entityType: Product,
  // Missing: relationsConfig: { relations: { supplier: true } }
});

// Solution: Add relation configuration
const serviceStructure = CrudServiceStructure({
  entityType: Product,
  relationsConfig: { relations: { supplier: true } }
});
```

## Performance Considerations

1. **Database Indexes**: Ensure proper indexing on GROUP BY fields
2. **Relation Loading**: Only load necessary relations
3. **Result Limiting**: Use pagination to prevent memory issues
4. **Query Optimization**: Monitor database query performance
5. **Caching**: Consider caching frequently-used aggregations

## Integration with Existing Features

### Soft Deletion

GROUP BY automatically respects soft deletion settings:

```typescript
// Soft-deleted entities are automatically excluded
const result = await service.findAllGrouped(context, {
  groupBy: { fields: { category: true } }
});
```

### Filtering

Combine GROUP BY with existing filtering capabilities:

```typescript
const result = await service.findAllGrouped(context, {
  where: { price: { gte: 100 } }, // Filter before grouping
  groupBy: { fields: { category: true } }
});
```

### Ordering

Results are automatically ordered by group keys for consistency.

## Testing

The framework includes comprehensive E2E tests for GROUP BY functionality. Example test structure:

```typescript
describe('GROUP BY Functionality', () => {
  it('should group by supplier with aggregations', async () => {
    // Test implementation
  });

  it('should handle pagination in grouped queries', async () => {
    // Test implementation
  });

  it('should work with soft-deleted entities', async () => {
    // Test implementation
  });
});
```

## Conclusion

The GROUP BY feature provides powerful data aggregation capabilities while maintaining the framework's principles of type safety, protocol agnosticism, and developer experience. It seamlessly integrates with existing features like pagination, filtering, and soft deletion, making it a natural extension of the CRUD operations.