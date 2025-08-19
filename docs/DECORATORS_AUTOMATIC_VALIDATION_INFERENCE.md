# Automatic Validation Inference in SOLID Decorators

**Version**: v0.2.8  
**Date**: August 19, 2025  
**Type**: Framework Documentation  

## Overview

The SOLID NestJS Framework provides automatic inference of class-validator decorators based on TypeScript property types and field configuration options. This eliminates the need to manually apply validation decorators, reducing boilerplate code by 70-80% while maintaining full type safety and validation capabilities.

## How It Works

When you use `@SolidField()` decorator, the framework automatically analyzes:

1. **TypeScript property type** (string, number, boolean, etc.)
2. **Optional syntax** (`field?: type` or `field: type | null`)
3. **Configuration options** (`email: true`, `nullable: true`, etc.)
4. **Constraint options** (`minLength`, `maxLength`, `min`, `max`, etc.)

Based on this analysis, it automatically applies the appropriate class-validator decorators.

## Automatic Type-to-Validator Mapping

### Basic Types

| TypeScript Type | Auto-Applied Decorators | Example |
|-----------------|-------------------------|---------|
| `string` | `@IsString()` + `@IsNotEmpty()` | `name: string` |
| `number` | `@IsNumber()` | `price: number` |
| `boolean` | `@IsBoolean()` | `isActive: boolean` |
| `Date` | `@IsDate()` | `createdAt: Date` |
| `Array<T>` | `@IsArray()` | `tags: string[]` |
| `Enum` | `@IsEnum(enumType)` | `status: Status` |
| `Object` | `@IsObject()` + `@ValidateNested()` | `config: Config` |

### Optional Properties

| TypeScript Syntax | Auto-Applied Decorators | Example |
|-------------------|-------------------------|---------|
| `field?: string` | `@IsOptional()` + `@IsString()` | `phone?: string` |
| `field: string \| null` | `@IsOptional()` + `@IsString()` | `address: string \| null` |

## Special Validation Options

### String Validation

```typescript
// Email validation
@SolidField({ 
  description: 'User email address',
  email: true 
})
email: string; // → @IsString() @IsNotEmpty() @IsEmail()

// URL validation
@SolidField({ 
  description: 'Website URL',
  url: true 
})
website: string; // → @IsString() @IsNotEmpty() @IsUrl()

// UUID validation
@SolidField({ 
  description: 'Unique identifier',
  uuid: true 
})
id: string; // → @IsString() @IsNotEmpty() @IsUUID()

// JSON validation
@SolidField({ 
  description: 'Configuration JSON',
  json: true 
})
config: string; // → @IsString() @IsNotEmpty() @IsJSON()
```

### Number Validation

```typescript
// Integer validation
@SolidField({ 
  description: 'User age',
  integer: true 
})
age: number; // → @IsInt()

// Positive number
@SolidField({ 
  description: 'Product price',
  positive: true 
})
price: number; // → @IsNumber() @IsPositive()

// Negative number
@SolidField({ 
  description: 'Temperature below zero',
  negative: true 
})
temperature: number; // → @IsNumber() @IsNegative()
```

### Nullable Fields

```typescript
// Using nullable option
@SolidField({ 
  description: 'Optional phone number',
  nullable: true 
})
phone: string; // → @IsOptional() @IsString()

// Using TypeScript optional syntax
@SolidField({ 
  description: 'Optional address' 
})
address?: string; // → @IsOptional() @IsString()
```

## Constraint Validation

### String Constraints

```typescript
@SolidField({
  description: 'Product name',
  minLength: 3,
  maxLength: 100,
  pattern: /^[A-Za-z\s]+$/
})
name: string; 
// → @IsString() @IsNotEmpty() @MinLength(3) @MaxLength(100) @Matches(/^[A-Za-z\s]+$/)
```

### Number Constraints

```typescript
@SolidField({
  description: 'Product price',
  min: 0,
  max: 10000,
  precision: 10,
  scale: 2
})
price: number; 
// → @IsNumber() @Min(0) @Max(10000)
```

### Array Constraints

