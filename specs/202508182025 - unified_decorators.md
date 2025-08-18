# Unified Decorators Specification

**Date:** 2025-08-18  
**Version:** 1.0  
**Status:** Draft  
**Author:** SOLID NestJS Team

## Executive Summary

This specification defines a new decorator system for the SOLID NestJS Framework that unifies and simplifies the definition of entities and DTOs by automatically applying the appropriate decorators based on TypeScript types and configuration options. This system will reduce boilerplate code by 70-80% while maintaining full compatibility with existing manual decorators.

## Problem Statement

Currently, developers must manually apply multiple decorators for each field in entities and DTOs:

### Current Entity Definition (Boilerplate Heavy)
```typescript
@ObjectType()
@Entity()
export class Product {
  @ApiProperty({ description: 'The unique identifier' })
  @Field(() => ID, { description: 'The unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Product name' })
  @Field({ description: 'Product name' })
  @Column()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Price', required: false })
  @Field(() => Float, { description: 'Price', nullable: true })
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;
}
```

### Issues with Current Approach
1. **Redundancy:** Same information repeated across multiple decorators
2. **Error-prone:** Inconsistencies between TypeScript types and decorator configurations
3. **Maintenance burden:** Changes require updating multiple decorators
4. **Learning curve:** Developers must know all decorator APIs
5. **Verbosity:** Simple fields require 3-5 decorators

## Proposed Solution

### New Unified Decorator Syntax

```typescript
import { SolidEntity, SolidField, SolidId, SolidRelation } from '@solid-nestjs/common';

@SolidEntity()
export class Product {
  @SolidId()
  id: string;

  @SolidField()
  name: string;

  @SolidField({ 
    precision: 10, 
    scale: 2,
    min: 0 
  })
  price?: number;

  @SolidField({ 
    maxLength: 500,
    defaultValue: '' 
  })
  description: string = '';

  @SolidRelation(() => Supplier, { 
    cascade: true,
    eager: false 
  })
  supplier: Supplier;
}
```

### DTO Definition with Unified Decorators

```typescript
import { SolidInput, SolidField } from '@solid-nestjs/common';

@SolidInput()
export class CreateProductDto {
  @SolidField()
  name: string;

  @SolidField({ min: 0, transform: true })
  price: number;

  @SolidField({ optional: true })
  description?: string;
}
```

## Technical Design

### Core Architecture

```
@solid-nestjs/common (Core Package)
├── decorators/
│   ├── solid-field.decorator.ts
│   ├── solid-id.decorator.ts  
│   ├── solid-relation.decorator.ts
│   ├── solid-entity.decorator.ts
│   └── solid-input.decorator.ts
├── metadata/
│   ├── field-metadata.ts
│   └── metadata-storage.ts
└── helpers/
    ├── type-inference.helper.ts
    └── decorator-builder.helper.ts

Technology-specific packages apply decorators:
- @solid-nestjs/typeorm → Applies TypeORM decorators
- @solid-nestjs/rest-api → Applies Swagger decorators  
- @solid-nestjs/graphql → Applies GraphQL decorators
```

### Decorator Implementation Strategy

#### 1. Metadata Collection Phase
```typescript
@SolidField(options?: SolidFieldOptions)
```
- Collects field metadata (name, type, options)
- Stores in global metadata storage
- Infers types from TypeScript reflection

#### 2. Decorator Application Phase - DETAILED MECHANISM

The key innovation is that `@SolidField` and other unified decorators work as **composite decorators** that apply multiple specific decorators at compile time through a plugin-based architecture that follows SOLID principles.

##### Plugin-Based Registration Architecture (Recommended)

```typescript
// In @solid-nestjs/common/decorators/solid-field.decorator.ts
export interface SolidFieldOptions {
  // Common options
  description?: string;
  defaultValue?: any;
  
  // Adapter control
  skip?: string[];  // Array of adapter names to skip
  adapters?: {      // Adapter-specific options
    [adapterName: string]: any;
  };
  
  // Common field options
  required?: boolean;
  nullable?: boolean;
  unique?: boolean;
  // ... other common options
}

export function SolidField(options?: SolidFieldOptions): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol) {
    const type = Reflect.getMetadata('design:type', target, propertyKey);
    
    // Store metadata for adapters to use
    const metadata: FieldMetadata = {
      target: target.constructor,
      propertyKey,
      type,
      options: options || {},
      isOptional: type === undefined || Reflect.getMetadata('design:returntype', target, propertyKey) === undefined
    };
    
    MetadataStorage.addFieldMetadata(metadata);
    
    // Apply decorators from all registered adapters
    DecoratorRegistry.applyDecorators(target, propertyKey, metadata);
  };
}
```

