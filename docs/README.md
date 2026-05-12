# SOLID NestJS Framework Documentation

Welcome to the SOLID NestJS Framework — a productivity layer on top of NestJS that eliminates boilerplate by unifying TypeORM, Swagger/OpenAPI, GraphQL, and validation decorators through a single set of `@Solid*` decorators, and generates full CRUD APIs via mixin-based factories.

## How to Use This Documentation

Start with the [Getting Started guide](getting-started.md) to install the framework and build your first CRUD endpoint in minutes. After that, explore the Core Concepts to understand decorators and architecture, then dive into feature-specific docs as you need them. Each document is self-contained and cross-references related topics.

---

## Getting Started

- [Getting Started](getting-started.md) — Installation, quick start, and first CRUD endpoint

## Core Concepts

- [Architecture](architecture.md) — Package structure, adapters, and decorator pipeline
- [SOLID Decorators](solid-decorators.md) — `@SolidEntity`, `@SolidField`, `@SolidId`, `@SolidRelation` and more
- [Validation](validation.md) — Automatic class-validator inference and custom rules

## Features

- [CRUD Operations](crud-operations.md) — Mixin-based service, controller, and resolver generation
- [Querying](querying.md) — Filtering (`Where`), sorting (`OrderBy`), and pagination
- [Group By](group-by.md) — Aggregation queries with `GROUP BY` support
- [Bulk Operations](bulk-operations.md) — `bulkInsert`, `bulkUpdate`, `bulkDelete`, `bulkRemove`, `bulkRecover`
- [Soft Delete](soft-delete.md) — Soft delete, recovery, and hard remove patterns
- [DTO Generation](dto-generation.md) — Auto-generating input types and args DTOs from entities
- [GraphQL](graphql.md) — `CrudResolverFrom`, args helpers, and GraphQL-specific features
- [REST API](rest-api.md) — `CrudControllerFrom`, Swagger integration, and REST patterns
- [Hybrid](hybrid.md) — Combining REST and GraphQL in a single application

## Advanced

- [Context & Transactions](context-transactions.md) — Context pattern, `@Transactional`, and lifecycle hooks
- [Plugins](plugins.md) — Extending services, controllers, and resolvers with plugin hooks

## Database

- [Database](database.md) — Multi-database support, TypeORM configuration, and seeders

## Reference

- [API Reference](api-reference.md) — Complete API surface and type signatures

## Guides

- [Migration](migration.md) — Migrating from raw NestJS/TypeORM to SOLID NestJS
- [Troubleshooting](troubleshooting.md) — Common issues and solutions
- [Examples](examples.md) — Example apps and real-world patterns

## CLI

- [CLI](cli/README.md) — The `snest` command-line tool for scaffolding and code generation

---

[GitHub Repository](https://github.com/anomalyco/solid-nestjs)
