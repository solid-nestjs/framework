# Composite Key GraphQL CRUD App - SOLID NestJS Framework Example

This example demonstrates how to build a complete GraphQL CRUD application using **composite primary keys** with the **SOLID NestJS Framework**, TypeORM, SQLite, and Apollo GraphQL.

## 🔑 What are Composite Keys?

**Composite keys** (also known as compound keys) are primary keys that consist of multiple columns working together to uniquely identify a row in a database table. Unlike simple primary keys that use a single field (like `id: 1`), composite keys combine two or more fields to create a unique identifier (like `{ type: "ELECTRONICS", code: 1001 }`).

This example demonstrates a real-world scenario where:

- **Products** have composite keys: `type` (user-provided) + `code` (auto-generated)
- **Suppliers** have composite keys: `type` (user-provided) + `code` (auto-generated)
- The framework automatically handles the complexity of composite key operations

## 🚀 Features

- **🔑 Composite Primary Keys** - Multi-field primary keys with auto-increment support
- **🎯 Complete GraphQL API** - Full CRUD operations with composite key identification
- **💾 Database Integration** - SQLite with TypeORM for composite key relationships
- **⚡ Auto-Increment Support** - Automatic code generation for composite keys
- **🔍 Advanced Filtering** - GraphQL queries with composite key filtering
- **📄 Pagination Support** - Built-in pagination with composite key entities
- **🎮 GraphQL Playground** - Interactive GraphQL IDE for testing composite keys
- **🛡️ Input Validation** - Automatic validation for composite key components
- **⚡ Auto-generated Resolvers** - GraphQL resolvers for composite key operations
- **🔗 Complex Relationships** - Foreign key relationships with composite keys
- **📝 Schema Generation** - Automatic GraphQL schema for composite key types

## 🏗️ What's Included

### Entities with Composite Keys

- **Product** - Composite key: `{ type: string, code: number }`
- **Supplier** - Composite key: `{ type: string, code: number }`

### Composite Key Structure

```typescript
// Product composite key
{
  type: "ELECTRONICS",  // User-provided category
  code: 1001           // Auto-generated sequential number
}

// Supplier composite key
{
  type: "VENDOR",      // User-provided supplier type
  code: 1             // Auto-generated sequential number
}
```

### Generated GraphQL Operations

#### Queries with Composite Keys

- `products()` - List products with composite key identification
- `product(id: ProductId!)` - Get single product by composite key
- `suppliers()` - List suppliers with their composite keys
- `supplier(id: SupplierId!)` - Get single supplier by composite key

#### Mutations with Composite Keys

- `createProduct(createInput: CreateProductInput!)` - Create product with composite key
- `updateProduct(id: ProductId!, updateInput: UpdateProductInput!)` - Update by composite key
- `removeProduct(id: ProductId!)` - Delete by composite key
- `createSupplier(createInput: CreateSupplierInput!)` - Create supplier with composite key
- `updateSupplier(id: SupplierId!, updateInput: UpdateSupplierInput!)` - Update by composite key
- `removeSupplier(id: SupplierId!)` - Delete by composite key

### Key SOLID NestJS Composite Key Features Demonstrated

- **Composite Key Definition** - `ProductId` and `SupplierId` composite key classes
- **Auto-Increment Support** - `@AutoIncrement<T>('field')` decorator for automatic code generation
- **Service Structure with Composite Keys** - `CrudServiceStructure()` configured for composite keys
- **Auto-generated Services** - `CrudServiceFrom()` mixin handling composite key operations
- **Resolver Structure for Composite Keys** - `CrudResolverStructure()` with composite key support
- **Auto-generated Resolvers** - `CrudResolverFrom()` mixin for composite key GraphQL operations
- **GraphQL Schema Generation** - Automatic schema generation for composite key types
- **Advanced Filtering with Composite Keys** - Type-safe GraphQL filtering with complex keys
- **Relation Configuration** - Foreign key relationships using composite keys

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

## 🔍 Example GraphQL Operations with Composite Keys

### Basic Queries

```graphql
# Get all products with their composite keys and supplier information
query {
  products {
    id {
      type
      code
    }
    name
    price
    supplier {
      type
      code
      name
      contactEmail
    }
  }
}

# Get single product by composite key
query {
  product(id: { type: "ELECTRONICS", code: 1001 }) {
    id {
      type
      code
    }
    name
    price
    description
    supplier {
      type
      code
      name
      contactEmail
    }
  }
}

# Get suppliers with their composite keys and products
query {
  suppliers {
    type
    code
    name
    contactEmail
    products {
      id {
        type
        code
      }
      name
      price
    }
  }
}
```

