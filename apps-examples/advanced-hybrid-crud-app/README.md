# Simple Hybrid CRUD App - SOLID NestJS Framework Example

This example demonstrates how to build a **hybrid REST + GraphQL CRUD application** using the **SOLID NestJS Framework** with TypeORM, SQLite, Apollo GraphQL, and Swagger documentation. This showcases the ultimate flexibility of having both REST and GraphQL APIs from the same codebase.

## 🚀 Features

- **🔄 Hybrid API** - Both REST and GraphQL endpoints from single service structure
- **📡 Complete REST API** - Full RESTful CRUD operations with Swagger docs
- **🎯 Complete GraphQL API** - Full GraphQL queries and mutations with Playground
- **💾 Database Integration** - SQLite with TypeORM for data persistence
- **🔍 Advanced Filtering** - Query parameters (REST) and GraphQL arguments with filtering
- **📄 Pagination Support** - Built-in pagination with metadata for both APIs
- **📝 Dual Documentation** - Swagger for REST + GraphQL Playground
- **🛡️ Input Validation** - Automatic validation with class-validator
- **⚡ Auto-generated Everything** - Controllers and resolvers from shared service structures
- **🔗 Relation Handling** - Automatic loading and nested queries for related entities

## 🏗️ What's Included

### Entities with Dual Decorators

- **Product** - Entity with both `@ApiProperty` (REST) and `@Field` (GraphQL) decorators
- **Supplier** - Related entity supporting both REST and GraphQL operations

### Generated REST Endpoints

- `GET /products` - List products with filtering and pagination
- `GET /products/:id` - Get single product by ID
- `POST /products` - Create new product
- `PUT /products/:id` - Update existing product
- `DELETE /products/:id` - Delete product (soft delete)

### Generated GraphQL Operations

- **Queries**: `products()`, `product(id)`, `suppliers()`, `supplier(id)`
- **Mutations**: `createProduct()`, `updateProduct()`, `removeProduct()`, etc.

### Key SOLID NestJS Features Demonstrated

- **Hybrid Service Structure** - `CrudServiceStructure()` supporting both APIs
- **Auto-generated Services** - `CrudServiceFrom()` mixin
- **Dual Controllers** - `CrudControllerFrom()` for REST endpoints
- **Dual Resolvers** - `CrudResolverFrom()` for GraphQL operations
- **Unified Filtering** - Shared filtering logic for both REST and GraphQL
- **Shared DTOs** - Input types working for both REST and GraphQL

## 📦 Installation

```bash
npm install
```

## 🎯 Running the Application

```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run start:prod

# Debug mode
npm run start:debug
```

## 📖 API Documentation

Once running, access both API interfaces:

