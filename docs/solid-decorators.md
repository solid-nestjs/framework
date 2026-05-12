# SOLID Decorators Reference

Unified decorators that apply TypeORM, GraphQL, Swagger, and validation decorators from a single declaration — reducing boilerplate by 70-80%.

## Core Concept

Traditional NestJS entities need 4+ decorators per field (`@Column`, `@Field`, `@ApiProperty`, `@IsString`). SOLID decorators replace this with a **plugin adapter architecture**: one decorator, multiple adapters auto-apply technology-specific annotations based on installed packages.

```typescript
// BEFORE: ~40 lines, 10+ decorators
@ObjectType() @Entity()
export class Product {
  @ApiProperty({ description: 'Product ID', format: 'uuid' })
  @Field(() => ID, { description: 'Product ID' })
  @PrimaryGeneratedColumn('uuid') @IsUUID()
  id: string;

  @ApiProperty({ description: 'Name', maxLength: 100 })
  @Field({ description: 'Name' })
  @Column({ length: 100 }) @IsString() @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Price', minimum: 0 })
  @Field(() => Float, { description: 'Price' })
  @Column('decimal', { precision: 10, scale: 2 }) @IsNumber() @Min(0)
  price: number;
}

// AFTER: ~15 lines, 1 decorator per field
@SolidEntity()
export class Product {
  @SolidId({ generated: 'uuid', description: 'Product ID' })
  id: string;

  @SolidField({ description: 'Name', maxLength: 100 })
  name: string;

  @SolidField({ description: 'Price', precision: 10, scale: 2, min: 0 })
  price: number;
}
```

## Adapter System

Four adapters auto-register when their packages are installed:

| Adapter | Required Package | What it applies |
|---|---|---|
| TypeORM | `typeorm`, `@nestjs/typeorm` | `@Entity`, `@Column`, `@PrimaryGeneratedColumn`, relation decorators |
| GraphQL | `@nestjs/graphql` | `@ObjectType`, `@InputType`, `@Field` |
| Swagger | `@nestjs/swagger` | `@ApiProperty`, `@ApiPropertyOptional` |
| Validation | `class-validator`, `class-transformer` | `@IsString`, `@IsNumber`, `@IsOptional`, etc. |

Adapters are **silently skipped** if their package is not installed — no errors, no config needed.

## Class-Level Decorators

### `@SolidEntity()`

Marks a class as a database entity. Replaces `@Entity()` + `@ObjectType()`.

```typescript
@SolidEntity()
export class User { ... }
```

Auto-applies: `@Entity()` (TypeORM), `@ObjectType()` (GraphQL).

### `@SolidInput()`

Marks a DTO class. Replaces `@InputType()` (GraphQL), no TypeORM.

```typescript
@SolidInput()
export class CreateUserDto { ... }
```

Auto-applies: `@InputType()` (GraphQL), Swagger body documentation.

## Field Decorators

### `@SolidId(options)`

Primary key fields. Infers `@PrimaryGeneratedColumn` or `@PrimaryColumn` from the `generated` option.

```typescript
@SolidId({ generated: 'uuid', description: 'User ID' })
id: string;  // → @PrimaryGeneratedColumn('uuid'), @Field(() => ID), @IsUUID()

@SolidId({ generated: 'increment', description: 'Auto-ID' })
id: number;  // → @PrimaryGeneratedColumn('increment'), @Field(() => ID), @IsNumber()
```

| Option | Values | Default |
|---|---|---|
| `generated` | `'uuid'`, `'increment'`, `'rowid'`, `'identity'` | `'uuid'` (string) / `'increment'` (number) |
| `description` | string | — |

### `@SolidField(options)`

The primary decorator for regular fields. Options drive all adapters.

#### Common Options

| Option | Type | Effect |
|---|---|---|
| `description` | `string` | Swagger description, GraphQL description |
| `nullable` | `boolean` | Makes field optional in all adapters |
| `unique` | `boolean` | `@Column({ unique: true })` |
| `defaultValue` | `any \| () => any` | Default value across TypeORM + GraphQL |
| `skip` | `('typeorm' \| 'graphql' \| 'swagger' \| 'validation')[]` | Skip specific adapters |
| `skipValidation` | `boolean` | Skip automatic validation decorators |
| `adapters` | `AdapterConfig` | Per-adapter overrides (see below) |

#### String-Specific Options

| Option | Effect |
|---|---|
| `maxLength` | `@Column({ length })`, `@MaxLength()` |
| `minLength` | `@MinLength()` |
| `email` | `@IsEmail()` |
| `url` | `@IsUrl()` |
| `uuid` | `@IsUUID()` |
| `json` | `@IsJSON()` |
| `pattern` | `@Matches(pattern)` |

#### Number-Specific Options

| Option | Effect |
|---|---|
| `integer` | `@IsInt()` |
| `float` | `@IsNumber()` with `float` column type |
| `min` | `@Min()` |
| `max` | `@Max()` |
| `positive` | `@IsPositive()` |
| `negative` | `@IsNegative()` |
| `precision` + `scale` | Decimal column `precision`/`scale` |

#### Array-Specific Options

| Option | Effect |
|---|---|
| `array` | Enable array handling |
| `arrayType` | `() => String \| Number \| DtoType` — element type function |
| `minSize` | `@ArrayMinSize()` |
| `maxSize` | `@ArrayMaxSize()` |
| `nested` | `@ValidateNested()` (object arrays) |

#### Enum Handling

```typescript
@SolidField({
  description: 'Status',
  enum: ProductStatus,
  defaultValue: ProductStatus.ACTIVE,
  adapters: {
    typeorm: { type: 'enum', enum: ProductStatus },
    graphql: { type: () => ProductStatus },
  },
})
status: ProductStatus;
```

