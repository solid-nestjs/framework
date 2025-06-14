# SOLID NestJS Framework

A powerful, modular, and type-safe framework for building scalable NestJS applications with automatic CRUD generation, advanced query capabilities, and extensible architecture.

## 🚀 Overview

The SOLID NestJS Framework is a collection of utilities and mixins that accelerate the development of robust REST APIs with TypeORM. It follows SOLID principles and provides a clean, maintainable architecture for enterprise-grade applications.

### Core Packages

- **`@solid-nestjs/common`** - Common utilities, interfaces, and decorators
- **`@solid-nestjs/typeorm`** - TypeORM service mixins for data access
- **`@solid-nestjs/rest-api`** - REST API controller mixins with Swagger integration

### 🌟 Key Features

- **🔧 Auto-generated CRUD Operations** - Instantly create controllers and services with full CRUD functionality
- **🔍 Advanced Query System** - Powerful filtering, pagination, sorting, and relation handling
- **🔒 Transaction Support** - Built-in transaction management with isolation levels
- **📝 Type Safety** - Full TypeScript support with comprehensive type definitions
- **🎯 OpenAPI Integration** - Automatic Swagger documentation generation
- **🔄 Flexible Relations** - Easy configuration of entity relationships and eager loading
- **🛡️ Input Validation** - Integrated class-validator support
- **📦 Modular Architecture** - Clean separation of concerns following SOLID principles
- **🎨 Extensible Design** - Easy to extend and customize for specific needs
- **🔄 Soft Delete Support** - Built-in soft delete functionality with recovery operations
- **🔄 Bulk Operations** - Efficient bulk insert, update, delete, and remove operations
- **♻️ Recovery Operations** - Restore soft-deleted entities with cascade support
- **📊 Audit Trail** - Optional audit logging for data changes
- **🚀 Future-Ready** - Designed for GraphQL and Prisma integration

## 🗺️ What's Coming in v0.3.0

We're excited to share a preview of upcoming features in version 0.3.0:

#### 🛠️ Enhanced CLI Tools

- 🔲 **Framework CLI Generator** - Scaffold controllers, services, and modules with interactive prompts

#### 🎨 Custom Decorators & Boilerplate Reduction

- 🔲 **Composite Field Decorators** - Create unified decorators that combine common patterns like `@ApiProperty`, `@IsString`, `@IsNotEmpty`, etc.
- 🔲 **Smart Type Inference Decorators** - Automatically generate validation and API documentation based on TypeScript types
- 🔲 **Entity-to-DTO Code Generation** - Generate DTOs automatically from entity definitions with configurable validation rules
- 🔲 **Hybrid API Decorators** - Single decorators that work for both REST (`@ApiProperty`) and GraphQL (`@Field`) simultaneously
- 🔲 **Validation Preset Decorators** - Pre-configured decorator combinations for common patterns (email, UUID, positive numbers, etc.)

#### 🔐 Advanced Authentication & Authorization

- 🔲 **Role-Based Access Control (RBAC)** - Built-in decorators for fine-grained permissions
- 🔲 **JWT Integration** - Seamless authentication middleware
- 🔲 **Resource-Level Security** - Per-endpoint authorization with custom guards
- 🔲 **Audit Trail Enhancement** - User tracking and action logging

#### 📊 Performance & Monitoring

- 🔲 **Caching Layer** - Redis integration for improved performance

#### 🔄 Advanced Relations & Data Management

- ✅ **Soft Deletion & Recovery Operations** - Built-in soft delete functionality with recovery operations
- ✅ **Bulk Operations** - Efficient bulk insert, update, delete, and remove operations
- 🔲 **Custom Operation Definitions** - Framework for defining custom business operations beyond CRUD

#### 🎨 Enhanced GraphQL Features

- 🔲 **Subscription Support** - Real-time data updates via GraphQL subscriptions
- 🔲 **DataLoader Integration** - Optimized N+1 query resolution
- 🔲 **Custom Scalar Types** - Extended type system for complex data types

### 🧪 Experimental Features

- 🔲 **Prisma Integration** - Alternative ORM support alongside TypeORM
- 🔲 **Event Sourcing** - Built-in event-driven architecture patterns
- 🔲 **Microservices Support** - Framework for distributed system development
- 🔲 **MCP Support** - Model Context Protocol integration for AI applications

_Want to influence the roadmap? Check out our [full roadmap](ROADMAP.md) and join the discussion!_

## 🚀 Try It Now

Get started immediately with our working examples:

### 🎯 REST API Example

```bash
# Clone and run the REST API example
git clone https://github.com/solid-nestjs/framework.git
cd framework/apps-examples/simple-crud-app
npm install && npm run start:dev
# Visit http://localhost:3000/api for Swagger docs
```

