# Advanced CRUD App - SOLID NestJS Framework Example

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
- **Invoice** - Advanced entity demonstrating event hooks with invoice details
- **InvoiceDetail** - Child entity showing one-to-many relationships

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

**Invoices (Advanced Example):**

- `GET /invoices` - List invoices with details and product information
- `GET /invoices/:id` - Get single invoice by ID with full details
- `POST /invoices` - Create new invoice (validates products, calculates totals)
- `PUT /invoices/:id` - Update existing invoice (recalculates totals)
- `DELETE /invoices/:id` - Delete invoice (soft delete)

### Key SOLID NestJS Features Demonstrated

- **Service Structure** - `CrudServiceStructure()` configuration
- **Auto-generated Services** - `CrudServiceFrom()` mixin
- **Controller Structure** - `CrudControllerStructure()` configuration
- **Auto-generated Controllers** - `CrudControllerFrom()` mixin
- **Advanced Filtering** - String, number, and date filters
- **Relation Configuration** - Automatic supplier loading
- **Event Hooks** - Before/after hooks for create, update, delete operations (see InvoiceService)
- **Business Logic Integration** - Custom validation and calculations in hooks
- **Entity Relationships** - One-to-many relationships with cascade operations

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

### Invoice Operations (Advanced Example)

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

# Get invoice with full details
GET http://localhost:3000/invoices/1

# Update invoice (automatically recalculates totals)
PUT http://localhost:3000/invoices/1
Content-Type: application/json

{
  "status": "paid",
  "details": [
    {
      "productId": "uuid-of-product-1",
      "quantity": 3,
      "unitPrice": 999.99
    }
  ]
}
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
├── suppliers/             # Suppliers module
│   ├── dto/
│   ├── entities/
│   ├── suppliers.controller.ts
│   ├── suppliers.service.ts
│   └── suppliers.module.ts
└── invoices/              # Advanced example with event hooks
    ├── dto/               # Create/Update DTOs and Find Args
    │   ├── inputs/        # Input DTOs for create/update
    │   └── args/          # Query arguments for filtering
    ├── entities/          # Invoice and InvoiceDetail entities
    ├── invoices.controller.ts   # Auto-generated REST controller
    ├── invoices.service.ts      # Service with custom event hooks
    └── invoices.module.ts       # Invoices module
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

### Event Hooks (invoices.service.ts)

The InvoiceService demonstrates the use of **before** event hooks for create, update, and delete operations:

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
      ...new Set(entity.details.map((detail) => detail.productId)),
    ];

    for (const productId of productIds) {
      await this.productsService.findOne(context, productId, true);
    }

    let totalAmount = 0;

    entity.details.forEach((detail) => {
      totalAmount += detail.totalAmount = detail.unitPrice * detail.quantity;
    });

    entity.totalAmount = totalAmount;
  }

  /**
   * Optional: beforeRemove hook for custom delete logic
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

The SOLID NestJS Framework provides the following event hooks that you can override:

- **beforeCreate** - Executed before creating an entity
- **beforeUpdate** - Executed before updating an entity
- **beforeRemove** - Executed before soft-deleting an entity
- **beforeHardRemove** - Executed before permanently deleting an entity
- **afterCreate** - Executed after creating an entity
- **afterUpdate** - Executed after updating an entity
- **afterRemove** - Executed after soft-deleting an entity
- **afterHardRemove** - Executed after permanently deleting an entity

Each hook receives the operation context, repository, entity, and relevant input data.

## 🎯 Advanced Features: Invoice Example

This application includes an **Invoice** entity that demonstrates advanced SOLID NestJS features:

### Complex Business Logic

- **Product Validation**: Before creating/updating invoices, validates that all referenced products exist
- **Automatic Calculations**: Calculates line item totals and invoice totals automatically
- **Shared Hook Logic**: Uses the same validation logic for both create and update operations

### Entity Relationships

- **One-to-Many**: Invoice → InvoiceDetails with cascade operations
- **Many-to-One**: InvoiceDetail → Product with eager loading
- **Automatic Loading**: Related products are automatically loaded with invoice details

### Event Hook Implementation

The `InvoicesService` shows how to:

- Override multiple hooks (`beforeCreate`, `beforeUpdate`) with shared logic
- Perform async validation (checking product existence)
- Modify entity data before persistence (calculating totals)
- Integrate with other services (ProductsService dependency injection)

This pattern is ideal for entities requiring complex business rules, validation, or calculations.

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

- **[simple-crud-app](../simple-crud-app)** - Basic REST API example
- **[simple-graphql-crud-app](../simple-graphql-crud-app)** - GraphQL API example
- **[advanced-hybrid-crud-app](../advanced-hybrid-crud-app)** - REST + GraphQL hybrid with same features
- **[simple-hybrid-crud-app](../simple-hybrid-crud-app)** - Basic REST + GraphQL hybrid example

## 📚 Learn More

- [SOLID NestJS Framework Documentation](../../docs)
- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io/)

## ✨ What Makes This "Advanced"

This example goes beyond basic CRUD operations to demonstrate:

- **Event Hooks**: Custom business logic in beforeCreate, beforeUpdate, beforeRemove
- **Complex Relationships**: One-to-many with cascading operations
- **Business Validation**: Cross-entity validation (product existence checks)
- **Automatic Calculations**: Dynamic field computation (invoice totals)
- **Service Integration**: Dependency injection between services

## 📄 License

This example is part of the SOLID NestJS Framework and is MIT licensed.
