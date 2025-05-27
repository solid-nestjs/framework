# Examples and Tutorials

This directory contains comprehensive examples and step-by-step tutorials for the SOLID NestJS Framework.

## Table of Contents

- [Quick Start Tutorial](#quick-start-tutorial)
- [Advanced Examples](#advanced-examples)
- [Real-World Use Cases](#real-world-use-cases)
- [Integration Examples](#integration-examples)

## Quick Start Tutorial

### Tutorial 1: Building Your First CRUD API

**Goal**: Create a complete Product management API with CRUD operations.

#### Step 1: Setup Project

```bash
# Create new NestJS project
npm i -g @nestjs/cli
nest new product-api
cd product-api

# Install SOLID NestJS Framework
npm install @solid-nestjs/common @solid-nestjs/typeorm @solid-nestjs/rest-api

# Install dependencies
npm install @nestjs/typeorm typeorm pg class-validator class-transformer
npm install @nestjs/swagger swagger-ui-express
```

#### Step 2: Configure Database

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'password',
      database: 'product_api',
      autoLoadEntities: true,
      synchronize: true, // Don't use in production
    }),
    ProductsModule,
  ],
})
export class AppModule {}
```

#### Step 3: Create Entity

```typescript
// src/products/entities/product.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('products')
export class Product {
  @ApiProperty({ description: 'Product ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Product name' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Product description' })
  @Column({ nullable: true })
  description?: string;

  @ApiProperty({ description: 'Product price' })
  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @ApiProperty({ description: 'Stock quantity' })
  @Column({ default: 0 })
  stock: number;

  @ApiProperty({ description: 'Creation date' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  @UpdateDateColumn()
  updatedAt: Date;
}
```

#### Step 4: Create DTOs

```typescript
// src/products/dto/create-product.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({ description: 'Product name', minLength: 3, maxLength: 100 })
  @IsString()
  @Length(3, 100)
  name: string;

  @ApiProperty({ description: 'Product description', required: false })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiProperty({ description: 'Product price', minimum: 0 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'Stock quantity', minimum: 0 })
  @IsNumber()
  @Min(0)
  stock: number;
}
```

```typescript
// src/products/dto/update-product.dto.ts
import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}
```

```typescript
// src/products/dto/find-product-args.dto.ts
import { FindArgsMixin } from '@solid-nestjs/rest-api';
import { Product } from '../entities/product.entity';

export class FindProductArgs extends FindArgsMixin(Product) {}
```

#### Step 5: Create Service

```typescript
// src/products/products.service.ts
import { Injectable } from '@nestjs/common';
import { CrudServiceFrom, CrudServiceStructure } from '@solid-nestjs/typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FindProductArgs } from './dto/find-product-args.dto';

export const serviceStructure = CrudServiceStructure({
  entityType: Product,
  createInputType: CreateProductDto,
  updateInputType: UpdateProductDto,
  findArgsType: FindProductArgs,
});

@Injectable()
export class ProductsService extends CrudServiceFrom(serviceStructure) {
  // Automatically includes:
  // - findAll(context, findArgs?)
  // - findOne(context, id, throwsError?)
  // - create(context, createInput)
  // - update(context, id, updateInput)
  // - remove(context, id) - soft delete
  // - hardRemove(context, id) - hard delete
  
  // Add custom methods here
}
```

#### Step 6: Create Controller

```typescript
// src/products/products.controller.ts
import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CrudControllerFrom, CrudControllerStructure } from '@solid-nestjs/rest-api';
import { ProductsService, serviceStructure } from './products.service';

export const controllerStructure = CrudControllerStructure({
  ...serviceStructure,
  serviceType: ProductsService,
  operations: {
    findAll: {
      summary: 'Get all products',
      description: 'Retrieve all products with filtering, pagination, and sorting'
    },
    findOne: {
      summary: 'Get product by ID',
      description: 'Retrieve a specific product by its ID'
    },
    create: {
      summary: 'Create product',
      description: 'Create a new product'
    },
    update: {
      summary: 'Update product',
      description: 'Update an existing product'
    },
    remove: {
      summary: 'Delete product',
      description: 'Soft delete a product'
    }
  }
});

@ApiTags('products')
@Controller('products')
export class ProductsController extends CrudControllerFrom(controllerStructure) {
  // Automatically includes:
  // GET /products - List with filtering, pagination, sorting
  // GET /products/:id - Get by ID
  // POST /products - Create
  // PUT /products/:id - Update
  // DELETE /products/:id - Soft delete
  
