# @solid-nestjs/typeorm

Core TypeORM utilities for the SOLID NestJS framework. This package provides the foundational service mixins, decorators, and interfaces for building type-safe database services with automatic CRUD operations using TypeORM.

## 🚀 Features

- **🎯 Auto-generated Services** - Instant CRUD services with TypeORM repository integration
- **🔍 Advanced Query Building** - Type-safe query builders with filtering and pagination
- **🔗 Relation Management** - Automatic relation loading and configuration
- **📄 Pagination Support** - Built-in pagination with metadata
- **⚡ Transaction Support** - Decorators for transactional operations
- **🛡️ Type Safety** - Full TypeScript support throughout
- **🎨 Highly Customizable** - Extensive configuration options
- **🔧 Event Hooks** - Before/after hooks for all operations

## 📦 Installation

```bash
npm install @solid-nestjs/typeorm @solid-nestjs/common typeorm
```

## 🏗️ Quick Start

### 1. Create Entity

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  supplierId: number;

  @ManyToOne(() => Supplier, supplier => supplier.products)
  supplier: Supplier;
}
```

### 2. Create DTOs

```typescript
// dto/create-product.dto.ts
export class CreateProductDto {
  name: string;
  price: number;
  supplierId: number;
}

// dto/update-product.dto.ts
export class UpdateProductDto {
  name?: string;
  price?: number;
  supplierId?: number;
}

// dto/find-product-args.dto.ts
import { FindArgs } from '@solid-nestjs/common';
export class FindProductArgs extends FindArgs<Product> {}
```

### 3. Create Service

```typescript
import { CrudServiceFrom, CrudServiceStructure } from '@solid-nestjs/typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto, UpdateProductDto, FindProductArgs } from './dto';

export const serviceStructure = CrudServiceStructure({
  entityType: Product,
  createInputType: CreateProductDto,
  updateInputType: UpdateProductDto,
  findArgsType: FindProductArgs,
  relationsConfig: {
    relations: {
      supplier: true
    }
  }
});

export class ProductsService extends CrudServiceFrom(serviceStructure) {
  // Automatically provides:
  // - findAll(context, args): Promise<Product[]>
  // - findOne(context, id): Promise<Product>
  // - create(context, createDto): Promise<Product>
  // - update(context, id, updateDto): Promise<Product>
  // - remove(context, id): Promise<Product> - soft delete
  // - hardRemove(context, id): Promise<Product> - permanent delete
  // - pagination(context, args): Promise<PaginationResult<Product>>
  
  // Add custom methods here if needed
}
```

### 4. Register in Module

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  providers: [ProductsService],
  exports: [ProductsService]
})
export class ProductsModule {}
```

## 🔧 Advanced Configuration

### Transaction Support

```typescript
export const serviceStructure = CrudServiceStructure({
  entityType: Product,
  createInputType: CreateProductDto,
  updateInputType: UpdateProductDto,
  findArgsType: FindProductArgs,
  functions: {
    create: { transactional: true },
    update: { transactional: true },
    remove: { transactional: true },
    hardRemove: { transactional: true },
  },
});
```

### Relation Configuration

```typescript
export const serviceStructure = CrudServiceStructure({
  entityType: Product,
  createInputType: CreateProductDto,
  updateInputType: UpdateProductDto,
  findArgsType: FindProductArgs,
  relationsConfig: {
    relations: {
      supplier: true,
      categories: true
    }
  },
  functions: {
    findOne: {
      relationsConfig: {
        relations: {
          supplier: true,
          reviews: true
        }
      }
    }
  }
});
```

### Custom Method Decorators

```typescript
export const serviceStructure = CrudServiceStructure({
  entityType: Product,
  createInputType: CreateProductDto,
  updateInputType: UpdateProductDto,
  findArgsType: FindProductArgs,
  functions: {
    create: {
      transactional: true,
      decorators: [() => UseGuards(AdminGuard)]
    },
    update: {
      decorators: [() => UseInterceptors(AuditInterceptor)]
    }
  }
});
```

### Event Hooks

