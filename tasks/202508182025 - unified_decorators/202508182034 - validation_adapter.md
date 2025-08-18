# Task: Validation Adapter Implementation

**Created:** 2025-08-18 20:34  
**Status:** Pending  
**Priority:** High  
**Estimated Time:** 4 hours  
**Package:** @solid-nestjs/common

## Objective

Implement the validation adapter that applies class-validator and class-transformer decorators. This adapter is special as it's registered once in the common package and shared across REST and GraphQL to avoid duplication.

## Dependencies

- Requires: Core Infrastructure (202508182030)
- Requires: Basic Decorators (202508182032)

## Implementation Details

### 1. Validation Adapter Class

**File:** `packages-core/common/src/adapters/validation.adapter.ts`

```typescript
import {
  IsString, IsNumber, IsBoolean, IsDate, IsEmail, IsUUID,
  IsOptional, IsNotEmpty, IsEnum, IsArray, IsObject,
  Min, Max, MinLength, MaxLength, Matches,
  ValidateNested, IsInt, IsPositive, IsNegative,
  ArrayMinSize, ArrayMaxSize, IsUrl, IsJSON
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { DecoratorAdapter, FieldMetadata } from '../interfaces';

export class ValidationDecoratorAdapter implements DecoratorAdapter {
  name = 'validation';
  
  // Track applied decorators to prevent duplicates
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
    
    // Skip if validation explicitly disabled
    if (options.skipValidation || adapterOptions?.skip) {
      return;
    }
    
    // Apply transformation
    this.applyTransformation(target, propertyKey, type, options, adapterOptions);
    
    // Apply optional/required validators
    this.applyOptionalValidators(target, propertyKey, options, isOptional, adapterOptions);
    
    // Apply type-specific validators
    this.applyTypeValidators(target, propertyKey, type, options, adapterOptions);
    
    // Apply constraint validators
    this.applyConstraintValidators(target, propertyKey, type, options, adapterOptions);
    
    // Apply custom validators
    this.applyCustomValidators(target, propertyKey, adapterOptions);
  }
  
  private applyTransformation(
    target: any,
    propertyKey: string | symbol,
    type: any,
    options: any,
    adapterOptions: any
  ): void {
    // Skip transformation if explicitly disabled
    if (options.transform === false || adapterOptions?.skipTransform) {
      return;
    }
    
    // Apply Type decorator for nested objects
    if (type && !this.isPrimitiveType(type)) {
      Type(() => type)(target, propertyKey);
    }
    
    // Apply custom transformers
    if (adapterOptions?.transform) {
      Transform(adapterOptions.transform)(target, propertyKey);
    }
  }
  
  private applyOptionalValidators(
    target: any,
    propertyKey: string | symbol,
    options: any,
    isOptional: boolean,
    adapterOptions: any
  ): void {
    const isNullable = options.nullable ?? isOptional;
    
    if (isNullable) {
      IsOptional()(target, propertyKey);
    } else if (!adapterOptions?.skipRequired) {
      IsNotEmpty()(target, propertyKey);
    }
  }
  
  private applyTypeValidators(
    target: any,
    propertyKey: string | symbol,
    type: any,
    options: any,
    adapterOptions: any
  ): void {
    // String validators
    if (type === String) {
      IsString()(target, propertyKey);
      
      if (options.email || adapterOptions?.email) {
        IsEmail(adapterOptions?.emailOptions || {})(target, propertyKey);
      }
      if (options.url || adapterOptions?.url) {
        IsUrl(adapterOptions?.urlOptions || {})(target, propertyKey);
      }
      if (options.uuid || adapterOptions?.uuid) {
        IsUUID(adapterOptions?.uuidVersion || '4')(target, propertyKey);
      }
      if (options.json || adapterOptions?.json) {
        IsJSON()(target, propertyKey);
      }
    }
    
    // Number validators
    else if (type === Number) {
      if (options.integer || adapterOptions?.integer) {
        IsInt()(target, propertyKey);
      } else {
        IsNumber(adapterOptions?.numberOptions || {})(target, propertyKey);
      }
      
      if (options.positive || adapterOptions?.positive) {
        IsPositive()(target, propertyKey);
      }
      if (options.negative || adapterOptions?.negative) {
        IsNegative()(target, propertyKey);
      }
    }
    
    // Boolean validators
    else if (type === Boolean) {
      IsBoolean()(target, propertyKey);
    }
    
    // Date validators
    else if (type === Date) {
      IsDate()(target, propertyKey);
    }
    
    // Array validators
    else if (Array.isArray(type) || adapterOptions?.isArray) {
      IsArray()(target, propertyKey);
      
      if (adapterOptions?.arrayType) {
        ValidateNested({ each: true })(target, propertyKey);
        Type(() => adapterOptions.arrayType)(target, propertyKey);
      }
    }
    
    // Enum validators
    else if (options.enum || adapterOptions?.enum) {
      const enumType = options.enum || adapterOptions.enum;
      IsEnum(enumType)(target, propertyKey);
    }
    
    // Object validators
    else if (type && typeof type === 'function' && !this.isPrimitiveType(type)) {
      IsObject()(target, propertyKey);
      ValidateNested()(target, propertyKey);
    }
  }
  
  private applyConstraintValidators(
    target: any,
    propertyKey: string | symbol,
    type: any,
    options: any,
    adapterOptions: any
  ): void {
    // String constraints
    if (type === String) {
      if (options.minLength !== undefined) {
        MinLength(options.minLength)(target, propertyKey);
      }
      if (options.maxLength !== undefined) {
        MaxLength(options.maxLength)(target, propertyKey);
      }
      if (options.pattern) {
        Matches(options.pattern)(target, propertyKey);
      }
    }
    
    // Number constraints
    if (type === Number) {
      if (options.min !== undefined) {
        Min(options.min)(target, propertyKey);
      }
      if (options.max !== undefined) {
        Max(options.max)(target, propertyKey);
      }
    }
    
    // Array constraints
    if (Array.isArray(type) || adapterOptions?.isArray) {
      if (options.minSize !== undefined || adapterOptions?.minSize !== undefined) {
        ArrayMinSize(options.minSize || adapterOptions.minSize)(target, propertyKey);
      }
      if (options.maxSize !== undefined || adapterOptions?.maxSize !== undefined) {
        ArrayMaxSize(options.maxSize || adapterOptions.maxSize)(target, propertyKey);
      }
    }
  }
  
  private applyCustomValidators(
    target: any,
    propertyKey: string | symbol,
    adapterOptions: any
  ): void {
    if (adapterOptions?.validators && Array.isArray(adapterOptions.validators)) {
      adapterOptions.validators.forEach((validator: any) => {
        if (typeof validator === 'function') {
          validator(target, propertyKey);
        }
      });
    }
  }
  
  private isPrimitiveType(type: any): boolean {
    return [String, Number, Boolean, Date, Symbol, BigInt].includes(type);
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
  
  // Class-level decorator support
  applyClassDecorator?(target: Function, type: 'entity' | 'input', options: any): void {
    // No class-level validation decorators needed
  }
}
```

