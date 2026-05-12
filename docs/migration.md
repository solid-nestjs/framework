# Migration Guide

Migrating between SOLID NestJS versions and from other CRUD frameworks.

## From @nestjsx/crud

### Key Differences

| Aspect | @nestjsx/crud | SOLID NestJS |
|---|---|---|
| Architecture | Decorator-based (`@Crud(...)`) | Mixin-based (`CrudControllerFrom(...)`) |
| Composition | Inheritance | Composition over inheritance |
| Config | Decorator options | Typed structure objects |
| Type safety | Limited | Full generic inference |

### Step 1: Replace Dependencies

```bash
npm uninstall @nestjsx/crud @nestjsx/crud-typeorm
npm install @solid-nestjs/common @solid-nestjs/typeorm @solid-nestjs/rest-api
```

### Step 2: Convert Service

```typescript
// Before: @nestjsx/crud
@Injectable()
export class ProductsService extends TypeOrmCrudService<Product> {
  constructor(@InjectRepository(Product) repo) { super(repo); }
}

// After: SOLID NestJS
const structure = CrudServiceStructure({
  entityType: Product,
  createInputType: CreateProductDto,
  updateInputType: UpdateProductDto,
  findArgsType: FindProductArgs,
});

@Injectable()
export class ProductsService extends CrudServiceFrom(structure) {}
```

### Step 3: Convert Controller

```typescript
// Before: @nestjsx/crud
@Crud({ model: { type: Product }, dto: { create: Create, update: Update } })
@Controller('products')
export class ProductsController implements CrudController<Product> {
  constructor(public service: ProductsService) {}
}

// After
const ctrlStructure = CrudControllerStructure({
  ...structure,
  serviceType: ProductsService,
});

@Controller('products')
export class ProductsController extends CrudControllerFrom(ctrlStructure) {}
```

### Step 4: Update Query Syntax

```typescript
// Before: @nestjsx/crud
// GET /products?filter=name||$cont||laptop&join=supplier

// After: SOLID NestJS
// GET /products?filter={"name":{"$like":"%laptop%"}}&relations=["supplier"]
```

---

## From Raw NestJS (Manual CRUD)

### Service Migration

Replace manual repository methods with mixin composition:

```typescript
// Before
@Injectable()
export class ProductsService {
  constructor(@InjectRepository(Product) private repo: Repository<Product>) {}

  async findAll(): Promise<Product[]> { return this.repo.find(); }
  async findOne(id: string): Promise<Product> { return this.repo.findOne({ where: { id } }); }
  async create(dto: CreateDto): Promise<Product> { return this.repo.save(this.repo.create(dto)); }
  async update(id: string, dto: UpdateDto): Promise<Product> {
    await this.repo.update(id, dto);
    return this.findOne(id);
  }
  async remove(id: string): Promise<void> { await this.repo.delete(id); }
}

// After
const structure = CrudServiceStructure({
  entityType: Product,
  createInputType: CreateProductDto,
  updateInputType: UpdateProductDto,
  findArgsType: FindProductArgs,
});

@Injectable()
export class ProductsService extends CrudServiceFrom(structure) {
  // Add custom methods only
  async findByCategory(context: Context, categoryId: string) {
    return this.findAll(context, { where: { category: { id: categoryId } } });
  }
}
```

### Controller Migration

Replace manual routes:

```typescript
// Before: ~40 lines of @Get/@Post/@Patch/@Delete

// After: single mixin + optional custom endpoints
const ctrlStructure = CrudControllerStructure({
  ...structure,
  serviceType: ProductsService,
});

@Controller('products')
export class ProductsController extends CrudControllerFrom(ctrlStructure) {
  @Get('category/:id')
  async byCategory(@CurrentContext() ctx: Context, @Param('id') id: string) {
    return this.service.findByCategory(ctx, id);
  }
}
```

---

## Version Migration: v0.1.x → v0.2.x

### Breaking Changes