```typescript
export class ProductsService extends CrudServiceFrom(serviceStructure) {
  
  async beforeCreate(context: Context, repository: Repository<Product>, entity: Product, createInput: CreateProductDto): Promise<void> {
    // Custom logic before creating
    entity.createdAt = new Date();
  }

  async afterCreate(context: Context, repository: Repository<Product>, entity: Product, createInput: CreateProductDto): Promise<void> {
    // Custom logic after creating
    await this.notificationService.sendNewProductAlert(entity);
  }

  async beforeUpdate(context: Context, repository: Repository<Product>, entity: Product, updateInput: UpdateProductDto): Promise<void> {
    // Custom validation before update
    if (updateInput.price && updateInput.price < 0) {
      throw new BadRequestException('Price cannot be negative');
    }
  }
}
```

## 📊 API Reference

### Core Functions

#### `CrudServiceFrom(structure)`
Creates a service class with full CRUD operations.

```typescript
function CrudServiceFrom<T>(
  structure: CrudServiceStructure<T>
): Constructor<CrudService<T>>;
```

#### `DataServiceFrom(structure)`
Creates a service class with read-only operations.

```typescript
function DataServiceFrom<T>(
  structure: DataServiceStructure<T>
): Constructor<DataService<T>>;
```

#### `CrudServiceStructure(config)`
Configuration builder for CRUD services.

```typescript
function CrudServiceStructure<T>(
  config: CrudServiceStructureConfig<T>
): CrudServiceStructure<T>;
```

### Service Methods

All generated services include these methods:

#### Data Operations
- `findAll(context, args?)` - Find all entities with optional filtering
- `findOne(context, id, orFail?)` - Find single entity by ID
- `pagination(context, args?)` - Get paginated results with metadata

#### CRUD Operations
- `create(context, createInput)` - Create new entity
- `update(context, id, updateInput)` - Update existing entity
- `remove(context, id)` - Soft delete entity (if delete column exists)
- `hardRemove(context, id)` - Permanently delete entity

#### Repository Access
- `getRepository(context)` - Get TypeORM repository
- `getEntityManager(context)` - Get entity manager
- `getQueryBuilder(context, args?)` - Get query builder with filters

### Decorators

#### `@Transactional(options?)`
Marks methods to run in database transactions.

```typescript
@Transactional({ isolationLevel: 'READ_COMMITTED' })
async createProduct(data: CreateProductDto) {
  // This method runs in a transaction
}
```

### Interfaces

#### `CrudService<T>`
Main interface for CRUD services with all operations.

#### `DataService<T>`
Interface for read-only data services.

#### `Context`
Request context interface for dependency injection.

## 🛠️ TypeORM Integration

This package provides seamless integration with TypeORM:

- **Repository Injection** - Automatic repository injection and management
- **Query Builder** - Enhanced query builder with filtering support
- **Relation Loading** - Configurable relation loading strategies
- **Transaction Management** - Built-in transaction support
- **Entity Validation** - Integration with class-validator
- **Soft Deletes** - Automatic soft delete handling when delete columns exist

## 🔗 Related Packages

- **[@solid-nestjs/typeorm-crud](../typeorm-crud)** - Complete REST API bundle
- **[@solid-nestjs/typeorm-graphql-crud](../typeorm-graphql-crud)** - Complete GraphQL API bundle  
- **[@solid-nestjs/typeorm-hybrid-crud](../typeorm-hybrid-crud)** - Complete REST + GraphQL bundle
- **[@solid-nestjs/rest-api](../rest-api)** - REST API controllers
- **[@solid-nestjs/graphql](../graphql)** - GraphQL resolvers
- **[@solid-nestjs/common](../common)** - Shared utilities and interfaces

## 📝 Example Projects

See the [examples directory](../../apps-examples) for complete working applications:

- **[simple-crud-app](../../apps-examples/simple-crud-app)** - REST API with TypeORM
- **[simple-graphql-crud-app](../../apps-examples/simple-graphql-crud-app)** - GraphQL API with TypeORM
- **[simple-hybrid-crud-app](../../apps-examples/simple-hybrid-crud-app)** - Hybrid REST + GraphQL API

For complete documentation and tutorials, visit the [main framework documentation](https://github.com/solid-nestjs/framework).

## 📄 License

MIT
