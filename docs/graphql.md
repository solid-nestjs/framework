# GraphQL

The `@solid-nestjs/graphql` package provides GraphQL resolver mixins, args helpers, scalars, and decorator adapters that integrate with `@nestjs/graphql` for automatic schema generation.

## Resolver Mixins

### `CrudResolverFrom(structure)`

Generates a full CRUD resolver class with standard mutations. Accepts a `CrudResolverStructure` config object:

```typescript
import { CrudResolverFrom } from '@solid-nestjs/graphql';
import { ProductService } from '../services/product.service';
import { Product } from '../entities/product.entity';
import { CreateProductInput } from '../dto/inputs/create-product.input';
import { UpdateProductInput } from '../dto/inputs/update-product.input';
import { FindProductArgs } from '../dto/args/find-product-args.dto';

export const ProductResolver = CrudResolverFrom({
  entityType: Product,
  createInputType: CreateProductInput,
  updateInputType: UpdateProductInput,
  findArgsType: FindProductArgs,
  service: ProductService,
  operations: {
    create: true,
    update: true,
    remove: true,
    softRemove: true,
    hardRemove: false,  // disabled by default
    recover: true,
  },
  entityId: {
    type: String,
    pipeTransforms: [],  // ParseUUIDPipe, etc.
  },
});

// Register in your module
@Module({
  providers: [ProductResolver],
})
export class ProductsModule {}
```

### `DataResolverFrom(structure)`

Generates a read-only data resolver with queries (no mutations):

```typescript
import { DataResolverFrom } from '@solid-nestjs/graphql';

export const ProductDataResolver = DataResolverFrom({
  entityType: Product,
  serviceType: ProductDataService,
  findArgsType: FindProductArgs,
  groupByArgsType: GroupedProductArgs,  // optional — enables findAllGrouped
  operations: {
    findAll: true,
    findOne: true,
    pagination: true,
    findAllGrouped: true,
  },
});
```

### CrudResolverStructure Config

```typescript
CrudResolverStructure({
  entityType,            // @ObjectType class (the entity)
  createInputType,       // @InputType for create mutations
  updateInputType,       // @InputType for update mutations
  service,               // Service class reference (injected)
  findArgsType?,         // Find args type (default: DefaultArgs)
  groupByArgsType?,      // GroupBy args type (enables findAllGrouped)
  operations?: {         // Toggle individual operations
    create?: boolean | OperationStructure,
    update?: boolean | OperationStructure,
    remove?: boolean | OperationStructure,
    hardRemove?: boolean | OperationStructure,
    softRemove?: boolean | OperationStructure,
    recover?: boolean | OperationStructure,
    findAll?: boolean | OperationStructure,
    findOne?: boolean | OperationStructure,
    pagination?: boolean | OperationStructure,
    findAllGrouped?: boolean | OperationStructure,
  },
  classDecorators?: ClassDecorator[],
  parameterDecorators?: {
    context?: ParameterDecorator,  // custom context extraction
  },
  entityId?: {
    type: Number | String,
    pipeTransforms: Type<PipeTransform>[],
  },
})
```

## Auto-Generated Queries

Given `ProductsResolver = CrudResolverFrom({ entityType: Product, ... })`, the framework generates:

| Query | Name (default) | Returns | Description |
|---|---|---|---|
| `findAll` | `products` | `[Product!]!` | List with optional where/orderBy args |
| `pagination` | `productsPagination` | `PaginationResult!` | Paginated list with metadata |
| `findOne` | `product` | `Product` | Fetch by ID |
| `findAllGrouped` | `productsGrouped` | `GroupedPaginationResult!` | Grouped query with aggregates (requires `groupByArgsType`) |

### Query Examples (GraphQL Schema Language)

```graphql
query {
  products(
    where: { name: { contains: "Widget" } }
    orderBy: { createdAt: DESC }
    pagination: { page: 1, limit: 20 }
  ) {
    id
    name
    price
  }
}

query {
  product(id: "abc-123") {
    id
    name
    description
    supplier { id name }
  }
}

query {
  productsGrouped(
    groupBy: {
      fields: { category: true }
      aggregates: [
        { field: "price", function: AVG, resultField: "avgPrice" }
        { field: "id", function: COUNT, resultField: "totalCount" }
      ]
    }
  ) {
    data {
      group { category }
      avgPrice
      totalCount
    }
  }
}
```

## Auto-Generated Mutations