##### Decorator Registry Core

```typescript
// In @solid-nestjs/common/decorator-registry.ts
export interface DecoratorAdapter {
  name: string;
  apply(target: any, propertyKey: string | symbol, metadata: FieldMetadata): void;
  isAvailable(): boolean;
}

export class DecoratorRegistry {
  private static adapters: Map<string, DecoratorAdapter> = new Map();
  
  static registerAdapter(name: string, adapter: DecoratorAdapter) {
    // Prevent duplicate registration
    if (this.adapters.has(name)) {
      console.debug(`[SolidNestJS] Adapter '${name}' already registered, skipping`);
      return;
    }
    
    if (adapter.isAvailable()) {
      this.adapters.set(name, adapter);
      console.debug(`[SolidNestJS] Registered adapter: ${name}`);
    }
  }
  
  static applyDecorators(
    target: any,
    propertyKey: string | symbol,
    metadata: FieldMetadata
  ) {
    const skipAdapters = metadata.options?.skip || [];
    
    this.adapters.forEach((adapter, name) => {
      // Skip if adapter is in skip list
      if (skipAdapters.includes(name)) {
        return;
      }
      
      // Apply decorator with adapter-specific options if provided
      const adapterOptions = metadata.options?.adapters?.[name];
      const enhancedMetadata = {
        ...metadata,
        adapterOptions
      };
      
      adapter.apply(target, propertyKey, enhancedMetadata);
    });
  }
  
  static getAdapter(name: string): DecoratorAdapter | undefined {
    return this.adapters.get(name);
  }
  
  static getRegisteredAdapters(): string[] {
    return Array.from(this.adapters.keys());
  }
}
```

##### Adapter Registration Architecture

The registration architecture ensures no duplicates and proper separation of concerns:

```
Package Structure & Registration Flow:

@solid-nestjs/common
├── Registers: validation adapter (singleton)
├── Provides: DecoratorRegistry
└── Manages: Core decorators and metadata

@solid-nestjs/typeorm
├── Registers: typeorm adapter
└── Depends on: @solid-nestjs/common

@solid-nestjs/rest-api
├── Registers: swagger adapter
├── Does NOT register: validation (uses common's)
└── Depends on: @solid-nestjs/common

@solid-nestjs/graphql
├── Registers: graphql adapter
├── Does NOT register: validation (uses common's)
└── Depends on: @solid-nestjs/common

@solid-nestjs/rest-graphql (hybrid)
├── Does NOT register any adapters
├── Imports: rest-api + graphql (adapters auto-register)
└── Validation is registered once via common
```

**Key Points:**
1. **Validation adapter** is registered ONCE in @solid-nestjs/common
2. **Technology-specific adapters** register in their own packages
3. **Hybrid packages** don't register adapters, they import packages that do
4. **WeakMap tracking** prevents duplicate decorator application
5. **Singleton pattern** ensures single instance of validation adapter
```

##### Implementation in Technology-Specific Packages

**@solid-nestjs/typeorm/adapters/typeorm.adapter.ts:**
```typescript
import { Column, ColumnOptions } from 'typeorm';
import { DecoratorAdapter, FieldMetadata } from '@solid-nestjs/common';

export class TypeOrmDecoratorAdapter implements DecoratorAdapter {
  name = 'typeorm';
  
  isAvailable(): boolean {
    try {
      require.resolve('typeorm');
      require.resolve('@nestjs/typeorm');
      return true;
    } catch {
      return false;
    }
  }
  
  apply(target: any, propertyKey: string | symbol, metadata: FieldMetadata): void {
    const { type, options, isOptional, adapterOptions } = metadata;
    
    // Merge common options with adapter-specific options
    const columnOptions: ColumnOptions = {
      type: this.mapTypeToColumnType(type),
      nullable: options.nullable ?? isOptional,
      default: options.defaultValue,
      unique: options.unique,
      ...adapterOptions // Allow override with adapter-specific options
    };
    
    // Apply specific mappings
    if (type === Number && (options.precision || adapterOptions?.precision)) {
      columnOptions.type = 'decimal';
      columnOptions.precision = options.precision || adapterOptions?.precision;
      columnOptions.scale = options.scale || adapterOptions?.scale;
    }
    
    if (type === String && options.maxLength) {
      columnOptions.length = options.maxLength;
    }
    
    // Apply the Column decorator
    Column(columnOptions)(target, propertyKey);
  }
  
