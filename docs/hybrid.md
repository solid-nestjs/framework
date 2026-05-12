# Hybrid REST + GraphQL

The `@solid-nestjs/rest-graphql` package combines REST controller mixins and GraphQL resolver mixins into a single dual-protocol layer. A single configuration structure builds both a REST controller and a GraphQL resolver, exposing the same service layer simultaneously to both protocols.

## Overview

```
┌─────────────────────────────────────────┐
│  @solid-nestjs/rest-graphql             │
│                                         │
│  CrudControllerFrom(structure) ──► REST │
│  CrudResolverFrom(structure)  ──► GQL   │
│  DataControllerFrom(structure) ──► REST │
│  DataResolverFrom(structure)  ──► GQL   │
│                                         │
│  Uses @solid-nestjs/rest-api internally │
│  Uses @solid-nestjs/graphql internally  │
└─────────────────────────────────────────┘
```

The hybrid package delegates to the REST and GraphQL packages internally. Hybrid helpers apply both `@ApiProperty` (Swagger) and `@Field` (GraphQL) decorators to generated DTO classes.

## When to Use Hybrid vs Single Protocol

| Scenario | Recommendation |
|---|---|
| API consumed by a web SPA + mobile app | Hybrid — serve REST to web, GraphQL to mobile |
| Legacy systems need REST, new features want GraphQL | Hybrid — incremental migration path |
| Single client, one protocol preferred | Single package — smaller bundle |
| Public API with multiple consumers | Hybrid — maximum flexibility |
| Internal microservice | Single package — lowest overhead |

## Hybrid Controllers

### `CrudControllerFrom(structure)` from rest-graphql

Same API as the REST-only variant, but imports from `@solid-nestjs/rest-graphql`:

```typescript
import { CrudControllerFrom } from '@solid-nestjs/rest-graphql';
import { ProductService } from '../services/product.service';
import { Product } from '../entities/product.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { FindProductArgs } from '../dto/args/find-product-args.dto';

export const ProductController = CrudControllerFrom({
  entityType: Product,
  createInputType: CreateProductDto,
  updateInputType: UpdateProductDto,
  findArgsType: FindProductArgs,
  service: ProductService,
  route: 'products',
  operations: {
    create: true,
    update: true,
    remove: true,
  },
});
```

Output: a NestJS controller with `GET /products`, `POST /products`, `PUT /products/:id`, `DELETE /products/:id`.

### `DataControllerFrom(structure)` from rest-graphql

Read-only variant, same pattern:

```typescript
import { DataControllerFrom } from '@solid-nestjs/rest-graphql';

export const ProductDataController = DataControllerFrom({
  entityType: Product,
  serviceType: ProductService,
  findArgsType: FindProductArgs,
  route: 'products',
});
```

## Hybrid Resolvers

### `CrudResolverFrom(structure)` from rest-graphql

Same structure as the GraphQL-only variant but imported from the hybrid package:

```typescript
import { CrudResolverFrom } from '@solid-nestjs/rest-graphql';

export const ProductResolver = CrudResolverFrom({
  entityType: Product,
  createInputType: CreateProductDto,    // same DTO — decorators are hybrid
  updateInputType: UpdateProductDto,
  findArgsType: FindProductArgs,
  service: ProductService,
  operations: {
    create: true,
    update: true,
    remove: true,
    softRemove: true,
    recover: true,
  },
});
```

Output: a GraphQL resolver with `Query.products`, `Mutation.createProduct`, `Mutation.updateProduct`, etc.

### Structure Compatibility

The `CrudControllerStructure` used by `@solid-nestjs/rest-graphql` is the same interface from `@solid-nestjs/rest-api`. The hybrid `CrudResolverFrom` wraps `@solid-nestjs/graphql`'s `CrudResolverFrom` and adds `DefaultArgs` fallback. This means a single structure object can serve both:

```typescript
const structure = {
  entityType: Product,
  createInputType: CreateProductDto,
  updateInputType: UpdateProductDto,
  findArgsType: FindProductArgs,
  service: ProductService,
  operations: { create: true, update: true, remove: true },
};

const ProductController = CrudControllerFrom(structure);
const ProductResolver = CrudResolverFrom(structure);
```

## Hybrid Args Helpers

Import from `@solid-nestjs/rest-graphql` to get helpers that apply both `@ApiProperty` and `@Field`:

