# @solid-nestjs/typeorm-crud

Complete TypeORM CRUD bundle for the SOLID NestJS Framework. This package combines TypeORM data access with REST API generation, providing a unified solution for building robust CRUD applications with minimal boilerplate.

## 🚀 Features

- **🎯 Auto-generated REST CRUD** - Complete REST endpoints with OpenAPI documentation
- **💾 TypeORM Integration** - Seamless database operations with full TypeORM support
- **🔍 Advanced Filtering** - Type-safe filtering with complex where conditions
- **📄 Pagination Support** - Built-in pagination with metadata
- **🔗 Relation Handling** - Automatic relation loading and nested queries
- **📝 Type Safety** - Full TypeScript support throughout
- **🛡️ Input Validation** - Integrated class-validator support
- **📚 OpenAPI Documentation** - Automatic Swagger documentation generation
- **⚡ Transaction Support** - Built-in transaction management
- **🎨 Highly Customizable** - Extensive configuration options

## 📦 Installation

```bash
npm install @solid-nestjs/typeorm-crud
```

### Peer Dependencies

```bash
npm install @nestjs/core @nestjs/common @nestjs/typeorm @nestjs/swagger
npm install typeorm class-validator class-transformer
```

## 🏗️ Quick Start

### 1. Define Your Entity

```typescript
// entities/product.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Supplier } from './supplier.entity';

@Entity()
export class Product {
  @ApiProperty({ description: 'The unique identifier of the product' })
  @PrimaryGeneratedColumn("uuid")
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
  @ManyToOne(() => Supplier, (supplier) => supplier.products)
  supplier: Supplier;
}
```

### 2. Create Input DTOs

```typescript
// dto/inputs/create-product.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, IsUUID, Min, ValidateNested } from 'class-validator';

export class ProductSupplierDto {
  @ApiProperty({ description: 'supplier id' })
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  id: string;
}

export class CreateProductDto {
  @ApiProperty({ description: 'The name of the product' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'The description of the product' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ description: 'The price of the product' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'The stock quantity of the product' })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiProperty({ description: 'product Supplier', type: () => ProductSupplierDto })
  @Type(() => ProductSupplierDto)
  @ValidateNested()
  supplier: ProductSupplierDto;
}
```

```typescript
// dto/inputs/update-product.dto.ts
import { PartialType } from "@nestjs/swagger";
import { CreateProductDto } from "./create-product.dto";

export class UpdateProductDto extends PartialType(CreateProductDto) {
  // Automatically makes all fields optional
}
```

### 3. Create Find Arguments (Advanced Filtering)

```typescript
// dto/args/find-product-args.dto.ts
import { IsEnum, IsOptional, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { 
  FindArgsFrom, 
  StringFilter, 
  NumberFilter, 
  OrderBy, 
  OrderByTypes, 
  Where 
} from "@solid-nestjs/typeorm-crud";
import { Product } from "../../entities/product.entity";

class FindProductWhere implements Where<Product> {
  @ApiProperty({ type: () => StringFilter, required: false })
  @Type(() => StringFilter)
  @IsOptional()
  @ValidateNested()
  name?: StringFilter;

  @ApiProperty({ type: () => StringFilter, required: false })
  @Type(() => StringFilter)
  @IsOptional()
  @ValidateNested()   
  description?: StringFilter;

  @ApiProperty({ type: () => NumberFilter, required: false })
  @Type(() => NumberFilter)
  @IsOptional()
  @ValidateNested()  
  price?: NumberFilter;

  @ApiProperty({ type: () => NumberFilter, required: false })
  @Type(() => NumberFilter)
  @IsOptional()
  @ValidateNested()  
  stock?: NumberFilter;
}

class FindProductOrderBy implements OrderBy<Product> {
  @ApiProperty({ enum: OrderByTypes, required: false })
  @IsEnum(OrderByTypes)
  @IsOptional()
  name?: OrderByTypes;

  @ApiProperty({ enum: OrderByTypes, required: false })
  @IsEnum(OrderByTypes)
  @IsOptional()
  price?: OrderByTypes;

  @ApiProperty({ enum: OrderByTypes, required: false })
  @IsEnum(OrderByTypes)
  @IsOptional()
  stock?: OrderByTypes;
}

export class FindProductArgs extends FindArgsFrom<Product>({ 
  whereType: FindProductWhere, 
  orderByType: FindProductOrderBy 
}) {}
```

### 4. Create Service

```typescript
// products.service.ts
import { CrudServiceFrom, CrudServiceStructure } from '@solid-nestjs/typeorm-crud';
import { Product } from './entities/product.entity';
import { CreateProductDto, FindProductArgs, UpdateProductDto } from './dto';

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
  // - remove(context, id): Promise<Product>
  // - hardRemove(context, id): Promise<Product>
  // - pagination(context, args): Promise<PaginationResult<Product>>
  
  // Add custom methods here if needed
}
```

### 5. Create Controller

```typescript
// products.controller.ts
import { CrudControllerFrom, CrudControllerStructure } from '@solid-nestjs/typeorm-crud';
import { ProductsService, serviceStructure } from './products.service';

const controllerStructure = CrudControllerStructure({
  ...serviceStructure,
  serviceType: ProductsService,
});

export class ProductsController extends CrudControllerFrom(controllerStructure) {
  // Automatically provides REST endpoints:
  // GET    /products              - findAll with filtering
  // GET    /products/:id          - findOne by ID
  // POST   /products              - create new product
  // PATCH  /products/:id          - update product
  // DELETE /products/:id          - soft delete product
  // DELETE /products/:id/hard     - hard delete product
  // GET    /products/pagination   - paginated results
  
  // Add custom endpoints here if needed
}
```

