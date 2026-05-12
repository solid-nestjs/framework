# Bulk Operations

The framework provides five bulk methods for efficient batch processing:
`bulkInsert`, `bulkUpdate`, `bulkDelete`, `bulkRemove`, and `bulkRecover`.
All support lifecycle hooks and transactional execution.

## Available Methods

### bulkInsert

Insert multiple entities in a single query. Returns the generated IDs:

```typescript
const result = await service.bulkInsert(context, [
  { name: 'Widget A', price: 10 },
  { name: 'Widget B', price: 20 },
  { name: 'Widget C', price: 30 },
]);

// result: { ids: [1, 2, 3] }
```

### bulkUpdate

Update all entities matching a `Where<T>` condition:

```typescript
const result = await service.bulkUpdate(
  context,
  { status: 'archived' },                              // update payload
  { status: 'inactive', lastLoginAt: { _lt: oldDate } } // where condition
);

// result: { affected: 42 }
```

### bulkDelete

Hard-delete all entities matching a condition:

```typescript
const result = await service.bulkDelete(context, {
  status: 'expired',
  createdAt: { _lt: new Date('2023-01-01') },
});

// result: { affected: 150 }
```

### bulkRemove

Remove entities matching a condition. Auto-detects soft vs hard delete based
on entity configuration:

```typescript
// Soft-deletable entity → runs .softDelete() (sets deletedAt)
const result = await service.bulkRemove(context, {
  status: 'deprecated',
});

// Non-soft-deletable entity → falls back to bulkDelete
const result = await service.bulkRemove(context, {
  tempData: true,
});

// result: { affected: 72 }
```

### bulkRecover

Restore soft-deleted entities. Only available on entities with a `deletedAt`
column:

```typescript
const result = await service.bulkRecover(context, {
  status: 'active',
  deletedAt: { _gte: new Date('2024-01-01') },
});

// result: { affected: 33 }
```

## Transaction Integration

Configure bulk operations as transactional via `functions`:

```typescript
const structure = CrudServiceStructure({
  entityType: Product,
  createInputType: CreateProductDto,
  updateInputType: UpdateProductDto,
  functions: {
    bulkInsert: { transactional: true, isolationLevel: 'READ_COMMITTED' },
    bulkUpdate: { transactional: true, isolationLevel: 'REPEATABLE_READ' },
    bulkDelete: { transactional: true },
    bulkRemove: { transactional: true },
    bulkRecover: { transactional: true },
  },
});
```

## Lifecycle Hooks

Override hooks for validation, enrichment, or side effects. Bulk hooks receive
arrays (insert) or `where` conditions (update/delete/remove/recover) instead of
individual entities:

```typescript
@Injectable()
export class ProductsService extends CrudServiceFrom(productServiceStructure) {
  async beforeBulkInsert(context, repository, entities, createInputs) {
    const dataSource = await this.auditService.getDataSource();
    const batchId = generateBatchId();
    entities.forEach(e => {
      e.batchId = batchId;
      e.createdBy = context.user.id;
    });

    // Cross-batch validation
    const emails = entities.map(e => e.email).filter(Boolean);
    const existing = await dataSource.getRepository(User).find({
      where: { email: In(emails) },
    });
    if (existing.length > 0) {
      throw new BadRequestException('Duplicate emails in batch');
    }
  }

  async afterBulkInsert(context, repository, ids, createInputs) {
    await this.auditService.logBulk('BULK_CREATE', ids, context.user.id);
    await this.cacheService.invalidatePattern('products:*');
  }

  async beforeBulkUpdate(context, repository, updateInput, where) {
    if (updateInput.status === 'published' && !context.user.canPublish) {
      throw new ForbiddenException('Cannot publish products');
    }
    updateInput.updatedBy = context.user.id;
  }

  async afterBulkUpdate(context, repository, affectedCount, updateInput, where) {
    if (affectedCount > 0) {
      await this.searchService.reindexByQuery(where);
    }
  }

  async beforeBulkDelete(context, repository, where) {
    const count = await repository.count({ where: where as any });
    await this.backupService.archiveByQuery(where, count);
  }

  async afterBulkDelete(context, repository, affectedCount, where) {
    await this.auditService.logBulk('BULK_DELETE', affectedCount, context.user.id);
  }

  async beforeBulkRemove(context, repository, where) {
    if (!context.user.canRemove) {
      throw new ForbiddenException();
    }
  }

  async afterBulkRecover(context, repository, affectedCount, where) {
    await this.cacheService.invalidatePattern('products:*');
  }
}
```