```typescript
import {
  createWhereFields,
  createOrderByFields,
  createGroupByFields,
  GroupByArgsFrom,
  FindArgsMixin,
  getWhereClass,
  getOrderByClass,
} from '@solid-nestjs/rest-graphql';
```

This means a single DTO definition works for both REST query parameters and GraphQL args:

```typescript
const ProductWhere = createWhereFields(Product, {
  name: true,      // @ApiProperty + @Field(StringFilter)
  price: true,     // @ApiProperty + @Field(NumberFilter)
  stock: true,     // @ApiProperty + @Field(NumberFilter)
}, { name: 'ProductWhereFilter' });
```

## Hybrid DTO Generation

`GenerateDtoFromEntity` from `@solid-nestjs/typeorm-hybrid-crud` applies both Swagger and GraphQL decorators:

```typescript
import { GenerateDtoFromEntity } from '@solid-nestjs/typeorm-hybrid-crud';

// Works for REST @Body() and GraphQL @InputType simultaneously
export class CreateProductDto extends GenerateDtoFromEntity(Product, [
  'name', 'description', 'price', 'stock',
]) {}
```

## Full Example: Same Entity via REST and GraphQL

```typescript
// products.module.ts
import { Module } from '@nestjs/common';
import {
  CrudControllerFrom,
  CrudResolverFrom,
} from '@solid-nestjs/rest-graphql';
import { Product } from './entities/product.entity';
import { ProductService } from './services/product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FindProductArgs } from './dto/args/find-product-args.dto';

const structure = {
  entityType: Product,
  createInputType: CreateProductDto,
  updateInputType: UpdateProductDto,
  findArgsType: FindProductArgs,
  service: ProductService,
  route: 'products',
  operations: {
    create: true,
    update: true,
    remove: true,
  },
};

const ProductController = CrudControllerFrom(structure);
const ProductResolver = CrudResolverFrom(structure);

@Module({
  controllers: [ProductController],
  providers: [ProductService, ProductResolver],
})
export class ProductsModule {}
```

With this single module, the `Product` entity is exposed via:

```
# REST endpoints
GET    /products
POST   /products
PUT    /products/:id
DELETE /products/:id

# GraphQL operations
query { products { id name price } }
query { product(id: "abc") { id name } }
mutation { createProduct(createInput: { ... }) { id } }
mutation { updateProduct(id: "abc", updateInput: { ... }) { id } }
mutation { removeProduct(id: "abc") { id } }
```

## DTO Decorator Composition

When using hybrid packages, each DTO property receives the correct decorators for both protocols:

```
┌──────────────────────────────────┐
│ CreateProductDto                 │
│  @ApiProperty({ description })   │  ← REST (Swagger)
│  @Field(() => String)            │  ← GraphQL
│  @IsString()                     │  ← Validation (class-validator)
│  name: string;                   │
└──────────────────────────────────┘
```

The framework manages this composition automatically; you define the entity once and the adapters handle the rest.

## Choosing the Right Import

| Feature | REST Only | GraphQL Only | Hybrid |
|---|---|---|---|
| Controller | `@solid-nestjs/rest-api` | — | `@solid-nestjs/rest-graphql` |
| Resolver | — | `@solid-nestjs/graphql` | `@solid-nestjs/rest-graphql` |
| Args helpers | `@solid-nestjs/rest-api` | `@solid-nestjs/graphql` | `@solid-nestjs/rest-graphql` |
| DTO generation | `@solid-nestjs/typeorm-crud` | `@solid-nestjs/typeorm-graphql-crud` | `@solid-nestjs/typeorm-hybrid-crud` |

## Permission & Guard Strategy

When exposing the same entity to two protocols, apply authorization consistently:

```typescript
// Shared guard
export const AdminGuard = { ... };

// Applied on the structure — affects both protocols
const structure = {
  ...baseStructure,
  classDecorators: [UseGuards(AdminGuard)],
  operations: {
    create: {
      decorators: [UseGuards(SuperAdminGuard)],
    },
  },
};
```

## Related Docs

- [DTO Generation](./dto-generation.md) — createWhereFields, createOrderByFields, GenerateDtoFromEntity
- [REST API Features](./rest-api.md)
- [GraphQL Features](./graphql.md)