### 6. Configure Module

```typescript
// products.module.ts
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

### 7. Setup Application

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: './database.sqlite',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Set to false in production
      logging: true
    }),
    ProductsModule,
  ],
})
export class AppModule {}
```

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { swaggerRecomenedOptions } from '@solid-nestjs/rest-api';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable validation
  app.useGlobalPipes(new ValidationPipe());

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Products API')
    .setDescription('The products API description')
    .setVersion('1.0')
    .addTag('products')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, { 
    swaggerOptions: { ...swaggerRecomenedOptions } 
  });

  await app.listen(3000);
  
  console.log('🚀 REST API ready at http://localhost:3000/api');
}
bootstrap();
```

## 🎯 Generated REST Endpoints

The bundle automatically generates the following endpoints:

```
GET    /products              # Get all products with filtering
GET    /products/:id          # Get single product by ID
POST   /products              # Create new product
PATCH  /products/:id          # Update existing product
DELETE /products/:id          # Soft delete product
DELETE /products/:id/hard     # Hard delete product (if enabled)
GET    /products/pagination   # Get paginated products with metadata
```

## 🔍 Advanced Filtering

The framework supports complex filtering with multiple operators:

### Basic Filtering

```bash
# Filter by name
GET /products?where[name]=laptop

# Filter by price range
GET /products?where[price][_gte]=100&where[price][_lte]=500

# Filter with multiple conditions
GET /products?where[name][_contains]=gaming&where[stock][_gt]=0
```

### Logical Operators

```bash
# OR conditions
GET /products?where[_or][0][name]=laptop&where[_or][1][description][_contains]=gaming

# AND conditions (default)
GET /products?where[name][_contains]=pro&where[price][_lt]=1000

# Complex nested conditions
GET /products?where[_or][0][_and][0][name]=laptop&where[_or][0][_and][1][price][_lt]=500
```

### Available Filter Operators

**String Filters:**
- `_eq` - Equals
- `_ne` - Not equals
- `_contains` - Contains substring
- `_startsWith` - Starts with
- `_endsWith` - Ends with
- `_in` - In array
- `_notIn` - Not in array

**Number Filters:**
- `_eq` - Equals
- `_ne` - Not equals
- `_gt` - Greater than
- `_gte` - Greater than or equal
- `_lt` - Less than
- `_lte` - Less than or equal
- `_in` - In array
- `_notIn` - Not in array

### Sorting

```bash
# Sort by single field
GET /products?orderBy[0][name]=asc

# Sort by multiple fields
GET /products?orderBy[0][price]=desc&orderBy[1][name]=asc
```

### Pagination

```bash
# Basic pagination
GET /products/pagination?pagination[limit]=10&pagination[offset]=0

# With filtering and sorting
GET /products/pagination?where[price][_gte]=100&orderBy[0][price]=desc&pagination[limit]=5
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

### Custom Operation Settings

```typescript
const controllerStructure = CrudControllerStructure({
  ...serviceStructure,
  serviceType: ProductsService,
  operations: {
    create: true,
    update: true,
    remove: true,
    hardRemove: false, // Disable hard delete
    findAll: {
      name: 'getAllProducts',
      summary: 'Retrieve all products with filtering'
    },
    pagination: {
      name: 'getProductsPaginated',
      summary: 'Get paginated products'
    }
  }
});
```

## 📊 Key Exports

### Services
- `CrudServiceFrom()` - Creates TypeORM-powered service with CRUD operations
- `DataServiceFrom()` - Creates read-only data service
- `CrudServiceStructure()` - Service configuration builder
- `Transactional()` - Transaction decorator

### Controllers
- `CrudControllerFrom()` - Creates REST controller with full CRUD endpoints
- `DataControllerFrom()` - Creates read-only REST controller
- `CrudControllerStructure()` - Controller configuration builder

### Filtering & Arguments
- `FindArgsFrom()` - Creates argument types for filtering and pagination
- `StringFilter`, `NumberFilter`, `DateFilter` - Filter input types
- `getWhereClass()`, `getOrderByClass()` - Extract filter classes

### Utilities
- `swaggerRecomenedOptions` - Recommended Swagger configuration
- `PaginationResult` - Pagination result type
- All TypeORM interfaces and types

## 📚 What's Included

This bundle automatically installs and exports:

- **`@solid-nestjs/common`** - Core utilities and interfaces
- **`@solid-nestjs/typeorm`** - TypeORM integration utilities  
- **`@solid-nestjs/rest-api`** - REST API CRUD controllers and services

## 📚 Examples

For complete working examples, see:
- [Simple CRUD App](https://github.com/solid-nestjs/framework/tree/master/apps-examples/simple-crud-app)
- [Framework Documentation](https://github.com/solid-nestjs/framework/tree/master/docs)

## 📖 Documentation

For complete documentation, examples, and advanced usage, see the [main framework documentation](https://github.com/solid-nestjs/framework).

## 🤝 Related Packages

### Individual Packages

If you prefer to install packages individually:

- `@solid-nestjs/common` - Core utilities
- `@solid-nestjs/typeorm` - TypeORM integration
- `@solid-nestjs/rest-api` - REST API generation

### Other Bundles

- `@solid-nestjs/typeorm-graphql-crud` - TypeORM + GraphQL bundle
- `@solid-nestjs/typeorm-hybrid-crud` - TypeORM + REST + GraphQL bundle

## License

MIT