# DTO Generation

The SOLID NestJS Framework provides two complementary approaches to DTO generation, eliminating boilerplate and ensuring type safety across entity-based and filter/query operations.

## Approach 1: Entity-to-DTO with `GenerateDtoFromEntity`

Generates input/output DTOs directly from TypeORM entity classes. Picks properties, transfers decorators, and auto-infers validation.

### Basic Usage

```typescript
import { GenerateDtoFromEntity } from '@solid-nestjs/typeorm-crud';
import { Product } from '../entities/product.entity';

// Default: auto-selects all primitive (flat) properties,
// skipping system fields (id, createdAt, updatedAt, deletedAt) and relations
export class ProductResponseDto extends GenerateDtoFromEntity(Product) {}

// Explicit array selection
export class CreateProductDto extends GenerateDtoFromEntity(Product, [
  'name',
  'description',
  'price',
  'stock',
]) {}

// Object config with boolean toggles
export class UpdateProductDto extends GenerateDtoFromEntity(Product, {
  name: true,
  description: true,
  price: true,
  stock: true,
  id: false,
  supplier: false,
}) {}

// All three forms yield a class usable in controllers via @Body(), @Param(), etc.
```

### Package Variants

| Package | Import from | Decorators Applied |
|---|---|---|
| REST API | `@solid-nestjs/typeorm-crud` | `@ApiProperty` (Swagger) |
| GraphQL | `@solid-nestjs/typeorm-graphql-crud` | `@Field`, `@InputType` |
| Hybrid | `@solid-nestjs/typeorm-hybrid-crud` | Both Swagger + GraphQL |

```typescript
// GraphQL variant — adds an optional third parameter for the class decorator
@InputType()
export class CreateProductInput extends GenerateDtoFromEntity(Product, [
  'name', 'price',
], InputType) {}
```

### Automatic Validation Inference

The framework maps TypeScript types to `class-validator` decorators. If none are already present on the property, these are auto-applied:

| TypeScript Type | Auto-Applied |
|---|---|
| `string` | `@IsString()` + `@IsNotEmpty()` |
| `number` | `@IsNumber()` |
| `boolean` | `@IsBoolean()` |
| `Date` | `@IsDate()` |
| `string[]` | `@IsArray()` |
| `string?` (optional column) | `@IsOptional()` + `@IsString()` |

### System Field Exclusion

The default mode (no config) automatically excludes:
- `id`, `createdAt`, `updatedAt`, `deletedAt`
- Relational fields (`@ManyToOne`, `@OneToMany`, etc.)
- Complex objects

When using explicit array selection, system fields are allowed so you can explicitly include `id` for response DTOs.

### Custom Fields & Overrides

```typescript
export class CreateProductDto extends GenerateDtoFromEntity(Product, [
  'name', 'price', 'stock',
]) {
  // Override with custom validation
  @Min(0.01)
  @Max(999999.99)
  price: number;

  // Add fields not in the entity
  @IsUUID()
  categoryId: string;
}
```

### DTO Generation Best Practices