### 🎮 GraphQL Example

```bash
# Run the GraphQL example
cd framework/apps-examples/simple-graphql-crud-app
npm install && npm run start:dev
# Visit http://localhost:3000/graphql for GraphQL Playground
```

### 🔄 Advanced Example with Soft Deletion & Bulk Operations

```bash
# Run the advanced example with soft deletion and bulk operations
cd framework/apps-examples/advanced-crud-app
npm install && npm run start:dev
# Visit http://localhost:3000/api for comprehensive Swagger docs
```

### 🔄 Hybrid Example with GraphQL Soft Deletion

```bash
# Run the hybrid example with GraphQL soft deletion support
cd framework/apps-examples/advanced-hybrid-crud-app
npm install && npm run start:dev
# Visit http://localhost:3000/api (REST) or http://localhost:3000/graphql
```

## 📦 Installation

```bash
# Install all packages
npm install @solid-nestjs/common @solid-nestjs/typeorm @solid-nestjs/rest-api

# Or install individually
npm install @solid-nestjs/typeorm-crud
```

## 🏗️ Quick Start

### 1. Define Your Entity

```typescript
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Product {
  @ApiProperty({ description: 'The unique identifier of the product' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'The name of the product' })
  @Column()
  name: string;

  @ApiProperty({ description: 'The description of the product' })
  @Column()
  description: string;

  @ApiProperty({ description: 'The price of the product' })
  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @ApiProperty({ description: 'The stock quantity of the product' })
  @Column()
  stock: number;

  @ApiProperty({ description: 'Product Supplier', type: () => Supplier })
  @ManyToOne(() => Supplier, supplier => supplier.products)
  supplier: Supplier;
}
```

### 2. Create DTOs

```typescript
// create-product.dto.ts
import { IsString, IsNumber, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNumber()
  price: number;

  @ApiProperty()
  @IsNumber()
  stock: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  supplierId?: string;
}

// update-product.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}

// find-product-args.ts
import { FindArgsMixin } from '@solid-nestjs/rest-api';
import { Product } from '../entities/product.entity';

export class FindProductArgs extends FindArgsMixin(Product) {}
```

### 3. Create Service with CRUD Operations

```typescript
import { CrudServiceFrom, CrudServiceStructure } from '@solid-nestjs/typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto, FindProductArgs, UpdateProductDto } from './dto';

// Define service structure
export const serviceStructure = CrudServiceStructure({
  entityType: Product,
  createInputType: CreateProductDto,
  updateInputType: UpdateProductDto,
  findArgsType: FindProductArgs,
  relationsConfig: {
    relations: {
      supplier: true,
    },
  },
});

// Create service extending CRUD functionality
export class ProductsService extends CrudServiceFrom(serviceStructure) {
  // Add custom methods here if needed
}
```

### 4. Create Controller with REST Endpoints

```typescript
import {
  CrudControllerFrom,
  CrudControllerStructure,
} from '@solid-nestjs/rest-api';
import { ProductsService, serviceStructure } from './products.service';

// Define controller structure
const controllerStructure = CrudControllerStructure({
  ...serviceStructure,
  serviceType: ProductsService,
});

export class ProductsController extends CrudControllerFrom(
  controllerStructure,
) {
  // Add custom endpoints here if needed
}
```

### 5. Register in Module

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
```

## 🎯 Generated API Endpoints

The framework automatically generates the following REST endpoints:

- `GET /products` - List all products with filtering, pagination, and sorting
- `GET /products/:id` - Get a specific product by ID
- `POST /products` - Create a new product
- `PUT /products/:id` - Update an existing product
- `DELETE /products/:id` - Soft delete a product
- `DELETE /products/soft/:id` - Explicit soft delete a product
- `DELETE /products/hard/:id` - Hard delete a product (if enabled)
- `PATCH /products/recover/:id` - Recover a soft-deleted product

### 🔄 Soft Deletion & Recovery Operations

The framework provides comprehensive soft deletion capabilities that allow you to mark entities as deleted without permanently removing them from the database. Soft-deleted entities can be recovered later, making this feature ideal for data protection and audit requirements.

#### Key Features

- **Automatic Soft Delete** - Default `DELETE` operations perform soft deletion when entity has `@DeleteDateColumn()`
- **Explicit Operations** - Separate endpoints for soft delete (`/soft/:id`) and hard delete (`/hard/:id`)
- **Recovery Support** - Restore soft-deleted entities with `PATCH /recover/:id`
- **Cascade Behavior** - Soft deletion and recovery cascade to related entities
- **Query Filtering** - Soft-deleted entities are automatically excluded from queries
- **GraphQL Support** - Full soft deletion support in GraphQL mutations

#### Configuration

Enable soft deletion by adding a `@DeleteDateColumn()` to your entity:

```typescript
@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  // Enable soft deletion
  @DeleteDateColumn()
  deletedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

