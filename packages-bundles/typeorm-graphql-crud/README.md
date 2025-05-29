# @solid-nestjs/typeorm-graphql-crud

Complete GraphQL CRUD bundle for the SOLID NestJS Framework. This package combines TypeORM data access with GraphQL resolver generation to provide a complete solution for building type-safe GraphQL APIs.

## 🚀 Features

- **🎯 Complete GraphQL CRUD** - Auto-generated resolvers with full CRUD operations
- **💾 TypeORM Integration** - Seamless database operations with TypeORM
- **🔍 Advanced Filtering** - Complex GraphQL queries with type-safe filtering
- **📄 Pagination Support** - Built-in pagination with metadata
- **🔗 Relation Handling** - Automatic relation loading and nested queries
- **📝 Type Safety** - Full TypeScript support throughout
- **🎨 Highly Customizable** - Extensive configuration options
- **🛡️ Input Validation** - Integrated class-validator support

## 📦 Installation

```bash
npm install @solid-nestjs/typeorm-graphql-crud
```

This bundle includes:
- `@solid-nestjs/common` - Common utilities and interfaces
- `@solid-nestjs/typeorm` - TypeORM service implementations
- `@solid-nestjs/graphql` - GraphQL resolver generators

## 🏗️ Quick Start

### 1. Define Your Entity

```typescript
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
@Entity()
export class Product {
  @Field(() => ID, { description: 'The unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field({ description: 'Product name' })
  @Column()
  name: string;

  @Field({ description: 'Product description' })
  @Column()
  description: string;

  @Field({ description: 'Product price' })
  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Field({ description: 'Stock quantity' })
  @Column()
  stock: number;

  @Field(() => Supplier, { description: 'Product supplier' })
  @ManyToOne(() => Supplier, supplier => supplier.products)
  supplier: Supplier;
}
```

### 2. Create Input DTOs

```typescript
// dto/create-product.dto.ts
import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNumber, IsUUID } from 'class-validator';

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

  @Field()
  @IsNumber()
  stock: number;

  @Field(() => ProductSupplierDto)
  supplier: ProductSupplierDto;
}

@InputType()
export class ProductSupplierDto {
  @Field(() => ID)
  @IsUUID()
  id: string;
}
```

### 3. Create Service

```typescript
import { CrudServiceFrom, CrudServiceStructure } from '@solid-nestjs/typeorm-graphql-crud';
import { Product } from './entities/product.entity';
import { CreateProductDto, UpdateProductDto, FindProductArgs } from './dto';

export const serviceStructure = CrudServiceStructure({
  entityType: Product,
  createInputType: CreateProductDto,
  updateInputType: UpdateProductDto,
  findArgsType: FindProductArgs,
  functions: {
    create: { transactional: true },
    update: { transactional: true },
    remove: { transactional: true },
    findOne: {
      relationsConfig: {
        relations: { supplier: true }
      }
    },
    findAll: {
      relationsConfig: {
        relations: { supplier: true }
      }
    }
  }
});

export class ProductsService extends CrudServiceFrom(serviceStructure) {}
```

### 4. Create GraphQL Resolver

```typescript
import { Resolver } from '@nestjs/graphql';
import { CrudResolverFrom, CrudResolverStructure } from '@solid-nestjs/typeorm-graphql-crud';
import { ProductsService, serviceStructure } from './products.service';
import { Product } from './entities/product.entity';

const resolverStructure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: ProductsService,
});

@Resolver(() => Product)
export class ProductsResolver extends CrudResolverFrom(resolverStructure) {
  // Add custom resolvers here if needed
}
```

### 5. Setup Module

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';
import { ProductsResolver } from './products.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  providers: [ProductsResolver, ProductsService],
  exports: [ProductsService]
})
export class ProductsModule {}
```

### 6. Configure GraphQL Module

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { join } from 'path';

@Module({
  imports: [
    GraphQLModule.forRoot({
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      driver: ApolloDriver,
      sortSchema: true,
    }),
    ProductsModule,
  ],
})
export class AppModule {}
```

## 🎯 Generated GraphQL Operations