```typescript
@SolidField({
  description: 'Product tags',
  minSize: 1,
  maxSize: 10
})
tags: string[]; 
// → @IsArray() @ArrayMinSize(1) @ArrayMaxSize(10)
```

## Complete Examples

### Simple DTO with Automatic Validation

**Before (Traditional Approach):**
```typescript
import { InputType, Field } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail, IsOptional } from 'class-validator';

@InputType()
export class CreateUserDto {
  @ApiProperty({ description: 'User first name' })
  @Field({ description: 'User first name' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'User email address' })
  @Field({ description: 'User email address' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Phone number', required: false })
  @Field({ description: 'Phone number', nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;
}
```

**After (SOLID Approach):**
```typescript
import { SolidInput, SolidField } from '@solid-nestjs/common';

@SolidInput()
export class CreateUserDto {
  @SolidField({
    description: 'User first name'
  })
  firstName: string; // Auto: @IsString() @IsNotEmpty()

  @SolidField({
    description: 'User email address',
    email: true
  })
  email: string; // Auto: @IsString() @IsNotEmpty() @IsEmail()

  @SolidField({
    description: 'Phone number',
    nullable: true
  })
  phone?: string; // Auto: @IsOptional() @IsString()
}
```

### Complex DTO with Advanced Validation

```typescript
import { SolidInput, SolidField } from '@solid-nestjs/common';

@SolidInput()
export class CreateProductDto {
  @SolidField({
    description: 'Product name',
    minLength: 3,
    maxLength: 100
  })
  name: string; // Auto: @IsString() @IsNotEmpty() @MinLength(3) @MaxLength(100)

  @SolidField({
    description: 'Product description',
    nullable: true,
    maxLength: 500
  })
  description?: string; // Auto: @IsOptional() @IsString() @MaxLength(500)

  @SolidField({
    description: 'Product price',
    positive: true,
    min: 0.01,
    max: 999999.99
  })
  price: number; // Auto: @IsNumber() @IsPositive() @Min(0.01) @Max(999999.99)

  @SolidField({
    description: 'Stock quantity',
    integer: true,
    min: 0
  })
  stock: number; // Auto: @IsInt() @Min(0)

  @SolidField({
    description: 'Product categories',
    minSize: 1,
    maxSize: 5
  })
  categories: string[]; // Auto: @IsArray() @ArrayMinSize(1) @ArrayMaxSize(5)

  @SolidField({
    description: 'Product website',
    url: true,
    nullable: true
  })
  website?: string; // Auto: @IsOptional() @IsString() @IsUrl()

  @SolidField({
    description: 'Product SKU',
    pattern: /^[A-Z]{3}-\d{4}$/
  })
  sku: string; // Auto: @IsString() @IsNotEmpty() @Matches(/^[A-Z]{3}-\d{4}$/)
}
```

## Advanced Configuration

### Custom Validation Options

```typescript
@SolidField({
  description: 'User email',
  email: true,
  adapters: {
    validation: {
      emailOptions: { 
        allow_ip_domain: false,
        require_tld: true
      }
    }
  }
})
email: string;
```

### Skipping Automatic Validation

```typescript
// Skip validation entirely
@SolidField({
  description: 'Custom field',
  skip: ['validation']
})
customField: string;

// Manual validation control
@SolidField({
  description: 'Manual field',
  skipValidation: true
})
@IsCustomValidation()
manualField: string;
```

### Nested Object Validation

```typescript
@SolidField({
  description: 'User address',
  nested: true
})
address: AddressDto; // Auto: @IsObject() @ValidateNested() @Type(() => AddressDto)
```

## Benefits

### 1. **Dramatic Code Reduction**
- **70-80% less boilerplate** code
- **Single decorator** instead of 3-4 separate decorators
- **Automatic inference** eliminates manual mapping

### 2. **Type Safety**
- **Full TypeScript support** preserved
- **Compile-time validation** of decorator options
- **IntelliSense support** for all options

### 3. **Consistency**
- **Standardized validation** across the application
- **Prevents validation mistakes** through automation
- **Unified approach** for all DTOs