Configure soft deletion operations in your controller structure:

```typescript
const controllerStructure = CrudControllerStructure({
  entityType: Product,
  serviceType: ProductsService,
  operations: {
    // Standard CRUD operations
    findAll: true,
    findOne: true,
    create: true,
    update: true,
    remove: true, // Default soft delete

    // Explicit soft deletion operations
    softRemove: true, // DELETE /products/soft/:id
    recover: true, // PATCH /products/recover/:id
    hardRemove: true, // DELETE /products/hard/:id (permanent)
  },
});
```

#### REST API Examples

```bash
# Soft delete a product (default behavior)
DELETE http://localhost:3000/products/123

# Explicit soft delete
DELETE http://localhost:3000/products/soft/123

# Recover a soft-deleted product
PATCH http://localhost:3000/products/recover/123

# Permanently delete a product
DELETE http://localhost:3000/products/hard/123

# List products (excludes soft-deleted)
GET http://localhost:3000/products

# Get a specific product (returns 404 if soft-deleted)
GET http://localhost:3000/products/123
```

#### GraphQL Examples

```graphql
# Soft delete a product
mutation {
  softRemoveProduct(id: "123") {
    id
    name
    deletedAt
  }
}

# Recover a soft-deleted product
mutation {
  recoverProduct(id: "123") {
    id
    name
    deletedAt # Will be null after recovery
  }
}

# Hard delete a product (permanent)
mutation {
  hardRemoveProduct(id: "123") {
    id
    name
  }
}

# Query products (automatically excludes soft-deleted)
query {
  products {
    id
    name
    deletedAt
  }
}
```

### 📦 Bulk Operations

The framework provides efficient bulk operations for handling multiple entities in a single database transaction, significantly improving performance for batch operations.

#### Available Bulk Operations

- **`bulkInsert`** - Create multiple entities in one operation
- **`bulkUpdate`** - Update multiple entities matching criteria
- **`bulkDelete`** - Permanently delete multiple entities
- **`bulkRemove`** - Soft delete multiple entities (when soft deletion is enabled)
- **`bulkRecover`** - Recover multiple soft-deleted entities

#### Service-Level Bulk Operations

```typescript
export class ProductsService extends CrudServiceFrom(serviceStructure) {
  // Bulk insert multiple products
  async createBulkProducts(
    context: Context,
    products: CreateProductDto[],
  ): Promise<string[]> {
    const result = await this.bulkInsert(context, products);
    return result.ids;
  }

  // Bulk update products by criteria
  async updatePricesBySupplier(
    context: Context,
    supplierId: string,
    priceMultiplier: number,
  ): Promise<number> {
    const result = await this.bulkUpdate(
      context,
      { price: () => `price * ${priceMultiplier}` },
      { supplier: { id: supplierId } },
    );
    return result.affected || 0;
  }

  // Bulk soft delete products
  async removeProductsByCategory(
    context: Context,
    categoryId: string,
  ): Promise<number> {
    const result = await this.bulkRemove(context, {
      category: { id: categoryId },
    });
    return result.affected || 0;
  }

  // Bulk recover products
  async recoverProductsBySupplier(
    context: Context,
    supplierId: string,
  ): Promise<number> {
    const result = await this.bulkRecover(context, {
      supplier: { id: supplierId },
    });
    return result.affected || 0;
  }
}
```

#### Controller-Level Bulk Endpoints

Add custom bulk endpoints to your controllers:

```typescript
export class ProductsController extends CrudControllerFrom(
  controllerStructure,
) {
  @Post('bulk')
  @ApiOperation({ summary: 'Bulk create products' })
  async bulkCreate(
    @CurrentContext() context: Context,
    @Body() products: CreateProductDto[],
  ): Promise<{ ids: string[] }> {
    const result = await this.service.bulkInsert(context, products);
    return { ids: result.ids };
  }

  @Put('bulk/update-by-supplier')
  @ApiOperation({ summary: 'Bulk update products by supplier' })
  async bulkUpdateBySupplier(
    @CurrentContext() context: Context,
    @Body() updateDto: { supplierId: string; updates: Partial<Product> },
  ): Promise<{ affected: number }> {
    const result = await this.service.bulkUpdate(context, updateDto.updates, {
      supplier: { id: updateDto.supplierId },
    });
    return { affected: result.affected || 0 };
  }

  @Delete('bulk/remove-by-category')
  @ApiOperation({ summary: 'Bulk soft delete products by category' })
  async bulkRemoveByCategory(
    @CurrentContext() context: Context,
    @Body() removeDto: { categoryId: string },
  ): Promise<{ affected: number }> {
    const result = await this.service.bulkRemove(context, {
      category: { id: removeDto.categoryId },
    });
    return { affected: result.affected || 0 };
  }

  @Patch('bulk/recover-by-supplier')
  @ApiOperation({ summary: 'Bulk recover products by supplier' })
  async bulkRecoverBySupplier(
    @CurrentContext() context: Context,
    @Body() recoverDto: { supplierId: string },
  ): Promise<{ affected: number }> {
    const result = await this.service.bulkRecover(context, {
      supplier: { id: recoverDto.supplierId },
    });
    return { affected: result.affected || 0 };
  }
}
```

