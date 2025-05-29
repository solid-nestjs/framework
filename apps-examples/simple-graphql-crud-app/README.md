# Simple GraphQL CRUD App - SOLID NestJS Framework Example

This example demonstrates how to build a complete GraphQL CRUD application using the **SOLID NestJS Framework** with TypeORM, SQLite, and Apollo GraphQL.

## 🚀 Features

- **🎯 Complete GraphQL API** - Full CRUD operations with GraphQL queries and mutations
- **💾 Database Integration** - SQLite with TypeORM for data persistence
- **🔍 Advanced Filtering** - GraphQL arguments with type-safe filtering
- **📄 Pagination Support** - Built-in pagination with metadata
- **🎮 GraphQL Playground** - Interactive GraphQL IDE for testing
- **🛡️ Input Validation** - Automatic validation with class-validator
- **⚡ Auto-generated Resolvers** - GraphQL resolvers generated from service structures
- **🔗 Relation Handling** - Automatic loading and nested queries for related entities
- **📝 Schema Generation** - Automatic GraphQL schema generation

## 🏗️ What's Included

### Entities
- **Product** - Main entity with GraphQL ObjectType decorators
- **Supplier** - Related entity with company details and product relations

### Generated GraphQL Operations

#### Queries
- `products()` - List products with filtering and pagination
- `product(id: ID!)` - Get single product by ID
- `suppliers()` - List suppliers with their products
- `supplier(id: ID!)` - Get single supplier by ID

#### Mutations
- `createProduct(createProductInput: CreateProductInput!)` - Create new product
- `updateProduct(id: ID!, updateProductInput: UpdateProductInput!)` - Update existing product
- `removeProduct(id: ID!)` - Delete product (soft delete)
- `createSupplier(createSupplierInput: CreateSupplierInput!)` - Create new supplier
- `updateSupplier(id: ID!, updateSupplierInput: UpdateSupplierInput!)` - Update existing supplier
- `removeSupplier(id: ID!)` - Delete supplier

### Key SOLID NestJS Features Demonstrated
- **Service Structure** - `CrudServiceStructure()` with GraphQL configuration
- **Auto-generated Services** - `CrudServiceFrom()` mixin
- **Resolver Structure** - `CrudResolverStructure()` configuration
- **Auto-generated Resolvers** - `CrudResolverFrom()` mixin
- **GraphQL Schema Generation** - Automatic schema from TypeScript types
- **Advanced Filtering** - Type-safe GraphQL filtering arguments
- **Relation Configuration** - Automatic nested relation queries

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

## 🎮 GraphQL Playground

Once running, access the interactive GraphQL Playground at:
**[http://localhost:3000/graphql](http://localhost:3000/graphql)**

## 🔍 Example GraphQL Operations

### Basic Queries

```graphql
# Get all products with supplier information
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

# Get single product by ID
query {
  product(id: "1") {
    id
    name
    price
    description
    supplier {
      name
      email
    }
  }
}

# Get suppliers with their products
query {
  suppliers {
    id
    name
    email
    products {
      id
      name
      price
    }
  }
}
```

### Advanced Queries with Filtering

```graphql
# Filter products by name and price range
query {
  products(
    where: {
      name: { contains: "laptop" }
      price: { gte: 500, lte: 2000 }
    }
  ) {
    id
    name
    price
    supplier {
      name
    }
  }
}

# Paginated products with sorting
query {
  products(
    pagination: { page: 1, limit: 10 }
    orderBy: { price: DESC }
  ) {
    id
    name
    price
  }
}
```

### Mutations

```graphql
# Create new product
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
    supplier {
      name
    }
  }
}

# Update product
mutation {
  updateProduct(
    id: "1"
    updateProductInput: {
      name: "Updated Gaming Laptop"
      price: 1199.99
    }
  ) {
    id
    name
    price
  }
}

# Delete product
mutation {
  removeProduct(id: "1") {
    id
    name
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
├── app.module.ts           # Main application module with GraphQL setup
├── main.ts                 # Application bootstrap
├── schema.gql              # Generated GraphQL schema
├── products/               # Products module
│   ├── dto/               # GraphQL Input types
│   ├── entities/          # TypeORM entities with GraphQL decorators
│   ├── products.resolver.ts    # Auto-generated GraphQL resolver
│   ├── products.service.ts     # Auto-generated CRUD service
│   └── products.module.ts      # Products module
└── suppliers/             # Suppliers module
    ├── dto/
    ├── entities/
    ├── suppliers.resolver.ts
    ├── suppliers.service.ts
    └── suppliers.module.ts
```

## 🔧 Key Code Examples

### Entity with GraphQL Decorators (product.entity.ts)
```typescript
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@ObjectType()
@Entity()
export class Product {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Field(() => Supplier)
  @ManyToOne(() => Supplier, supplier => supplier.products)
  supplier: Supplier;
}
```

### Service Structure (products.service.ts)
```typescript
import { CrudServiceFrom, CrudServiceStructure } from '@solid-nestjs/typeorm-graphql-crud';

export const serviceStructure = CrudServiceStructure({
  entityType: Product,
  createInputType: CreateProductDto,
  updateInputType: UpdateProductDto,
  findArgsType: FindProductArgs,
  relationsConfig: {
    relations: {
      supplier: true  // Auto-load supplier relation
    }
  }
});

export class ProductsService extends CrudServiceFrom(serviceStructure) {
  // Automatically includes all CRUD methods
}
```

### Resolver Structure (products.resolver.ts)
```typescript
import { Resolver } from '@nestjs/graphql';
import { CrudResolverFrom, CrudResolverStructure } from '@solid-nestjs/typeorm-graphql-crud';

const resolverStructure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: ProductsService,
});

@Resolver(() => Product)
export class ProductsResolver extends CrudResolverFrom(resolverStructure) {
  // Automatically generates all GraphQL queries and mutations
}
```

## 🛠️ Technologies Used

- **[SOLID NestJS Framework](../../)** - The main framework
- **[NestJS](https://nestjs.com/)** - Node.js framework
- **[Apollo GraphQL](https://www.apollographql.com/)** - GraphQL server
- **[TypeORM](https://typeorm.io/)** - Database ORM
- **[SQLite](https://www.sqlite.org/)** - Database
- **[GraphQL Playground](https://github.com/graphql/graphql-playground)** - GraphQL IDE
- **[class-validator](https://github.com/typestack/class-validator)** - Input validation
- **[class-transformer](https://github.com/typestack/class-transformer)** - Object transformation

## 🔗 Related Examples

- **[simple-crud-app](../simple-crud-app)** - REST API example
- **[simple-hybrid-crud-app](../simple-hybrid-crud-app)** - REST + GraphQL hybrid example

## 📚 Learn More

- [SOLID NestJS Framework Documentation](../../docs)
- [NestJS GraphQL Documentation](https://docs.nestjs.com/graphql/quick-start)
- [Apollo GraphQL Documentation](https://www.apollographql.com/docs/)

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
```

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
```

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
