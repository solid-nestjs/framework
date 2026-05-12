# Example Apps

The `apps-examples/` directory contains six reference applications demonstrating the SOLID NestJS Framework. All examples use TypeORM with SQLite by default unless noted otherwise.

**Source:** `apps-examples/` in the repository root.

## Overview

| Example | Type | Key Concepts |
|---|---|---|
| [simple-crud-app](#simple-crud-app) | REST | Basic CRUD, auto-generated controllers, Swagger |
| [simple-graphql-crud-app](#simple-graphql-crud-app) | GraphQL | GraphQL resolvers, Apollo, schema generation |
| [simple-hybrid-crud-app](#simple-hybrid-crud-app) | REST + GraphQL | Dual APIs, shared service layer, plugins |
| [advanced-crud-app](#advanced-crud-app) | REST | Soft delete, bulk ops, event hooks, complex relations |
| [advanced-hybrid-crud-app](#advanced-hybrid-crud-app) | REST + GraphQL | Multi-DB, soft delete + recovery, 102 e2e tests |
| [composite-key-graphql-app](#composite-key-graphql-app) | GraphQL | Composite primary keys, auto-increment |

All examples ship with e2e tests in their `test/` directories. Run them with `npm run test:e2e -w apps-examples/<name>`.

---

## simple-crud-app

Basic REST CRUD application with Products and Suppliers entities. Demonstrates `CrudServiceStructure()` + `CrudServiceFrom()` for auto-generated services, `CrudControllerStructure()` + `CrudControllerFrom()` for auto-generated REST endpoints, advanced filtering (`_contains`, `_gte`, `_lte`), pagination, and Swagger documentation.

**Run:**
```bash
npm run start:dev -w apps-examples/simple-crud-app
```

**Source:** [`apps-examples/simple-crud-app/`](../apps-examples/simple-crud-app/)

**API docs:** `http://localhost:3000/api`

**What to learn:**
- Setting up your first service and controller with framework mixins
- Defining entity types, DTOs, and find args
- Configuring relation eager-loading
- Using REST query parameters for filtering, pagination, and sorting

---

## simple-graphql-crud-app

GraphQL CRUD application with Products and Suppliers resolvers. Uses `CrudResolverStructure()` + `CrudResolverFrom()` to auto-generate queries and mutations from a shared service structure. Entities are decorated with both TypeORM and `@nestjs/graphql` decorators (`@ObjectType`, `@Field`). Includes Apollo server and GraphQL Playground.

**Run:**
```bash
npm run start:dev -w apps-examples/simple-graphql-crud-app
```

**Source:** [`apps-examples/simple-graphql-crud-app/`](../apps-examples/simple-graphql-crud-app/)

**Playground:** `http://localhost:3000/graphql`

**What to learn:**
- Building GraphQL-only applications with the framework
- Decorating entities for GraphQL schema generation
- Type-safe filtering via GraphQL arguments
- Nested relation queries in GraphQL

---

## simple-hybrid-crud-app

Combined REST + GraphQL CRUD application. A single `CrudServiceStructure()` powers both a REST controller and a GraphQL resolver. Entities carry dual decorators (`@ApiProperty` for Swagger, `@Field` for GraphQL). Includes a **hello-world plugin example** demonstrating the framework's plugin system with service, controller, and resolver plugins.

**Run:**
```bash
npm run start:dev -w apps-examples/simple-hybrid-crud-app
```

**Source:** [`apps-examples/simple-hybrid-crud-app/`](../apps-examples/simple-hybrid-crud-app/)

**REST docs:** `http://localhost:3000/api` · **GraphQL:** `http://localhost:3000/graphql`

**What to learn:**
- Building hybrid REST + GraphQL APIs from a single service structure
- Writing and applying framework plugins (service, controller, resolver)
- Dual decorator patterns on entities and DTOs
- Sharing filtering, validation, and business logic across API types

---

## advanced-crud-app

Advanced REST CRUD application featuring soft deletion, bulk operations, event hooks, and complex entity relationships across four entities: Products, Suppliers, Invoices, and InvoiceDetails. The InvoiceService demonstrates `beforeCreate`/`beforeUpdate` hooks for cross-entity validation and automatic total calculation. The SuppliersController adds custom bulk endpoints (`bulk-insert`, `bulk-update-email-by-name`, `bulk-delete-by-email`).

**Run:**
```bash
npm run start:dev -w apps-examples/advanced-crud-app
```

**Source:** [`apps-examples/advanced-crud-app/`](../apps-examples/advanced-crud-app/)

**API docs:** `http://localhost:3000/api`

**What to learn:**
- Overriding event hooks (`beforeCreate`, `beforeUpdate`, `beforeRemove`)
- Soft deletion with cascade behavior
- Service-level bulk operations (`bulkInsert`, `bulkUpdate`, `bulkDelete`)
- Custom controller endpoints on top of generated CRUD
- One-to-many relationships with TypeORM cascade options

---

## advanced-hybrid-crud-app

The most comprehensive example. Combines REST and GraphQL with multi-database support (SQLite, PostgreSQL, MySQL, SQL Server via Docker), soft deletion with recovery endpoints, bulk operations via both REST and GraphQL, and event hooks that work identically across API types. Includes 102 E2E tests (97 passing on enterprise DBs). Docker Compose configuration provided for all server databases.

**Run:**
```bash
# Default (SQLite)
npm run start:dev -w apps-examples/advanced-hybrid-crud-app

# With PostgreSQL
docker-compose -f apps-examples/advanced-hybrid-crud-app/docker-compose.yml up -d postgres
DB_TYPE=postgres npm run start:dev -w apps-examples/advanced-hybrid-crud-app
```

**Source:** [`apps-examples/advanced-hybrid-crud-app/`](../apps-examples/advanced-hybrid-crud-app/)

**REST docs:** `http://localhost:3000/api` · **GraphQL:** `http://localhost:3000/graphql`

**What to learn:**
- Full soft delete lifecycle: soft remove, recover, hard remove (REST + GraphQL)
- Bulk remove/recover/delete operations
- Switching databases via environment variables
- Running cross-database E2E test suites
- Event hooks working transparently across REST and GraphQL

---

## composite-key-graphql-app

GraphQL CRUD application using composite primary keys (`{ type, code }`) instead of single-column IDs. Products and Suppliers each have a two-field primary key where `type` is user-provided and `code` is auto-generated via the `@AutoIncrement<T>('code')` decorator. The GraphQL schema represents composite keys as input/object types with nested fields.

**Run:**
```bash
npm run start:dev -w apps-examples/composite-key-graphql-app
```

**Source:** [`apps-examples/composite-key-graphql-app/`](../apps-examples/composite-key-graphql-app/)

**Playground:** `http://localhost:3000/graphql`

**What to learn:**
- Defining composite primary key classes (`@InputType`, `@ObjectType`)
- Using the `@AutoIncrement<T>()` decorator for automatic key generation
- Foreign key relationships across composite-key entities
- GraphQL queries and mutations with multi-field IDs
- Real-world use cases: multi-tenant IDs, product catalogs, time-series data