#### Bulk Operations Examples

```bash
# Bulk create products
POST http://localhost:3000/products/bulk
Content-Type: application/json

[
  { "name": "Product 1", "price": 99.99, "supplierId": "supplier-1" },
  { "name": "Product 2", "price": 149.99, "supplierId": "supplier-1" },
  { "name": "Product 3", "price": 199.99, "supplierId": "supplier-2" }
]

# Bulk update products by supplier
PUT http://localhost:3000/products/bulk/update-by-supplier
Content-Type: application/json

{
  "supplierId": "supplier-1",
  "updates": {
    "price": 89.99,
    "status": "discounted"
  }
}

# Bulk soft delete products by category
DELETE http://localhost:3000/products/bulk/remove-by-category
Content-Type: application/json

{
  "categoryId": "category-1"
}

# Bulk recover products by supplier
PATCH http://localhost:3000/products/bulk/recover-by-supplier
Content-Type: application/json

{
  "supplierId": "supplier-1"
}
```

#### Event Hooks for Bulk Operations

The framework provides event hooks for bulk operations:

```typescript
export class ProductsService extends CrudServiceFrom(serviceStructure) {
  // Before bulk update hook
  async beforeBulkUpdate(
    context: Context,
    repository: Repository<Product>,
    updateInput: Partial<Product>,
    where: Where<Product>,
  ): Promise<void> {
    // Custom validation before bulk update
    if (updateInput.price && updateInput.price < 0) {
      throw new BadRequestException('Price cannot be negative');
    }
  }

  // After bulk remove hook
  async afterBulkRemove(
    context: Context,
    repository: Repository<Product>,
    affectedCount: number,
    where: Where<Product>,
  ): Promise<void> {
    // Log bulk operation
    console.log(`Soft deleted ${affectedCount} products`);

    // Notify external systems
    await this.notifyInventorySystem(where, 'bulk_removed');
  }

  // After bulk recover hook
  async afterBulkRecover(
    context: Context,
    repository: Repository<Product>,
    affectedCount: number,
    where: Where<Product>,
  ): Promise<void> {
    console.log(`Recovered ${affectedCount} products`);
    await this.notifyInventorySystem(where, 'bulk_recovered');
  }
}
```

## 🔧 Advanced Configuration

### Service Structure Options

```typescript
export const serviceStructure = CrudServiceStructure({
  entityType: Product,
  createInputType: CreateProductDto,
  updateInputType: UpdateProductDto,
  findArgsType: FindProductArgs,

  // Relations configuration
  relationsConfig: {
    mainAlias: 'product',
    relations: {
      supplier: true,
      category: {
        relations: {
          parentCategory: true,
        },
      },
    },
  },

  // Lock mode for database operations
  lockMode: 'pessimistic_read',

  // Function-specific configurations
  functions: {
    findAll: {
      relationsConfig: {
        relations: { supplier: true },
      },
      decorators: [() => CacheInterceptor()],
    },
    findOne: {
      lockMode: 'optimistic',
      relationsConfig: {
        relations: { supplier: true, category: true },
      },
    },
    create: {
      transactional: true,
      isolationLevel: 'READ_COMMITTED',
      decorators: [() => UseGuards(AdminGuard)],
    },
    update: {
      transactional: true,
      isolationLevel: 'REPEATABLE_READ',
    },
    remove: {
      transactional: true,
    },
    // Soft deletion operations
    softRemove: {
      transactional: true,
      isolationLevel: 'READ_COMMITTED',
    },
    recover: {
      transactional: true,
      isolationLevel: 'READ_COMMITTED',
    },
    hardRemove: {
      transactional: true,
      isolationLevel: 'READ_COMMITTED',
      decorators: [() => UseGuards(AdminGuard)], // Restrict hard delete
    },
    // Bulk operations
    bulkInsert: {
      transactional: true,
      isolationLevel: 'READ_COMMITTED',
    },
    bulkUpdate: {
      transactional: true,
      isolationLevel: 'REPEATABLE_READ',
    },
    bulkDelete: {
      transactional: true,
      isolationLevel: 'READ_COMMITTED',
      decorators: [() => UseGuards(AdminGuard)],
    },
    bulkRemove: {
      transactional: true,
      isolationLevel: 'READ_COMMITTED',
    },
    bulkRecover: {
      transactional: true,
      isolationLevel: 'READ_COMMITTED',
    },
  },
});
```