  private mapTypeToColumnType(type: any): string {
    const typeMap = new Map([
      [String, 'varchar'],
      [Number, 'int'],
      [Boolean, 'boolean'],
      [Date, 'timestamp'],
      [Buffer, 'blob'],
    ]);
    
    return typeMap.get(type) || 'varchar';
  }
}

// Auto-register when imported
import { DecoratorRegistry } from '@solid-nestjs/common';
DecoratorRegistry.registerAdapter('typeorm', new TypeOrmDecoratorAdapter());
```

**@solid-nestjs/rest-api/adapters/swagger.adapter.ts:**
```typescript
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { DecoratorAdapter, FieldMetadata } from '@solid-nestjs/common';

export class SwaggerDecoratorAdapter implements DecoratorAdapter {
  name = 'swagger';
  
  isAvailable(): boolean {
    try {
      require.resolve('@nestjs/swagger');
      return true;
    } catch {
      return false;
    }
  }
  
  apply(target: any, propertyKey: string | symbol, metadata: FieldMetadata): void {
    const { type, options, isOptional, adapterOptions } = metadata;
    
    const apiPropertyOptions: ApiPropertyOptions = {
      type: this.mapTypeToSwaggerType(type),
      description: options.description,
      required: !(options.nullable ?? isOptional),
      example: options.example,
      deprecated: options.deprecated,
      ...adapterOptions // Allow override with adapter-specific options
    };
    
    // Handle enums
    if (adapterOptions?.enum) {
      apiPropertyOptions.enum = adapterOptions.enum;
    }
    
    // Apply the ApiProperty decorator
    ApiProperty(apiPropertyOptions)(target, propertyKey);
  }
  
  private mapTypeToSwaggerType(type: any): any {
    if (type === Number) return 'number';
    if (type === String) return 'string';
    if (type === Boolean) return 'boolean';
    if (type === Date) return 'string'; // format: date-time
    if (Array.isArray(type)) return 'array';
    return type;
  }
}

// Auto-register when imported
import { DecoratorRegistry } from '@solid-nestjs/common';
DecoratorRegistry.registerAdapter('swagger', new SwaggerDecoratorAdapter());
```

**@solid-nestjs/graphql/adapters/graphql.adapter.ts:**
```typescript
import { Field, FieldOptions, Int, Float, ID } from '@nestjs/graphql';
import { DecoratorAdapter, FieldMetadata } from '@solid-nestjs/common';

export class GraphQLDecoratorAdapter implements DecoratorAdapter {
  name = 'graphql';
  
  isAvailable(): boolean {
    try {
      require.resolve('@nestjs/graphql');
      return true;
    } catch {
      return false;
    }
  }
  
  apply(target: any, propertyKey: string | symbol, metadata: FieldMetadata): void {
    const { type, options, isOptional, adapterOptions } = metadata;
    
    const graphqlType = this.mapTypeToGraphQLType(type, options);
    const fieldOptions: FieldOptions = {
      description: options.description,
      nullable: options.nullable ?? isOptional,
      defaultValue: options.defaultValue,
      deprecationReason: options.deprecated ? 'Deprecated field' : undefined,
      ...adapterOptions // Allow override with adapter-specific options
    };
    
    // Apply the Field decorator
    if (graphqlType) {
      Field(() => graphqlType, fieldOptions)(target, propertyKey);
    } else {
      Field(fieldOptions)(target, propertyKey);
    }
  }
  
  private mapTypeToGraphQLType(type: any, options: any): any {
    if (options.id || options.adapterOptions?.graphql?.type === 'ID') {
      return ID;
    }
    if (type === Number) {
      if (options.float || options.precision) {
        return Float;
      }
      return Int;
    }
    if (type === String) return String;
    if (type === Boolean) return Boolean;
    if (type === Date) return Date;
    return null; // Let GraphQL infer the type
  }
}

// Auto-register when imported
import { DecoratorRegistry } from '@solid-nestjs/common';
DecoratorRegistry.registerAdapter('graphql', new GraphQLDecoratorAdapter());
```

##### Validation Adapter - Special Handling

The validation adapter is special because it's shared across REST and GraphQL. To avoid duplicate decorator application, it's managed centrally:

**@solid-nestjs/common/adapters/validation.adapter.ts:**
```typescript
import { 
  IsString, IsNumber, IsBoolean, IsDate, IsEmail,
  IsOptional, IsNotEmpty, Min, Max, MinLength, MaxLength 
} from 'class-validator';
import { Type } from 'class-transformer';
import { DecoratorAdapter, FieldMetadata } from '@solid-nestjs/common';

