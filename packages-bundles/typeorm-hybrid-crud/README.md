# @solid-nestjs/typeorm-hybrid-crud

Complete TypeORM CRUD bundle for the SOLID NestJS Framework. This package combines TypeORM data access with both REST API and GraphQL capabilities, providing a unified solution for building full-stack applications with hybrid endpoints.

## 🚀 Features

- **🎯 Complete Hybrid CRUD** - Auto-generated REST + GraphQL endpoints from a single configuration
- **💾 TypeORM Integration** - Seamless database operations with full TypeORM support
- **🔍 Advanced Filtering** - Complex filtering with type-safe where conditions
- **📄 Pagination Support** - Built-in pagination for both REST and GraphQL
- **🔗 Relation Handling** - Automatic relation loading and nested queries
- **📝 Type Safety** - Full TypeScript support throughout
- **🛡️ Input Validation** - Integrated class-validator support
- **📚 Dual Documentation** - Automatic OpenAPI (Swagger) + GraphQL schema generation
- **⚡ Transaction Support** - Built-in transaction management
- **🎨 Highly Customizable** - Extensive configuration options

## 📦 Installation

```bash
npm install @solid-nestjs/typeorm-hybrid-crud
```

### Peer Dependencies

```bash
npm install @nestjs/core @nestjs/common @nestjs/typeorm @nestjs/swagger @nestjs/graphql @nestjs/apollo
npm install typeorm class-validator class-transformer
npm install @apollo/server graphql
```

## 🏗️ Quick Start

### 1. Define Your Entity

```typescript
// entities/product.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { Supplier } from './supplier.entity';

@ObjectType()
@Entity()
export class Product {
  @ApiProperty({ description: 'The unique identifier of the product' })
  @Field(() => ID, { description: 'The unique identifier of the product' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'The name of the product' })
  @Field({ description: 'The name of the product' })
  @Column()
  name: string;

  @ApiProperty({ description: 'The description of the product' })
  @Field({ description: 'The description of the product' })
  @Column()
  description: string;

  @ApiProperty({ description: 'The price of the product' })
  @Field(() => Float, { description: 'The price of the product' })
  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @ApiProperty({ description: 'The stock quantity of the product' })
  @Field(() => Int, { description: 'The stock quantity of the product' })
  @Column()
  stock: number;

  @ApiProperty({ description: 'Product Supplier', type: () => Supplier })
  @Field(() => Supplier, { description: 'Product Supplier', nullable: true })
  @ManyToOne(() => Supplier, supplier => supplier.products)
  supplier: Supplier;
}
```

### 2. Create Input DTOs

```typescript
// dto/inputs/create-product.dto.ts
import { InputType, Field, Float, Int, ID } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsPositive,
  Min,
  ValidateNested,
} from 'class-validator';

@InputType()
export class ProductSupplierDto {
  @ApiProperty({ description: 'supplier id' })
  @Field(() => ID)
  @IsString()
  id: string;
}

@InputType()
export class CreateProductDto {
  @ApiProperty({ description: 'The name of the product' })
  @Field({ description: 'The name of the product' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'The description of the product' })
  @Field({ description: 'The description of the product' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ description: 'The price of the product' })
  @Field(() => Float, { description: 'The price of the product' })
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({ description: 'The stock quantity of the product' })
  @Field(() => Int, { description: 'The stock quantity of the product' })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiProperty({
    description: 'product Supplier',
    type: () => ProductSupplierDto,
  })
  @Field(() => ProductSupplierDto, { description: 'product Supplier' })
  @Type(() => ProductSupplierDto)
  @ValidateNested()
  supplier: ProductSupplierDto;
}
```

```typescript
// dto/inputs/update-product.dto.ts
import { IsUUID } from 'class-validator';
import { Field, ID, InputType } from '@nestjs/graphql';
import { PartialType } from '@solid-nestjs/typeorm-hybrid-crud';
import { CreateProductDto } from './create-product.dto';

@InputType()
export class UpdateProductDto extends PartialType(CreateProductDto) {}
```

### 3. Create Find Arguments

```typescript
// dto/args/find-product-args.dto.ts
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ArgsType, Field, InputType } from '@nestjs/graphql';
import {
  FindArgsFrom,
  StringFilter,
  Where,
} from '@solid-nestjs/typeorm-hybrid-crud';
import { Product } from '../../entities/product.entity';

@InputType({ isAbstract: true })
class FindProductWhere implements Where<Product> {
  @Field(() => StringFilter)
  @ApiProperty({ type: () => StringFilter, required: false })
  @Type(() => StringFilter)
  @IsOptional()
  @ValidateNested()
  name: StringFilter;
}

@ArgsType()
export class FindProductArgs extends FindArgsFrom<Product>({
  whereType: FindProductWhere,
}) {}
```

### 4. Create Service

```typescript
// products.service.ts
import {
  CrudServiceFrom,
  CrudServiceStructure,
} from '@solid-nestjs/typeorm-hybrid-crud';
import { Product } from './entities/product.entity';
import { CreateProductDto, FindProductArgs, UpdateProductDto } from './dto';

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

export class ProductsService extends CrudServiceFrom(serviceStructure) {
  // Add custom methods here if needed
}
```

### 5. Create REST Controller

```typescript
// products.controller.ts
import {
  CrudControllerFrom,
  CrudControllerStructure,
} from '@solid-nestjs/typeorm-hybrid-crud';
import { ProductsService, serviceStructure } from './products.service';

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

### 6. Create GraphQL Resolver

```typescript
// products.resolver.ts
import { Resolver } from '@nestjs/graphql';
import {
  CrudResolverFrom,
  CrudResolverStructure,
} from '@solid-nestjs/typeorm-hybrid-crud';
import { ProductsService, serviceStructure } from './products.service';
import { Product } from './entities/product.entity';

