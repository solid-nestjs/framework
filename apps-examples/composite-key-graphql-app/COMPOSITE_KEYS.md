# Composite Keys in SOLID NestJS Framework

This documentation explains how to use composite keys (compound keys) in the SOLID NestJS Framework with TypeORM and GraphQL.

## What are Composite Keys?

Composite keys are primary keys that consist of multiple columns working together to uniquely identify a row in a database table. Unlike simple primary keys that use a single field, composite keys combine two or more fields to create a unique identifier.

### Example Scenarios

Composite keys are useful in scenarios such as:

- **Product Catalogs**: `type` + `code` (e.g., "ELECTRONICS" + 1001)
- **Multi-tenant Systems**: `tenant_id` + `user_id`
- **Time-series Data**: `device_id` + `timestamp`
- **Geographic Data**: `country_code` + `region_code`

## Implementing Composite Keys

### 1. Define the Composite Key Class

First, create a class that represents your composite key structure:

```typescript
// src/entities/product.key.ts
import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';
import { PrimaryColumn } from 'typeorm';

@InputType()
@ObjectType('OutProductId')
export class ProductId {
  @Field(() => ID, {
    description: 'The type of the unique identifier of the product',
  })
  @PrimaryColumn()
  type: string;

  @Field(() => ID, {
    description: 'The code of the unique identifier of the product',
  })
  @PrimaryColumn()
  code: number;
}
```

### 2. Create the Entity with Composite Key

```typescript
// src/entities/product.entity.ts
import { Entity, Column, PrimaryColumn } from 'typeorm';
import { ObjectType, Field, Float, Int } from '@nestjs/graphql';
import { ProductId } from './product.key';
import { AutoIncrement } from '@solid-nestjs/typeorm-graphql-crud';

@ObjectType()
@Entity()
@AutoIncrement<ProductId>('code') // Auto-increment the 'code' field
export class Product {
  @Field(() => ProductId, { description: 'The id of the product' })
  get id(): ProductId {
    return { type: this.type, code: this.code };
  }
  set id(value: ProductId) {
    this.type = value.type;
    this.code = value.code;
  }

  @PrimaryColumn()
  type: string;

  @PrimaryColumn()
  code: number;

  @Field({ description: 'The name of the product' })
  @Column()
  name: string;

  @Field(() => Float, { description: 'The price of the product' })
  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Field(() => Int, { description: 'The stock quantity of the product' })
  @Column()
  stock: number;
}
```

### 3. Create Input DTOs for Composite Keys

```typescript
// src/dto/create-product.dto.ts
import { InputType, Field, Float, Int, ID } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsPositive,
  Min,
} from 'class-validator';

@InputType()
export class ProductIdDto {
  @Field(() => ID, { description: 'The type of the product' })
  @IsNotEmpty()
  @IsString()
  type: string;
}

@InputType()
export class CreateProductDto {
  @Field(() => ProductIdDto, { description: 'id of the product' })
  @IsNotEmpty()
  id: ProductIdDto;

  @Field({ description: 'The name of the product' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field(() => Float, { description: 'The price of the product' })
  @IsNumber()
  @IsPositive()
  price: number;

  @Field(() => Int, { description: 'The stock quantity of the product' })
  @IsNumber()
  @Min(0)
  stock: number;
}
```

### 4. Configure Service with Composite Keys

```typescript
// src/products.service.ts
import {
  CrudServiceFrom,
  CrudServiceStructure,
} from '@solid-nestjs/typeorm-graphql-crud';
import { Product } from './entities/product.entity';
import { CreateProductDto, FindProductArgs, UpdateProductDto } from './dto';

export const serviceStructure = CrudServiceStructure({
  entityType: Product,
  createInputType: CreateProductDto,
  updateInputType: UpdateProductDto,
  findArgsType: FindProductArgs,
  relationsConfig: {
    // Define relationships if needed
  },
});

export class ProductsService extends CrudServiceFrom(serviceStructure) {}
```

### 5. Configure Resolver with Composite Keys

```typescript
// src/products.resolver.ts
import { Resolver } from '@nestjs/graphql';
import {
  CrudResolverFrom,
  CrudResolverStructure,
} from '@solid-nestjs/typeorm-graphql-crud';
import { ProductsService, serviceStructure } from './products.service';
import { Product } from './entities/product.entity';

const resolverStructure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: ProductsService,
});

@Resolver(() => Product)
export class ProductsResolver extends CrudResolverFrom(resolverStructure) {}
```

