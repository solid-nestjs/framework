# Advanced Hybrid CRUD App - SOLID NestJS Framework Example

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
- **🗑️ Soft Deletion & Recovery** - Complete soft delete with recovery for both REST and GraphQL APIs
- **📦 Bulk Operations** - Service-level bulk operations accessible via both REST and GraphQL
- **⚙️ Custom Bulk Endpoints** - Controller-level bulk operations with domain-specific logic

## 🏗️ What's Included

### Entities with Dual Decorators

- **Product** - Entity with both `@ApiProperty` (REST) and `@Field` (GraphQL) decorators
- **Supplier** - Related entity supporting both REST and GraphQL operations
- **Invoice** - Advanced entity demonstrating event hooks with invoice details in hybrid environment
- **InvoiceDetail** - Child entity showing one-to-many relationships with dual API support

### Generated REST Endpoints

**Products:**

- `GET /products` - List products with filtering and pagination
- `GET /products/:id` - Get single product by ID
- `POST /products` - Create new product
- `PUT /products/:id` - Update existing product
- `DELETE /products/:id` - Delete product (soft delete)

**Suppliers:**

- `GET /suppliers` - List suppliers with filtering and pagination
- `GET /suppliers/:id` - Get single supplier by ID
- `POST /suppliers` - Create new supplier
- `PUT /suppliers/:id` - Update existing supplier
- `DELETE /suppliers/:id` - Delete supplier (soft delete)
- `DELETE /suppliers/soft/:id` - Soft delete supplier
- `PATCH /suppliers/recover/:id` - Recover soft-deleted supplier
- `DELETE /suppliers/hard/:id` - Hard delete supplier
- `DELETE /suppliers/bulk/remove-by-email` - Bulk soft remove suppliers by email
- `PATCH /suppliers/bulk/recover-by-email` - Bulk recover suppliers by email
- `DELETE /suppliers/bulk/delete-by-email` - Bulk hard delete suppliers by email

**Invoices (Advanced Example):**

- `GET /invoices` - List invoices with details and product information
- `GET /invoices/:id` - Get single invoice by ID with full details
- `POST /invoices` - Create new invoice (validates products, calculates totals)
- `PUT /invoices/:id` - Update existing invoice (recalculates totals)
- `DELETE /invoices/:id` - Delete invoice (soft delete)

### Generated GraphQL Operations

**Queries**:

- `products()`, `product(id)` - Product queries with filtering and relations
- `suppliers()`, `supplier(id)` - Supplier queries with filtering

**Mutations**:

- `createProduct()`, `updateProduct()`, `removeProduct()` - Product mutations
- `createSupplier()`, `updateSupplier()`, `removeSupplier()` - Supplier mutations
- `softRemoveSupplier()`, `recoverSupplier()`, `hardRemoveSupplier()` - Soft deletion mutations
- `createInvoice()`, `updateInvoice()`, `removeInvoice()` - Invoice mutations with validation

### Key SOLID NestJS Features Demonstrated

- **Hybrid Service Structure** - `CrudServiceStructure()` supporting both APIs
- **Auto-generated Services** - `CrudServiceFrom()` mixin
- **Dual Controllers** - `CrudControllerFrom()` for REST endpoints
- **Dual Resolvers** - `CrudResolverFrom()` for GraphQL operations
- **Unified Filtering** - Shared filtering logic for both REST and GraphQL
- **Shared DTOs** - Input types working for both REST and GraphQL
- **Event Hooks** - Before/after hooks working seamlessly across REST and GraphQL (see InvoiceService)
- **Business Logic Integration** - Custom validation and calculations executed for both API types
- **Entity Relationships** - One-to-many relationships with cascade operations in hybrid environment
- **Dual Decorators** - Entities decorated for both Swagger (REST) and GraphQL schemas
- **Soft Deletion & Recovery** - Complete soft delete support for both REST and GraphQL APIs
- **Bulk Operations** - Service-level bulk operations accessible through both API types
- **Custom Bulk Endpoints** - Controller-level bulk operations with domain-specific business logic

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
GET http://localhost:3000/products?where={"name":{"_contains":"laptop"}},"price":{"_gte":100, "_lte":1000}}