### Controller Structure Options

```typescript
const controllerStructure = CrudControllerStructure({
  ...serviceStructure,
  serviceType: ProductsService,

  // Custom route configuration
  route: 'products',

  // API documentation
  apiTags: ['Products'],

  // Operation configurations
  operations: {
    findAll: {
      summary: 'Get all products',
      description:
        'Retrieve a list of all products with filtering and pagination',
      decorators: [() => UseGuards(JwtAuthGuard)],
    },
    findOne: {
      summary: 'Get product by ID',
      description: 'Retrieve a specific product by its ID',
    },
    create: {
      summary: 'Create new product',
      description: 'Create a new product in the system',
      decorators: [() => UseGuards(AdminGuard)],
    },
    update: {
      summary: 'Update product',
      description: 'Update an existing product',
    },
    remove: {
      summary: 'Delete product',
      description: 'Soft delete a product (default behavior)',
    },
    // Soft deletion operations
    softRemove: {
      summary: 'Soft delete product',
      description: 'Mark a product as deleted without removing from database',
    },
    recover: {
      summary: 'Recover product',
      description: 'Restore a soft-deleted product',
    },
    hardRemove: {
      summary: 'Hard delete product',
      description: 'Permanently remove a product from the database',
      decorators: [() => UseGuards(AdminGuard)], // Restrict access
    },
    pagination: true, // Enable pagination endpoint
  },

  // Custom decorators
  classDecorators: [() => UseGuards(JwtAuthGuard)],

  // Parameter decorators
  parameterDecorators: {
    context: CurrentUser,
  },
});
```

## 🔍 Query Features

### Filtering

```typescript
// GET /products?filter={"name": {"_contains": "laptop"}, "price": {"_gte": 500}}
// GET /products?filter={"supplier":{"name": "TechCorp"}}
```

### Pagination

```typescript
// GET /products?pagination={"take": 10, "skip": 20}
// GET /products?pagination={"page": 3, "limit": 10}
```

### Sorting

```typescript
// GET /products?orderBy={"name": "ASC", "price": "DESC"}
// GET /products?orderBy={"supplier":{"name": "ASC"}}
```

### Relations

```typescript
// GET /products?relations=["supplier", "category"]
// Automatic relation loading based on configuration
```

## 🛠️ Customization

### Custom Service Methods

```typescript
export class ProductsService extends CrudServiceFrom(serviceStructure) {
  async findBySupplier(
    context: Context,
    supplierId: string,
  ): Promise<Product[]> {
    return this.findAll(context, {
      where: { supplier: { id: supplierId } },
    });
  }

  async updateStock(
    context: Context,
    id: string,
    quantity: number,
  ): Promise<Product> {
    return this.runInTransaction(context, async transactionContext => {
      const product = await this.findOne(transactionContext, id, true);
      product.stock += quantity;
      return this.getRepository(transactionContext).save(product);
    });
  }

  // Bulk operations examples
  async bulkUpdatePrices(
    context: Context,
    categoryId: string,
    priceIncrease: number,
  ): Promise<number> {
    const result = await this.bulkUpdate(
      context,
      { price: () => `price + ${priceIncrease}` },
      { category: { id: categoryId } },
    );
    return result.affected || 0;
  }

  async softDeleteExpiredProducts(
    context: Context,
    expirationDate: Date,
  ): Promise<number> {
    const result = await this.bulkRemove(context, {
      expiresAt: { _lt: expirationDate },
    });
    return result.affected || 0;
  }

  async recoverRecentlyDeleted(
    context: Context,
    days: number = 7,
  ): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await this.bulkRecover(context, {
      deletedAt: { _gte: cutoffDate },
    });
    return result.affected || 0;
  }

  // Override lifecycle hooks
  async beforeCreate(
    context: Context,
    repository: Repository<Product>,
    entity: Product,
    createInput: CreateProductDto,
  ): Promise<void> {
    // Custom logic before creating
    entity.slug = this.generateSlug(entity.name);
  }

  async afterUpdate(
    context: Context,
    repository: Repository<Product>,
    entity: Product,
    updateInput: UpdateProductDto,
  ): Promise<void> {
    // Custom logic after updating
    await this.notifyStockChange(entity);
  }

  // Soft deletion hooks
  async beforeSoftRemove(
    context: Context,
    repository: Repository<Product>,
    entity: Product,
  ): Promise<void> {
    // Custom logic before soft deletion
    await this.notifySupplierOfDeletion(entity.supplier.id, entity.id);
  }

  async afterRecover(
    context: Context,
    repository: Repository<Product>,
    entity: Product,
  ): Promise<void> {
    // Custom logic after recovery
    await this.notifySupplierOfRecovery(entity.supplier.id, entity.id);
  }

  // Bulk operation hooks
  async beforeBulkRemove(
    context: Context,
    repository: Repository<Product>,
    where: Where<Product>,
  ): Promise<void> {
    // Log bulk soft deletion
    console.log(`About to soft delete products matching:`, where);
  }

  async afterBulkRecover(
    context: Context,
    repository: Repository<Product>,
    affectedCount: number,
    where: Where<Product>,
  ): Promise<void> {
    // Notify about bulk recovery
    console.log(`Recovered ${affectedCount} products`);
    await this.notifyInventorySystem('bulk_recovery', affectedCount);
  }
}
```