## Auto-Increment with Composite Keys

The SOLID NestJS Framework supports auto-increment for specific fields in composite keys:

```typescript
@AutoIncrement<ProductId>('code')
export class Product {
  // ... entity definition
}
```

This decorator automatically generates sequential values for the specified field (`code` in this case) while allowing the user to provide the other parts of the composite key (`type`).

## GraphQL Operations with Composite Keys

### Queries

```graphql
# Get all products
query {
  products {
    id {
      type
      code
    }
    name
    price
    stock
  }
}

# Get a single product by composite key
query {
  product(id: { type: "ELECTRONICS", code: 1001 }) {
    id {
      type
      code
    }
    name
    price
    stock
  }
}
```

### Mutations

```graphql
# Create a product (code will be auto-generated)
mutation {
  createProduct(
    createInput: {
      id: { type: "ELECTRONICS" }
      name: "Gaming Laptop"
      price: 1299.99
      stock: 50
    }
  ) {
    id {
      type
      code
    }
    name
    price
  }
}

# Update a product using composite key
mutation {
  updateProduct(
    id: { type: "ELECTRONICS", code: 1001 }
    updateInput: { name: "Updated Gaming Laptop", price: 1199.99 }
  ) {
    id {
      type
      code
    }
    name
    price
  }
}

# Delete a product using composite key
mutation {
  removeProduct(id: { type: "ELECTRONICS", code: 1001 }) {
    id {
      type
      code
    }
    name
  }
}
```

## Relationships with Composite Keys

When working with relationships between entities that have composite keys:

```typescript
@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  // Foreign key columns for composite key relationship
  @Column({ nullable: true })
  product_type: string;

  @Column({ nullable: true })
  product_code: number;

  @Field(() => Product, { nullable: true })
  @JoinColumn([
    { name: 'product_type', referencedColumnName: 'type' },
    { name: 'product_code', referencedColumnName: 'code' },
  ])
  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  product: Product;
}
```

## Best Practices

### 1. Key Design

- Choose meaningful and stable fields for composite keys
- Avoid using frequently changing values
- Consider the performance impact of multi-column indexes

### 2. GraphQL Schema Design

- Use descriptive names for composite key fields
- Provide clear descriptions in GraphQL field decorators
- Consider using separate input types for partial updates

### 3. Validation

- Validate all parts of the composite key
- Ensure required fields are marked appropriately
- Use appropriate validation decorators

### 4. Database Considerations

- Ensure proper indexing on composite key columns
- Consider the impact on foreign key relationships
- Plan for data migration scenarios

## Common Patterns

### Pattern 1: Type + Auto-Increment Code

```typescript
// User provides type, system generates code
{ type: "ELECTRONICS", code: 1001 }
{ type: "CLOTHING", code: 1 }
```

### Pattern 2: Multi-Tenant Keys

```typescript
// Tenant isolation with user identification
{ tenant_id: "company_a", user_id: 123 }
{ tenant_id: "company_b", user_id: 123 }
```

### Pattern 3: Time-based Keys

```typescript
// Device data with timestamp
{ device_id: "sensor_001", timestamp: "2024-01-15T10:30:00Z" }
```

## Limitations and Considerations

1. **GraphQL ID Type**: GraphQL ID scalar returns strings, so numeric fields appear as strings in responses
2. **Query Complexity**: Composite keys can make queries more complex than simple primary keys
3. **Relationship Mapping**: Relationships require careful mapping of all key components
4. **Performance**: Multi-column primary keys can impact performance compared to single-column keys

## Testing Composite Keys

The framework includes comprehensive e2e tests for composite key functionality. See the [test documentation](./test/README.md) for examples of testing composite key operations.

## Migration from Simple Keys

If you're migrating from simple primary keys to composite keys:

1. **Plan the Migration**: Identify which entities need composite keys
2. **Update Entities**: Add composite key classes and update entity definitions
3. **Update DTOs**: Modify input and output types for GraphQL
4. **Update Relationships**: Adjust foreign key mappings
5. **Update Tests**: Modify tests to work with composite key structures
6. **Database Migration**: Plan database schema changes carefully

## Conclusion

Composite keys in the SOLID NestJS Framework provide a powerful way to model complex business domains where simple primary keys are insufficient. The framework's auto-increment feature and seamless GraphQL integration make it easy to work with composite keys while maintaining type safety and good developer experience.