### 2. Singleton Registration

**File:** `packages-core/common/src/adapters/index.ts`

```typescript
import { DecoratorRegistry } from '../decorator-registry';
import { ValidationDecoratorAdapter } from './validation.adapter';

// Singleton instance to prevent multiple registrations
let validationAdapterInstance: ValidationDecoratorAdapter | null = null;

export function registerValidationAdapter(): void {
  if (!validationAdapterInstance) {
    validationAdapterInstance = new ValidationDecoratorAdapter();
    if (validationAdapterInstance.isAvailable()) {
      DecoratorRegistry.registerAdapter('validation', validationAdapterInstance);
    }
  }
}

// Auto-register on import
registerValidationAdapter();

export { ValidationDecoratorAdapter };
```

## Testing Requirements

### Unit Tests

1. **Basic Validation Tests**
   - Test string validation decorators
   - Test number validation decorators
   - Test boolean validation decorators
   - Test date validation decorators

2. **Constraint Tests**
   - Test min/max constraints
   - Test length constraints
   - Test pattern matching
   - Test array size constraints

3. **Complex Type Tests**
   - Test enum validation
   - Test nested object validation
   - Test array validation with type checking

4. **Duplicate Prevention Tests**
   - Test WeakMap tracking
   - Test single application per property
   - Verify no duplicate decorators

5. **Configuration Tests**
   - Test skip validation option
   - Test custom validators
   - Test transformation options

## Success Criteria

- [ ] Validation adapter implemented with all common validators
- [ ] Duplicate prevention mechanism working
- [ ] Singleton registration pattern implemented
- [ ] Support for custom validators
- [ ] Transformation decorators applied correctly
- [ ] All primitive and complex types supported
- [ ] 100% test coverage
- [ ] No performance degradation

## Notes

- Must be registered only once in common package
- REST and GraphQL packages must NOT register their own validation
- Consider lazy loading of validators for better performance
- Ensure compatibility with existing validation decorators
- WeakMap ensures proper garbage collection