### Custom Controller Endpoints

```typescript
export class ProductsController extends CrudControllerFrom(
  controllerStructure,
) {
  @Get('by-supplier/:supplierId')
  @ApiOperation({ summary: 'Get products by supplier' })
  async findBySupplier(
    @CurrentContext() context: Context,
    @Param('supplierId') supplierId: string,
  ): Promise<Product[]> {
    return this.service.findBySupplier(context, supplierId);
  }

  @Patch(':id/stock')
  @ApiOperation({ summary: 'Update product stock' })
  async updateStock(
    @CurrentContext() context: Context,
    @Param('id') id: string,
    @Body() stockUpdate: { quantity: number },
  ): Promise<Product> {
    return this.service.updateStock(context, id, stockUpdate.quantity);
  }

  // Bulk operations endpoints
  @Post('bulk')
  @ApiOperation({ summary: 'Bulk create products' })
  async bulkCreate(
    @CurrentContext() context: Context,
    @Body() products: CreateProductDto[],
  ): Promise<{ ids: string[] }> {
    const result = await this.service.bulkInsert(context, products);
    return { ids: result.ids };
  }

  @Put('bulk/update-prices/:categoryId')
  @ApiOperation({ summary: 'Bulk update prices by category' })
  async bulkUpdatePrices(
    @CurrentContext() context: Context,
    @Param('categoryId') categoryId: string,
    @Body() priceUpdate: { increase: number },
  ): Promise<{ affected: number }> {
    const affected = await this.service.bulkUpdatePrices(
      context,
      categoryId,
      priceUpdate.increase,
    );
    return { affected };
  }

  @Delete('bulk/expired')
  @ApiOperation({ summary: 'Soft delete expired products' })
  async bulkRemoveExpired(
    @CurrentContext() context: Context,
    @Body() expirationFilter: { expirationDate: string },
  ): Promise<{ affected: number }> {
    const affected = await this.service.softDeleteExpiredProducts(
      context,
      new Date(expirationFilter.expirationDate),
    );
    return { affected };
  }

  @Patch('bulk/recover-recent')
  @ApiOperation({ summary: 'Recover recently deleted products' })
  async bulkRecoverRecent(
    @CurrentContext() context: Context,
    @Body() recoveryFilter: { days?: number },
  ): Promise<{ affected: number }> {
    const affected = await this.service.recoverRecentlyDeleted(
      context,
      recoveryFilter.days,
    );
    return { affected };
  }
}
```

## 🔐 Security & Validation

### Input Validation

```typescript
import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  Max,
  Length,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({ minLength: 3, maxLength: 100 })
  @IsString()
  @Length(3, 100)
  name: string;

  @ApiProperty({ minimum: 0 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ minimum: 0, maximum: 10000 })
  @IsNumber()
  @Min(0)
  @Max(10000)
  stock: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  description?: string;
}
```

### Authentication & Authorization

```typescript
const controllerStructure = CrudControllerStructure({
  ...serviceStructure,
  serviceType: ProductsService,

  // Apply guards to all operations
  classDecorators: [() => UseGuards(JwtAuthGuard)],

  operations: {
    findAll: true, // Public access
    findOne: true, // Public access
    create: {
      decorators: [() => UseGuards(AdminGuard)], // Admin only
    },
    update: {
      decorators: [() => UseGuards(OwnerOrAdminGuard)], // Owner or Admin
    },
    remove: {
      decorators: [() => UseGuards(AdminGuard)], // Admin only
    },
  },
});
```

## 📊 Transaction Management