### `@SolidRelation(typeFn, inverseFn, options)`

Generic relation decorator. Three standard types auto-inferred:

```typescript
@SolidRelation(
  () => RelatedEntity,
  (entity) => entity.parent,
  { description: 'Related records' }
)
```

### Convenience Relation Shorthand

```typescript
@SolidOneToMany(() => Invoice, (invoice) => invoice.client, { cascade: true })
invoices: Invoice[];

@SolidManyToOne(() => Client, (client) => client.invoices, { onDelete: 'CASCADE' })
client: Client;

@SolidOneToOne(() => Profile, (profile) => profile.user)
profile: Profile;

@SolidManyToMany(() => Tag, (tag) => tag.products)
tags: Tag[];
```

**Circular dependency avoidance:** Use dynamic `require()` inside lazy functions:
```typescript
@SolidManyToOne(
  () => { const { Category } = require('./category.entity'); return Category; },
  (cat: any) => cat.products,
)
category: any;
```

### Timestamp Decorators

```typescript
@SolidTimestamp({ description: 'Custom timestamp' })
customDate: Date;

@SolidCreatedAt({ description: 'Created at' })
createdAt: Date;  // → @CreateDateColumn()

@SolidUpdatedAt({ description: 'Updated at' })
updatedAt: Date;  // → @UpdateDateColumn()

@SolidDeletedAt({ description: 'Soft delete' })
deletedAt?: Date;  // → @DeleteDateColumn()  (triggers soft-delete support)
```

## Type Inference Table

Validation, column type, and GraphQL type are inferred from TypeScript property types:

| TS Type | Validation | TypeORM Column | GraphQL |
|---|---|---|---|
| `string` | `@IsString()` `@IsNotEmpty()` | `varchar` | `@Field()` |
| `number` | `@IsNumber()` | `int` | `@Field(() => Int)` |
| `boolean` | `@IsBoolean()` | `boolean` | `@Field()` |
| `Date` | `@IsDate()` | `timestamp` | `@Field()` |
| `T[]` | `@IsArray()` | simple-array / json | `@Field(() => [Type])` |
| `enum` | `@IsEnum()` | enum | embedded enum type |
| `string?` | `@IsOptional()` + base | nullable | nullable |
| `string \| null` | `@IsOptional()` + base | nullable | nullable |
| `Record<string, any>` | `@IsObject()` | `json` | `@Field()` |
| `SomeDto` | `@ValidateNested()` | stored as json | `@Field(() => SomeDto)` |

## Adapter Overrides via `adapters`

Each adapter accepts its own options object for technology-specific control:

```typescript
@SolidField({
  description: 'Email',
  email: true,
  adapters: {
    typeorm: {
      type: 'varchar',
      length: 255,
      transformer: { to: (v: string) => v.toLowerCase(), from: (v: string) => v },
    },
    graphql: {
      type: () => String,
      complexity: 5,
    },
    swagger: {
      example: 'user@example.com',
      format: 'email',
    },
    validation: {
      validators: [CustomValidator()],
      emailOptions: { require_tld: true },
    },
  },
})
email: string;
```

## Skipping Adapters

```typescript
// Skip TypeORM (computed field, not stored)
@SolidField({ skip: ['typeorm'] })
get totalPrice(): number { return this.price * this.quantity; }

// Exclude from API (database-only field)
@SolidField({ skip: ['graphql', 'swagger'] })
internalNotes: string;

// Skip validation (manual decorators)
@SolidField({ skipValidation: true })
@IsCustomValidation()
customField: string;
```

## Complete Entity Example

```typescript
import {
  SolidEntity, SolidId, SolidField,
  SolidOneToMany, SolidManyToOne,
  SolidCreatedAt, SolidUpdatedAt, SolidDeletedAt,
} from '@solid-nestjs/common';

enum ProductStatus { ACTIVE = 'active', INACTIVE = 'inactive' }

@SolidEntity()
export class Product {
  @SolidId({ generated: 'uuid', description: 'Product ID' })
  id: string;

  @SolidField({ description: 'Product name', maxLength: 200 })
  name: string;

  @SolidField({ description: 'URL-friendly slug', unique: true, pattern: /^[a-z0-9-]+$/ })
  slug: string;

  @SolidField({
    description: 'Product description',
    nullable: true,
    adapters: { typeorm: { type: 'text' } },
  })
  description?: string;

  @SolidField({ description: 'Price in USD', precision: 10, scale: 2, min: 0 })
  price: number;

  @SolidField({ description: 'Stock quantity', integer: true, min: 0, defaultValue: 0 })
  stock: number;

  @SolidField({
    description: 'Product status',
    enum: ProductStatus,
    defaultValue: ProductStatus.ACTIVE,
    adapters: { typeorm: { type: 'enum', enum: ProductStatus } },
  })
  status: ProductStatus;

  @SolidField({ description: 'Image URLs', array: true, arrayType: () => String,
    adapters: { typeorm: { type: 'simple-array' } } })
  images: string[];

  @SolidField({ description: 'Tags', array: true, arrayType: () => String,
    adapters: { typeorm: { type: 'simple-array' } } })
  tags: string[];

  @SolidManyToOne(
    () => { const { Category } = require('./category.entity'); return Category; },
    (cat: any) => cat.products,
    { description: 'Product category', onDelete: 'SET NULL' },
  )
  category: any;

  @SolidCreatedAt()
  createdAt: Date;

  @SolidUpdatedAt()
  updatedAt: Date;

  @SolidDeletedAt()
  deletedAt?: Date;
}
```

## Debug Mode

```typescript
process.env.SOLID_DEBUG = 'true';
```

Logs every decorator applied by every adapter during startup — useful for verifying what gets generated.