### Advanced Queries with Composite Key Filtering

```graphql
# Filter products by name pattern
query {
  products(where: { name: { _contains: "laptop" } }) {
    id {
      type
      code
    }
    name
    price
    supplier {
      type
      code
      name
    }
  }
}

# Paginated products with sorting
query {
  products(pagination: { page: 1, limit: 10 }, orderBy: [{ price: DESC }]) {
    id {
      type
      code
    }
    name
    price
  }
}

# Filter suppliers by type and get their products
query {
  suppliers(where: { name: { _contains: "Tech" } }) {
    type
    code
    name
    contactEmail
    products {
      id {
        type
        code
      }
      name
      price
    }
  }
}
```

### Mutations with Composite Keys

```graphql
# Create new product (code will be auto-generated)
mutation {
  createProduct(
    createInput: {
      id: { type: "ELECTRONICS" }
      name: "Gaming Laptop"
      description: "High-performance gaming laptop"
      price: 1299.99
      stock: 50
      supplier: { type: "VENDOR", code: 1 }
    }
  ) {
    id {
      type
      code
    }
    name
    price
    supplier {
      type
      code
      name
    }
  }
}

# Create new supplier (code will be auto-generated)
mutation {
  createSupplier(
    createInput: {
      type: "VENDOR"
      name: "Tech Solutions Inc"
      contactEmail: "contact@techsolutions.com"
    }
  ) {
    type
    code
    name
    contactEmail
  }
}

# Update product using composite key
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

# Update supplier using composite key
mutation {
  updateSupplier(
    id: { type: "VENDOR", code: 1 }
    updateInput: {
      name: "Tech Solutions LLC"
      contactEmail: "info@techsolutions.com"
    }
  ) {
    type
    code
    name
    contactEmail
  }
}

# Delete product using composite key
mutation {
  removeProduct(id: { type: "ELECTRONICS", code: 1001 }) {
    id {
      type
      code
    }
    name
  }
}

# Delete supplier using composite key
mutation {
  removeSupplier(id: { type: "VENDOR", code: 1 }) {
    type
    code
    name
  }
}
```

## 🧪 Testing Composite Keys

This example includes comprehensive e2e tests specifically designed to validate composite key functionality:

```bash
# Run all e2e tests for composite keys
npm run test:e2e

# Run specific composite key tests
npm run test:e2e -- --testNamePattern="should create.*composite key"

# Test coverage for composite key operations
npm run test:cov

# Watch mode for development
npm run test:watch
```

### Test Coverage Includes:

- **Composite Key Creation** - Testing auto-increment behavior
- **CRUD Operations** - All operations using composite key identification
- **Relationship Handling** - Foreign key relationships with composite keys
- **GraphQL Schema Validation** - Ensuring proper schema generation
- **Input Validation** - Testing composite key component validation
- **Edge Cases** - Invalid keys, uniqueness constraints, etc.

See [test/README.md](./test/README.md) for detailed test documentation.

## 📁 Project Structure

```
src/
├── app.module.ts           # Main application module with GraphQL setup
├── main.ts                 # Application bootstrap
├── schema.gql              # Generated GraphQL schema with composite key types
├── products/               # Products module with composite keys
│   ├── dto/               # GraphQL Input types for composite keys
│   │   ├── args/          # Query arguments with composite key support
│   │   └── inputs/        # Mutation inputs for composite key operations
│   ├── entities/          # TypeORM entities with composite key definitions
│   │   ├── product.entity.ts    # Product entity with composite key
│   │   └── product.key.ts       # Composite key class definition
│   ├── products.resolver.ts     # Auto-generated GraphQL resolver
│   ├── products.service.ts      # Auto-generated CRUD service
│   └── products.module.ts       # Products module
└── suppliers/             # Suppliers module with composite keys
    ├── dto/               # GraphQL types for supplier composite keys
    │   ├── args/
    │   └── inputs/
    ├── entities/          # Supplier entities with composite keys
    │   ├── supplier.entity.ts   # Supplier entity with composite key
    │   └── supplier.key.ts      # Supplier composite key class
    ├── suppliers.resolver.ts    # Auto-generated GraphQL resolver
    ├── suppliers.service.ts     # Auto-generated CRUD service
    └── suppliers.module.ts      # Suppliers module
test/                      # E2E tests for composite key functionality
├── app.e2e-spec.ts        # Comprehensive tests for composite key operations
├── jest-e2e.json          # Jest configuration for e2e tests
├── jest-e2e.setup.js      # Test setup and configuration
└── README.md              # Test documentation
```