| Mutation | Name (default) | Signature |
|---|---|---|
| `create` | `createProduct` | `createProduct(createInput: CreateProductInput!): Product!` |
| `update` | `updateProduct` | `updateProduct(id: ID!, updateInput: UpdateProductInput!): Product!` |
| `remove` | `removeProduct` | `removeProduct(id: ID!): Product!` |
| `softRemove` | `softRemoveProduct` | `softRemoveProduct(id: ID!): Product!` |
| `hardRemove` | `hardRemoveProduct` | `hardRemoveProduct(id: ID!): Product!` |
| `recover` | `recoverProduct` | `recoverProduct(id: ID!): Product!` |

`hardRemove`/`softRemove`/`recover` require the service to implement `SoftDeletableCrudService`.

### Mutation Examples

```graphql
mutation {
  createProduct(createInput: {
    name: "New Widget"
    price: 29.99
    stock: 100
  }) {
    id
    name
    price
  }
}

mutation {
  updateProduct(
    id: "abc-123"
    updateInput: { price: 24.99 }
  ) {
    id
    name
    price
  }
}

mutation {
  softRemoveProduct(id: "abc-123") {
    id
    deletedAt
  }
}
```

## Custom `JSONScalar` Type

The package exports `GraphQLJSON` and `GraphQLJSONObject` scalars for arbitrary JSON fields:

```graphql
scalar JSON
scalar JSONObject
```

```typescript
import { GraphQLJSON } from '@solid-nestjs/graphql';

@ObjectType()
export class Product {
  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: Record<string, any>;
}
```

## GraphQL Adapter

When using SOLID decorators on entities, the GraphQL adapter automatically applies:

- `@ObjectType()` on entity classes
- `@Field()` on entity properties
- `@InputType()` on DTO classes
- Proper type mappings (number → `Float`, Date → `Date` scalar, etc.)

Solid decorators are applied once on the entity/DTO and the adapter handles the translation.

## Enum Registration

Enums are automatically registered with `registerEnumType`:

```typescript
// In @solid-nestjs/common
export enum OrderByTypes {
  ASC = 'ASC',
  DESC = 'DESC',
}

// In @solid-nestjs/graphql (auto-registered on import)
registerEnumType(OrderByTypes, { name: 'OrderTypes' });
```

## Args Helpers with GraphQL Decorators

Import from `@solid-nestjs/graphql` to get helpers that apply `@Field` and `@InputType`:

```typescript
import {
  createWhereFields,
  createOrderByFields,
  createGroupByFields,
  GroupByArgsFrom,
  FindArgsMixin,
  getWhereClass,
  getOrderByClass,
} from '@solid-nestjs/graphql';
```

See [DTO Generation](./dto-generation.md) for detailed usage of these helpers.

## Operation Configuration

Each operation can be toggled or customized:

```typescript
operations: {
  create: {
    name: 'addProduct',           // custom mutation name
    title: 'Add a new product',
    description: 'Creates a product with full validation',
    decorators: [UseGuards(AdminGuard)],
  },
  remove: false,                  // disable entirely
}
```

`OperationStructure` fields: `name`, `title`, `description`, `decorators`.

## Filter Types

| Type | Description |
|---|---|
| `StringFilter` | `equals`, `not`, `contains`, `startsWith`, `endsWith`, `in`, `notIn`, `mode` |
| `NumberFilter` | `equals`, `not`, `gt`, `gte`, `lt`, `lte`, `in`, `notIn` |
| `DateFilter` | `equals`, `not`, `gt`, `gte`, `lt`, `lte`, `in`, `notIn` |
| `BooleanFilter` | `equals`, `not` |
| `EnumFilter` | `equals`, `not`, `in`, `notIn` |

Logical operators `_and` and `_or` are auto-added to every Where class for nested compound conditions:

```graphql
query {
  products(where: {
    _or: [
      { name: { contains: "Widget" } },
      { price: { gt: 50 } }
    ]
  }) { id name price }
}
```

## PaginationResult Type

```graphql
type PaginationResult {
  total: Int!
  count: Int!
  limit: Int
  page: Int!
  pageCount: Int!
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
}
```

## Example: Full Resolver Module

```typescript
// products.module.ts
import { Module } from '@nestjs/common';
import { Product } from './entities/product.entity';
import { ProductService } from './services/product.service';
import { CreateProductInput } from './dto/inputs/create-product.input';
import { UpdateProductInput } from './dto/inputs/update-product.input';
import { FindProductArgs } from './dto/args/find-product-args.dto';
import { CrudResolverFrom } from '@solid-nestjs/graphql';

const ProductResolver = CrudResolverFrom({
  entityType: Product,
  createInputType: CreateProductInput,
  updateInputType: UpdateProductInput,
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

@Module({
  providers: [ProductService, ProductResolver],
})
export class ProductsModule {}
```

## Related Docs

- [DTO Generation](./dto-generation.md)
- [REST API Features](./rest-api.md)
- [Hybrid REST + GraphQL](./hybrid.md)
