# @solid-nestjs/graphql

GraphQL package for the SOLID NestJS Framework providing automatic GraphQL resolver generation with complete CRUD operations, advanced filtering, and type-safe query handling.

## 🚀 Features

- **🎯 Auto-generated GraphQL Resolvers** - Instant CRUD resolvers with proper GraphQL schema
- **🔍 Advanced Filtering** - Type-safe filtering with complex query support
- **📄 Pagination Support** - Built-in pagination with metadata
- **🔗 Relation Handling** - Automatic relation loading and nested queries
- **📝 Type Safety** - Full TypeScript support with GraphQL types
- **🎨 Customizable Operations** - Enable/disable specific operations
- **🛡️ Input Validation** - Integrated validation with GraphQL types

## 📦 Installation

```bash
# Install with TypeORM bundle (recommended)
npm install @solid-nestjs/typeorm-graphql-crud

# Or install individually
npm install @solid-nestjs/common @solid-nestjs/typeorm @solid-nestjs/graphql
```

## 🏗️ Quick Start

### 1. Define Your Entity and DTOs

```typescript
// entities/product.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
@Entity()
export class Product {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  description: string;

  @Field()
  @Column('decimal', { precision: 10, scale: 2 })
  price: number;
}
```

```typescript
// dto/create-product.dto.ts
import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNumber } from 'class-validator';

@InputType()
export class CreateProductDto {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  description: string;

  @Field()
  @IsNumber()
  price: number;
}
```

### 2. Create Service

```typescript
// products.service.ts
import { CrudServiceFrom, CrudServiceStructure } from '@solid-nestjs/typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto, UpdateProductDto, FindProductArgs } from './dto';

export const serviceStructure = CrudServiceStructure({
  entityType: Product,
  createInputType: CreateProductDto,
  updateInputType: UpdateProductDto,
  findArgsType: FindProductArgs,
});

export class ProductsService extends CrudServiceFrom(serviceStructure) {}
```

### 3. Create GraphQL Resolver

```typescript
// products.resolver.ts
import { Resolver } from '@nestjs/graphql';
import { CrudResolverFrom, CrudResolverStructure } from '@solid-nestjs/graphql';
import { ProductsService, serviceStructure } from './products.service';
import { Product } from './entities/product.entity';

const resolverStructure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: ProductsService,
});

@Resolver(() => Product)
export class ProductsResolver extends CrudResolverFrom(resolverStructure) {}
```

### 4. Register in Module

```typescript
// products.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';
import { ProductsResolver } from './products.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  providers: [ProductsResolver, ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
```

## 🎯 Generated GraphQL Schema

The resolver automatically generates:

### Queries

```graphql
type Query {
  # Get single product by ID
  product(id: String!): Product!

  # Get list of products with filtering
  products(where: FindProductWhere): [Product!]!

  # Get paginated products
  productsPagination(where: FindProductWhere): PaginationResult!
}
```

### Mutations

```graphql
type Mutation {
  # Create new product
  createProduct(createInput: CreateProductDto!): Product!

  # Update existing product
  updateProduct(updateInput: UpdateProductDto!): Product!

  # Soft delete product
  removeProduct(id: String!): Product!

  # Hard delete product (if enabled)
  hardRemoveProduct(id: String!): Product!
}
```

### Filtering

```graphql
input FindProductWhere {
  _and: [FindProductWhere!]
  _or: [FindProductWhere!]
  name: StringFilter
  price: NumberFilter
}

input StringFilter {
  _eq: String
  _like: String
  _contains: String
  _startswith: String
  _endswith: String
  _in: [String!]
  _neq: String
  _notlike: String
  _notcontains: String
}
```

## 🔧 Advanced Configuration

### Custom Operations

```typescript
const resolverStructure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: ProductsService,
  operations: {
    findAll: {
      name: 'getAllProducts',
      description: 'Retrieve all products with advanced filtering',
    },
    create: {
      name: 'addProduct',
      description: 'Add a new product to the catalog',
    },
    update: true,
    remove: true,
    hardRemove: false, // Disable hard delete
    pagination: true,
  },
});
```

### Custom Parameter Decorators

```typescript
import { CurrentUser } from '../decorators/current-user.decorator';

const resolverStructure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: ProductsService,
  parameterDecorators: {
    context: CurrentUser,
  },
});
```

## 🔗 Relations Support

```typescript
// With nested relations
export const serviceStructure = CrudServiceStructure({
  entityType: Product,
  createInputType: CreateProductDto,
  updateInputType: UpdateProductDto,
  findArgsType: FindProductArgs,
  functions: {
    findAll: {
      relationsConfig: {
        relations: {
          category: true,
          supplier: true,
        },
      },
    },
    findOne: {
      relationsConfig: {
        relations: {
          category: true,
          supplier: true,
        },
      },
    },
  },
});
```

## 📊 Key Exports

### Resolvers

- `CrudResolverFrom()` - Creates complete CRUD resolver
- `DataResolverFrom()` - Creates read-only resolver
- `CrudResolverStructure()` - Configuration builder
- `DataResolverStructure()` - Read-only configuration builder

### Filtering

- `FindArgsFrom()` - Generates GraphQL filter args
- `StringFilter`, `NumberFilter`, `DateFilter` - Filter input types
- `getWhereClass()`, `getOrderByClass()` - Dynamic filter classes

### Types

- `PaginationResult` - GraphQL pagination result type
- `DefaultArgs` - Default query arguments

## 📚 Examples

For complete examples, see:

- [Simple GraphQL CRUD App](https://github.com/solid-nestjs/framework/tree/master/apps-examples/simple-graphql-crud-app)
- [Advanced GraphQL Examples](https://github.com/solid-nestjs/framework/tree/master/docs/EXAMPLES.md)

## 📖 Documentation

For complete documentation, examples, and advanced usage, see the [main framework documentation](https://github.com/solid-nestjs/framework).

## 🤝 Related Packages

- `@solid-nestjs/common` - Common utilities and interfaces
- `@solid-nestjs/typeorm` - TypeORM service implementations
- `@solid-nestjs/rest-api` - REST API controllers
- `@solid-nestjs/typeorm-graphql-crud` - Complete bundle

## License

MIT
