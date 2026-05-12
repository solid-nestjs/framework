# Querying — Filtering, Sorting & Pagination

The framework uses the `Where<T>`, `OrderBy<T>`, and `PaginationRequest` types to
build type-safe queries. These are consumed by `FindArgs<T>` DTOs and passed to
`findAll`, `pagination`, and `findAllGrouped`.

## FindArgs<T>

The unified query input:

```typescript
export interface FindArgs<T> {
  pagination?: PaginationRequest;
  where?: Where<T>;
  orderBy?: OrderBy<T> | OrderBy<T>[];
}

// Usage DTO
export class FindProductArgs implements FindArgs<Product> {
  pagination?: PaginationRequest;
  where?: Where<Product>;
  orderBy?: OrderBy<Product> | OrderBy<Product>[];
}
```

## Where<T> — Flexible Filters

`Where<T>` maps each entity field to a filter type. You can pass raw values or
use filter objects for operators.

### String Filters

Direct value matching:

```typescript
where: { name: 'Widget' }           // exact match
where: { name: ['A', 'B'] }         // IN (...)
```

Operator object via `StringFilter`:

```typescript
where: {
  name: {
    _eq: 'Widget',
    _neq: 'Gadget',
    _in: ['Widget', 'Gadget'],
    _startswith: 'Wi',
    _endswith: 'get',
    _contains: 'idg',
    _like: '%idg%',
    _notstartswith: 'Ga',
    _notendswith: 'foo',
    _notcontains: 'xyz',
    _notlike: '%bad%',
  }
}
```

### Number Filters

```typescript
where: {
  price: 29.99,
  stock: [10, 20, 30],              // IN
  rating: {
    _eq: 5,
    _neq: 0,
    _gt: 10,
    _gte: 10,
    _lt: 100,
    _lte: 100,
    _in: [10, 20, 30],
    _between: [10, 50],
    _notbetween: [100, 200],
  }
}
```

### Date Filters

```typescript
where: {
  createdAt: {
    _eq: new Date('2024-01-01'),
    _gt: new Date('2024-01-01'),
    _gte: new Date('2024-01-01'),
    _lt: new Date('2024-12-31'),
    _lte: new Date('2024-12-31'),
    _in: [new Date('2024-01-01'), new Date('2024-06-01')],
    _between: [new Date('2024-01-01'), new Date('2024-12-31')],
    _notbetween: [new Date('2025-01-01'), new Date('2025-12-31')],
  }
}
```

### Boolean Filters

Boolean fields only support direct value:

```typescript
where: { active: true }
where: { featured: false }
```

## Logical Operators

Combine conditions with `_and` / `_or`:

```typescript
where: {
  _and: [
    { price: { _gt: 10 } },
    { price: { _lt: 100 } },
  ],
  _or: [
    { category: { name: 'Electronics' } },
    { category: { name: 'Books' } },
  ],
}
```

Nested logical operators:

```typescript
where: {
  _and: [
    { active: true },
    {
      _or: [
        { price: { _lt: 20 } },
        { featured: true },
      ],
    },
  ],
}
```

Both `_and` and `_or` accept a single object or an array.

## Nested Relation Filtering

Filter through relations using the `Where<T>` nesting:

```typescript
where: {
  supplier: {
    name: { _eq: 'Acme Corp' },
    country: { _in: ['US', 'CA'] },
  },
  category: {
    name: 'Electronics',
    active: true,
  },
}
```

## OrderBy<T>

Sort results by entity fields or nested relation fields. Values use
`OrderByTypes` enum: `ASC` or `DESC`.

```typescript
// Single field
orderBy: { name: 'ASC' }

// Multiple fields
orderBy: [
  { category: { name: 'ASC' } },
  { price: 'DESC' },
]

// Nested relation ordering
orderBy: {
  supplier: { name: 'ASC' },
  createdAt: 'DESC',
}
```

## Pagination

### PaginationRequest

```typescript
pagination: {
  page: 1,     // 1-based page number
  limit: 20,   // items per page
}
```

Alternative syntax (skip/take):

```typescript
pagination: {
  skip: 0,     // offset
  take: 20,    // limit
}
```

### PaginationResult

```typescript
{
  total: 250,          // total matching records
  count: 20,           // records on current page
  limit: 20,           // limit used
  page: 1,             // current page
  pageCount: 13,       // total pages
  hasNextPage: true,
  hasPreviousPage: false,
}
```

## Service Query Examples

### findAll with all three axes

```typescript
const result = await service.findAll(context, {
  where: {
    active: true,
    price: { _between: [10, 100] },
    category: { name: { _in: ['Electronics', 'Books'] } },
  },
  orderBy: [
    { price: 'ASC' },
    { createdAt: 'DESC' },
  ],
  pagination: { page: 1, limit: 25 },
}, true);

// result.data       → Product[]
// result.pagination → PaginationResult
```

### pagination (count only)

```typescript
const meta = await service.pagination(context, {
  where: { active: true },
  pagination: { page: 1, limit: 25 },
});
```

### findOneBy (non-primary-key lookup)

```typescript
const user = await service.findOneBy(context, {
  email: 'admin@example.com',
}, true); // throws if not found
```

### find with raw TypeORM options

```typescript
const products = await service.find(context, {
  where: { status: 'published' },
  relations: { supplier: true },
  order: { createdAt: 'DESC' },
  skip: 0,
  take: 10,
});
```

## REST API Queries

Filter/sort/paginate via query parameters. The framework auto-parses JSON-encoded query strings:

```
GET /products?where={"price":{"_gt":10},"active":true}&orderBy=[{"createdAt":"DESC"}]&pagination={"page":1,"limit":20}
```

## GraphQL Queries

Define your `FindArgs` as a GraphQL input type:

```graphql
query {
  products(
    where: { price: { _gt: 10 }, active: true }
    orderBy: [{ createdAt: DESC }]
    pagination: { page: 1, limit: 20 }
  ) {
    data {
      id
      name
      price
      supplier { name }
    }
    pagination {
      total
      page
      pageCount
    }
  }
}
```

## Type Reference

| Type | Description |
|---|---|
| `StringFilter` | `_eq`, `_neq`, `_in`, `_startswith`, `_notstartswith`, `_endswith`, `_notendswith`, `_contains`, `_notcontains`, `_like`, `_notlike` |
| `NumberFilter` | `_eq`, `_neq`, `_gt`, `_gte`, `_lt`, `_lte`, `_in`, `_between`, `_notbetween` |
| `DateFilter` | `_eq`, `_neq`, `_gt`, `_gte`, `_lt`, `_lte`, `_in`, `_between`, `_notbetween` |
| `Where<T>` | Maps fields → `WhereField<T>`, plus `_and` / `_or` |
| `OrderBy<T>` | Maps fields → `ASC` / `DESC` or nested `OrderBy` |
| `PaginationRequest` | `page`/`limit` or `skip`/`take` |
| `PaginationResult` | `total`, `count`, `limit`, `page`, `pageCount`, `hasNextPage`, `hasPreviousPage` |
| `FindArgs<T>` | `{ pagination?, where?, orderBy? }` |