# Paginated and sorted
GET http://localhost:3000/products?pagination={"page":1,"limit":10}&orderBy=[{"price":"DESC"}]

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

### Invoice Operations (Advanced Example)

**REST API:**

```bash
# Create new invoice with line items
POST http://localhost:3000/invoices
Content-Type: application/json

{
  "invoiceNumber": "INV-2024-001",
  "status": "pending",
  "details": [
    {
      "productId": "uuid-of-product-1",
      "quantity": 2,
      "unitPrice": 999.99
    },
    {
      "productId": "uuid-of-product-2",
      "quantity": 1,
      "unitPrice": 1299.99
    }
  ]
}
```

**GraphQL:**

```graphql
# Query invoices with nested details and products
query {
  invoices {
    id
    invoiceNumber
    totalAmount
    status
    invoiceDate
    details {
      id
      quantity
      unitPrice
      totalAmount
      product {
        id
        name
        price
      }
    }
  }
}

# Create invoice mutation (validates products, calculates totals)
mutation {
  createInvoice(
    createInvoiceInput: {
      invoiceNumber: "INV-2024-001"
      status: "pending"
      details: [
        { productId: "uuid-of-product-1", quantity: 2, unitPrice: 999.99 }
        { productId: "uuid-of-product-2", quantity: 1, unitPrice: 1299.99 }
      ]
    }
  ) {
    id
    invoiceNumber
    totalAmount
    details {
      quantity
      unitPrice
      totalAmount
      product {
        name
      }
    }
  }
}
```

## 🚀 Advanced Features

### 🗑️ Soft Deletion & Recovery Operations

This hybrid example demonstrates comprehensive soft deletion capabilities for both REST and GraphQL APIs with automatic cascade handling.

#### REST API Soft Deletion Examples

```bash
# Soft delete a supplier (sets deletedAt timestamp)
DELETE http://localhost:3000/suppliers/soft/1

# Recover a soft-deleted supplier (clears deletedAt)
PATCH http://localhost:3000/suppliers/recover/1

# Hard delete a supplier (permanently removes from database)
DELETE http://localhost:3000/suppliers/hard/1

# Bulk soft remove suppliers by email
DELETE http://localhost:3000/suppliers/bulk/remove-by-email
Content-Type: application/json

{
  "contactEmail": "remove@example.com"
}

# Bulk recover suppliers by email
PATCH http://localhost:3000/suppliers/bulk/recover-by-email
Content-Type: application/json

{
  "contactEmail": "recover@example.com"
}

# Bulk hard delete suppliers by email
DELETE http://localhost:3000/suppliers/bulk/delete-by-email
Content-Type: application/json

{
  "contactEmail": "delete@example.com"
}
```

#### GraphQL Soft Deletion Examples

```graphql
# Soft delete a supplier
mutation {
  softRemoveSupplier(id: "supplier-1") {
    id
    name
    contactEmail
  }
}

# Recover a soft-deleted supplier
mutation {
  recoverSupplier(id: "supplier-1") {
    id
    name
    contactEmail
  }
}

# Hard delete a supplier
mutation {
  hardRemoveSupplier(id: "supplier-1") {
    id
    name
    contactEmail
  }
}
```

#### Cascade Behavior (Both REST & GraphQL)

- **Soft Delete Cascade**: When a supplier is soft-deleted, all related products are automatically soft-deleted
- **Recovery Cascade**: When a supplier is recovered, all related products are also recovered
- **Relationship Preservation**: All relationships remain intact during soft deletion and recovery
- **API Consistency**: Same cascade behavior works identically for both REST and GraphQL operations

### 📦 Bulk Operations

This example showcases powerful bulk operations accessible through both REST and GraphQL APIs.

#### REST API Bulk Operations