```typescript
export class ProductsService extends CrudServiceFrom(serviceStructure) {
  async transferStock(
    context: Context,
    fromProductId: string,
    toProductId: string,
    quantity: number,
  ): Promise<{ from: Product; to: Product }> {
    return this.runInTransaction(
      context,
      async transactionContext => {
        const fromProduct = await this.findOne(
          transactionContext,
          fromProductId,
          true,
        );
        const toProduct = await this.findOne(
          transactionContext,
          toProductId,
          true,
        );

        if (fromProduct.stock < quantity) {
          throw new BadRequestException('Insufficient stock');
        }

        fromProduct.stock -= quantity;
        toProduct.stock += quantity;

        const repository = this.getRepository(transactionContext);

        const from = await repository.save(fromProduct);
        const to = await repository.save(toProduct);

        return { from, to };
      },
      'REPEATABLE_READ',
    );
  }
}
```

## 📈 Performance Optimization

### Query Optimization

```typescript
// Optimized relations loading
export const serviceStructure = CrudServiceStructure({
  entityType: Product,
  createInputType: CreateProductDto,
  updateInputType: UpdateProductDto,
  findArgsType: FindProductArgs,

  functions: {
    findAll: {
      relationsConfig: {
        // Only load essential relations for list view
        relations: { supplier: true },
      },
    },
    findOne: {
      relationsConfig: {
        // Load all relations for detail view
        relations: {
          supplier: true,
          category: true,
          reviews: true,
        },
      },
    },
  },
});
```

### Pagination with Complex Relations

```typescript
// The framework automatically handles complex pagination scenarios
// It prevents the N+1 problem and optimizes query performance for relations
export class ProductsController extends CrudControllerFrom(
  controllerStructure,
) {
  // This endpoint automatically handles pagination optimization
  // even with complex relations
  async findAll() {
    // Framework handles:
    // 1. Initial query to get IDs with pagination
    // 2. Separate query to load entities with relations
    // 3. Proper count query for pagination metadata
  }
}
```

## 🧪 Testing

### Test Commands

The framework includes comprehensive testing support for both unit and end-to-end (E2E) tests:

```bash
# Run all unit tests
npm run test

# Run end-to-end tests
npm run test:e2e

# Run tests in watch mode
npm run test:watch

# Generate test coverage report
npm run test:coverage

# Run tests in debug mode
npm run test:debug
```

### Service Testing

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: Repository<Product>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get<Repository<Product>>(getRepositoryToken(Product));
  });

  it('should create a product', async () => {
    const createDto = { name: 'Test Product', price: 100, stock: 10 };
    const context = { user: { id: '1' } };

    jest.spyOn(repository, 'create').mockReturnValue(createDto as Product);
    jest.spyOn(repository, 'save').mockResolvedValue(createDto as Product);

    const result = await service.create(context, createDto);
    expect(result).toEqual(createDto);
  });
});
```

### Controller Testing

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  it('should return an array of products', async () => {
    const products = [{ id: '1', name: 'Test Product' }];
    jest.spyOn(service, 'findAll').mockResolvedValue(products as any);

    const context = { user: { id: '1' } };
    const result = await controller.findAll(context, {});
    expect(result).toEqual(products);
  });
});
```

## 🚀 Deployment & Production

### Environment Configuration

