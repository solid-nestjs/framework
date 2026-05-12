# Soft Delete

The framework automatically detects soft-delete support on entities and adapts
all queries accordingly. Soft-deleted records are excluded from normal queries,
and recovery is built in.

## Entity Configuration

Mark the soft-delete column with TypeORM's `@DeleteDateColumn()` or the
framework's `@SolidDeletedAt()` decorator:

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { SolidDeletedAt } from '@solid-nestjs/common';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @SolidDeletedAt()
  deletedAt: Date | null;
}
```

The framework automatically detects the `deletedAt` column via the
`hasDeleteDateColumn` helper. Either decorator works.

## Operations

### remove() — Auto-Detection

`remove()` inspects the entity and chooses the appropriate strategy:

- **Has `deletedAt` column** → soft-deletes (sets `deletedAt = now()`, runs `beforeRemove`/`afterRemove` hooks).
- **No `deletedAt` column** → hard-deletes (removes the row from the database).

```typescript
await service.remove(context, 1);
// Soft-deletable entity → softRemove
// Non-soft-deletable entity → hardRemove
```

### softRemove() — Explicit Soft Delete

Forces a soft delete regardless of auto-detection. Throws if the entity lacks a
`deletedAt` column:

```typescript
await service.softRemove(context, 1);
```

Runs `beforeSoftRemove` / `afterSoftRemove` hooks.

### hardRemove() — Permanent Delete

Permanently removes the entity. Works on all entities:

```typescript
await service.hardRemove(context, 1);
```

Runs `beforeHardRemove` / `afterHardRemove` hooks.

### recover() — Restore Soft-Deleted

Restores a previously soft-deleted entity by clearing `deletedAt`:

```typescript
await service.recover(context, 1);
```

Runs `beforeRecover` / `afterRecover` hooks.

## Bulk Variants

All four operations have bulk equivalents:

```typescript
// Soft remove (if deletable) or hard delete
await service.bulkRemove(context, { status: 'inactive' });

// Force hard delete
await service.bulkDelete(context, { expired: true });

// Restore soft-deleted records
await service.bulkRecover(context, { deletedAt: { _gte: lastWeek } });
```

| Method | Description | Requires deletedAt? |
|---|---|---|
| `bulkRemove` | Auto-detects soft/hard delete | No |
| `bulkDelete` | Always hard deletes | No |
| `bulkRecover` | Restores soft-deleted | Yes |

## Automatic Filtering

All query methods automatically exclude soft-deleted records:

- `findAll` / `findOne` / `findOneBy` / `pagination` / `findAllGrouped` — all
  add `WHERE deletedAt IS NULL` when a `deletedAt` column is present.
- Bulk update/delete where clauses also filter out soft-deleted records by
  default.

To include soft-deleted records, pass `withDeleted: true` in options:

```typescript
const allIncludingDeleted = await service.find(context, {
  withDeleted: true,
});

const entity = await service.findOne(context, id, true, {
  withDeleted: true,
});
```

## Lifecycle Hooks

Override hooks for soft-delete-specific logic:

```typescript
@Injectable()
export class ProductsService extends CrudServiceFrom(productServiceStructure) {
  async beforeRemove(context, repository, entity) {
    // Validate before soft-delete
    const activeOrders = await this.orderRepo.count({
      where: { productId: entity.id, status: 'pending' },
    });
    if (activeOrders > 0) {
      throw new BadRequestException('Cannot delete product with pending orders');
    }
  }

  async afterRemove(context, repository, entity) {
    await this.auditService.log('SOFT_DELETED', entity.id, context.user.id);
    await this.cacheService.invalidate(`product:${entity.id}`);
    await this.searchService.removeFromIndex(entity.id);
  }

  async beforeHardRemove(context, repository, entity) {
    await this.backupService.createBackup(entity);
    await this.fileService.cleanupAttachments(entity.id);
  }

  async afterRecover(context, repository, entity) {
    await this.auditService.log('RECOVERED', entity.id, context.user.id);
    await this.searchService.addToIndex(entity);
    await this.cacheService.invalidate(`product:${entity.id}`);
  }
}
```

## Controller Endpoints

Enable soft-delete operations in your controller structure:

```typescript
const controllerStructure = CrudControllerStructure({
  ...serviceStructure,
  serviceType: ProductsService,
  operations: {
    findAll: true,
    findOne: true,
    remove: true,
    softRemove: true,
    hardRemove: true,
    recover: true,
    bulkRemove: true,
    bulkDelete: true,
    bulkRecover: true,
  },
});

@Controller('products')
export class ProductsController extends CrudControllerFrom(controllerStructure) {}
```

Generated REST endpoints:

| Method | Path | Operation |
|---|---|---|
| `DELETE` | `/products/:id` | remove (soft by default) |
| `DELETE` | `/products/:id/soft` | softRemove |
| `DELETE` | `/products/:id/hard` | hardRemove |
| `POST` | `/products/:id/recover` | recover |
| `POST` | `/products/bulk/remove` | bulkRemove |
| `DELETE` | `/products/bulk` | bulkDelete |
| `POST` | `/products/bulk/recover` | bulkRecover |

## GraphQL

Enable in the resolver structure:

```typescript
const resolverStructure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: ProductsService,
  operations: {
    findAll: true,
    findOne: true,
    remove: true,
    softRemove: true,
    hardRemove: true,
    recover: true,
    bulkRemove: true,
    bulkDelete: true,
    bulkRecover: true,
  },
});

@Resolver(() => Product)
export class ProductsResolver extends CrudResolverFrom(resolverStructure) {}
```

Example mutations:

```graphql
mutation {
  removeProduct(id: 1) {        # auto soft/hard
    id
    deletedAt
  }

  softRemoveProduct(id: 2) {   # explicit soft
    id
    deletedAt
  }

  hardRemoveProduct(id: 3) {   # permanent
    id
  }

  recoverProduct(id: 2) {      # restore
    id
    name
  }

  bulkRemoveProducts(where: { status: "inactive" }) {
    affected
  }

  bulkRecoverProducts(where: { deletedAt: { _gte: "2024-01-01" } }) {
    affected
  }
}
```

## Cascade Behavior

When related entities also have `deletedAt` columns, TypeORM's cascade settings
control whether soft/hard removes propagate:

```typescript
@Entity()
export class Product {
  @OneToMany(() => Order, order => order.product, { cascade: ['soft-remove'] })
  orders: Order[];
}
```

- `cascade: ['soft-remove']` — soft-deleting a product also soft-deletes its
  orders.
- `cascade: ['remove']` — only hard deletes cascade by default.
- Use `cascade: ['soft-remove', 'remove']` for both.

The framework respects TypeORM cascade behavior. Hooks fire for each cascaded
entity.

## Configuration via functions

Customize individual operation behavior:

```typescript
functions: {
  remove: {
    transactional: true,
    decorators: [() => UseGuards(OwnerGuard)],
  },
  hardRemove: {
    transactional: true,
    decorators: [() => UseGuards(AdminGuard)],
  },
  recover: {
    transactional: true,
  },
  bulkRemove: {
    transactional: true,
    isolationLevel: 'READ_COMMITTED',
  },
}
```
