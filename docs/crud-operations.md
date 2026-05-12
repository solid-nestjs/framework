# CRUD Operations

The SOLID NestJS Framework generates full CRUD services via mixins. Define a
structure, extend the mixin, and you get create, read, update, delete, and
recovery — with lifecycle hooks, event handlers, and relation awareness.

## Service Structure

`CrudServiceStructure` accepts entity metadata, input DTOs, find args, and
optional relation/function configuration:

```typescript
import { CrudServiceStructure } from '@solid-nestjs/typeorm';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FindProductArgs } from './dto/find-product.args';

export const productServiceStructure = CrudServiceStructure({
  entityType: Product,
  createInputType: CreateProductDto,
  updateInputType: UpdateProductDto,
  findArgsType: FindProductArgs,
  relationsConfig: {
    mainAlias: 'product',
    relations: ['supplier', 'category'],
  },
  functions: {
    create: { transactional: true },
    update: { transactional: true },
    remove: { transactional: true },
  },
});
```

All keys:

| Property | Required | Description |
|---|---|---|
| `entityType` | Yes | The TypeORM entity class |
| `createInputType` | Yes | DTO class for create payloads |
| `updateInputType` | Yes | DTO class for update payloads |
| `findArgsType` | No | Query args class (`where` + `orderBy` + `pagination`) |
| `relationsConfig` | No | Relations to auto-eager load |
| `functions` | No | Per-method config (transactional, isolation, decorators) |

## Service Creation

Extend `CrudServiceFrom` with your structure:

```typescript
import { Injectable } from '@nestjs/common';
import { CrudServiceFrom } from '@solid-nestjs/typeorm';

@Injectable()
export class ProductsService extends CrudServiceFrom(
  productServiceStructure,
) {}
```

The generated service provides all CRUD methods out of the box.

## Read-Only Variant

For read-only services (no create/update/delete), use `DataServiceFrom`:

```typescript
import { DataServiceStructure, DataServiceFrom } from '@solid-nestjs/typeorm';

const readOnlyStructure = DataServiceStructure({
  entityType: Product,
  findArgsType: FindProductArgs,
  relationsConfig: { relations: ['supplier'] },
});

@Injectable()
export class ProductViewService extends DataServiceFrom(readOnlyStructure) {}
```

## Entity Operations

### Create

```typescript
const product = await service.create(context, {
  name: 'Widget',
  price: 29.99,
  categoryId: 1,
});
```

### Update

```typescript
const updated = await service.update(context, 1, {
  price: 34.99,
});
```

### Find One

```typescript
// Returns null if not found
const product = await service.findOne(context, 1);

// Throws EntityNotFoundError if not found
const product = await service.findOne(context, 1, true);
```

### Find All

```typescript
// Without pagination
const products = await service.findAll(context, { where: { price: { _gt: 10 } } });

// With pagination
const result = await service.findAll(context, {
  where: { active: true },
  pagination: { page: 1, limit: 20 },
  orderBy: { createdAt: 'DESC' },
}, true);
// result.data       → Product[]
// result.pagination → PaginationResult
```

### Find All Grouped

```typescript
const grouped = await service.findAllGrouped(context, {
  groupBy: {
    fields: { category: true },
    aggregates: [{ field: 'price', function: AggregateFunctionTypes.AVG, alias: 'avgPrice' }],
  },
  pagination: { page: 1, limit: 10 },
});
```

### Pagination (metadata only)

```typescript
const meta = await service.pagination(context, {
  where: { active: true },
  pagination: { page: 1, limit: 20 },
});
// meta → { total, count, page, pageCount, hasNextPage, hasPreviousPage }
```

### Find (raw TypeORM options)

```typescript
const products = await service.find(context, {
  where: { status: 'published' },
  relations: { supplier: true },
  order: { createdAt: 'DESC' },
  take: 5,
});
```

### Remove

```typescript
// Auto-detects soft vs hard delete based on entity metadata
await service.remove(context, 1);
```

## Lifecycle Hooks

Override hooks in your service subclass to inject business logic:

```typescript
@Injectable()
export class ProductsService extends CrudServiceFrom(productServiceStructure) {
  async beforeCreate(context, repository, entity, createInput) {
    entity.slug = this.slugify(entity.name);
    entity.createdBy = context.user.id;
  }

  async afterCreate(context, repository, entity, createInput) {
    await this.auditService.log('PRODUCT_CREATED', entity.id, context.user.id);
  }

  async beforeUpdate(context, repository, entity, updateInput) {
    if (updateInput.price && updateInput.price < 0) {
      throw new BadRequestException('Price cannot be negative');
    }
  }

  async afterRemove(context, repository, entity) {
    await this.cacheService.invalidate(`product:${entity.id}`);
  }
}
```

### Available Hooks