export class ValidationDecoratorAdapter implements DecoratorAdapter {
  name = 'validation';
  private static applied = new WeakMap<any, Set<string | symbol>>();
  
  isAvailable(): boolean {
    try {
      require.resolve('class-validator');
      require.resolve('class-transformer');
      return true;
    } catch {
      return false;
    }
  }
  
  apply(target: any, propertyKey: string | symbol, metadata: FieldMetadata): void {
    // Prevent duplicate application
    if (this.isAlreadyApplied(target, propertyKey)) {
      return;
    }
    this.markAsApplied(target, propertyKey);
    
    const { type, options, isOptional, adapterOptions } = metadata;
    
    // Skip validation if explicitly disabled
    if (options.skipValidation || adapterOptions?.skip) {
      return;
    }
    
    // Apply transformation decorator if needed
    if (options.transform !== false && type) {
      Type(() => type)(target, propertyKey);
    }
    
    // Apply optional decorator
    if (options.nullable ?? isOptional) {
      IsOptional()(target, propertyKey);
    } else if (!adapterOptions?.skipRequired) {
      IsNotEmpty()(target, propertyKey);
    }
    
    // Apply type validators
    if (type === String) {
      IsString()(target, propertyKey);
      
      if (options.email || adapterOptions?.email) {
        IsEmail()(target, propertyKey);
      }
      if (options.minLength) {
        MinLength(options.minLength)(target, propertyKey);
      }
      if (options.maxLength) {
        MaxLength(options.maxLength)(target, propertyKey);
      }
    } else if (type === Number) {
      IsNumber()(target, propertyKey);
      
      if (options.min !== undefined) {
        Min(options.min)(target, propertyKey);
      }
      if (options.max !== undefined) {
        Max(options.max)(target, propertyKey);
      }
    } else if (type === Boolean) {
      IsBoolean()(target, propertyKey);
    } else if (type === Date) {
      IsDate()(target, propertyKey);
    }
    
    // Apply custom validators from adapter options
    if (adapterOptions?.validators) {
      adapterOptions.validators.forEach((validator: any) => {
        validator(target, propertyKey);
      });
    }
  }
  
  private isAlreadyApplied(target: any, propertyKey: string | symbol): boolean {
    const applied = ValidationDecoratorAdapter.applied.get(target);
    return applied ? applied.has(propertyKey) : false;
  }
  
  private markAsApplied(target: any, propertyKey: string | symbol): void {
    let applied = ValidationDecoratorAdapter.applied.get(target);
    if (!applied) {
      applied = new Set();
      ValidationDecoratorAdapter.applied.set(target, applied);
    }
    applied.add(propertyKey);
  }
}

// Singleton instance registered once in common package
let validationAdapterInstance: ValidationDecoratorAdapter | null = null;

export function registerValidationAdapter(): void {
  if (!validationAdapterInstance) {
    validationAdapterInstance = new ValidationDecoratorAdapter();
    DecoratorRegistry.registerAdapter('validation', validationAdapterInstance);
  }
}

// Auto-register when imported
registerValidationAdapter();
```

##### Usage Examples

**Basic Usage:**
```typescript
@SolidEntity()
export class Product {
  @SolidField({ description: 'Product name', maxLength: 100 })
  name: string;
}
```

**Skipping Specific Adapters (e.g., calculated field):**
```typescript
@SolidEntity()
export class Product {
  @SolidField()
  price: number;
  
  @SolidField()
  quantity: number;
  
  // This field is calculated, not stored in database
  @SolidField({ 
    skip: ['typeorm'],  // Skip TypeORM decorator
    description: 'Total value (price * quantity)'
  })
  get totalValue(): number {
    return this.price * this.quantity;
  }
}
```

**Adapter-Specific Options:**
```typescript
@SolidEntity()
export class User {
  @SolidField({
    description: 'User email address',
    unique: true,
    email: true,  // Common validation
    adapters: {
      // TypeORM specific options
      typeorm: {
        type: 'varchar',
        length: 255,
        charset: 'utf8mb4',
        collation: 'utf8mb4_unicode_ci'
      },
      // GraphQL specific options
      graphql: {
        complexity: 5,
        extensions: { 
          role: 'USER_FIELD' 
        }
      },
      // Swagger specific options
      swagger: {
        example: 'user@example.com',
        format: 'email'
      },
      // Custom validators
      validation: {
        validators: [
          IsEmail({ allow_ip_domain: false }),
          CustomEmailDomainValidator()
        ]
      }
    }
  })
  email: string;
}
```

**Complex Field with Multiple Configurations:**
```typescript
@SolidEntity()
export class Invoice {
  @SolidField({
    description: 'Invoice amount',
    precision: 10,
    scale: 2,
    min: 0,
    max: 1000000,
    adapters: {
      typeorm: {
        type: 'decimal',
        transformer: {
          to: (value: number) => value,
          from: (value: string) => parseFloat(value)
        }
      },
      graphql: {
        type: () => Float
      },
      swagger: {
        type: 'number',
        format: 'decimal'
      }
    }
  })
  amount: number;
  