- **REST API Swagger**: [http://localhost:3000/api](http://localhost:3000/api)
- **GraphQL Playground**: [http://localhost:3000/graphql](http://localhost:3000/graphql)

## 🔍 Example API Requests

### REST API Examples

```bash
# Get all products
GET http://localhost:3000/products

# Filter products by name and price
GET http://localhost:3000/products?name_contains=laptop&price_gte=500&price_lte=2000

# Paginated and sorted
GET http://localhost:3000/products?page=1&limit=10&orderBy=price&orderDirection=DESC

# Create new product
POST http://localhost:3000/products
Content-Type: application/json

{
  "name": "Gaming Laptop",
  "price": 1299.99,
  "supplierId": 1
}

# Update product
PUT http://localhost:3000/products/1
Content-Type: application/json

{
  "name": "Updated Gaming Laptop",
  "price": 1199.99
}
```

### GraphQL Examples

```graphql
# Query all products with supplier info
query {
  products {
    id
    name
    price
    supplier {
      id
      name
      email
    }
  }
}

# Filter products with GraphQL arguments
query {
  products(
    where: { name: { contains: "laptop" }, price: { gte: 500, lte: 2000 } }
    pagination: { page: 1, limit: 10 }
    orderBy: { price: DESC }
  ) {
    id
    name
    price
    supplier {
      name
    }
  }
}

# Create product mutation
mutation {
  createProduct(
    createProductInput: {
      name: "Gaming Laptop"
      price: 1299.99
      description: "High-performance gaming laptop"
      supplierId: 1
    }
  ) {
    id
    name
    price
  }
}

# Update product mutation
mutation {
  updateProduct(
    id: "1"
    updateProductInput: { name: "Updated Gaming Laptop", price: 1199.99 }
  ) {
    id
    name
    price
  }
}
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## 📁 Project Structure

```
src/
├── app.module.ts           # Main module with both REST and GraphQL setup
├── main.ts                 # Bootstrap with dual API setup
├── schema.gql              # Generated GraphQL schema
├── products/               # Products module
│   ├── dto/               # Shared DTOs for REST and GraphQL
│   ├── entities/          # Entities with dual decorators
│   ├── products.controller.ts  # Auto-generated REST controller
│   ├── products.resolver.ts    # Auto-generated GraphQL resolver
│   ├── products.service.ts     # Shared CRUD service
│   └── products.module.ts      # Products module
└── suppliers/             # Suppliers module
    ├── dto/
    ├── entities/
    ├── suppliers.controller.ts # REST endpoints
    ├── suppliers.resolver.ts   # GraphQL operations
    ├── suppliers.service.ts    # Shared service
    └── suppliers.module.ts
```

## 🔧 Key Code Examples

### Hybrid Entity (product.entity.ts)

```typescript
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@ObjectType() // GraphQL
@Entity() // TypeORM
export class Product {
  @Field(() => ID) // GraphQL
  @ApiProperty() // REST/Swagger
  @PrimaryGeneratedColumn() // TypeORM
  id: number;

  @Field() // GraphQL
  @ApiProperty() // REST/Swagger
  @Column() // TypeORM
  name: string;

  @Field() // GraphQL
  @ApiProperty() // REST/Swagger
  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Field(() => Supplier) // GraphQL
  @ApiProperty({ type: () => Supplier }) // REST/Swagger
  @ManyToOne(() => Supplier, supplier => supplier.products)
  supplier: Supplier;
}
```

### Hybrid DTO (create-product.dto.ts)

```typescript
import { InputType, Field } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsPositive } from 'class-validator';

@InputType() // GraphQL
export class CreateProductDto {
  @Field() // GraphQL
  @ApiProperty() // REST/Swagger
  @IsString() // Validation
  name: string;

  @Field() // GraphQL
  @ApiProperty() // REST/Swagger
  @IsNumber() // Validation
  @IsPositive()
  price: number;

  @Field() // GraphQL
  @ApiProperty() // REST/Swagger
  @IsNumber()
  supplierId: number;
}
```

### Shared Service Structure (products.service.ts)

```typescript
import {
  CrudServiceFrom,
  CrudServiceStructure,
} from '@solid-nestjs/typeorm-hybrid-crud';

export const serviceStructure = CrudServiceStructure({
  entityType: Product,
  createInputType: CreateProductDto,
  updateInputType: UpdateProductDto,
  findArgsType: FindProductArgs,
  relationsConfig: {
    relations: {
      supplier: true, // Auto-load for both REST and GraphQL
    },
  },
});

export class ProductsService extends CrudServiceFrom(serviceStructure) {
  // Single service supporting both REST and GraphQL
}
```

### REST Controller (products.controller.ts)

```typescript
import { Controller } from '@nestjs/common';
import {
  CrudControllerFrom,
  CrudControllerStructure,
} from '@solid-nestjs/typeorm-hybrid-crud';

const controllerStructure = CrudControllerStructure({
  ...serviceStructure,
  serviceType: ProductsService,
});

@Controller('products')
export class ProductsController extends CrudControllerFrom(
  controllerStructure,
) {
  // Automatically generates REST endpoints
}
```

### GraphQL Resolver (products.resolver.ts)

```typescript
import { Resolver } from '@nestjs/graphql';
import {
  CrudResolverFrom,
  CrudResolverStructure,
} from '@solid-nestjs/typeorm-hybrid-crud';

const resolverStructure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: ProductsService,
});

