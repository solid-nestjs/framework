# Getting Started

This guide walks you through installing the SOLID NestJS Framework and building a complete CRUD API for a `Product` entity — with filtering, sorting, pagination, and Swagger documentation — all from a few lines of configuration.

## Installation

Choose the bundle that matches your needs:

| Bundle | What it provides |
|--------|-----------------|
| `@solid-nestjs/typeorm-crud` | REST API controllers + TypeORM services |
| `@solid-nestjs/typeorm-graphql-crud` | GraphQL resolvers + TypeORM services |
| `@solid-nestjs/typeorm-hybrid-crud` | REST controllers + GraphQL resolvers + TypeORM services |

Each bundle re-exports everything from the core packages, so you only need one dependency.

### For a REST API project

```bash
npm install @solid-nestjs/typeorm-crud
```

You also need the NestJS and TypeORM peer dependencies:

```bash
npm install @nestjs/common @nestjs/core @nestjs/typeorm typeorm @nestjs/swagger class-validator class-transformer reflect-metadata
```

### For a GraphQL project

```bash
npm install @solid-nestjs/typeorm-graphql-crud @nestjs/graphql graphql
```

### For a hybrid REST + GraphQL project

```bash
npm install @solid-nestjs/typeorm-hybrid-crud @nestjs/graphql @nestjs/swagger graphql
```

## Quick Start

The following steps build a complete `Product` CRUD API. The flow is consistent across all three bundles — only the imports and generated class names differ slightly.

### 1. Create the Entity

Define your entity using SOLID decorators. These automatically apply TypeORM (`@Entity`, `@Column`, `@PrimaryGeneratedColumn`), Swagger (`@ApiProperty`), GraphQL (`@ObjectType`, `@Field`), and validation (`class-validator`) decorators behind the scenes.

```typescript
// src/products/entities/product.entity.ts
import {
  SolidEntity,
  SolidId,
  SolidField,
  SolidCreatedAt,
  SolidUpdatedAt,
} from '@solid-nestjs/typeorm-crud';

@SolidEntity()
export class Product {
  @SolidId({
    generated: 'uuid',
    description: 'The unique identifier of the product',
  })
  id: string;

  @SolidField({
    maxLength: 100,
    unique: true,
    description: 'The name of the product',
  })
  name: string;

  @SolidField({
    maxLength: 500,
    nullable: true,
    description: 'The description of the product',
  })
  description?: string;

  @SolidField({
    float: true,
    precision: 10,
    scale: 2,
    positive: true,
    description: 'The price of the product',
  })
  price: number;

  @SolidField({
    integer: true,
    positive: true,
    description: 'The stock quantity of the product',
  })
  stock: number;

  @SolidCreatedAt()
  createdAt!: Date;

  @SolidUpdatedAt()
  updatedAt!: Date;
}
```

> **Tip:** The SOLID decorators infer TypeScript types automatically. `string` becomes `VARCHAR`, `number` becomes `INT`, `Date` becomes `timestamp`. You can override the column type, add validation rules, and control API visibility all through the decorator options.

### 2. Create Input DTOs

Input DTOs define the shape of data accepted by create and update endpoints. Use `@SolidField` or the shorter `@SolidInput` class decorator with standard validation decorators.

```typescript
// src/products/dto/inputs/create-product.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min, MaxLength } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ description: 'The name of the product' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'The description of the product', required: false })
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ description: 'The price of the product' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'The stock quantity of the product' })
  @IsNumber()
  @Min(0)
  stock: number;
}
```

```typescript
// src/products/dto/inputs/update-product.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}
```

```typescript
// src/products/dto/inputs/index.ts
export * from './create-product.dto';
export * from './update-product.dto';
```

### 3. Create Find Args (Filtering & Sorting)

The framework generates filter and sort DTOs automatically from your entity fields.

