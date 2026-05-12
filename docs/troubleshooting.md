# Troubleshooting Guide

Practical solutions for common issues when using the SOLID NestJS Framework.

## Table of Contents

- [Installation & Setup](#installation--setup)
- [TypeScript Compilation Errors](#typescript-compilation-errors)
- [Runtime Errors](#runtime-errors)
- [Database Issues](#database-issues)
- [Performance](#performance)
- [Debug Mode](#debug-mode)
- [Getting Help](#getting-help)

## Installation & Setup

### Package installation fails with peer dependency errors

```
npm ERR! peer dep missing: @nestjs/common@^8.0.0
```

**Solution:** Install compatible NestJS first, then add SOLID packages.

```bash
npm install @nestjs/common@^10.0.0 @nestjs/core@^10.0.0
npm install @solid-nestjs/common @solid-nestjs/typeorm @solid-nestjs/rest-api
```

### Cannot find module '@solid-nestjs/...' after install

```
error TS2307: Cannot find module '@solid-nestjs/common'
```

**Solution:** Clean-install and build core packages.

```bash
rm -rf node_modules package-lock.json
npm install && npm install typescript@^5.0.0 --save-dev
npm run build -w packages-core/common
```

### Decorator metadata broken / tsconfig missing settings

```
Error: Reflect.getMetadata is not a function
error TS1219: Experimental support for decorators...
```

**Solution:** Install `reflect-metadata`, import it first in main.ts, and enable decorators in tsconfig.

```bash
npm install reflect-metadata
```

```typescript
// main.ts — must be the very first import
import 'reflect-metadata';
```

```json
// tsconfig.json
{ "compilerOptions": { "experimentalDecorators": true, "emitDecoratorMetadata": true } }
```

## TypeScript Compilation Errors

### Generic type mismatch on CrudServiceFrom

```
Error: Type 'unknown' is not assignable to type 'Product'
```

**Solution:** Ensure `entityType` is set in the structure, with all DTO types provided.

```typescript
export const serviceStructure = CrudServiceStructure({
  entityType: Product,
  createInputType: CreateProductDto,
  updateInputType: UpdateProductDto,
  findArgsType: FindProductArgs,
});
```

### Decorator type mismatch in controller structure

```
Error: Type '() => any' is not assignable to type 'MethodDecorator'
```

**Solution:** Wrap decorators in factory functions (arrow functions) in structure definitions.

```typescript
operations: { create: { decorators: [() => UseGuards(JwtAuthGuard)] } }
```

## Runtime Errors

### Decorator adapter not available (Swagger/GraphQL metadata missing)

Entities lack Swagger or GraphQL metadata because the adapter was not imported.

**Solution:** Import the adapter side-effect module before bootstrapping.

```typescript
// REST/Swagger: import '@solid-nestjs/rest-api';
// GraphQL:      import '@solid-nestjs/graphql';
// Hybrid:       import '@solid-nestjs/rest-api'; import '@solid-nestjs/graphql';
```

Verify at runtime:

```typescript
import { DecoratorRegistry } from '@solid-nestjs/common';
console.log(DecoratorRegistry.getRegisteredAdapters());
// ['typeorm', 'swagger'] (REST) or ['typeorm', 'graphql'] (GraphQL)
```

### Repository for entity not found

```
Error: Repository for "Product" not found
```

**Solution:** Register the entity in the module's TypeORM imports.

```typescript
@Module({ imports: [TypeOrmModule.forFeature([Product])] })
export class ProductsModule {}
```

### Circular dependency prevents service creation

```
Error: Nest cannot create the ProductsService instance.
```

**Solution:** Use `forwardRef()` to break the cycle.

```typescript
@Module({
  imports: [forwardRef(() => SuppliersModule)],
  exports: [ProductsService],
})
export class ProductsModule {}

// In constructor:
constructor(@Inject(forwardRef(() => SuppliersService)) private supp: SuppliersService) {}
```

### Method not found on service / Swagger name errors

```
Error: Cannot read property 'findAll' of undefined
Error: Cannot read property 'name' of undefined (Swagger)
```

**Solution:** Verify `serviceType` matches the service class, and DTOs have `@ApiProperty()` decorators.

```typescript
const controllerStructure = CrudControllerStructure({ serviceType: ProductsService });
```

### Validation not working on inputs

**Solution:** Register `ValidationPipe` globally and add `class-validator` decorators to DTOs.

```typescript
// main.ts
app.useGlobalPipes(new ValidationPipe({ transform: true }));

// DTO
export class CreateProductDto {
  @IsString() @IsNotEmpty() name: string;
  @IsNumber() @IsPositive() price: number;
}
```

## Database Issues

### Connection refused

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:** Verify the database is running and connection config matches. Use env vars for credentials.

### Table already exists on startup

```
Error: Table 'products' already exists
```

**Solution:** Disable `synchronize` in production, use migrations instead.

```typescript
TypeOrmModule.forRoot({ synchronize: false, migrationsRun: true, migrations: ['dist/migrations/*.js'] });
```

### SQLite-specific issues

Avoid `enum` and `jsonb` column types — use `text`, `integer`, `real`. SQLite ignores most type constraints.

### PostgreSQL/SQL Server/MySQL: camelCase column quirks

TypeORM bulk operations with camelCase columns behave inconsistently across databases. The E2E suite passes 102/102 on SQLite and 97/102 on PostgreSQL, SQL Server, and MySQL. Use `snake_case` column names for cross-database compatibility.

### Deadlock on concurrent writes

```
Error: deadlock detected
```

**Solution:** Use consistent operation ordering and lock modes.

```typescript
export const serviceStructure = CrudServiceStructure({
  lockMode: 'pessimistic_read',
  functions: { update: { lockMode: 'pessimistic_write', isolationLevel: 'READ_COMMITTED' } },
});
```

## Performance

### Slow startup

- Keep `synchronize: false` in production (it scans all entities on boot).
- Don't import unnecessary adapters (e.g., `@solid-nestjs/graphql` in REST-only apps).
- Avoid `SOLID_DEBUG=true` in production.

### N+1 queries

Configure eager loading or pass `relations` per query:

```typescript
export const serviceStructure = CrudServiceStructure({
  relationsConfig: { relations: { supplier: true } },
});
// or: await service.findAll(context, { relations: ['supplier'] });
```

### Large datasets

Always use pagination. REST: `?pagination={"page":1,"limit":20}`. GraphQL: `products(pagination: { page: 1, limit: 20 })`.

## Debug Mode

Set `SOLID_DEBUG=true` to enable verbose adapter registration logging (also active when `NODE_ENV=development`).

```bash
SOLID_DEBUG=true npm run start:dev
```

Output shows which adapters register and apply to each field:

```
[SolidNestJS] Adapter 'graphql' not available, skipping registration
[SolidNestJS] Registered adapter: typeorm
[SolidNestJS] Applied adapter 'typeorm' to Product.name
```

This helps diagnose missing imports, missing peer deps, and skipped fields.

Programmatic access:

```typescript
import { DecoratorRegistry } from '@solid-nestjs/common';
DecoratorRegistry.setDebugMode(true);
console.log(DecoratorRegistry.getStats());
// { totalAdapters: 2, availableAdapters: ['typeorm', 'swagger'], unavailableAdapters: [] }
```

Enable TypeORM SQL logging for query debugging:

```typescript
TypeOrmModule.forRoot({ logging: ['query', 'error'] });
```

## Getting Help

1. **Enable debug mode** — `SOLID_DEBUG=true` surfaces adapter issues.
2. **Check the docs** — Review other guides in this directory.
3. **Study the example apps** — `apps-examples/` covers REST, GraphQL, hybrid, composite keys, and advanced CRUD.
4. **Search GitHub issues** — Look for similar problems before opening a new one.
5. **Create a minimal reproduction** — Isolate the problem in a small test case.

When opening an issue, include: framework version, NestJS/TypeScript versions, full error + stack trace, minimal reproduction code, and steps to reproduce.