- Use default mode for read/response DTOs
- Use explicit array for create DTOs (whitelist what's allowed)
- Use boolean config for update DTOs (exclude id, relations)
- Add nested DTOs manually via `@ValidateNested()` + `@Type(() => NestedDto)`
- Run `app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));` for full enforcement

---

## Approach 2: Args Helpers for Filter, Sort & Group-By DTOs

When you need `where`, `orderBy`, and `groupBy` DTOs for query operations, manually writing every filter field is tedious. The args helpers generate these classes from the entity definition.

### Core Helpers

| Helper | Purpose | Signature |
|---|---|---|
| `createWhereFields(entity, config, options?)` | WHERE filter DTO | Returns a class with filter fields + `_and`/`_or` logical operators |
| `createOrderByFields(entity, config, options?)` | ORDER BY DTO | Returns a class with `OrderByTypes` enum fields |
| `createGroupByFields(entity, config, options?)` | GROUP BY field selection DTO | Returns a class with boolean toggles per field |
| `GroupByArgsFrom(config)` | Complete GroupBy args mixin | Mixes GroupBy fields + FindArgs into a single ArgsType |

### Before (Manual) vs After (Helper)

**Manual approach** — ~45 lines per filter class:

```typescript
class FindProductWhere {
  @ApiProperty({ required: false })
  @IsOptional() @ValidateNested()
  @Type(() => StringFilter)
  name?: StringFilter;

  @ApiProperty({ required: false })
  @IsOptional() @ValidateNested()
  @Type(() => NumberFilter)
  price?: NumberFilter;

  @ApiProperty({ required: false })
  @IsOptional() @ValidateNested()
  @Type(() => DateFilter)
  createdAt?: DateFilter;

  // ... repeat for every field
}
```

**Helper approach** — 8 lines:

```typescript
const ProductWhere = createWhereFields(
  Product,
  { name: true, price: true, createdAt: true },
  { name: 'FindProductWhere' },
);
```

Code reduction: **60-80% fewer lines**. All decorators (`@ApiProperty`, `@Field`, `@IsOptional`, `@ValidateNested`, `@Type`) are auto-applied.

### Where Config Options

```typescript
const ProductWhere = createWhereFields(Product, {
  name: true,                              // auto-infers StringFilter
  price: NumberFilter,                     // explicit filter type
  createdAt: {                             // full config object
    type: DateFilter,
    description: 'Filter by creation date',
  },
  supplier: getWhereClass(FindSupplierArgs), // reuse existing relation DTO
  rawValue: { isPlain: true, type: Number }, // plain type, not a filter
});
```

### Filter Type Auto-Inference

When using `fieldName: true`, the framework auto-infers:

| Entity Property Type | Inferred Filter |
|---|---|
| `string` | `StringFilter` |
| `number` | `NumberFilter` |
| `Date` | `DateFilter` |
| `boolean` | `BooleanFilter` |
| `enum` | `EnumFilter` |

### Package-Specific Variants

Each package exports its own version of the helpers, applying the right decorators:

```typescript
// REST API only — applies @ApiProperty
import { createWhereFields, createOrderByFields } from '@solid-nestjs/rest-api';

// GraphQL only — applies @Field, @InputType
import { createWhereFields, createOrderByFields } from '@solid-nestjs/graphql';

// Hybrid (REST + GraphQL) — applies both @ApiProperty and @Field
import { createWhereFields, createOrderByFields } from '@solid-nestjs/rest-graphql';
```

### Full FindArgs Example (GraphQL)

```typescript
import { ArgsType, Field } from '@nestjs/graphql';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import {
  createWhereFields,
  createOrderByFields,
  FindArgsMixin,
  getWhereClass,
  getOrderByClass,
} from '@solid-nestjs/graphql';
import { Product } from '../../entities/product.entity';

const ProductWhere = createWhereFields(Product, {
  name: true,
  price: true,
  stock: true,
  createdAt: true,
  supplier: getWhereClass(FindSupplierArgs),
}, { name: 'ProductWhereInput' });

const ProductOrderBy = createOrderByFields(Product, {
  name: true,
  price: true,
  createdAt: true,
  supplier: getOrderByClass(FindSupplierArgs),
}, { name: 'ProductOrderByInput' });

@ArgsType()
export class FindProductArgs extends FindArgsMixin(Product) {
  @Field(() => ProductWhere, { nullable: true })
  @IsOptional() @ValidateNested()
  @Type(() => ProductWhere)
  where?: InstanceType<typeof ProductWhere>;

  @Field(() => ProductOrderBy, { nullable: true })
  @IsOptional() @ValidateNested()
  @Type(() => ProductOrderBy)
  orderBy?: InstanceType<typeof ProductOrderBy>;
}
```

### GroupBy with GroupByArgsFrom

```typescript
const ProductGroupByFields = createGroupByFields(Product, {
  name: true,
  supplier: { name: true, contactEmail: true },
}, { name: 'ProductGroupByFields' });

@ArgsType()
export class GroupedProductArgs extends GroupByArgsFrom<Product>({
  findArgsType: FindProductArgs,
  groupByFieldsType: ProductGroupByFields,
  options: { name: 'GroupedProductArgs' },
}) {}
```

### Relation Handling: `getWhereClass` / `getOrderByClass`

Always use these utilities for relation references to avoid circular dependency issues:

```typescript
import { getWhereClass, getOrderByClass } from '@solid-nestjs/graphql';

// ✅ Reuses FindSupplierArgs' where class — safe, no circular refs
const ProductWhere = createWhereFields(Product, {
  supplier: getWhereClass(FindSupplierArgs),
});

// ❌ Direct reference can cause circular import issues
// supplier: FindSupplierWhere,
```

### Migration from Manual DTOs

1. Identify repetitive `@ApiProperty`/`@Field` + `@ValidateNested` + `@Type()` patterns
2. Import `createWhereFields` / `createOrderByFields` from the correct package
3. Replace the class definition with a helper call
4. Update references to use `InstanceType<typeof YourClass>` for types
5. Build and test: `npm run build && npm run test:e2e`

## Related Docs

- [REST API Features](./rest-api.md)
- [GraphQL Features](./graphql.md)
- [Hybrid REST + GraphQL](./hybrid.md)