const resolverStructure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: ProductsService,
});

@Resolver(() => Product)
export class ProductsResolver extends CrudResolverFrom(resolverStructure) {
  // Add custom GraphQL methods here if needed
}
```

### 7. Configure Module

```typescript
// products.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsResolver } from './products.resolver';
import { Product } from './entities/product.entity';
import { ProductsController } from './products.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  providers: [ProductsResolver, ProductsService],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule {}
```

### 8. Setup Application

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: './database.sqlite',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    GraphQLModule.forRoot({
      autoSchemaFile: 'schema.gql',
      driver: ApolloDriver,
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
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { swaggerRecomenedOptions } from '@solid-nestjs/rest-api';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Products API')
    .setDescription('The products API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: { ...swaggerRecomenedOptions },
  });

  await app.listen(3000);

  console.log('🚀 REST API ready at http://localhost:3000/api');
  console.log('🚀 GraphQL server ready at http://localhost:3000/graphql');
}
bootstrap();
```

## 🎯 Generated Endpoints

### REST API Endpoints

```
GET    /products              # Get all products with filtering
GET    /products/:id          # Get single product
POST   /products              # Create new product
PATCH  /products/:id          # Update product
DELETE /products/:id          # Soft delete product
DELETE /products/:id/hard     # Hard delete product
GET    /products/pagination   # Get paginated products
```

### GraphQL Operations

```graphql
type Query {
  # Get single product by ID
  product(id: String!): Product!

  # Get list of products with filtering
  products(where: FindProductWhere): [Product!]!

  # Get paginated products
  productsPagination(where: FindProductWhere): PaginationResult!
}

type Mutation {
  # Create new product
  createProduct(createInput: CreateProductDto!): Product!

  # Update existing product
  updateProduct(updateInput: UpdateProductDto!): Product!

  # Soft delete product
  removeProduct(id: String!): Product!

  # Hard delete product (if enabled)
  hardRemoveProduct(id: String!): Product!
}
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
  functions: {
    findOne: {
      relationsConfig: {
        relations: {
          supplier: true,
          categories: true,
        },
      },
    },
    findAll: {
      relationsConfig: {
        relations: {
          supplier: true,
        },
      },
    },
  },
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
      summary: 'Retrieve all products',
    },
  },
});
```

## 🔍 Advanced Filtering

The bundle supports complex filtering with logical operators:

### REST API Query Examples

```bash
# Filter by name
GET /products?where={"name":{"_contains":"laptop"}}}

# Filter by price range
GET /products?where={"price":{"_gte":100, "_lte":1000}}

# Filter with multiple conditions
GET /products?where={"name":{"_contains":"laptop"}},"price":{"_gte":100, "_lte":1000}}
```

### GraphQL Query Examples

```graphql
# Basic filtering
query {
  products(where: { name: "laptop" }) {
    id
    name
    price
  }
}

# With logical operators
query {
  products(where: { _or: [{ name: "laptop" }, { description: "gaming" }] }) {
    id
    name
    price
  }
}

# With pagination
query {
  productsPagination(
    where: { price: { _gte: 100 } }
    pagination: { limit: 10, offset: 0 }
  ) {
    items {
      id
      name
      price
    }
    meta {
      totalItems
      totalPages
    }
  }
}
```

## 📊 Key Exports

### Services

- `CrudServiceFrom()` - Creates TypeORM-powered service with CRUD operations
- `DataServiceFrom()` - Creates read-only data service
- `CrudServiceStructure()` - Service configuration builder
- `Transactional()` - Transaction decorator

### Controllers (REST API)

- `CrudControllerFrom()` - Creates REST controller with full CRUD endpoints
- `DataControllerFrom()` - Creates read-only REST controller
- `CrudControllerStructure()` - Controller configuration builder

### Resolvers (GraphQL)

- `CrudResolverFrom()` - Creates GraphQL resolver with full CRUD operations
- `DataResolverFrom()` - Creates read-only GraphQL resolver
- `CrudResolverStructure()` - Resolver configuration builder

### Filtering & Arguments

- `FindArgsFrom()` - Creates hybrid argument types for REST + GraphQL
- `StringFilter`, `NumberFilter`, `DateFilter` - Filter input types
- `getWhereClass()`, `getOrderByClass()` - Dynamic filter classes

### Utilities

- `PartialType()` - Enhanced partial type helper for hybrid decorators
- `PaginationResult` - Pagination result type

## 📚 Examples

For complete working examples, see:

- [Simple Hybrid CRUD App](https://github.com/solid-nestjs/framework/tree/master/apps-examples/simple-hybrid-crud-app)
- [Framework Documentation](https://github.com/solid-nestjs/framework/tree/master/docs)

## 📖 Documentation

For complete documentation, examples, and advanced usage, see the [main framework documentation](https://github.com/solid-nestjs/framework).

## 🤝 Related Packages

This bundle includes and re-exports:

- `@solid-nestjs/common` - Common utilities and interfaces
- `@solid-nestjs/typeorm` - TypeORM service implementations
- `@solid-nestjs/rest-api` - REST API controllers and decorators
- `@solid-nestjs/graphql` - GraphQL resolvers and schemas
- `@solid-nestjs/rest-graphql` - Hybrid REST + GraphQL utilities

## License

MIT
