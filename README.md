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
- **🔄 Soft Delete Support** - Built-in soft delete functionality
- **📊 Audit Trail** - Optional audit logging for data changes
- **🚀 Future-Ready** - Designed for GraphQL and Prisma integration

## 🗺️ What's Coming in v0.3.0

We're excited to share a preview of upcoming features in version 0.3.0:

### 🛠️ Enhanced Developer Experience

- **Framework CLI Generator** - Scaffold controllers, services, and modules with interactive prompts

#### 🔐 Advanced Authentication & Authorization

- **Role-Based Access Control (RBAC)** - Built-in decorators for fine-grained permissions
- **JWT Integration** - Seamless authentication middleware
- **Resource-Level Security** - Per-endpoint authorization with custom guards
- **Audit Trail Enhancement** - User tracking and action logging

#### 📊 Performance & Monitoring

- **Query Optimization** - Automatic query analysis and optimization suggestions
- **Performance Metrics** - Built-in monitoring for response times and database queries
- **Caching Layer** - Redis integration for improved performance

#### 🔄 Advanced Relations & Data Management

- **Polymorphic Relations** - Support for complex entity relationships
- **Bulk Operations** - Efficient batch create, update, and delete operations
- **Data Seeding** - Framework for populating test and development data
- **Schema Versioning** - Support for API versioning with backward compatibility
- **Recovery Operations** - Built-in soft delete recovery and data restoration capabilities
- **Custom Operation Definitions** - Framework for defining custom business operations beyond CRUD

#### 🎨 Enhanced GraphQL Features

- **Subscription Support** - Real-time data updates via GraphQL subscriptions
- **DataLoader Integration** - Optimized N+1 query resolution
- **Custom Scalar Types** - Extended type system for complex data types

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

### 🔄 Hybrid REST + GraphQL Example

```bash
# Run the hybrid example with both APIs
cd framework/apps-examples/simple-hybrid-crud-app
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
- `DELETE /products/hard/:id` - Hard delete a product (if enabled)

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
      description: 'Soft delete a product',
    },
    hardRemove: true, // Enable hard delete endpoint
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

  // Add soft delete support
  @DeleteDateColumn()
  deletedAt?: Date;

  // Index frequently queried fields
  @Index()
  @Column()
  name: string;

  // Use appropriate column types
  @Column('decimal', { precision: 10, scale: 2 })
  price: number;
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
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.txt) file for details.

## 👨‍💻 Author

**Andres De la Ossa**

- Email: adelaossa0129@gmail.com
- GitHub: [@solid-nestjs](https://github.com/solid-nestjs)

## 🙏 Acknowledgments

- Built with [NestJS](https://nestjs.com/)
- Powered by [TypeORM](https://typeorm.io/)
- Inspired by the SOLID principles
- Community feedback and contributions

---

_Made with ❤️ for the NestJS community_