  @SolidField({
    description: 'Invoice status',
    adapters: {
      typeorm: {
        type: 'enum',
        enum: InvoiceStatus,
        default: InvoiceStatus.DRAFT
      },
      graphql: {
        type: () => InvoiceStatus
      },
      swagger: {
        enum: InvoiceStatus,
        enumName: 'InvoiceStatus'
      }
    }
  })
  status: InvoiceStatus;
}
```

**Selective Adapter Usage for DTOs:**
```typescript
@SolidInput()
export class CreateProductDto {
  @SolidField({
    skip: ['typeorm'],  // DTOs don't need database decorators
    description: 'Product name'
  })
  name: string;
  
  @SolidField({
    skip: ['typeorm'],
    min: 0,
    adapters: {
      swagger: {
        example: 99.99
      }
    }
  })
  price: number;
}
```

**Execution Flow:**
1. `@SolidField` decorator executes
2. Detects type via reflection (e.g., `string`)
3. Checks registered adapters:
   - ✅ TypeORM adapter → checks if in skip list → applies if not skipped
   - ✅ Swagger adapter → checks if in skip list → applies with specific options
   - ✅ GraphQL adapter → checks if in skip list → applies with specific options
   - ✅ Validation adapter → checks if in skip list → applies validators
4. Each adapter receives both common options and its specific options
5. All decorators are applied at compile time
6. NestJS sees the fully decorated property

### Type Inference Rules

| TypeScript Type | Database Type | GraphQL Type | Validation |
|----------------|---------------|--------------|------------|
| `string` | `varchar` | `String` | `@IsString()` |
| `string?` | `varchar NULL` | `String nullable` | `@IsOptional() @IsString()` |
| `number` | `int` | `Int` | `@IsNumber()` |
| `number?` | `int NULL` | `Int nullable` | `@IsOptional() @IsNumber()` |
| `boolean` | `boolean` | `Boolean` | `@IsBoolean()` |
| `Date` | `timestamp` | `DateTime` | `@IsDate()` |
| `Decimal` | `decimal` | `Float` | `@IsNumber()` |
| `T[]` | `json` | `[T]` | `@IsArray()` |
| `Enum` | `enum` | `registerEnumType` | `@IsEnum()` |

### Configuration Options

```typescript
interface SolidFieldOptions {
  // Common options
  description?: string;
  defaultValue?: any;
  transform?: boolean;
  
  // Database options
  columnType?: string;
  length?: number;
  precision?: number;
  scale?: number;
  unique?: boolean;
  index?: boolean;
  
  // Validation options  
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  
  // API options
  example?: any;
  deprecated?: boolean;
  hidden?: boolean;
  
  // Override options
  skipValidation?: boolean;
  skipDatabase?: boolean;
  skipApi?: boolean;
}
```

### Compatibility Features

#### 1. Mixed Usage Support
```typescript
@SolidEntity()
export class Product {
  @SolidId()
  id: string;

  @SolidField()
  name: string;