| Area | v0.1.x | v0.2.x |
|---|---|---|
| Mixin names | `CrudService(...)` | `CrudServiceFrom(...)` |
| Config property | `entity` | `entityType` |
| Config property | `createDto` | `createInputType` |
| Config property | `updateDto` | `updateInputType` |
| Config property | `findArgs` | `findArgsType` |
| Config function | Manual object | `CrudServiceStructure(config)` |
| Relations | `relations: ['a', 'b']` | `relationsConfig: { relations: { a: true, b: true } }` |
| Package | `@solid-nestjs/crud` | `@solid-nestjs/typeorm` |
| Package | `@solid-nestjs/crud` | `@solid-nestjs/rest-api` (controllers) |

### Migration Steps

**1. Update Dependencies**

```bash
npm uninstall @solid-nestjs/crud
npm install @solid-nestjs/common @solid-nestjs/typeorm @solid-nestjs/rest-api
```

**2. Update Imports**

```typescript
// Before
import { CrudService } from '@solid-nestjs/crud';
import { CrudController } from '@solid-nestjs/crud';

// After
import { CrudServiceFrom, CrudServiceStructure } from '@solid-nestjs/typeorm';
import { CrudControllerFrom, CrudControllerStructure } from '@solid-nestjs/rest-api';
```

**3. Migrate Service Configuration**

```typescript
// Before
export class ProductsService extends CrudService({
  entity: Product,
  createDto: CreateProductDto,
  updateDto: UpdateProductDto,
  findArgs: FindProductArgs,
  relations: ['supplier'],
}) {}

// After
const structure = CrudServiceStructure({
  entityType: Product,
  createInputType: CreateProductDto,
  updateInputType: UpdateProductDto,
  findArgsType: FindProductArgs,
  relationsConfig: { relations: { supplier: true } },
});

export class ProductsService extends CrudServiceFrom(structure) {}
```

**4. Migrate Controller Configuration**

```typescript
// Before
export class ProductsController extends CrudController({
  service: ProductsService, entity: Product,
  createDto: CreateProductDto, updateDto: UpdateProductDto,
  findArgs: FindProductArgs,
}) {}

// After
const ctrlStructure = CrudControllerStructure({
  ...structure,
  serviceType: ProductsService,
});

export class ProductsController extends CrudControllerFrom(ctrlStructure) {}
```

---

## Migration Checklist

- [ ] Replace package dependencies
- [ ] Update imports across all services, controllers, resolvers
- [ ] Convert config objects to structure builders (`CrudServiceStructure`, `CrudControllerStructure`)
- [ ] Rename mixin calls (`CrudService` → `CrudServiceFrom`)
- [ ] Update property names (`entity` → `entityType`, `createDto` → `createInputType`, etc.)
- [ ] Convert relations from arrays to `relationsConfig` objects
- [ ] Add `Context` parameter to all custom service methods
- [ ] Run `npm run build` — fix TypeScript errors
- [ ] Run `npm run test` — verify all tests pass
- [ ] Update API docs / Swagger annotations
- [ ] Create a git branch and backup before starting

## Automated Migration Script (v0.1.x → v0.2.x)

```typescript
import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

const files = glob.sync('src/**/*.ts');

for (const file of files) {
  let content = readFileSync(file, 'utf8');

  content = content
    .replace(/from '@solid-nestjs\/crud'/g, "from '@solid-nestjs/typeorm'")
    .replace(/CrudService\(/g, 'CrudServiceFrom(CrudServiceStructure(')
    .replace(/CrudController\(/g, 'CrudControllerFrom(CrudControllerStructure(')
    .replace(/\bentity:/g, 'entityType:')
    .replace(/\bcreateDto:/g, 'createInputType:')
    .replace(/\bupdateDto:/g, 'updateInputType:')
    .replace(/\bfindArgs:/g, 'findArgsType:');

  writeFileSync(file, content);
}

console.log('Migration completed. Review changes and run npm run build.');
```