```bash
# Bulk soft remove suppliers by email
DELETE http://localhost:3000/suppliers/bulk/remove-by-email
Content-Type: application/json

{
  "contactEmail": "bulk.remove@test.com"
}

# Response:
{
  "affected": 3
}

# Bulk recover suppliers by email
PATCH http://localhost:3000/suppliers/bulk/recover-by-email
Content-Type: application/json

{
  "contactEmail": "bulk.recover@test.com"
}

# Response:
{
  "affected": 2
}

# Bulk hard delete suppliers by email
DELETE http://localhost:3000/suppliers/bulk/delete-by-email
Content-Type: application/json

{
  "contactEmail": "bulk.delete@test.com"
}

# Response:
{
  "affected": 1
}
```

#### Service-Level Bulk Operations

All bulk operations are powered by the underlying service methods:

```typescript
// Available service methods for bulk operations
await this.service.bulkInsert(context, entities); // Returns { ids: string[] }
await this.service.bulkUpdate(context, updates, where); // Returns { affected: number }
await this.service.bulkRemove(context, where); // Returns { affected: number } - soft delete
await this.service.bulkRecover(context, where); // Returns { affected: number } - restore
await this.service.bulkDelete(context, where); // Returns { affected: number } - hard delete
```

### ⚙️ Controller Configuration for Soft Deletion

The controllers are configured to enable soft deletion operations:

```typescript
const controllerStructure = CrudControllerStructure({
  ...serviceStructure,
  serviceType: SuppliersService,
  operations: {
    softRemove: true, // Enable soft delete endpoints
    recover: true, // Enable recovery endpoints
    hardRemove: true, // Enable hard delete endpoints
  },
});
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
├── suppliers/             # Suppliers module
│   ├── dto/
│   ├── entities/
│   ├── suppliers.controller.ts # REST endpoints
│   ├── suppliers.resolver.ts   # GraphQL operations
│   ├── suppliers.service.ts    # Shared service
│   └── suppliers.module.ts
└── invoices/              # Advanced hybrid example with event hooks
    ├── dto/               # Dual-purpose DTOs with both decorators
    │   ├── inputs/        # Input DTOs for REST and GraphQL
    │   └── args/          # Query arguments for both API types
    ├── entities/          # Entities with @ApiProperty and @Field decorators
    ├── invoices.controller.ts   # Auto-generated REST controller
    ├── invoices.resolver.ts     # Auto-generated GraphQL resolver
    ├── invoices.service.ts      # Service with event hooks for both APIs
    └── invoices.module.ts       # Invoices module
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

### Event Hooks (invoices.service.ts)

The InvoicesService demonstrates the use of **before** event hooks for create, update, and delete operations in a hybrid environment:

```typescript
@Injectable()
export class InvoicesService extends CrudServiceFrom(serviceStructure) {
  constructor(
    @Inject(ProductsService)
    private readonly productsService: ProductsService,
  ) {
    super();
  }

  // Override beforeCreate and beforeUpdate to use shared logic
  override beforeCreate = this.beforeCreateOrUpdate;
  override beforeUpdate = this.beforeCreateOrUpdate;

  /**
   * Shared validation and calculation logic for create and update operations
   * Works for both REST API calls and GraphQL mutations
   * - Validates that all products in invoice details exist
   * - Calculates individual line totals and invoice total amount
   */
  async beforeCreateOrUpdate(
    context: Context,
    repository: TypeOrmRepository<Invoice>,
    entity: Invoice,
    input: DeepPartial<Invoice>,
  ): Promise<void> {
    // Check that all products in the details exist
    const productIds = [
      ...new Set(entity.details.map(detail => detail.productId)),
    ];

    for (const productId of productIds) {
      await this.productsService.findOne(context, productId, true);
    }

    let totalAmount = 0;

    entity.details.forEach(detail => {
      totalAmount += detail.totalAmount = detail.unitPrice * detail.quantity;
    });

    entity.totalAmount = totalAmount;
  }