  // Manual decorators still work
  @Column('text')
  @ApiProperty({ description: 'Custom field' })
  @Field()
  customField: string;
}
```

#### 2. Override Mechanism
```typescript
@SolidField({
  // Auto-applies decorators
})
@Column('varchar', { length: 100 }) // Manual override
name: string;
```

#### 3. Context-Aware Application
- REST-only apps: Skip GraphQL decorators
- GraphQL-only apps: Skip Swagger decorators
- Detect available packages at runtime

## Implementation Plan

### Phase 1: Core Infrastructure (Week 1)
1. Create metadata storage system
2. Implement type inference helpers
3. Build decorator factories
4. Create configuration interfaces

### Phase 2: Basic Decorators (Week 2)
1. Implement @SolidField decorator
2. Implement @SolidId decorator
3. Implement @SolidEntity and @SolidInput
4. Create decorator application engine

### Phase 3: Advanced Features (Week 3)
1. Implement @SolidRelation decorator
2. Add @SolidTimestamp for createdAt/updatedAt
3. Create @SolidEnum for enum fields
4. Build @SolidEmbedded for embedded entities

### Phase 4: Technology Adapters (Week 4)
1. Create TypeORM adapter
2. Create Swagger adapter
3. Create GraphQL adapter
4. Implement conditional application logic

### Phase 5: Testing & Documentation (Week 5)
1. Unit tests for all decorators
2. Integration tests with example apps
3. Migration guide documentation
4. API reference documentation

## Migration Strategy

### Gradual Adoption
1. New decorators work alongside existing ones
2. Teams can migrate file by file
3. No breaking changes to existing code

### Migration Helper Tool
```bash
npm run migrate:decorators -- --path=src/entities
```
- Analyzes existing decorators
- Suggests unified decorator replacements
- Can auto-migrate with confirmation

### Example Migration

**Before:**
```typescript
@ObjectType()
@Entity()
export class User {
  @ApiProperty()
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Field()
  @Column()
  @IsEmail()
  email: string;
}
```

**After:**
```typescript
@SolidEntity()
export class User {
  @SolidId()
  id: string;

  @SolidField({ pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ })
  email: string;
}
```

## Performance Considerations

### Startup Performance
- Metadata collection: ~5ms per 100 fields
- Decorator application: ~10ms per entity
- Total overhead: <100ms for typical app

### Runtime Performance
- No runtime overhead after initialization
- Decorators applied once during bootstrap
- Same performance as manual decorators

### Memory Usage
- Metadata storage: ~1KB per entity
- Cleared after application startup
- No memory leaks

## Security Considerations

1. **Input Validation:** Automatic validation decorators based on types
2. **SQL Injection:** TypeORM parameterized queries unchanged
3. **Type Safety:** Full TypeScript type checking preserved
4. **Schema Validation:** Automatic DTO validation rules

## Testing Strategy

### Unit Tests
- Test each decorator in isolation
- Verify metadata collection
- Test type inference logic
- Validate decorator application

### Integration Tests
- Test with real entities/DTOs
- Verify database schema generation
- Test API documentation generation
- Validate GraphQL schema

### E2E Tests
- Full CRUD operations
- API endpoint testing
- GraphQL query testing
- Multi-database support

## Documentation Requirements

### API Reference
- Decorator API documentation
- Configuration options reference
- Type mapping tables
- Examples for each decorator

### Guides
1. Getting Started Guide
2. Migration Guide
3. Best Practices Guide
4. Troubleshooting Guide

### Examples
- Update all example apps
- Create comparison examples
- Show advanced use cases
- Performance benchmarks

## Success Metrics

1. **Code Reduction:** 70-80% less boilerplate
2. **Developer Velocity:** 50% faster entity/DTO creation
3. **Error Reduction:** 90% fewer decorator-related bugs
4. **Adoption Rate:** 80% of new projects using unified decorators
5. **Performance:** <100ms startup overhead

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking changes | High | Full backward compatibility |
| Performance regression | Medium | Extensive benchmarking |
| Complex edge cases | Medium | Escape hatch to manual decorators |
| Learning curve | Low | Comprehensive documentation |
| Package size increase | Low | Tree-shaking support |

## Future Extensions

### Version 2.0 Features
1. **AI-Powered Suggestions:** Suggest optimal field configurations
2. **Schema Evolution:** Automatic migration generation
3. **Multi-Database:** Database-specific optimizations
4. **Custom Validators:** Pluggable validation system
5. **IDE Integration:** VSCode extension for IntelliSense

### Ecosystem Integration
1. **Prisma Support:** Alternative to TypeORM
2. **Zod Integration:** Schema validation
3. **tRPC Support:** Type-safe APIs
4. **Effect-TS:** Functional programming support

## Conclusion

The Unified Decorators system will significantly improve developer experience by reducing boilerplate, preventing errors, and accelerating development while maintaining full compatibility with the existing SOLID NestJS Framework architecture. This specification provides a clear path forward for implementation with minimal risk and maximum benefit.

## Appendix

### A. Detailed Type Mappings
[Full type mapping tables for all supported types]

### B. Configuration Examples
[Comprehensive examples of all configuration options]

### C. Performance Benchmarks
[Detailed performance analysis and benchmarks]

### D. Compatibility Matrix
[Package version compatibility information]