  // Add custom endpoints here
}
```

#### Step 7: Create Module

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
  exports: [ProductsService],
})
export class ProductsModule {}
```

#### Step 8: Configure Swagger

```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Product API')
    .setDescription('Product management API built with SOLID NestJS Framework')
    .setVersion('1.0')
    .addTag('products')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
  console.log('API running on http://localhost:3000');
  console.log('Swagger docs at http://localhost:3000/api');
}
bootstrap();
```

#### Step 9: Test Your API

```bash
# Start the application
npm run start:dev

# Test endpoints
curl http://localhost:3000/products
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Laptop","price":999.99,"stock":10}'

# Visit Swagger UI
open http://localhost:3000/api
```

**Congratulations!** You've built a complete CRUD API with:
- ✅ Full CRUD operations
- ✅ Automatic Swagger documentation
- ✅ Input validation
- ✅ TypeScript type safety
- ✅ Filtering, pagination, and sorting

### Tutorial 2: Adding Relations

Let's extend the Product API with Categories and Suppliers.

#### Step 1: Create Category Entity

```typescript
// src/categories/entities/category.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @OneToMany(() => Product, product => product.category)
  products: Product[];
}
```

#### Step 2: Update Product Entity

```typescript
// src/products/entities/product.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Category } from '../../categories/entities/category.entity';

@Entity('products')
export class Product {
  // ... existing fields

  @ManyToOne(() => Category, category => category.products)
  @JoinColumn({ name: 'category_id' })
  category?: Category;

  @Column({ name: 'category_id', nullable: true })
  categoryId?: string;
}
```

#### Step 3: Update Service with Relations

```typescript
// src/products/products.service.ts
export const serviceStructure = CrudServiceStructure({
  entityType: Product,
  createInputType: CreateProductDto,
  updateInputType: UpdateProductDto,
  findArgsType: FindProductArgs,
  relationsConfig: {
    relations: {
      category: true // Enable category loading
    }
  }
});
```

#### Step 4: Update DTOs

```typescript
// src/products/dto/create-product.dto.ts
export class CreateProductDto {
  // ... existing fields

  @ApiProperty({ description: 'Category ID', required: false })
  @IsOptional()
  @IsString()
  categoryId?: string;
}
```

Now your API supports:
- Products with categories
- Automatic relation loading
- Filtering by category: `GET /products?filter={"category.name":"Electronics"}`
- Sorting by category: `GET /products?orderBy={"category.name":"ASC"}`

## Advanced Examples


### Example: Advanced Controller with Guards and Validation

```typescript
// src/products/products.controller.ts
import { UseGuards, Param, Query, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard, RolesGuard, AdminGuard } from '../auth/guards';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

export const controllerStructure = CrudControllerStructure({
  ...serviceStructure,
  serviceType: ProductsService,
  operations: {
    findAll: {
      summary: 'Get all products',
      description: 'Public endpoint to retrieve products'
    },
    findOne: {
      summary: 'Get product by ID',
      description: 'Public endpoint to get product details'
    },
    create: {
      summary: 'Create product',
      description: 'Admin only - Create new product',
      decorators: [() => UseGuards(AdminGuard)]
    },
    update: {
      summary: 'Update product',
      description: 'Admin only - Update product',
      decorators: [() => UseGuards(AdminGuard)]
    },
    remove: {
      summary: 'Delete product',
      description: 'Admin only - Delete product',
      decorators: [() => UseGuards(AdminGuard)]
    }
  },
  classDecorators: [() => UseGuards(JwtAuthGuard, RolesGuard)]
});

@ApiTags('products')
@Controller('products')
export class ProductsController extends CrudControllerFrom(controllerStructure) {

  @Get('low-stock')
  @ApiOperation({ summary: 'Get low stock products' })
  @Roles('admin', 'manager')
  async findLowStock(
    @CurrentUser() user: any,
    @Query('threshold', ParseIntPipe) threshold: number = 10
  ): Promise<Product[]> {
    const context = { user };
    return this.service.findLowStock(context, threshold);
  }

  @Post(':id/stock')
  @ApiOperation({ summary: 'Update product stock' })
  @Roles('admin', 'manager')
  async updateStock(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateStockDto: UpdateStockDto
  ): Promise<Product> {
    const context = { user };
    return this.service.updateStock(context, id, updateStockDto.quantity);
  }

  @Get('price-range')
  @ApiOperation({ summary: 'Find products by price range' })
  async findByPriceRange(
    @CurrentUser() user: any,
    @Query('min', ParseIntPipe) minPrice: number,
    @Query('max', ParseIntPipe) maxPrice: number
  ): Promise<Product[]> {
    const context = { user };
    return this.service.findByPriceRange(context, minPrice, maxPrice);
  }
}
```

### Example 3: Testing with SOLID NestJS

```typescript
// src/products/products.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: Repository<Product>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
      getOne: jest.fn(),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get<Repository<Product>>(getRepositoryToken(Product));
  });

  describe('create', () => {
    it('should create a product', async () => {
      const createDto = {
        name: 'Test Product',
        price: 99.99,
        stock: 10
      };
      
      const savedProduct = { id: '1', ...createDto };
      
      mockRepository.create.mockReturnValue(savedProduct);
      mockRepository.save.mockResolvedValue(savedProduct);

      const context = { user: { id: 'user1' } };
      const result = await service.create(context, createDto);

      expect(result).toEqual(savedProduct);
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('findLowStock', () => {
    it('should find products with low stock', async () => {
      const lowStockProducts = [
        { id: '1', name: 'Product 1', stock: 5 },
        { id: '2', name: 'Product 2', stock: 3 }
      ];

      const queryBuilder = mockRepository.createQueryBuilder();
      queryBuilder.getMany.mockResolvedValue(lowStockProducts);

      const context = { user: { id: 'user1' } };
      const result = await service.findLowStock(context, 10);

      expect(result).toEqual(lowStockProducts);
    });
  });
});
```

## Real-World Use Cases

### Use Case 1: E-commerce Product Catalog

**Scenario**: Building a product catalog for an e-commerce platform with categories, suppliers, reviews, and inventory management.

**Key Features**:
- Products with multiple categories
- Supplier management
- Stock tracking with alerts
- Product reviews and ratings
- Price history
- SEO-friendly URLs

**Implementation highlights**:
```typescript
// Advanced relations configuration
export const serviceStructure = CrudServiceStructure({
  entityType: Product,
  createInputType: CreateProductDto,
  updateInputType: UpdateProductDto,
  findArgsType: FindProductArgs,
  relationsConfig: {
    relations: {
      category: true,
      supplier: true,
      reviews: {
        relations: {
          user: true
        }
      },
      priceHistory: true
    }
  },
  functions: {
    findAll: {
      relationsConfig: {
        relations: { category: true, supplier: true } // Lighter for list view
      }
    },
    findOne: {
      relationsConfig: {
        relations: { 
          category: true, 
          supplier: true, 
          reviews: { relations: { user: true } },
          priceHistory: true
        }
      }
    }
  }
});
```

### Use Case 2: Content Management System

**Scenario**: Building a CMS with articles, authors, categories, and tags.

**Key Features**:
- Articles with rich content
- Author management
- Category hierarchy
- Tag system
- Publishing workflow
- SEO optimization

### Use Case 3: Task Management System

**Scenario**: Building a project management tool with projects, tasks, users, and time tracking.

**Key Features**:
- Project hierarchy
- Task assignments
- Time tracking
- File attachments
- Comments and activity logs
- Notifications


## Next Steps

After completing these examples:

1. **Explore Advanced Features**:
   - Custom validation pipes
   - Advanced filtering patterns
   - Performance optimization techniques
   - Microservices integration

2. **Production Considerations**:
   - Error handling strategies
   - Logging and monitoring
   - Security best practices
   - Database optimization

3. **Community Examples**:
   - Check the [examples repository](https://github.com/solid-nestjs/examples)
   - Join our Discord for community examples
   - Contribute your own examples

For more examples and tutorials, visit our [GitHub repository](https://github.com/solid-nestjs/framework) and [documentation site](https://docs.solid-nestjs.com).
