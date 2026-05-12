# Validation Guide

SOLID decorators automatically infer and apply `class-validator` decorators from TypeScript types, field options, and constraint settings — eliminating manual validation boilerplate.

## Automatic Type Inference

When you declare a field with `@SolidField()`, the Validation adapter inspects the TypeScript property type and applies the correct decorators:

| TypeScript Type | Validation Applied |
|---|---|
| `string` | `@IsString()` `@IsNotEmpty()` |
| `number` | `@IsNumber()` |
| `boolean` | `@IsBoolean()` |
| `Date` | `@IsDate()` |
| `T[]` | `@IsArray()` |
| `enum` | `@IsEnum(enumType)` |
| `Record<string, any>` / nested DTO | `@IsObject()` `@ValidateNested()` |
| `string?` or `string \| null` | `@IsOptional()` + base validators |
| `T[]` of DTOs | `@IsArray()` `@ValidateNested({ each: true })` |

### Special Boolean Options

Setting any of these flags on `@SolidField` overrides the base behavior:

| Option | Validation | Column Type |
|---|---|---|
| `email: true` | `@IsEmail()` | — |
| `url: true` | `@IsUrl()` | — |
| `uuid: true` | `@IsUUID()` | — |
| `json: true` | `@IsJSON()` | — |
| `integer: true` | `@IsInt()` | `int` |
| `float: true` | `@IsNumber()` | `float` |
| `positive: true` | `@IsPositive()` | — |
| `negative: true` | `@IsNegative()` | — |

## Constraint Validation

Numeric and string constraints are inferred from `@SolidField` options:

```typescript
@SolidField({
  description: 'Product name',
  minLength: 3,
  maxLength: 100,
  pattern: /^[A-Za-z\s]+$/,
})
name: string;
// → @IsString() @IsNotEmpty() @MinLength(3) @MaxLength(100) @Matches(/^[A-Za-z\s]+$/)

@SolidField({
  description: 'Product price',
  min: 0.01,
  max: 999999.99,
})
price: number;
// → @IsNumber() @Min(0.01) @Max(999999.99)

@SolidField({
  description: 'Tags',
  array: true,
  arrayType: () => String,
  minSize: 1,
  maxSize: 10,
})
tags: string[];
// → @IsArray() @ArrayMinSize(1) @ArrayMaxSize(10)
```

## Decorator Adapter Architecture

The validation system follows a **plugin adapter** pattern:

1. **Core decorators** (`@SolidField`, `@SolidEntity`) collect field metadata (type info, options, constraints).
2. **`ValidationDecoratorAdapter`** reads the metadata and maps it to `class-validator` decorators.
3. The adapter is **auto-registered** when `class-validator` is installed — no manual setup.

Available adapters (all auto-register when their packages are present):

| Adapter | Package Required | Role |
|---|---|---|
| `ValidationDecoratorAdapter` | `class-validator`, `class-transformer` | Applies `@IsString`, `@IsNumber`, etc. |
| `TypeOrmDecoratorAdapter` | `typeorm`, `@nestjs/typeorm` | Applies `@Column`, `@Entity`, etc. |
| `SwaggerDecoratorAdapter` | `@nestjs/swagger` | Applies `@ApiProperty` |
| `GraphQLDecoratorAdapter` | `@nestjs/graphql` | Applies `@Field`, `@ObjectType`, `@InputType` |

Adapters that don't have their package installed are silently skipped — no errors at startup.

## Customizing Validation Per-Field

### Adapter-Specific Validation Options

```typescript
@SolidField({
  description: 'Email address',
  email: true,
  adapters: {
    validation: {
      emailOptions: {
        allow_ip_domain: false,
        require_tld: true,
      },
    },
  },
})
email: string;
// → @IsEmail({ allow_ip_domain: false, require_tld: true })
```

### Custom Validation Messages

```typescript
@SolidField({
  description: 'Product SKU',
  pattern: /^[A-Z]{3}-\d{4}$/,
  adapters: {
    validation: {
      message: 'SKU must be format: ABC-1234',
    },
  },
})
sku: string;
```

### Custom Validators

Pass additional `class-validator` decorator factories via `adapters.validation.validators`:

```typescript
import { IsFlexibleUUID } from '../validators/is-flexible-uuid.validator';

@SolidField({
  description: 'External reference ID',
  adapters: {
    validation: {
      validators: [IsFlexibleUUID],
    },
  },
})
referenceId: string;

// Inline custom validator
@SolidField({
  description: 'Image URLs',
  array: true,
  arrayType: () => String,
  adapters: {
    validation: {
      validators: [
        (value: string[]) => value.every(url => /^https?:\/\/.+\.(jpg|png)$/i.test(url)),
      ],
    },
  },
})
images: string[];
```

## Skipping Validation

```typescript
// Skip all automatic validation (apply your own)
@SolidField({ skipValidation: true })
@IsCustomValidation()
manualField: string;

// Skip validation only (keep TypeORM, Swagger, GraphQL adapters)
@SolidField({ skip: ['validation'] })
unvalidatedField: string;

// Skip validation for file upload fields
@SolidField({
  description: 'Image file',
  adapters: { validation: { skip: true } },
})
file: any;
```

## Nested Object Validation

```typescript
@SolidField({ description: 'Shipping address' })
shippingAddress: AddressDto;
// → @IsObject() @ValidateNested() @Type(() => AddressDto)

@SolidField({ description: 'Line items', array: true, arrayType: () => OrderItemDto })
items: OrderItemDto[];
// → @IsArray() @ValidateNested({ each: true }) @Type(() => OrderItemDto)
```

## NestJS Configuration

For validation to work at runtime, NestJS needs a global `ValidationPipe`:

```typescript
// main.ts
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    transform: true,            // Auto-transform payloads to DTO instances
    whitelist: true,            // Strip non-decorated properties
    forbidNonWhitelisted: true, // Throw on unknown properties
  }));

  await app.listen(3000);
}
bootstrap();
```

Without `ValidationPipe`, the decorators exist at the class level but are never executed — validation won't work.

## Debug Mode

Set `SOLID_DEBUG=true` to see every decorator applied by every adapter:

```typescript
process.env.SOLID_DEBUG = 'true';
```

This outputs adapter-by-adapter logs during startup:

```
[SOLID] ValidationDecoratorAdapter: @IsString @IsNotEmpty → Product.name
[SOLID] ValidationDecoratorAdapter: @IsNumber @Min(0) → Product.price
[SOLID] TypeOrmDecoratorAdapter: @Column('varchar', { length: 200 }) → Product.name
[SOLID] TypeOrmDecoratorAdapter: @Column('decimal', { precision: 10, scale: 2 }) → Product.price
```
