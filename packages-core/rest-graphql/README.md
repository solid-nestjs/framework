# @solid-nestjs/rest-graphql

REST API + GraphQL hybrid utilities for the SOLID NestJS Framework. This package provides mixins and helpers for building applications that support both REST API and GraphQL endpoints with shared argument types and validation.

## 🚀 Features

- **🔄 Hybrid Arguments** - Create argument types that work with both REST and GraphQL
- **🎯 Unified Filtering** - Shared filtering logic between REST and GraphQL endpoints
- **📝 Type Safety** - Full TypeScript support with dual decorators
- **🛡️ Input Validation** - Integrated class-validator support for both protocols
- **🎨 Flexible Design** - Easy integration with existing REST or GraphQL implementations
- **📚 OpenAPI + GraphQL Schema** - Automatic documentation generation for both

## 📦 Installation

```bash
# Install with complete bundle (recommended)
npm install @solid-nestjs/typeorm-hybrid-crud

# Or install individually
npm install @solid-nestjs/rest-graphql
```

## 🏗️ Quick Start

### 1. Define Hybrid Argument Types

```typescript
// dto/find-product-args.dto.ts
import { FindArgsFrom } from '@solid-nestjs/rest-graphql';
import { ProductWhereInput } from './product-where.input';
import { ProductOrderByInput } from './product-order-by.input';

export const FindProductArgs = FindArgsFrom({
  whereType: ProductWhereInput,
  orderByType: ProductOrderByInput,
});

export class FindProductArgsDto extends FindProductArgs {}
```

### 2. Create Where Input Type

```typescript
// dto/product-where.input.ts
import { Field, InputType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

@InputType()
export class ProductWhereInput {
  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
```

### 3. Use in REST Controller

```typescript
// products.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { FindProductArgsDto } from './dto/find-product-args.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  @Get()
  @ApiOperation({ summary: 'Get products with filtering' })
  async findAll(@Query() args: FindProductArgsDto) {
    // Use args.where, args.orderBy, args.pagination
    return this.productsService.findAll(args);
  }
}
```

### 4. Use in GraphQL Resolver

```typescript
// products.resolver.ts
import { Resolver, Query, Args } from '@nestjs/graphql';
import { FindProductArgsDto } from './dto/find-product-args.dto';
import { Product } from './entities/product.entity';

@Resolver(() => Product)
export class ProductsResolver {
  @Query(() => [Product])
  async products(@Args() args: FindProductArgsDto): Promise<Product[]> {
    // Same args structure works for GraphQL
    return this.productsService.findAll(args);
  }
}
```

## 🎯 Generated Features

The `FindArgsFrom` mixin automatically generates:

### REST API Support

- **OpenAPI Documentation** - Swagger decorators for all fields
- **Query Parameters** - Proper query parameter parsing
- **Validation** - class-validator integration

### GraphQL Support

- **GraphQL Schema** - InputType and ArgsType decorators
- **Type Definitions** - Proper GraphQL type generation
- **Nested Inputs** - Support for complex filtering with `_and`/`_or`

### Common Features

- **Pagination** - Built-in pagination request handling
- **Filtering** - Complex where conditions with logical operators
- **Sorting** - Flexible orderBy field support
- **Validation** - Shared validation rules

## 🔧 Advanced Configuration

### Custom Pagination

```typescript
import { FindArgsFrom } from '@solid-nestjs/rest-graphql';
import { PaginationRequest } from '@solid-nestjs/rest-graphql';

export const FindProductArgs = FindArgsFrom({
  whereType: ProductWhereInput,
  orderByType: ProductOrderByInput,
});

// The generated class includes:
// - pagination?: PaginationRequest
// - where?: ProductWhereInput & { _and?: ProductWhereInput[]; _or?: ProductWhereInput[] }
// - orderBy?: ProductOrderByInput[]
```

### Logical Operators

The generated where input automatically supports:

```typescript
// REST API Query
GET /products?where[name]=laptop&where[_or][0][description]=gaming&where[_or][1][price][_gte]=1000

// GraphQL Query
query {
  products(where: {
    name: "laptop"
    _or: [
      { description: "gaming" }
      { price: { _gte: 1000 } }
    ]
  }) {
    id
    name
    price
  }
}
```

## 📊 Key Exports

### Mixins

- `FindArgsFrom()` - Creates hybrid argument types for REST + GraphQL

### Helpers

- `PartialType()` - Enhanced partial type helper for hybrid decorators

### Utilities

- `getWhereClass()` - Extract where class from FindArgs type
- `getOrderByClass()` - Extract orderBy class from FindArgs type

### Classes

- `PaginationRequest` - Common pagination input type

## 🎨 Integration Examples

### With Existing Services

```typescript
// service works with both REST and GraphQL
export class ProductsService {
  async findAll(args: FindProductArgsDto) {
    const { where, orderBy, pagination } = args;

    // Your business logic here
    return this.repository.findAndCount({
      where: this.buildWhereCondition(where),
      order: this.buildOrderCondition(orderBy),
      skip: pagination?.offset,
      take: pagination?.limit,
    });
  }
}
```

### Module Configuration

```typescript
// products.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductsResolver } from './products.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  providers: [ProductsService, ProductsResolver],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule {}
```

## 🔗 Compatibility

Works seamlessly with:

- **@solid-nestjs/rest-api** - REST controller mixins
- **@solid-nestjs/graphql** - GraphQL resolver mixins
- **@solid-nestjs/typeorm** - TypeORM service implementations
- **Standard NestJS** - Controllers and resolvers

## 📚 Examples

For complete examples, see:

- [Simple Hybrid CRUD App](https://github.com/solid-nestjs/framework/tree/master/apps-examples/simple-hybrid-crud-app)
- [Framework Documentation](https://github.com/solid-nestjs/framework/tree/master/docs)

## 📖 Documentation

For complete documentation, examples, and advanced usage, see the [main framework documentation](https://github.com/solid-nestjs/framework).

## 🤝 Related Packages

- `@solid-nestjs/common` - Common utilities and interfaces
- `@solid-nestjs/rest-api` - REST API controllers and decorators
- `@solid-nestjs/graphql` - GraphQL resolvers and schemas
- `@solid-nestjs/typeorm` - TypeORM service implementations
- `@solid-nestjs/typeorm-hybrid-crud` - Complete hybrid bundle

## License

MIT