```typescript
// app.module.ts
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [Product, Supplier],
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

### Production Considerations

```typescript
// Use specific configurations for production
export const serviceStructure = CrudServiceStructure({
  entityType: Product,
  createInputType: CreateProductDto,
  updateInputType: UpdateProductDto,
  findArgsType: FindProductArgs,

  // Production-optimized settings
  lockMode:
    process.env.NODE_ENV === 'production' ? 'pessimistic_read' : undefined,

  functions: {
    findAll: {
      // Add caching in production
      decorators:
        process.env.NODE_ENV === 'production' ? [() => CacheInterceptor()] : [],
    },
    create: {
      transactional: true,
      isolationLevel: 'READ_COMMITTED',
    },
  },
});
```

## 🎯 Best Practices

### 1. Entity Design

```typescript
@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Always add created/updated timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Add soft delete support (enables soft deletion operations)
  @DeleteDateColumn()
  deletedAt?: Date;

  // Index frequently queried fields
  @Index()
  @Column()
  name: string;

  // Use appropriate column types
  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  // Configure cascade behavior for soft deletion
  @ManyToOne(() => Supplier, supplier => supplier.products, {
    cascade: ['soft-remove', 'recover'], // Enable cascade operations
  })
  supplier: Supplier;
}
```

### 2. DTO Validation

```typescript
export class CreateProductDto {
  @ApiProperty({
    description: 'Product name',
    minLength: 1,
    maxLength: 100,
    example: 'MacBook Pro',
  })
  @IsString()
  @Length(1, 100)
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({
    description: 'Product price in USD',
    minimum: 0,
    example: 999.99,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  price: number;
}
```

### 3. Error Handling

```typescript
export class ProductsService extends CrudServiceFrom(serviceStructure) {
  async findOne(
    context: Context,
    id: string,
    orFail = false,
  ): Promise<Product> {
    try {
      return await super.findOne(context, id, orFail);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      throw error;
    }
  }
}
```

### 4. Logging & Monitoring

```typescript
export class ProductsService extends CrudServiceFrom(serviceStructure) {
  private readonly logger = new Logger(ProductsService.name);

  async create(
    context: Context,
    createInput: CreateProductDto,
  ): Promise<Product> {
    this.logger.log(`Creating product: ${createInput.name}`);

    try {
      const result = await super.create(context, createInput);
      this.logger.log(`Product created successfully: ${result.id}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to create product: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/solid-nestjs/framework.git
cd framework

# Install dependencies
npm install

# Build all packages
npm run build

# Run the typeorm & rest-api example
npm run start:dev -w apps-examples/simple-crud-app

# Run the typeorm & graphql example
npm run start:dev -w apps-examples/simple-graphql-crud-app

# Run the typeorm & rest-api + graphql example
npm run start:dev -w apps-examples/simple-hybrid-crud-app

# Run the advanced examples with soft deletion & bulk operations
npm run start:dev -w apps-examples/advanced-crud-app
npm run start:dev -w apps-examples/advanced-hybrid-crud-app
```

### 🔄 Exploring Advanced Features

The advanced examples (`advanced-crud-app` and `advanced-hybrid-crud-app`) demonstrate comprehensive implementations of soft deletion, recovery, and bulk operations:

#### Advanced CRUD App Features:

- **Soft Deletion**: Suppliers and Products with cascade soft delete
- **Recovery Operations**: Restore soft-deleted entities
- **Bulk Operations**: Bulk insert, update, delete, and remove
- **Custom Bulk Endpoints**: Service-level bulk operations by criteria
- **Event Hooks**: Complete lifecycle hooks for all operations
- **Transaction Management**: All operations properly wrapped in transactions

#### Advanced Hybrid App Features:

- **GraphQL Soft Deletion**: Complete GraphQL mutation support
- **REST + GraphQL**: Both API types with soft deletion support
- **Cascade Operations**: Related entity cascade for soft delete/recover
- **Bulk Recovery**: GraphQL and REST bulk recovery operations

#### Example Endpoints from Advanced Apps:

```bash
# Advanced CRUD App (REST only)
POST   /suppliers/bulk                    # Bulk create suppliers
PUT    /suppliers/bulk/update-email-by-name  # Bulk update by criteria
DELETE /suppliers/bulk/delete-by-email    # Bulk hard delete by criteria

# Advanced Hybrid App (REST + GraphQL)
DELETE /suppliers/bulk/remove-by-email    # Bulk soft delete by criteria
PATCH  /suppliers/bulk/recover-by-email   # Bulk recover by criteria
DELETE /suppliers/soft/:id               # Individual soft delete
PATCH  /suppliers/recover/:id            # Individual recovery
DELETE /suppliers/hard/:id               # Individual hard delete

# GraphQL mutations (Hybrid App)
mutation { softRemoveSupplier(id: "123") { id name deletedAt } }
mutation { recoverSupplier(id: "123") { id name deletedAt } }
mutation { hardRemoveSupplier(id: "123") { id name } }
```

For complete implementation details, see:

- `apps-examples/advanced-crud-app/src/suppliers/suppliers.controller.ts`
- `apps-examples/advanced-hybrid-crud-app/src/suppliers/suppliers.controller.ts`
- Test files in each example's `test/` directory for comprehensive usage examples

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.txt) file for details.

## 👨‍💻 Author

**Andres De la Ossa**

- Email: adelaossa0129@gmail.com
- GitHub: [@solid-nestjs](https://github.com/solid-nestjs)

## 🙏 Acknowledgments

This framework wouldn't have been possible without the inspiration and guidance from several sources:

### 🎓 Educational Inspiration

- **[Fernando Herrera](https://fernando-herrera.com/)** - Special thanks for his exceptional NestJS and design patterns courses that provided fundamental inspiration and architectural guidance for this framework
- **Claude Sonnet 4.0 (agent)** - Invaluable assistance with documentation, testing strategies, and architectural guidance throughout the development process

### 🛠️ Technology Stack

- Built with [NestJS](https://nestjs.com/) - The progressive Node.js framework
- Powered by [TypeORM](https://typeorm.io/) - Amazing TypeScript ORM
- Inspired by the SOLID principles and Clean Architecture
- GraphQL support via [Apollo Server](https://www.apollographql.com/)

### 🌟 Community

- Community feedback and contributions that help shape the framework
- The open-source ecosystem that makes projects like this possible
- All developers who test, use, and provide feedback on the framework

---

_Made with ❤️ for the NestJS community_