### Queries
```graphql
query GetProducts($where: FindProductWhere) {
  products(where: $where) {
    id
    name
    description
    price
    stock
    supplier {
      id
      name
    }
  }
}

query GetProduct($id: String!) {
  product(id: $id) {
    id
    name
    description
    price
    stock
    supplier {
      id
      name
      contactEmail
    }
  }
}

query GetProductsPagination($where: FindProductWhere) {
  productsPagination(where: $where) {
    total
    count
    page
    pageCount
    hasNextPage
    hasPreviousPage
  }
}
```

### Mutations
```graphql
mutation CreateProduct($createInput: CreateProductDto!) {
  createProduct(createInput: $createInput) {
    id
    name
    description
    price
    stock
  }
}

mutation UpdateProduct($updateInput: UpdateProductDto!) {
  updateProduct(updateInput: $updateInput) {
    id
    name
    description
    price
    stock
  }
}

mutation RemoveProduct($id: String!) {
  removeProduct(id: $id) {
    id
    name
  }
}
```

## 🔍 Advanced Filtering

```graphql
query FilteredProducts {
  products(where: {
    _and: [
      { name: { _contains: "laptop" } }
      { price: { _gte: 500, _lte: 2000 } }
      { supplier: { name: { _eq: "TechCorp" } } }
    ]
  }) {
    id
    name
    price
    supplier {
      name
    }
  }
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
      description: 'Retrieve all products with advanced filtering'
    },
    create: {
      name: 'addProduct', 
      description: 'Add a new product to the catalog'
    },
    update: true,
    remove: true,
    hardRemove: false, // Disable hard delete
    pagination: true
  }
});
```

### Transaction Configuration

```typescript
export const serviceStructure = CrudServiceStructure({
  entityType: Product,
  createInputType: CreateProductDto,
  updateInputType: UpdateProductDto,
  findArgsType: FindProductArgs,
  functions: {
    create: {
      transactional: true,
      isolationLevel: 'READ_COMMITTED'
    },
    update: {
      transactional: true,
      lockMode: 'pessimistic_write'
    },
    remove: {
      transactional: true
    }
  }
});
```

### Relation Configuration

```typescript
export const serviceStructure = CrudServiceStructure({
  entityType: Product,
  createInputType: CreateProductDto,
  updateInputType: UpdateProductDto,
  findArgsType: FindProductArgs,
  functions: {
    findAll: {
      relationsConfig: {
        relations: {
          supplier: true,
          category: true
        }
      }
    },
    findOne: {
      relationsConfig: {
        relations: {
          supplier: {
            relations: {
              address: true
            }
          },
          category: true,
          reviews: {
            relations: {
              user: true
            }
          }
        }
      }
    }
  }
});
```

## 📚 Key Exports

### CRUD Operations
```typescript
export {
  CrudServiceFrom,
  CrudServiceStructure,
  CrudResolverFrom,
  CrudResolverStructure
} from '@solid-nestjs/typeorm-graphql-crud';
```

### Filtering & Queries
```typescript
export {
  FindArgsFrom,
  getWhereClass,
  getOrderByClass,
  StringFilter,
  DateFilter,
  NumberFilter
} from '@solid-nestjs/typeorm-graphql-crud';
```

### Transactions
```typescript
export {
  Transactional
} from '@solid-nestjs/typeorm-graphql-crud';
```

### TypeORM Types
```typescript
export {
  TypeOrmFindManyOptions,
  TypeOrmFindOptionsWhere,
  TypeOrmRepository,
  TypeOrmSelectQueryBuilder
} from '@solid-nestjs/typeorm-graphql-crud';
```

## 📚 Examples

Check out the complete example application:
- [Simple GraphQL CRUD App](https://github.com/solid-nestjs/framework/tree/master/apps-examples/simple-graphql-crud-app)

## 📖 Documentation

For complete documentation, examples, and advanced usage, see the [main framework documentation](https://github.com/solid-nestjs/framework).

## 🤝 Related Packages

- `@solid-nestjs/typeorm-crud` - REST API bundle with TypeORM
- `@solid-nestjs/rest-api` - REST API controllers only
- `@solid-nestjs/graphql` - GraphQL resolvers only

## License

MIT
