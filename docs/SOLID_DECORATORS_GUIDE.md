# SOLID Decorators - Complete Guide

**Version**: v0.2.8  
**Date**: August 19, 2025  
**Type**: Framework Documentation  

## Table of Contents

1. [Overview](#overview)
2. [Core Concepts](#core-concepts)
3. [Entity Decorators](#entity-decorators)
4. [DTO Decorators](#dto-decorators)
5. [Advanced Features](#advanced-features)
6. [Real-World Examples](#real-world-examples)
7. [Migration Guide](#migration-guide)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

## Overview

SOLID Decorators represent a revolutionary approach to defining entities and DTOs in the SOLID NestJS Framework. Instead of manually applying multiple decorators for TypeORM, GraphQL, Swagger, and validation, you use unified decorators that automatically apply the appropriate technology-specific decorators based on your configuration and TypeScript types.

### Before vs After

**Traditional Approach (10+ decorators per field):**
```typescript
@ObjectType()
@Entity()
export class Product {
  @ApiProperty({ description: 'Product ID', format: 'uuid' })
  @Field(() => ID, { description: 'Product ID' })
  @PrimaryGeneratedColumn('uuid')
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'Product name', maxLength: 100 })
  @Field({ description: 'Product name' })
  @Column({ length: 100 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Product price', minimum: 0 })
  @Field(() => Float, { description: 'Product price' })
  @Column('decimal', { precision: 10, scale: 2 })
  @IsNumber()
  @Min(0)
  price: number;
}
```

**SOLID Approach (1 decorator per field):**
```typescript
@SolidEntity()
export class Product {
  @SolidId({
    generated: 'uuid',
    description: 'Product ID'
  })
  id: string;

  @SolidField({
    description: 'Product name',
    maxLength: 100
  })
  name: string;

  @SolidField({
    description: 'Product price',
    precision: 10,
    scale: 2,
    min: 0
  })
  price: number;
}
```

### Key Benefits

- **70-80% less boilerplate code**
- **Automatic type inference** from TypeScript types
- **Unified configuration** across all technologies
- **Zero duplication** of common settings
- **Full backward compatibility** with existing decorators
- **IntelliSense support** for all options

## Core Concepts

### Architecture

The SOLID Decorators system uses a **plugin-based architecture** where:

1. **Core decorators** (`@SolidField`, `@SolidEntity`, etc.) collect metadata
2. **Technology adapters** apply specific decorators based on available packages:
   - **TypeORM Adapter** → Applies `@Column`, `@Entity`, `@PrimaryGeneratedColumn`
   - **GraphQL Adapter** → Applies `@Field`, `@ObjectType`, `@InputType`
   - **Swagger Adapter** → Applies `@ApiProperty`, `@ApiPropertyOptional`
   - **Validation Adapter** → Applies `@IsString`, `@IsNumber`, `@IsOptional`

3. **Automatic registration** happens when packages are imported
4. **Runtime detection** ensures only available adapters are used

### Type Inference

SOLID Decorators automatically infer appropriate validations and configurations from:

| TypeScript Type | Auto-Applied | Example |
|-----------------|--------------|---------|
| `string` | `@IsString()` + `@Column('varchar')` + `@Field()` | `name: string` |
| `number` | `@IsNumber()` + `@Column('int')` + `@Field(() => Int)` | `age: number` |
| `boolean` | `@IsBoolean()` + `@Column('boolean')` + `@Field()` | `active: boolean` |
| `Date` | `@IsDate()` + `@Column('timestamp')` + `@Field()` | `createdAt: Date` |
| `string?` | `@IsOptional()` + `nullable: true` everywhere | `phone?: string` |
| `T[]` | `@IsArray()` + array configurations | `tags: string[]` |

## Entity Decorators

### @SolidEntity()

Replaces `@Entity()` + `@ObjectType()` and provides automatic schema generation.

```typescript
import { SolidEntity, SolidField, SolidId } from '@solid-nestjs/common';

@SolidEntity()
export class User {
  @SolidId({
    generated: 'uuid',
    description: 'User unique identifier'
  })
  id: string;

  @SolidField({
    description: 'User email address',
    unique: true,
    email: true,
    maxLength: 255
  })
  email: string;
}
```

**Auto-generates:**
- TypeORM: `@Entity()` + `@ObjectType()`
- GraphQL: `@ObjectType()`
- Swagger: Included in API documentation

### @SolidId()

Specialized decorator for primary key fields.

```typescript
// Auto-increment integer ID
@SolidId({
  generated: 'increment',
  description: 'Auto-incrementing ID'
})
id: number;

// UUID ID
@SolidId({
  generated: 'uuid',
  description: 'UUID identifier'
})
id: string;

// Custom ID
@SolidId({
  description: 'Custom identifier'
})
id: string;
```

**Auto-generates:**
- TypeORM: `@PrimaryGeneratedColumn()` or `@PrimaryColumn()`
- GraphQL: `@Field(() => ID)`
- Swagger: `@ApiProperty({ format: 'uuid' })`
- Validation: `@IsUUID()` or `@IsNumber()`

### @SolidField()

The workhorse decorator for regular entity fields.

#### Basic Usage
```typescript
@SolidField({
  description: 'Field description'
})
fieldName: string;
```

#### String Fields
```typescript
// Basic string
@SolidField({
  description: 'User first name',
  maxLength: 50
})
firstName: string;

// Email field
@SolidField({
  description: 'Email address',
  email: true,
  unique: true
})
email: string;

// URL field
@SolidField({
  description: 'Website URL',
  url: true,
  nullable: true
})
website?: string;

// UUID string
@SolidField({
  description: 'External ID',
  uuid: true
})
externalId: string;

// Text field (longer strings)
@SolidField({
  description: 'Product description',
  maxLength: 1000,
  adapters: {
    typeorm: {
      type: 'text'
    }
  }
})
description: string;

// Pattern validation
@SolidField({
  description: 'Product SKU',
  pattern: /^[A-Z]{3}-\d{4}$/
})
sku: string;
```

#### Number Fields
```typescript
// Basic integer
@SolidField({
  description: 'User age',
  integer: true,
  min: 0,
  max: 120
})
age: number;

// Decimal field
@SolidField({
  description: 'Product price',
  precision: 10,
  scale: 2,
  min: 0
})
price: number;

// Float field
@SolidField({
  description: 'Rating score',
  float: true,
  min: 0,
  max: 5
})
rating: number;
```

#### Boolean Fields
```typescript
@SolidField({
  description: 'Is user active',
  defaultValue: true
})
isActive: boolean;
```

#### Date Fields
```typescript
// Timestamp field
@SolidField({
  description: 'User birth date'
})
birthDate: Date;

// Date-only field
@SolidField({
  description: 'Event date',
  adapters: {
    typeorm: {
      type: 'date'
    }
  }
})
eventDate: Date;
```

#### Array Fields
```typescript
// Simple string array
@SolidField({
  description: 'User tags',
  array: true,
  arrayType: () => String,
  minSize: 1,
  maxSize: 10
})
tags: string[];

// Number array
@SolidField({
  description: 'Score history',
  array: true,
  arrayType: () => Number
})
scores: number[];
```

#### Enum Fields
```typescript
enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator'
}

@SolidField({
  description: 'User role',
  enum: UserRole,
  defaultValue: UserRole.USER,
  adapters: {
    typeorm: {
      type: 'enum',
      enum: UserRole
    },
    graphql: {
      type: () => UserRole
    }
  }
})
role: UserRole;
```

### Relationship Decorators

#### @SolidOneToMany()

```typescript
@SolidOneToMany(
  () => {
    const { Invoice } = require('./invoice.entity');
    return Invoice;
  },
  (invoice: any) => invoice.client,
  {
    description: 'Client invoices',
    cascade: ['insert', 'update', 'remove']
  }
)
invoices: any[];
```

#### @SolidManyToOne()

```typescript
@SolidManyToOne(
  () => {
    const { Client } = require('../clients/client.entity');
    return Client;
  },
  (client: any) => client.invoices,
  {
    description: 'Invoice client',
    onDelete: 'CASCADE'
  }
)
client: any;
```

#### @SolidManyToMany()

```typescript
@SolidManyToMany(
  () => Tag,
  (tag: Tag) => tag.products,
  {
    description: 'Product tags',
    cascade: true
  }
)
tags: Tag[];
```

### Timestamp Decorators

```typescript
@SolidCreatedAt({
  description: 'Record creation timestamp'
})
createdAt: Date;

@SolidUpdatedAt({
  description: 'Last update timestamp'
})
updatedAt: Date;

@SolidDeletedAt({
  description: 'Soft deletion timestamp'
})
deletedAt?: Date;
```

### Complete Entity Example

```typescript
import {
  SolidEntity,
  SolidId,
  SolidField,
  SolidOneToMany,
  SolidManyToOne,
  SolidCreatedAt,
  SolidUpdatedAt,
  SolidDeletedAt
} from '@solid-nestjs/common';

enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DISCONTINUED = 'discontinued'
}

@SolidEntity()
export class Product {
  @SolidId({
    generated: 'uuid',
    description: 'Product unique identifier'
  })
  id: string;

  @SolidField({
    description: 'Product name',
    maxLength: 100
  })
  name: string;

  @SolidField({
    description: 'Product description',
    maxLength: 1000,
    nullable: true,
    adapters: {
      typeorm: {
        type: 'text'
      }
    }
  })
  description?: string;

  @SolidField({
    description: 'Product price',
    precision: 10,
    scale: 2,
    min: 0,
    adapters: {
      typeorm: {
        transformer: {
          to: (value: number) => value,
          from: (value: string) => parseFloat(value)
        }
      }
    }
  })
  price: number;

  @SolidField({
    description: 'Stock quantity',
    integer: true,
    min: 0,
    defaultValue: 0
  })
  stock: number;

  @SolidField({
    description: 'Product status',
    enum: ProductStatus,
    defaultValue: ProductStatus.ACTIVE,
    adapters: {
      typeorm: {
        type: 'enum',
        enum: ProductStatus
      }
    }
  })
  status: ProductStatus;

  @SolidField({
    description: 'Product SKU',
    unique: true,
    pattern: /^[A-Z]{3}-\d{4}$/
  })
  sku: string;

  @SolidField({
    description: 'Product tags',
    array: true,
    arrayType: () => String,
    adapters: {
      typeorm: {
        type: 'simple-array'
      }
    }
  })
  tags: string[];

  @SolidManyToOne(
    () => {
      const { Category } = require('./category.entity');
      return Category;
    },
    (category: any) => category.products,
    {
      description: 'Product category',
      onDelete: 'SET NULL'
    }
  )
  category: any;

  @SolidCreatedAt({
    description: 'Product creation date'
  })
  createdAt: Date;

  @SolidUpdatedAt({
    description: 'Last update date'
  })
  updatedAt: Date;

  @SolidDeletedAt({
    description: 'Soft deletion date'
  })
  deletedAt?: Date;
}
```

## DTO Decorators

### @SolidInput()

Replaces `@InputType()` for GraphQL and provides Swagger documentation for DTOs.

```typescript
import { SolidInput, SolidField } from '@solid-nestjs/common';

@SolidInput()
export class CreateUserDto {
  @SolidField({
    description: 'User first name',
    maxLength: 50
  })
  firstName: string;

  @SolidField({
    description: 'User email address',
    email: true
  })
  email: string;
}
```

**Auto-generates:**
- GraphQL: `@InputType()`
- Swagger: Included in request body documentation
- Validation: All appropriate validators

### DTO Field Examples

#### Basic Fields
```typescript
@SolidInput()
export class CreateProductDto {
  @SolidField({
    description: 'Product name'
  })
  name: string; // Auto: @IsString() @IsNotEmpty()

  @SolidField({
    description: 'Product price',
    min: 0
  })
  price: number; // Auto: @IsNumber() @Min(0)

  @SolidField({
    description: 'Is product active',
    nullable: true
  })
  isActive?: boolean; // Auto: @IsOptional() @IsBoolean()
}
```

#### Advanced Validation
```typescript
@SolidInput()
export class UpdateUserDto {
  @SolidField({
    description: 'First name',
    minLength: 2,
    maxLength: 50,
    pattern: /^[A-Za-z\s]+$/
  })
  firstName?: string;

  @SolidField({
    description: 'Email address',
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
  email?: string;

  @SolidField({
    description: 'Phone number',
    pattern: /^\+?[1-9]\d{1,14}$/,
    nullable: true
  })
  phone?: string;
}
```

#### Array Fields in DTOs
```typescript
@SolidInput()
export class CreateInvoiceDto {
  @SolidField({
    description: 'Invoice number'
  })
  invoiceNumber: string;

  @SolidField({
    description: 'Invoice details/line items',
    array: true,
    arrayType: () => CreateInvoiceDetailDto,
    minSize: 1,
    maxSize: 100
  })
  details: CreateInvoiceDetailDto[];

  @SolidField({
    description: 'Product tags',
    array: true,
    arrayType: () => String,
    nullable: true
  })
  tags?: string[];
}
```

#### Nested Objects
```typescript
@SolidInput()
export class CreateOrderDto {
  @SolidField({
    description: 'Customer information'
  })
  customer: CustomerDto;

  @SolidField({
    description: 'Shipping address'
  })
  shippingAddress: AddressDto;

  @SolidField({
    description: 'Order items',
    array: true,
    arrayType: () => OrderItemDto
  })
  items: OrderItemDto[];
}
```

#### File Upload
```typescript
@SolidInput()
export class UploadImageDto {
  @SolidField({
    description: 'Image file',
    adapters: {
      swagger: {
        type: 'string',
        format: 'binary'
      },
      validation: {
        skip: true // Skip automatic validation for file uploads
      }
    }
  })
  file: any;

  @SolidField({
    description: 'Image description',
    nullable: true,
    maxLength: 500
  })
  description?: string;
}
```

#### Custom Validators
```typescript
import { IsFlexibleUUID } from '../validators/is-flexible-uuid.validator';

@SolidInput()
export class CreateInvoiceDetailDto {
  @SolidField({
    description: 'Product ID',
    adapters: {
      graphql: {
        type: () => ID
      },
      validation: {
        validators: [IsFlexibleUUID]
      }
    }
  })
  productId: string;

  @SolidField({
    description: 'Quantity',
    integer: true,
    min: 1
  })
  quantity: number;
}
```

## Advanced Features

### Adapter-Specific Configuration

Each SOLID decorator accepts an `adapters` object where you can provide technology-specific configurations:

```typescript
@SolidField({
  description: 'Complex field with specific configurations',
  adapters: {
    // TypeORM specific
    typeorm: {
      type: 'varchar',
      length: 255,
      charset: 'utf8mb4',
      collation: 'utf8mb4_unicode_ci',
      transformer: {
        to: (value: string) => value.toLowerCase(),
        from: (value: string) => value.toUpperCase()
      }
    },
    
    // GraphQL specific
    graphql: {
      type: () => String,
      complexity: 5,
      description: 'GraphQL-specific description',
      extensions: {
        role: 'USER_FIELD'
      }
    },
    
    // Swagger specific
    swagger: {
      example: 'example@domain.com',
      format: 'email',
      pattern: '^[^@]+@[^@]+\.[^@]+$'
    },
    
    // Validation specific
    validation: {
      validators: [
        IsEmail({ allow_ip_domain: false }),
        CustomDomainValidator()
      ],
      emailOptions: {
        require_tld: true
      }
    }
  }
})
email: string;
```

### Skipping Specific Adapters

Sometimes you need to skip certain adapters for specific fields:

```typescript
@SolidField({
  description: 'Calculated field (not stored in database)',
  skip: ['typeorm'], // Skip TypeORM decorators
  adapters: {
    graphql: {
      type: () => Float
    }
  }
})
get totalValue(): number {
  return this.price * this.quantity;
}

@SolidField({
  description: 'Internal field (not exposed in API)',
  skip: ['graphql', 'swagger'] // Only for database
})
internalFlag: boolean;
```

### Conditional Configuration

Configure fields differently based on environment or context:

```typescript
@SolidField({
  description: 'Debug information',
  nullable: true,
  skip: process.env.NODE_ENV === 'production' ? ['graphql', 'swagger'] : []
})
debugInfo?: string;
```

### Custom Default Values

```typescript
@SolidField({
  description: 'User status',
  defaultValue: 'active',
  enum: ['active', 'inactive', 'pending']
})
status: string;

@SolidField({
  description: 'Creation timestamp',
  defaultValue: () => new Date()
})
createdAt: Date;
```

### Complex Transformations

```typescript
@SolidField({
  description: 'Email address (stored lowercase)',
  email: true,
  adapters: {
    typeorm: {
      transformer: {
        to: (value: string) => value.toLowerCase(),
        from: (value: string) => value
      }
    },
    validation: {
      transform: true,
      transformFn: (value: string) => value.toLowerCase()
    }
  }
})
email: string;
```

## Real-World Examples

### E-commerce Product System

```typescript
// Category Entity
@SolidEntity()
export class Category {
  @SolidId({
    generated: 'uuid',
    description: 'Category unique identifier'
  })
  id: string;

  @SolidField({
    description: 'Category name',
    unique: true,
    maxLength: 100
  })
  name: string;

  @SolidField({
    description: 'Category description',
    nullable: true,
    maxLength: 500
  })
  description?: string;

  @SolidOneToMany(
    () => {
      const { Product } = require('./product.entity');
      return Product;
    },
    (product: any) => product.category,
    {
      description: 'Products in this category'
    }
  )
  products: any[];

  @SolidCreatedAt()
  createdAt: Date;

  @SolidUpdatedAt()
  updatedAt: Date;
}

// Product Entity with Complex Relationships
@SolidEntity()
export class Product {
  @SolidId({
    generated: 'uuid',
    description: 'Product unique identifier'
  })
  id: string;

  @SolidField({
    description: 'Product name',
    maxLength: 200
  })
  name: string;

  @SolidField({
    description: 'Product slug for URLs',
    unique: true,
    pattern: /^[a-z0-9-]+$/
  })
  slug: string;

  @SolidField({
    description: 'Product description',
    nullable: true,
    adapters: {
      typeorm: {
        type: 'text'
      }
    }
  })
  description?: string;

  @SolidField({
    description: 'Product price',
    precision: 10,
    scale: 2,
    min: 0,
    adapters: {
      typeorm: {
        transformer: {
          to: (value: number) => value,
          from: (value: string) => parseFloat(value)
        }
      },
      graphql: {
        type: () => Float
      }
    }
  })
  price: number;

  @SolidField({
    description: 'Discounted price',
    precision: 10,
    scale: 2,
    min: 0,
    nullable: true,
    adapters: {
      typeorm: {
        transformer: {
          to: (value: number) => value,
          from: (value: string) => parseFloat(value)
        }
      }
    }
  })
  salePrice?: number;

  @SolidField({
    description: 'Stock quantity',
    integer: true,
    min: 0,
    defaultValue: 0
  })
  stock: number;

  @SolidField({
    description: 'Product weight in grams',
    integer: true,
    min: 1,
    nullable: true
  })
  weight?: number;

  @SolidField({
    description: 'Product images URLs',
    array: true,
    arrayType: () => String,
    adapters: {
      typeorm: {
        type: 'simple-array'
      }
    }
  })
  images: string[];

  @SolidField({
    description: 'Product tags',
    array: true,
    arrayType: () => String,
    adapters: {
      typeorm: {
        type: 'simple-array'
      }
    }
  })
  tags: string[];

  @SolidField({
    description: 'Product specifications as JSON',
    adapters: {
      typeorm: {
        type: 'json'
      }
    }
  })
  specifications: Record<string, any>;

  @SolidField({
    description: 'Is product active',
    defaultValue: true
  })
  isActive: boolean;

  @SolidField({
    description: 'Featured product',
    defaultValue: false
  })
  isFeatured: boolean;

  @SolidManyToOne(
    () => {
      const { Category } = require('./category.entity');
      return Category;
    },
    (category: any) => category.products,
    {
      description: 'Product category',
      onDelete: 'SET NULL'
    }
  )
  category: any;

  @SolidCreatedAt()
  createdAt: Date;

  @SolidUpdatedAt()
  updatedAt: Date;

  @SolidDeletedAt()
  deletedAt?: Date;
}

// Create Product DTO
@SolidInput()
export class CreateProductDto {
  @SolidField({
    description: 'Product name',
    maxLength: 200
  })
  name: string;

  @SolidField({
    description: 'Product slug',
    pattern: /^[a-z0-9-]+$/
  })
  slug: string;

  @SolidField({
    description: 'Product description',
    nullable: true,
    maxLength: 2000
  })
  description?: string;

  @SolidField({
    description: 'Product price',
    min: 0,
    adapters: {
      graphql: {
        type: () => Float
      }
    }
  })
  price: number;

  @SolidField({
    description: 'Sale price',
    min: 0,
    nullable: true,
    adapters: {
      graphql: {
        type: () => Float
      }
    }
  })
  salePrice?: number;

  @SolidField({
    description: 'Initial stock quantity',
    integer: true,
    min: 0,
    defaultValue: 0
  })
  stock: number;

  @SolidField({
    description: 'Product weight in grams',
    integer: true,
    min: 1,
    nullable: true
  })
  weight?: number;

  @SolidField({
    description: 'Product image URLs',
    array: true,
    arrayType: () => String,
    minSize: 1,
    maxSize: 10,
    adapters: {
      validation: {
        validators: [(value: string[]) => {
          return value.every(url => /^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i.test(url));
        }]
      }
    }
  })
  images: string[];

  @SolidField({
    description: 'Product tags',
    array: true,
    arrayType: () => String,
    maxSize: 20
  })
  tags: string[];

  @SolidField({
    description: 'Category ID',
    adapters: {
      validation: {
        validators: [IsUUID()]
      }
    }
  })
  categoryId: string;

  @SolidField({
    description: 'Product specifications',
    nullable: true
  })
  specifications?: Record<string, any>;
}
```

### User Management System

```typescript
enum UserRole {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  USER = 'user'
}

enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending'
}

@SolidEntity()
export class User {
  @SolidId({
    generated: 'uuid',
    description: 'User unique identifier'
  })
  id: string;

  @SolidField({
    description: 'User email address',
    email: true,
    unique: true,
    maxLength: 255
  })
  email: string;

  @SolidField({
    description: 'User first name',
    maxLength: 100
  })
  firstName: string;

  @SolidField({
    description: 'User last name',
    maxLength: 100
  })
  lastName: string;

  @SolidField({
    description: 'User role',
    enum: UserRole,
    defaultValue: UserRole.USER,
    adapters: {
      typeorm: {
        type: 'enum',
        enum: UserRole
      }
    }
  })
  role: UserRole;

  @SolidField({
    description: 'User status',
    enum: UserStatus,
    defaultValue: UserStatus.PENDING,
    adapters: {
      typeorm: {
        type: 'enum',
        enum: UserStatus
      }
    }
  })
  status: UserStatus;

  @SolidField({
    description: 'Phone number',
    nullable: true,
    pattern: /^\+?[1-9]\d{1,14}$/
  })
  phone?: string;

  @SolidField({
    description: 'Date of birth',
    nullable: true,
    adapters: {
      typeorm: {
        type: 'date'
      }
    }
  })
  dateOfBirth?: Date;

  @SolidField({
    description: 'User avatar URL',
    url: true,
    nullable: true
  })
  avatarUrl?: string;

  @SolidField({
    description: 'User preferences as JSON',
    adapters: {
      typeorm: {
        type: 'json'
      }
    }
  })
  preferences: UserPreferences;

  @SolidField({
    description: 'Last login timestamp',
    nullable: true
  })
  lastLoginAt?: Date;

  @SolidField({
    description: 'Email verification status',
    defaultValue: false
  })
  emailVerified: boolean;

  @SolidCreatedAt()
  createdAt: Date;

  @SolidUpdatedAt()
  updatedAt: Date;

  @SolidDeletedAt()
  deletedAt?: Date;
}

interface UserPreferences {
  theme: 'light' | 'dark';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    profileVisible: boolean;
    showEmail: boolean;
    showPhone: boolean;
  };
}

// Registration DTO
@SolidInput()
export class RegisterUserDto {
  @SolidField({
    description: 'Email address',
    email: true
  })
  email: string;

  @SolidField({
    description: 'Password',
    minLength: 8,
    maxLength: 100,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    adapters: {
      swagger: {
        format: 'password'
      }
    }
  })
  password: string;

  @SolidField({
    description: 'First name',
    maxLength: 100
  })
  firstName: string;

  @SolidField({
    description: 'Last name',
    maxLength: 100
  })
  lastName: string;

  @SolidField({
    description: 'Phone number',
    nullable: true,
    pattern: /^\+?[1-9]\d{1,14}$/
  })
  phone?: string;

  @SolidField({
    description: 'Date of birth',
    nullable: true
  })
  dateOfBirth?: Date;

  @SolidField({
    description: 'Terms of service acceptance',
    adapters: {
      validation: {
        validators: [(value: boolean) => value === true]
      }
    }
  })
  acceptTerms: boolean;
}

// Update Profile DTO
@SolidInput()
export class UpdateUserProfileDto {
  @SolidField({
    description: 'First name',
    maxLength: 100,
    nullable: true
  })
  firstName?: string;

  @SolidField({
    description: 'Last name',
    maxLength: 100,
    nullable: true
  })
  lastName?: string;

  @SolidField({
    description: 'Phone number',
    nullable: true,
    pattern: /^\+?[1-9]\d{1,14}$/
  })
  phone?: string;

  @SolidField({
    description: 'Date of birth',
    nullable: true
  })
  dateOfBirth?: Date;

  @SolidField({
    description: 'Avatar URL',
    url: true,
    nullable: true
  })
  avatarUrl?: string;

  @SolidField({
    description: 'User preferences',
    nullable: true
  })
  preferences?: Partial<UserPreferences>;
}
```

## Migration Guide

### From Traditional Decorators to SOLID

#### Step 1: Update Dependencies

```bash
# Ensure you have the latest SOLID packages
npm install @solid-nestjs/common@latest
npm install @solid-nestjs/typeorm-hybrid-crud@latest
```

#### Step 2: Update Imports

**Before:**
```typescript
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail } from 'class-validator';
```

**After:**
```typescript
import { SolidEntity, SolidId, SolidField } from '@solid-nestjs/common';
```

#### Step 3: Replace Class Decorators

**Before:**
```typescript
@Entity()
@ObjectType()
export class User {
  // ...
}

@InputType()
export class CreateUserDto {
  // ...
}
```

**After:**
```typescript
@SolidEntity()
export class User {
  // ...
}

@SolidInput()
export class CreateUserDto {
  // ...
}
```

#### Step 4: Replace Field Decorators

**Before:**
```typescript
@ApiProperty({ description: 'User ID' })
@Field(() => ID, { description: 'User ID' })
@PrimaryGeneratedColumn('uuid')
@IsUUID()
id: string;

@ApiProperty({ description: 'Email address' })
@Field({ description: 'Email address' })
@Column({ unique: true })
@IsEmail()
@IsNotEmpty()
email: string;

@ApiProperty({ description: 'Phone number', required: false })
@Field({ description: 'Phone number', nullable: true })
@Column({ nullable: true })
@IsOptional()
@IsString()
phone?: string;
```

**After:**
```typescript
@SolidId({
  generated: 'uuid',
  description: 'User ID'
})
id: string;

@SolidField({
  description: 'Email address',
  email: true,
  unique: true
})
email: string;

@SolidField({
  description: 'Phone number',
  nullable: true
})
phone?: string;
```

#### Step 5: Handle Relationships

**Before:**
```typescript
import { OneToMany } from 'typeorm';
import { Field } from '@nestjs/graphql';
import { Invoice } from './invoice.entity';

@ApiProperty({ type: () => [Invoice] })
@Field(() => [Invoice])
@OneToMany(() => Invoice, invoice => invoice.client)
invoices: Invoice[];
```

**After:**
```typescript
@SolidOneToMany(
  () => {
    const { Invoice } = require('./invoice.entity');
    return Invoice;
  },
  (invoice: any) => invoice.client,
  {
    description: 'Client invoices'
  }
)
invoices: any[];
```

#### Step 6: Test and Validate

1. **Run your application** and ensure it starts without errors
2. **Check the generated database schema** matches expectations
3. **Verify GraphQL schema** is generated correctly
4. **Test Swagger documentation** displays all fields
5. **Validate API endpoints** work with proper validation

### Migration Tools

#### Automated Migration Script

```bash
# Create a migration script (optional)
cat > migrate-decorators.js << 'EOF'
const fs = require('fs');
const path = require('path');

function migrateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace imports
  content = content.replace(
    /import.*from ['"]typeorm['"];?\n/g,
    ''
  );
  content = content.replace(
    /import.*from ['"]@nestjs\/graphql['"];?\n/g,
    ''
  );
  content = content.replace(
    /import.*from ['"]@nestjs\/swagger['"];?\n/g,
    ''
  );
  content = content.replace(
    /import.*from ['"]class-validator['"];?\n/g,
    ''
  );
  
  // Add SOLID import
  const solidImport = "import { SolidEntity, SolidId, SolidField } from '@solid-nestjs/common';\n\n";
  content = solidImport + content;
  
  // Replace class decorators
  content = content.replace(/@Entity\(\)/g, '@SolidEntity()');
  content = content.replace(/@ObjectType\(\)/g, '');
  content = content.replace(/@InputType\(\)/g, '@SolidInput()');
  
  // Save migrated file
  fs.writeFileSync(filePath + '.migrated', content);
  console.log(`Migrated: ${filePath}`);
}

// Usage: node migrate-decorators.js src/entities/*.entity.ts
process.argv.slice(2).forEach(migrateFile);
EOF

chmod +x migrate-decorators.js
```

#### Manual Migration Checklist

- [ ] Replace all imports with SOLID imports
- [ ] Replace `@Entity()` with `@SolidEntity()`
- [ ] Replace `@InputType()` with `@SolidInput()`
- [ ] Replace ID fields with `@SolidId()`
- [ ] Replace regular fields with `@SolidField()`
- [ ] Update relationship decorators
- [ ] Test database schema generation
- [ ] Validate GraphQL schema
- [ ] Check Swagger documentation
- [ ] Run all tests

## Best Practices

### 1. Consistent Field Naming

```typescript
// ✅ Good - Clear, consistent naming
@SolidField({
  description: 'User email address',
  email: true,
  unique: true
})
email: string;

// ❌ Avoid - Unclear or inconsistent naming
@SolidField({
  description: 'Mail',
  email: true
})
userMail: string;
```

### 2. Comprehensive Descriptions

```typescript
// ✅ Good - Clear business purpose
@SolidField({
  description: 'Product price in USD, excluding taxes',
  precision: 10,
  scale: 2,
  min: 0
})
price: number;

// ❌ Avoid - Generic or missing descriptions
@SolidField({
  description: 'Price'
})
price: number;
```

### 3. Use TypeScript Types Effectively

```typescript
// ✅ Good - Let TypeScript and SOLID work together
@SolidField({
  description: 'User age'
})
age: number; // Automatically gets @IsNumber()

// ❌ Avoid - Redundant manual decorators
@SolidField({
  description: 'User age'
})
@IsNumber()
age: number;
```

### 4. Leverage Configuration Options

```typescript
// ✅ Good - Use SOLID configuration
@SolidField({
  description: 'Email address',
  email: true, // Automatic email validation
  unique: true // Database constraint
})
email: string;

// ❌ Avoid - Manual configuration
@SolidField({
  description: 'Email address'
})
@IsEmail()
@Column({ unique: true })
email: string;
```

### 5. Handle Relationships Properly

```typescript
// ✅ Good - Avoid circular imports with require()
@SolidOneToMany(
  () => {
    const { Order } = require('./order.entity');
    return Order;
  },
  (order: any) => order.customer,
  {
    description: 'Customer orders'
  }
)
orders: any[];

// ❌ Avoid - Direct imports causing circular dependencies
import { Order } from './order.entity';

@SolidOneToMany(() => Order, order => order.customer)
orders: Order[];
```

### 6. Use Nullable Consistently

```typescript
// ✅ Good - Clear optionality with TypeScript syntax
@SolidField({
  description: 'Phone number',
  nullable: true
})
phone?: string;

// ✅ Also good - Explicit nullable configuration
@SolidField({
  description: 'Phone number',
  nullable: true
})
phone: string | null;
```

### 7. Validate Arrays Appropriately

```typescript
// ✅ Good - Proper array configuration
@SolidField({
  description: 'Product tags',
  array: true,
  arrayType: () => String,
  minSize: 1,
  maxSize: 10
})
tags: string[];

// ❌ Avoid - Missing array configuration
@SolidField({
  description: 'Product tags'
})
tags: string[];
```

### 8. Use Adapter-Specific Options When Needed

```typescript
// ✅ Good - Technology-specific optimizations
@SolidField({
  description: 'Product description',
  maxLength: 1000,
  adapters: {
    typeorm: {
      type: 'text' // Use TEXT instead of VARCHAR for long content
    },
    graphql: {
      complexity: 2 // Set GraphQL complexity
    }
  }
})
description: string;
```

### 9. Default Values

```typescript
// ✅ Good - Meaningful defaults
@SolidField({
  description: 'User status',
  defaultValue: 'active',
  enum: ['active', 'inactive', 'pending']
})
status: string;

@SolidField({
  description: 'Account created',
  defaultValue: true
})
isActive: boolean;
```

### 10. Error Handling and Validation

```typescript
// ✅ Good - Comprehensive validation
@SolidField({
  description: 'Product SKU',
  pattern: /^[A-Z]{3}-\d{4}$/,
  unique: true,
  adapters: {
    validation: {
      message: 'SKU must be in format ABC-1234'
    }
  }
})
sku: string;
```

## Troubleshooting

### Common Issues

#### 1. "Adapter not found" Error

**Problem:** The required technology package is not installed.

**Solution:**
```bash
# Install missing packages
npm install @nestjs/typeorm typeorm
npm install @nestjs/graphql @apollo/server
npm install @nestjs/swagger
npm install class-validator class-transformer
```

#### 2. Circular Import Issues

**Problem:** Direct imports between entities cause circular dependencies.

**Solution:** Use dynamic imports with `require()`:
```typescript
// ❌ Wrong - Direct import
import { User } from './user.entity';

@SolidManyToOne(() => User, user => user.posts)
author: User;

// ✅ Correct - Dynamic import
@SolidManyToOne(
  () => {
    const { User } = require('./user.entity');
    return User;
  },
  (user: any) => user.posts
)
author: any;
```

#### 3. Validation Not Working

**Problem:** Automatic validation decorators are not being applied.

**Solutions:**
- Ensure `class-validator` and `class-transformer` are installed
- Verify NestJS validation pipes are configured:
```typescript
// main.ts
app.useGlobalPipes(new ValidationPipe({
  transform: true,
  whitelist: true,
  forbidNonWhitelisted: true
}));
```

#### 4. GraphQL Schema Issues

**Problem:** GraphQL types are not generated correctly.

**Solutions:**
- Ensure `@nestjs/graphql` is installed
- Check GraphQL module configuration
- Use proper type functions for arrays:
```typescript
// ✅ Correct
@SolidField({
  array: true,
  arrayType: () => String
})
tags: string[];
```

#### 5. Swagger Documentation Missing

**Problem:** API documentation is not showing fields.

**Solutions:**
- Install `@nestjs/swagger`
- Configure SwaggerModule in your application
- Ensure DTO classes are properly imported

#### 6. Database Schema Issues

**Problem:** Database columns are not created correctly.

**Solutions:**
- Verify TypeORM configuration
- Check entity registration in modules
- Run database synchronization or migrations

#### 7. Type Inference Problems

**Problem:** Decorators are applied to wrong types.

**Solution:** Explicitly configure field types:
```typescript
// For complex types, be explicit
@SolidField({
  description: 'Decimal price',
  adapters: {
    typeorm: {
      type: 'decimal',
      precision: 10,
      scale: 2
    }
  }
})
price: number;
```

#### 8. Performance Issues

**Problem:** Application startup is slow due to decorator processing.

**Solutions:**
- Disable unused adapters in production:
```typescript
@SolidField({
  skip: ['graphql'], // Skip in REST-only apps
  description: 'Field description'
})
field: string;
```

### Debug Mode

Enable debug logging to see which decorators are being applied:

```typescript
// In your main.ts or environment configuration
process.env.SOLID_DEBUG = 'true';
```

This will output detailed information about decorator application during startup.

### Getting Help

1. **Check the documentation** - Most issues are covered in the guides
2. **Review example apps** - See working implementations
3. **Enable debug mode** - Get detailed logging information
4. **Check GitHub issues** - Search for similar problems
5. **Create minimal reproduction** - Isolate the problem

### Performance Optimization

#### 1. Skip Unused Adapters

```typescript
// In REST-only applications
@SolidField({
  skip: ['graphql'],
  description: 'Field only for REST API'
})
restOnlyField: string;

// In GraphQL-only applications
@SolidField({
  skip: ['swagger'],
  description: 'Field only for GraphQL'
})
graphqlOnlyField: string;
```

#### 2. Lazy Loading for Large Applications

```typescript
// Use dynamic imports for large entity graphs
@SolidManyToOne(
  () => {
    const { LargeEntity } = require('./large.entity');
    return LargeEntity;
  },
  (entity: any) => entity.relations
)
relation: any;
```

#### 3. Optimize Database Types

```typescript
@SolidField({
  description: 'Short text field',
  maxLength: 50,
  adapters: {
    typeorm: {
      type: 'varchar',
      length: 50 // Explicit length for optimization
    }
  }
})
shortText: string;
```

## Conclusion

SOLID Decorators represent a significant advancement in NestJS development, providing:

- **Dramatic reduction in boilerplate code** (70-80% less)
- **Automatic type inference** and validation
- **Unified configuration** across all technologies
- **Full backward compatibility**
- **Enhanced developer experience**

By following this guide and the best practices outlined, you can leverage the full power of SOLID Decorators to build robust, maintainable applications with minimal effort.

The unified decorator system ensures consistency across your application while providing the flexibility to handle edge cases through adapter-specific configurations and escape hatches to manual decorators when needed.

---

**Next Steps:**
- Explore the [Advanced Configuration Guide](./advanced-configuration.md)
- Learn about [Custom Adapters](./custom-adapters.md)
- Check out [Performance Optimization](./performance-optimization.md)
- Review [Migration Strategies](./migration-strategies.md)