| Operation | Before Hook | After Hook |
|---|---|---|
| create | `beforeCreate` | `afterCreate` |
| update | `beforeUpdate` | `afterUpdate` |
| remove | `beforeRemove` | `afterRemove` |
| softRemove | `beforeSoftRemove` | `afterSoftRemove` |
| hardRemove | `beforeHardRemove` | `afterHardRemove` |
| recover | `beforeRecover` | `afterRecover` |
| bulkInsert | `beforeBulkInsert` | `afterBulkInsert` |
| bulkUpdate | `beforeBulkUpdate` | `afterBulkUpdate` |
| bulkDelete | `beforeBulkDelete` | `afterBulkDelete` |
| bulkRemove | `beforeBulkRemove` | `afterBulkRemove` |
| bulkRecover | `beforeBulkRecover` | `afterBulkRecover` |

### Hook Signatures

**beforeCreate**: `(context, repository, entity, createInput) => Promise<void>`
**afterCreate**: `(context, repository, entity, createInput) => Promise<void>`

**beforeUpdate**: `(context, repository, entity, updateInput) => Promise<void>`
**afterUpdate**: `(context, repository, entity, updateInput) => Promise<void>`

**beforeRemove/afterRemove**: `(context, repository, entity) => Promise<void>`
**beforeHardRemove/afterHardRemove**: `(context, repository, entity) => Promise<void>`
**beforeRecover/afterRecover**: `(context, repository, entity) => Promise<void>`

**beforeBulkInsert**: `(context, repository, entities[], createInputs[]) => Promise<void>`
**afterBulkInsert**: `(context, repository, ids[], createInputs[]) => Promise<void>`

**beforeBulkUpdate/afterBulkUpdate**:
`(context, repository, updateInput, where) / (context, repository, affectedCount, updateInput, where) => Promise<void>`

**beforeBulkDelete/afterBulkDelete**:
`(context, repository, where) / (context, repository, affectedCount, where) => Promise<void>`

## Event Handlers

Extract hook logic into dedicated event handler classes that implement the
corresponding interface, then pass via `options.eventHandler`:

```typescript
import { CreateEventsHandler } from '@solid-nestjs/typeorm';

export class ProductCreateHandler implements CreateEventsHandler<Product> {
  async beforeCreate(context, repository, entity, createInput) {
    entity.sku = generateSku(createInput.name);
  }

  async afterCreate(context, repository, entity, createInput) {
    await notifyWarehouse(entity);
  }
}

// Usage
await service.create(context, input, {
  eventHandler: new ProductCreateHandler(),
});
```

Available handler interfaces: `CreateEventsHandler`, `UpdateEventsHandler`,
`RemoveEventsHandler`, `SoftRemoveEventsHandler`, `HardRemoveEventsHandler`,
`RecoverEventsHandler`, `BulkInsertEventsHandler`, `BulkUpdateEventsHandler`,
`BulkDeleteEventsHandler`, `BulkRemoveEventsHandler`, `BulkRecoverEventsHandler`.

## Relations Configuration

Nested relation loading via `relationsConfig`:

```typescript
const structure = CrudServiceStructure({
  entityType: Product,
  // ... other fields
  relationsConfig: {
    mainAlias: 'product',
    relations: [
      'supplier',
      'category',
      { parent: 'children' },           // nested
    ],
  },
});
```

Or use TypeORM's `FindOptionsRelations` syntax:

```typescript
relationsConfig: {
  mainAlias: 'product',
  relations: {
    supplier: true,
    category: { products: true },
  },
}
```

## Custom Methods

Add business-logic methods directly to your service class:

```typescript
@Injectable()
export class ProductsService extends CrudServiceFrom(productServiceStructure) {
  async publish(context: Context, id: number): Promise<Product> {
    return this.update(context, id, { status: 'published' } as any);
  }

  async findByCategory(context: Context, categoryId: number): Promise<Product[]> {
    return this.findAll(context, {
      where: { category: { id: categoryId } },
      orderBy: { name: 'ASC' },
    });
  }

  async runInventoryReport(context: Context): Promise<GroupedPaginationResult<Product>> {
    return this.findAllGrouped(context, {
      groupBy: {
        fields: { category: true },
        aggregates: [
          { field: 'stock', function: AggregateFunctionTypes.SUM, alias: 'totalStock' },
          { field: 'id', function: AggregateFunctionTypes.COUNT, alias: 'productCount' },
        ],
      },
    });
  }
}
```

## Transaction Configuration

Per-function transactional behavior via `functions`:

```typescript
functions: {
  create: { transactional: true, isolationLevel: 'READ_COMMITTED' },
  update: { transactional: true, isolationLevel: 'REPEATABLE_READ' },
  bulkInsert: { transactional: true },
}
```

## Context

All methods accept a `context` parameter that carries request-scoped data
(data source, user, etc.). Pass it through from controllers/resolvers:

```typescript
@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @Post()
  create(@Context() context: Context, @Body() dto: CreateProductDto) {
    return this.service.create(context, dto);
  }
}
```
