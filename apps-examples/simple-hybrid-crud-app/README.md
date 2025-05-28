# Simple Hybrid (Rest-Api - GraphQL) CRUD App

This example demonstrates how to build a complete GraphQL CRUD application using NestJS, TypeORM, SQLite, and Apollo GraphQL.

## Features

- **GraphQL API**: Complete CRUD operations via GraphQL
- **Database**: SQLite with TypeORM
- **Validation**: Input validation using class-validator
- **GraphQL Playground**: Interactive GraphQL IDE
- **TypeScript**: Full TypeScript support
- **Testing**: E2E tests included

## What's Included

- Product entity with GraphQL ObjectType decorators
- GraphQL Input types for create and update operations
- Complete GraphQL resolver with queries and mutations
- Service layer with business logic
- SQLite database integration
- Validation pipes
- Error handling
- E2E tests

## Installation

```bash
npm install
```

## Running the App

```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod
```

## GraphQL Playground

Once the application is running, visit [http://localhost:3000/graphql](http://localhost:3000/graphql) to access the GraphQL playground.

## Available Operations

### Queries

```graphql
# Get all products
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