@Resolver(() => Product)
export class ProductsResolver extends CrudResolverFrom(resolverStructure) {
  // Automatically generates GraphQL queries and mutations
}
```

## 🛠️ Technologies Used

- **[SOLID NestJS Framework](../../)** - The main framework
- **[NestJS](https://nestjs.com/)** - Node.js framework
- **[Apollo GraphQL](https://www.apollographql.com/)** - GraphQL server
- **[TypeORM](https://typeorm.io/)** - Database ORM
- **[SQLite](https://www.sqlite.org/)** - Database
- **[Swagger](https://swagger.io/)** - REST API documentation
- **[GraphQL Playground](https://github.com/graphql/graphql-playground)** - GraphQL IDE
- **[class-validator](https://github.com/typestack/class-validator)** - Input validation
- **[class-transformer](https://github.com/typestack/class-transformer)** - Object transformation

## 🔗 Related Examples

- **[simple-crud-app](../simple-crud-app)** - REST API only example
- **[simple-graphql-crud-app](../simple-graphql-crud-app)** - GraphQL API only example

## 📚 Learn More

- [SOLID NestJS Framework Documentation](../../docs)
- [NestJS GraphQL Documentation](https://docs.nestjs.com/graphql/quick-start)
- [NestJS Swagger Documentation](https://docs.nestjs.com/openapi/introduction)

## 🎯 Why Hybrid?

This example demonstrates the power of the SOLID NestJS Framework's hybrid approach:

1. **Single Source of Truth** - One service structure generates both APIs
2. **Code Reuse** - Shared entities, DTOs, and business logic
3. **API Flexibility** - Clients can choose REST or GraphQL based on needs
4. **Consistent Data** - Both APIs return identical data structures
5. **Unified Filtering** - Same filtering logic works for both APIs
6. **Reduced Maintenance** - Changes automatically apply to both APIs

## 📄 License

This example is part of the SOLID NestJS Framework and is MIT licensed.
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

# Get a single product by ID

query {
product(id: "your-product-id") {
id
name
description
price
stock
}
}

# Find products by name

query {
productsByName(name: "Product Name") {
id
name
price
}
}

# Find products by price range

query {
productsByPriceRange(minPrice: 10.0, maxPrice: 50.0) {
id
name
price
}
}

````

### Mutations

```graphql
# Create a new product
mutation {
  createProduct(createProductInput: {
    name: "New Product"
    description: "Product description"
    price: 29.99
    stock: 100
  }) {
    id
    name
    price
  }
}

# Update an existing product
mutation {
  updateProduct(
    id: "your-product-id"
    updateProductInput: {
      name: "Updated Product"
      price: 39.99
    }
  ) {
    id
    name
    price
    updatedAt
  }
}

# Delete a product
mutation {
  removeProduct(id: "your-product-id") {
    id
    name
  }
}
````

## Project Structure

```
src/
├── app.module.ts          # Main application module
├── main.ts               # Application entry point
└── products/
    ├── dto/
    │   ├── create-product.input.ts    # GraphQL input for creating products
    │   └── update-product.input.ts    # GraphQL input for updating products
    ├── entities/
    │   └── product.entity.ts          # Product entity with GraphQL decorators
    ├── products.module.ts             # Products module
    ├── products.resolver.ts           # GraphQL resolver
    └── products.service.ts            # Business logic service
```

## Technologies Used

- **NestJS**: A progressive Node.js framework
- **GraphQL**: Query language for APIs
- **Apollo Server**: GraphQL server implementation
- **TypeORM**: Object-relational mapping
- **SQLite**: Lightweight database
- **TypeScript**: Typed JavaScript
- **Class Validator**: Validation decorators

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Key Learning Points

1. **GraphQL Integration**: How to set up GraphQL with NestJS using Apollo
2. **Entity Decorators**: Using both TypeORM and GraphQL decorators on entities
3. **Input Types**: Creating GraphQL input types with validation
4. **Resolvers**: Implementing GraphQL resolvers for queries and mutations
5. **Service Layer**: Separating business logic from GraphQL concerns
6. **Database Operations**: CRUD operations with TypeORM and SQLite
7. **Validation**: Input validation using class-validator decorators
8. **Error Handling**: Proper error handling in GraphQL context

This example serves as a foundation for building more complex GraphQL APIs with NestJS.
