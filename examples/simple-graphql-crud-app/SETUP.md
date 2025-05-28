# Simple GraphQL CRUD Example - Setup Instructions

This example demonstrates how to create a GraphQL CRUD application with NestJS. Due to version compatibility issues with some GraphQL packages, here are the steps to set it up properly:

## Quick Setup

1. **Install dependencies:**
```bash
npm install @nestjs/common@^10.4.4 @nestjs/core@^10.4.4 @nestjs/platform-express@^10.4.4
npm install @nestjs/graphql@^10.2.1 apollo-server-express@^3.12.1 graphql@^16.8.1
npm install @nestjs/typeorm@^10.0.2 typeorm@^0.3.22 sqlite3@^5.1.7
npm install class-transformer@^0.5.1 class-validator@^0.14.1 reflect-metadata@^0.2.2 rxjs@^7.8.1
```

2. **Update app.module.ts to use legacy GraphQL configuration:**
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { ProductsModule } from './products/products.module';
import { Product } from './products/entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: './database-data/products.sqlite',
      entities: [Product],
      synchronize: true,
      logging: true
    }),
    GraphQLModule.forRoot({
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: true,
      introspection: true,
      sortSchema: true,
    }),
    ProductsModule,
  ],
})
export class AppModule {}
```

## What's Built

✅ **Product Entity** with GraphQL decorators
✅ **GraphQL Resolver** with CRUD operations
✅ **Service Layer** with TypeORM integration
✅ **SQLite Database** integration
✅ **Input Types** with validation
✅ **E2E Tests** 

## Available GraphQL Operations

### Queries
- `products` - Get all products
- `product(id: ID!)` - Get product by ID
- `productsByName(name: String!)` - Find products by name
- `productsByPriceRange(minPrice: Float!, maxPrice: Float!)` - Find products in price range

### Mutations
- `createProduct(createProductInput: CreateProductInput!)` - Create a new product
- `updateProduct(id: ID!, updateProductInput: UpdateProductInput!)` - Update a product
- `removeProduct(id: ID!)` - Delete a product

## Testing GraphQL

Once running, visit `http://localhost:3000/graphql` to use GraphQL Playground.

### Example Queries:

**Create a Product:**
```graphql
mutation {
  createProduct(createProductInput: {
    name: "Gaming Laptop"
    description: "High-performance gaming laptop"
    price: 1299.99
    stock: 50
  }) {
    id
    name
    price
    stock
    createdAt
  }
}
```

**Get All Products:**
```graphql
query {
  products {
    id
    name
    description
    price
    stock
    createdAt
    updatedAt
  }
}
```

**Update Product:**
```graphql
mutation {
  updateProduct(
    id: "your-product-id"
    updateProductInput: {
      price: 1199.99
      stock: 45
    }
  ) {
    id
    name
    price
    stock
    updatedAt
  }
}
```

## Key Features Demonstrated

1. **GraphQL Schema Generation**: Automatic schema generation from TypeScript decorators
2. **TypeORM Integration**: Database operations with SQLite
3. **Input Validation**: Using class-validator decorators
4. **Error Handling**: Proper GraphQL error responses
5. **Database Relations**: Ready for expansion with related entities
6. **Testing Setup**: E2E tests with GraphQL operations

## Architecture

```
src/
├── app.module.ts              # Main app module with GraphQL config
├── main.ts                   # Application bootstrap
└── products/
    ├── dto/
    │   ├── create-product.input.ts    # GraphQL input type for creation
    │   └── update-product.input.ts    # GraphQL input type for updates
    ├── entities/
    │   └── product.entity.ts          # TypeORM entity with GraphQL decorators
    ├── products.module.ts             # Products module
    ├── products.resolver.ts           # GraphQL resolver
    └── products.service.ts            # Business logic service
```

This example provides a solid foundation for building GraphQL APIs with NestJS and can be extended with authentication, authorization, subscriptions, and more complex data relationships.