```typescript
// src/products/dto/args/find-product-args.dto.ts
import {
  createWhereFields,
  createOrderByFields,
  FindArgsFrom,
} from '@solid-nestjs/typeorm-crud';
import { Product } from '../../entities/product.entity';

const FindProductWhere = createWhereFields(Product, {
  name: true,
  description: true,
  price: true,
  stock: true,
});

const FindProductOrderBy = createOrderByFields(Product, {
  name: true,
  description: true,
  price: true,
  stock: true,
});

export class FindProductArgs extends FindArgsFrom<Product>({
  whereType: FindProductWhere,
  orderByType: FindProductOrderBy,
}) {}
```

```typescript
// src/products/dto/args/index.ts
export * from './find-product-args.dto';
```

```typescript
// src/products/dto/index.ts
export * from './inputs';
export * from './args';
```

> This gives you `where` filters (`equals`, `contains`, `gt`, `gte`, `lt`, `lte`, `in`, `between`, etc.), `orderBy` sorting, and pagination (`skip` / `take`) out of the box.

### 4. Create the Service

The service is defined by a structure object and a one-line class extension. The framework generates all CRUD methods automatically.

```typescript
// src/products/products.service.ts
import {
  CrudServiceFrom,
  CrudServiceStructure,
} from '@solid-nestjs/typeorm-crud';
import { Product } from './entities/product.entity';
import { CreateProductDto, FindProductArgs, UpdateProductDto } from './dto';

export const serviceStructure = CrudServiceStructure({
  entityType: Product,
  createInputType: CreateProductDto,
  updateInputType: UpdateProductDto,
  findArgsType: FindProductArgs,
});

export class ProductsService extends CrudServiceFrom(serviceStructure) {}
```

The generated service includes: `create`, `findOne`, `findAll`, `findAllPaginated`, `update`, `remove` (soft-delete aware), `bulkInsert`, `bulkUpdate`, `bulkRemove`, and more.

### 5. Create the Controller

Like the service, the controller is generated from a structure object.

```typescript
// src/products/products.controller.ts
import {
  CrudControllerFrom,
  CrudControllerStructure,
} from '@solid-nestjs/typeorm-crud';
import { ProductsService, serviceStructure } from './products.service';

const controllerStructure = CrudControllerStructure({
  ...serviceStructure,
  serviceType: ProductsService,
  operations: {
    findAll: true,
    findOne: true,
    pagination: true,
    findAllPaginated: true,
    create: true,
    update: true,
    remove: true,
  },
});

export class ProductsController extends CrudControllerFrom(
  controllerStructure,
) {}
```

The generated controller exposes endpoints with full Swagger metadata:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/products` | Find all products (with filtering, sorting, pagination) |
| `GET` | `/products/paginated` | Paginated product listing |
| `GET` | `/products/:id` | Find one product by ID |
| `POST` | `/products` | Create a product |
| `PUT` | `/products/:id` | Update a product |
| `DELETE` | `/products/:id` | Remove a product (soft delete) |

### 6. Register the Module

```typescript
// src/products/products.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
```

Then import `ProductsModule` and configure `TypeOrmModule.forRoot(...)` in your root `AppModule`.

### 7. Test Your API

Start your NestJS application:

```bash
npm run start:dev
```

Your Swagger UI is available at `http://localhost:3000/api` and lists all generated endpoints. You can create, read, update, and delete products immediately.

**Query examples:**

```
GET /products?where.name.contains=Widget
GET /products?orderBy.price=ASC&take=10&skip=0
GET /products?where.price.gte=10&where.price.lte=100
GET /products/paginated?page=1&limit=20
```

## Next Steps

- Learn about [SOLID Decorators](solid-decorators.md) and their full option set
- Explore [CRUD Operations](crud-operations.md) for advanced configurations like transactions, lifecycle hooks, and custom decorators
- Add [GraphQL support](graphql.md) with `CrudResolverFrom` for auto-generated resolvers
- Use [Group By](group-by.md) for aggregation queries
- Enable [Soft Delete](soft-delete.md) by adding a `@SolidDeletedAt` field to your entity
- Read the [Architecture](architecture.md) overview to understand the decorator pipeline and adapter system
