# Simple CRUD App - SOLID NestJS Framework Example

This example demonstrates how to build a complete REST API CRUD application using the **SOLID NestJS Framework** with TypeORM, SQLite, and Swagger documentation.

## 🚀 Features

- **📡 Complete REST API** - Full CRUD operations with RESTful endpoints
- **💾 Database Integration** - SQLite with TypeORM for data persistence
- **🔍 Advanced Filtering** - Query parameters with operators like `_contains`, `_gte`, `_lte`
- **📄 Pagination Support** - Built-in pagination with metadata
- **📝 Swagger Documentation** - Interactive API documentation
- **🛡️ Input Validation** - Automatic validation with class-validator
- **⚡ Auto-generated Endpoints** - Controllers generated from service structures
- **🔗 Relation Handling** - Automatic loading of related entities

## 🏗️ What's Included

### Entities

- **Product** - Main entity with name, price, and supplier relation
- **Supplier** - Related entity with company details

### Generated REST Endpoints

- `GET /products` - List products with filtering and pagination
- `GET /products/:id` - Get single product by ID
- `POST /products` - Create new product
- `PUT /products/:id` - Update existing product
- `DELETE /products/:id` - Delete product (soft delete)

### Key SOLID NestJS Features Demonstrated

- **Service Structure** - `CrudServiceStructure()` configuration
- **Auto-generated Services** - `CrudServiceFrom()` mixin
- **Controller Structure** - `CrudControllerStructure()` configuration
- **Auto-generated Controllers** - `CrudControllerFrom()` mixin
- **Advanced Filtering** - String, number, and date filters
- **Relation Configuration** - Automatic supplier loading

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

Once running, access the interactive Swagger documentation at:
**[http://localhost:3000/api](http://localhost:3000/api)**

## 🔍 Example API Requests

### Basic Operations

```bash
# Get all products
GET http://localhost:3000/products

# Get product by ID
GET http://localhost:3000/products/1

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

# Delete product
DELETE http://localhost:3000/products/1
```

### Advanced Filtering

```bash
# Search by name
GET http://localhost:3000/products?where={"name":{"_contains":"laptop"}}}

# Price range filtering
GET http://localhost:3000/products?where={"price":{"_gte":100, "_lte":1000}}

# Pagination
GET http://localhost:3000/products?pagination={"page":1,"limit":10}

# Sorting
GET http://localhost:3000/products?orderBy=[{"price":"DESC"}]

# Combined filtering
GET http://localhost:3000/products?where={"name":{"_contains":"laptop"}}}&pagination={"page":1,"limit":10}&orderBy=[{"price":"DESC"}]
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
├── app.module.ts           # Main application module
├── main.ts                 # Application bootstrap
├── products/               # Products module
│   ├── dto/               # Data Transfer Objects
│   ├── entities/          # TypeORM entities
│   ├── products.controller.ts  # Auto-generated REST controller
│   ├── products.service.ts     # Auto-generated CRUD service
│   └── products.module.ts      # Products module
└── suppliers/             # Suppliers module
    ├── dto/
    ├── entities/
    ├── suppliers.controller.ts
    ├── suppliers.service.ts
    └── suppliers.module.ts
```

## 🔧 Key Code Examples

### Service Structure (products.service.ts)

```typescript
import {
  CrudServiceFrom,
  CrudServiceStructure,
} from '@solid-nestjs/typeorm-crud';

export const serviceStructure = CrudServiceStructure({
  entityType: Product,
  createInputType: CreateProductDto,
  updateInputType: UpdateProductDto,
  findArgsType: FindProductArgs,
  relationsConfig: {
    relations: {
      supplier: true, // Auto-load supplier relation
    },
  },
});

export class ProductsService extends CrudServiceFrom(serviceStructure) {
  // Automatically includes all CRUD methods
}
```

### Controller Structure (products.controller.ts)

```typescript
import {
  CrudControllerFrom,
  CrudControllerStructure,
} from '@solid-nestjs/typeorm-crud';

const controllerStructure = CrudControllerStructure({
  ...serviceStructure,
  serviceType: ProductsService,
});

export class ProductsController extends CrudControllerFrom(
  controllerStructure,
) {
  // Automatically generates all REST endpoints
}
```

## 🛠️ Technologies Used

- **[SOLID NestJS Framework](../../)** - The main framework
- **[NestJS](https://nestjs.com/)** - Node.js framework
- **[TypeORM](https://typeorm.io/)** - Database ORM
- **[SQLite](https://www.sqlite.org/)** - Database
- **[Swagger](https://swagger.io/)** - API documentation
- **[class-validator](https://github.com/typestack/class-validator)** - Input validation
- **[class-transformer](https://github.com/typestack/class-transformer)** - Object transformation

## 🔗 Related Examples

- **[simple-graphql-crud-app](../simple-graphql-crud-app)** - GraphQL API example
- **[simple-hybrid-crud-app](../simple-hybrid-crud-app)** - REST + GraphQL hybrid example

## 📚 Learn More

- [SOLID NestJS Framework Documentation](../../docs)
- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io/)

## 📄 License

This example is part of the SOLID NestJS Framework and is MIT licensed.