## Bulk Hook Signatures

| Hook | Parameters |
|---|---|
| `beforeBulkInsert` | `context, repository, entities[], createInputs[]` |
| `afterBulkInsert` | `context, repository, ids[], createInputs[]` |
| `beforeBulkUpdate` | `context, repository, updateInput, where` |
| `afterBulkUpdate` | `context, repository, affectedCount, updateInput, where` |
| `beforeBulkDelete` | `context, repository, where` |
| `afterBulkDelete` | `context, repository, affectedCount, where` |
| `beforeBulkRemove` | `context, repository, where` |
| `afterBulkRemove` | `context, repository, affectedCount, where` |
| `beforeBulkRecover` | `context, repository, where` |
| `afterBulkRecover` | `context, repository, affectedCount, where` |

## Controller Endpoints

Expose bulk operations via REST:

```typescript
const controllerStructure = CrudControllerStructure({
  ...serviceStructure,
  serviceType: ProductsService,
  operations: {
    findAll: true,
    findOne: true,
    bulkInsert: true,
    bulkUpdate: true,
    bulkDelete: true,
    bulkRemove: true,
    bulkRecover: true,
  },
});

@Controller('products')
export class ProductsController extends CrudControllerFrom(controllerStructure) {}
```

This generates endpoints:

| Method | Path | Operation |
|---|---|---|
| `POST` | `/products/bulk` | bulkInsert |
| `PATCH` | `/products/bulk` | bulkUpdate |
| `DELETE` | `/products/bulk` | bulkDelete |
| `POST` | `/products/bulk/remove` | bulkRemove |
| `POST` | `/products/bulk/recover` | bulkRecover |

## GraphQL

Enable bulk mutations in the resolver:

```typescript
const resolverStructure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: ProductsService,
  operations: {
    findAll: true,
    findOne: true,
    bulkInsert: true,
    bulkUpdate: true,
    bulkDelete: true,
    bulkRemove: true,
    bulkRecover: true,
  },
});

@Resolver(() => Product)
export class ProductsResolver extends CrudResolverFrom(resolverStructure) {}
```

Example mutations:

```graphql
mutation {
  bulkInsertProducts(inputs: [
    { name: "A", price: 10 }
    { name: "B", price: 20 }
  ]) {
    ids
  }

  bulkUpdateProducts(
    input: { status: "archived" }
    where: { status: "inactive" }
  ) {
    affected
  }

  bulkDeleteProducts(
    where: { expired: true }
  ) {
    affected
  }
}
```

## Performance Notes

- `bulkInsert` uses `INSERT ... VALUES (...), (...)` — a single DB round-trip.
- `bulkUpdate`, `bulkDelete`, `bulkRemove`, and `bulkRecover` use query builder
  `.update()`, `.delete()`, `.softDelete()`, and `.restore()` — no entity
  hydration overhead.
- Bulk hooks do **not** receive loaded entities for update/delete/remove/recover
  (only the `where` condition). This keeps operations fast even for millions of
  rows.
- For very large batches, wrap in a transaction to ensure atomicity.
- Use the `functions` config to add guards via decorators:

```typescript
import { UseGuards } from '@nestjs/common';

functions: {
  bulkDelete: {
    transactional: true,
    decorators: [() => UseGuards(AdminGuard)],
  },
}
```
