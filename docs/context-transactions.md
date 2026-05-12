# Context & Transactions

The Context pattern and `@Transactional()` decorator power request-scoped state and database transaction management in SOLID NestJS.

## Context

### Purpose

Every service method receives a `context` parameter — a typed bag for passing request-scoped data (auth, tenant, locale, audit info) through controllers, resolvers, and services without threading arguments manually.

### Context Interface

```typescript
import { Context } from '@solid-nestjs/common';

interface Context {}
```

The interface is intentionally minimal. Extend it for your application:

```typescript
interface AppContext extends Context {
  user?: { id: string; email: string; roles: string[] };
  tenantId?: string;
  locale?: string;
  requestId?: string;
}
```

### @CurrentContext() Decorator

Extracts the context in controller/resolver methods:

```typescript
import { CurrentContext } from '@solid-nestjs/common';

@Get()
async findAll(
  @CurrentContext() context: AppContext,
  @Query() args: FindProductArgs,
) {
  return this.service.findAll(context, args);
}
```

### Context Flow

```
HTTP Request → Controller → Service → Repository
      ↓            ↓           ↓          ↓
   Context  →   Context  →  Context  →  Context
```

## Transaction Management

### @Transactional() Decorator

Wraps a service method in a database transaction automatically. Uses `WrappedBy` under the hood. Provide an optional isolation level:

```typescript
import { Transactional } from '@solid-nestjs/typeorm';

@Transactional()
async transferFunds(context: Context, input: TransferDto): Promise<void> {
  await this.debit(context, input.from, input.amount);
  await this.credit(context, input.to, input.amount);
}

@Transactional({ isolationLevel: 'SERIALIZABLE' })
async processOrder(context: Context, order: OrderDto): Promise<Order> {
  // ...
}
```

### runInTransaction(context, dataSource, fn, isolationLevel?)

For manual transaction control:

```typescript
import { runInTransaction } from '@solid-nestjs/typeorm';
import { DataSource } from 'typeorm';

async complexOperation(
  context: Context,
  dataSource: DataSource,
): Promise<Result> {
  return runInTransaction(context, dataSource, async (txContext) => {
    await this.productService.create(txContext, product);
    await this.auditService.log(txContext, 'product-created');
    return { success: true };
  }, 'READ_COMMITTED');
}
```

If `context.transactionManager` already exists (nested call), `runInTransaction` reuses it — no new transaction is started.

### Transaction Isolation Levels

| Level | Description |
|---|---|
| `READ_UNCOMMITTED` | Dirty reads allowed |
| `READ_COMMITTED` | No dirty reads (default) |
| `REPEATABLE_READ` | Consistent reads within transaction |
| `SERIALIZABLE` | Full serialization |

Configure at operation level in service structure:

```typescript
const serviceStructure = CrudServiceStructure({
  entityType: Product,
  functions: {
    create: { transactional: true, isolationLevel: 'READ_COMMITTED' },
    update: { transactional: true, lockMode: 'pessimistic_write' },
  },
});
```

## Common Use Cases

### Authentication / User Context

```typescript
interface AuthContext extends Context {
  user?: { id: string; email: string; roles: string[] };
}

// Set in guard/middleware
context.user = { id: '123', email: 'u@ex.com', roles: ['admin'] };

// Use in service
async findUserProducts(context: AuthContext) {
  if (!context.user) throw new UnauthorizedException();
  return this.repository.findByUserId(context.user.id);
}
```

### Multi-Tenancy

```typescript
interface TenantContext extends Context {
  tenantId?: string;
}

async findAll(context: TenantContext, args: FindArgs) {
  return context.tenantId
    ? this.repo.find({ where: { tenantId: context.tenantId } })
    : this.repo.find();
}
```

### Internationalization / Locale

```typescript
interface I18nContext extends Context {
  locale?: string;
  timezone?: string;
}

async getLocalized(context: I18nContext) {
  const items = await this.repo.find();
  return items.map(i => ({
    ...i,
    name: this.i18n.translate(i.nameKey, context.locale),
  }));
}
```

### Audit Trail

```typescript
interface AuditContext extends Context {
  user?: { id: string };
  requestId?: string;
  ip?: string;
}

async update(context: AuditContext, id: string, data: UpdateDto) {
  const old = await this.findOne(context, id);
  const updated = await super.update(context, id, data);
  await this.audit.log(context, 'UPDATE', id, this.diff(old, updated));
  return updated;
}
```

### Fiscal Year

```typescript
interface FiscalContext extends Context {
  fiscalYear?: number;
}

async findInvoices(context: FiscalContext) {
  return this.repo.find({
    where: { year: context.fiscalYear },
  });
}
```

## Best Practices

1. **Typed contexts** — Extend `Context` rather than using `any`.
2. **Validate required fields** — Check `context.user`, `context.tenantId`, etc., at method entry.
3. **Context middleware** — Populate common fields (`requestId`, `ip`, `locale`) in a NestJS middleware, not per-endpoint.
4. **Extend context** — Compose feature-specific interfaces (e.g., `AppContext extends AuthContext, TenantContext`).
5. **Reuse existing transactions** — `runInTransaction` detects an active transaction manager; remove `context.transactionManager` if you want a new nested transaction.