### 4. **Maintainability**
- **Centralized validation logic** in the framework
- **Easy to update** validation rules globally
- **Clear and readable** DTO definitions

### 5. **Framework Integration**
- **Works with all adapters** (TypeORM, GraphQL, Swagger)
- **Seamless integration** with NestJS validation pipes
- **Compatible with** existing class-validator decorators

## Migration Guide

### From Traditional to SOLID Validation

1. **Replace imports:**
   ```typescript
   // Remove
   import { InputType, Field } from '@nestjs/graphql';
   import { ApiProperty } from '@nestjs/swagger';
   import { IsNotEmpty, IsString, IsEmail } from 'class-validator';
   
   // Add
   import { SolidInput, SolidField } from '@solid-nestjs/common';
   ```

2. **Replace class decorator:**
   ```typescript
   // Before
   @InputType()
   
   // After
   @SolidInput()
   ```

3. **Replace field decorators:**
   ```typescript
   // Before
   @ApiProperty({ description: 'User name' })
   @Field({ description: 'User name' })
   @IsNotEmpty()
   @IsString()
   name: string;
   
   // After
   @SolidField({
     description: 'User name'
   })
   name: string;
   ```

4. **Handle special cases:**
   ```typescript
   // Email validation
   @SolidField({
     description: 'User email',
     email: true
   })
   email: string;
   
   // Optional fields
   @SolidField({
     description: 'Phone number',
     nullable: true
   })
   phone?: string;
   ```

## Best Practices

### 1. **Use TypeScript Types Effectively**
```typescript
// ✅ Good - Let TypeScript infer validation
@SolidField({ description: 'User age' })
age: number; // Automatically gets @IsNumber()

// ❌ Avoid - Unnecessary manual decoration
@SolidField({ description: 'User age' })
@IsNumber()
age: number;
```

### 2. **Leverage Special Options**
```typescript
// ✅ Good - Use framework options
@SolidField({ 
  description: 'User email',
  email: true 
})
email: string;

// ❌ Avoid - Manual email validation
@SolidField({ description: 'User email' })
@IsEmail()
email: string;
```

### 3. **Use Nullable Consistently**
```typescript
// ✅ Good - Framework handles optionality
@SolidField({ 
  description: 'Phone number',
  nullable: true 
})
phone?: string;

// ❌ Avoid - Manual optional handling
@SolidField({ description: 'Phone number' })
@IsOptional()
@IsString()
phone?: string;
```

### 4. **Combine with Constraints**
```typescript
// ✅ Good - All constraints in one place
@SolidField({
  description: 'Product name',
  minLength: 3,
  maxLength: 100,
  pattern: /^[A-Za-z\s]+$/
})
name: string;
```

## Troubleshooting

### Common Issues

1. **Validation not working:**
   - Ensure `class-validator` and `class-transformer` are installed
   - Check that validation pipes are properly configured in NestJS
   - Verify the field type matches the expected validation

2. **Duplicate validation decorators:**
   - Remove manual class-validator decorators when using SOLID
   - Use `skipValidation: true` if you need manual control

3. **Custom validation not applied:**
   - Use the `adapters.validation` section for custom options
   - Consider using `skip: ['validation']` for completely custom validation

### Debug Mode

Enable debug mode to see which decorators are being applied:

```typescript
// In your module or main.ts
process.env.SOLID_DEBUG = 'true';
```

This will log all automatically applied decorators to the console during application startup.

## Conclusion

The automatic validation inference in SOLID decorators represents a significant advancement in developer experience and code quality. By leveraging TypeScript's type system and intelligent defaults, developers can focus on business logic rather than repetitive validation boilerplate.

The system maintains full compatibility with existing class-validator decorators while providing a much more streamlined development experience. This results in cleaner, more maintainable code that is less prone to validation errors and inconsistencies.

---

**Next Steps:**
- Explore [Entity Validation](./entity-validation.md) for database-level validation
- Learn about [Custom Validation Adapters](./custom-validation-adapters.md)
- Review [Migration Guide](./migration-guide.md) for existing projects