## 🔧 Key Code Examples

### Composite Key Class Definition (product.key.ts)

```typescript
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

### Entity with Composite Key and Auto-Increment (product.entity.ts)

```typescript
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

### Input DTO for Composite Key Creation (create-product.dto.ts)

```typescript
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
  // Note: 'code' is auto-generated, so not included in input
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

### Service Structure with Composite Keys (products.service.ts)

```typescript
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
    supplier: true, // Auto-load supplier relation
  },
});

export class ProductsService extends CrudServiceFrom(serviceStructure) {
  // Automatically includes all CRUD methods for composite key operations
  // - create(createInput) - handles composite key creation with auto-increment
  // - findAll(args) - supports filtering and pagination with composite keys
  // - findOne(id) - finds by composite key { type, code }
  // - update(id, updateInput) - updates using composite key identification
  // - remove(id) - deletes using composite key identification
}
```

### Resolver Structure with Composite Keys (products.resolver.ts)

```typescript
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
export class ProductsResolver extends CrudResolverFrom(resolverStructure) {
  // Automatically generates all GraphQL queries and mutations:
  // - products(where?, orderBy?, pagination?) - query with composite key support
  // - product(id: ProductId!) - query single by composite key
  // - createProduct(createInput: CreateProductDto!) - mutation with auto-increment
  // - updateProduct(id: ProductId!, updateInput: UpdateProductDto!) - mutation
  // - removeProduct(id: ProductId!) - mutation for deletion
}
```

### Composite Key Relationships (Foreign Key Example)

```typescript
// When referencing entities with composite keys
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

## 🛠️ Technologies Used

- **[SOLID NestJS Framework](../../)** - The main framework with composite key support
- **[NestJS](https://nestjs.com/)** - Node.js framework
- **[Apollo GraphQL](https://www.apollographql.com/)** - GraphQL server
- **[TypeORM](https://typeorm.io/)** - Database ORM with composite key support
- **[SQLite](https://www.sqlite.org/)** - Database with composite key indexes
- **[GraphQL Playground](https://github.com/graphql/graphql-playground)** - GraphQL IDE
- **[class-validator](https://github.com/typestack/class-validator)** - Input validation for composite keys
- **[class-transformer](https://github.com/typestack/class-transformer)** - Object transformation

## � Documentation

- **[COMPOSITE_KEYS.md](./COMPOSITE_KEYS.md)** - Comprehensive guide to composite keys in the framework
- **[test/README.md](./test/README.md)** - E2E test documentation for composite keys

## �🔗 Related Examples

- **[simple-crud-app](../simple-crud-app)** - REST API with simple primary keys
- **[simple-graphql-crud-app](../simple-graphql-crud-app)** - GraphQL with simple primary keys
- **[simple-hybrid-crud-app](../simple-hybrid-crud-app)** - REST + GraphQL hybrid with simple keys

## 💡 Key Learning Points

1. **Composite Key Design** - When and how to use multi-field primary keys
2. **Auto-Increment with Composite Keys** - Automatic generation of key components
3. **GraphQL Integration** - Handling complex key structures in GraphQL schema
4. **TypeORM Configuration** - Setting up composite primary keys and relationships
5. **Input Validation** - Validating composite key components in GraphQL inputs
6. **Foreign Key Relationships** - Managing relationships between composite key entities
7. **Database Performance** - Indexing strategies for composite keys
8. **Testing Complex Keys** - Comprehensive testing approach for composite key operations

## 🎯 Use Cases for Composite Keys

This example demonstrates composite keys in action, which are ideal for:

- **Multi-tenant Applications** - `tenant_id + user_id`
- **Product Catalogs** - `category + product_code`
- **Time-series Data** - `device_id + timestamp`
- **Geographic Systems** - `country_code + region_code`
- **Inventory Management** - `warehouse_id + product_id`
- **Order Line Items** - `order_id + line_number`

## 📄 License

This example is part of the SOLID NestJS Framework and is MIT licensed.