  /**
   * Optional: beforeRemove hook for custom delete logic
   * Works for both REST DELETE and GraphQL removeInvoice mutation
   * Uncomment and implement if you need custom validation before deletion
   */
  // override async beforeRemove(
  //   context: Context,
  //   repository: TypeOrmRepository<Invoice>,
  //   entity: Invoice,
  // ): Promise<void> {
  //   // Custom logic before deletion (e.g., check if invoice is paid)
  //   if (entity.status === 'paid') {
  //     throw new BadRequestException('Cannot delete a paid invoice');
  //   }
  // }
}
```

### Available Event Hooks

The SOLID NestJS Framework provides the following event hooks that work seamlessly with both REST and GraphQL:

- **beforeCreate** - Executed before creating an entity (REST POST / GraphQL mutation)
- **beforeUpdate** - Executed before updating an entity (REST PUT/PATCH / GraphQL mutation)
- **beforeRemove** - Executed before soft-deleting an entity (REST DELETE / GraphQL mutation)
- **beforeHardRemove** - Executed before permanently deleting an entity
- **afterCreate** - Executed after creating an entity
- **afterUpdate** - Executed after updating an entity
- **afterRemove** - Executed after soft-deleting an entity
- **afterHardRemove** - Executed after permanently deleting an entity

Each hook receives the operation context, repository, entity, and relevant input data. The hooks are executed regardless of whether the operation was triggered via REST API or GraphQL.

## 🎯 Advanced Features: Invoice Example

This hybrid application includes an **Invoice** entity that demonstrates advanced SOLID NestJS features working across both REST and GraphQL:

### Complex Business Logic (Hybrid)

- **Product Validation**: Before creating/updating invoices (via REST POST/PUT or GraphQL mutations), validates that all referenced products exist
- **Automatic Calculations**: Calculates line item totals and invoice totals automatically for both API types
- **Shared Hook Logic**: Uses the same validation logic for both create and update operations, regardless of API entry point

### Entity Relationships (Dual Support)

- **One-to-Many**: Invoice → InvoiceDetails with cascade operations accessible via both REST and GraphQL
- **Many-to-One**: InvoiceDetail → Product with eager loading for both API responses
- **Automatic Loading**: Related products are automatically loaded with invoice details in REST responses and GraphQL query results

### Event Hook Implementation (API-Agnostic)

The `InvoicesService` demonstrates how to:

- Override multiple hooks (`beforeCreate`, `beforeUpdate`) with shared logic that works for both APIs
- Perform async validation (checking product existence) regardless of whether called from REST or GraphQL
- Modify entity data before persistence (calculating totals) for both API types
- Integrate with other services (ProductsService dependency injection) in a hybrid environment

### Hybrid Benefits

- **Single Business Logic**: Write validation and calculation logic once, use it everywhere
- **Consistent Behavior**: Same validation rules and calculations apply whether client uses REST or GraphQL
- **Unified Error Handling**: Errors thrown in hooks are properly formatted for both API types

This pattern is ideal for complex business entities requiring validation, calculations, or business rules that must work consistently across multiple API interfaces.

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

### Custom Bulk Endpoints

This example shows how to add domain-specific bulk endpoints to hybrid controllers:

```typescript
export class SuppliersController extends CrudControllerFrom(
  controllerStructure,
) {
  @Delete('bulk/remove-by-email')
  @ApiOperation({ summary: 'Bulk soft remove suppliers by email' })
  async bulkRemoveByEmail(
    @CurrentContext() context: Context,
    @Body() removeDto: { contactEmail: string },
  ): Promise<{ affected: number }> {
    const result = await this.service.bulkRemove(context, {
      contactEmail: removeDto.contactEmail,
    });
    return { affected: result.affected };
  }

  @Patch('bulk/recover-by-email')
  @ApiOperation({ summary: 'Bulk recover suppliers by email' })
  async bulkRecoverByEmail(
    @CurrentContext() context: Context,
    @Body() recoverDto: { contactEmail: string },
  ): Promise<{ affected: number }> {
    const result = await this.service.bulkRecover(context, {
      contactEmail: recoverDto.contactEmail,
    });
    return { affected: result.affected };
  }

  @Delete('bulk/delete-by-email')
  @ApiOperation({ summary: 'Bulk hard delete suppliers by email' })
  async bulkDeleteByEmail(
    @CurrentContext() context: Context,
    @Body() deleteDto: { contactEmail: string },
  ): Promise<{ affected: number }> {
    const result = await this.service.bulkDelete(context, {
      contactEmail: deleteDto.contactEmail,
    });
    return { affected: result.affected };
  }
}
```

#### Benefits of Hybrid Bulk Operations

- **Single Implementation**: Bulk logic implemented once in the service layer
- **Multiple Access Points**: Same operations available via REST endpoints
- **Service Integration**: GraphQL can also access bulk operations through custom resolvers
- **Consistent Results**: Same response format and behavior across API types

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
- **[advanced-crud-app](../advanced-crud-app)** - Advanced REST API with same features
- **[simple-graphql-crud-app](../simple-graphql-crud-app)** - GraphQL API only example
- **[simple-hybrid-crud-app](../simple-hybrid-crud-app)** - Basic REST + GraphQL hybrid example

## 📚 Learn More

- [SOLID NestJS Framework Documentation](../../docs)
- [NestJS GraphQL Documentation](https://docs.nestjs.com/graphql/quick-start)
- [NestJS Swagger Documentation](https://docs.nestjs.com/openapi/introduction)

## ✨ What Makes This "Advanced" and "Hybrid"

This example combines the complexity of advanced CRUD operations with the flexibility of hybrid APIs:

**Advanced Features:**

- **Event Hooks**: Custom business logic working across both REST and GraphQL
- **Complex Relationships**: One-to-many with cascading operations for both API types
- **Business Validation**: Cross-entity validation executed regardless of API entry point
- **Automatic Calculations**: Dynamic field computation for both REST and GraphQL responses
- **Service Integration**: Dependency injection between services in hybrid environment

**Hybrid Benefits:**

- **Single Codebase**: One service structure generates both REST and GraphQL APIs
- **Consistent Business Logic**: Same validation and calculations for both API types
- **Flexible Client Access**: Clients can choose the most appropriate API for their needs
- **Unified Error Handling**: Consistent error responses across both APIs

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

## 🔗 Related Examples

- **[simple-crud-app](../simple-crud-app)** - Basic REST API example
- **[simple-graphql-crud-app](../simple-graphql-crud-app)** - GraphQL API example
- **[simple-hybrid-crud-app](../simple-hybrid-crud-app)** - Basic REST + GraphQL hybrid example
- **[advanced-crud-app](../advanced-crud-app)** - Advanced REST API with same features

## 📚 Learn More

- [SOLID NestJS Framework Documentation](../../docs)
- [NestJS Documentation](https://docs.nestjs.com)
- [Apollo GraphQL Documentation](https://www.apollographql.com/docs/)
- [TypeORM Documentation](https://typeorm.io/)

## ✨ What Makes This "Advanced Hybrid"

This example goes beyond basic hybrid CRUD operations to demonstrate:

- **Dual API Support**: Complete feature parity between REST and GraphQL APIs
- **Soft Deletion & Recovery**: Full soft delete lifecycle with cascade behavior for both API types
- **Bulk Operations**: Efficient bulk processing accessible via both REST endpoints and service methods
- **Custom Bulk Endpoints**: Domain-specific bulk operations with business logic (e.g., bulk operations by email)
- **Event Hooks**: Unified business logic working seamlessly across REST and GraphQL operations
- **Cascade Operations**: Related entity cascade for soft delete/recover operations in hybrid environment
- **API Consistency**: Same validation rules, calculations, and behaviors across both API interfaces
- **Unified Error Handling**: Consistent error responses regardless of API entry point
- **Shared Service Layer**: Single business logic implementation serving both REST controllers and GraphQL resolvers

## 📄 License

This example is part of the SOLID NestJS Framework and is MIT licensed.
