# Task: Basic Decorators Implementation

**Created:** 2025-08-18 20:32  
**Status:** Pending  
**Priority:** High  
**Estimated Time:** 6 hours  
**Package:** @solid-nestjs/common

## Objective

Implement the core unified decorators (@SolidField, @SolidId, @SolidEntity, @SolidInput) that will be used to define entities and DTOs with automatic decorator application.

## Dependencies

- Requires: Core Infrastructure (202508182030)
- Required by: All adapter tasks

## Implementation Details

### 1. @SolidField Decorator

**File:** `packages-core/common/src/decorators/solid-field.decorator.ts`

```typescript
import 'reflect-metadata';
import { SolidFieldOptions } from '../interfaces';
import { MetadataStorage } from '../metadata';
import { DecoratorRegistry } from '../decorator-registry';

export function SolidField(options?: SolidFieldOptions): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol) {
    const type = Reflect.getMetadata('design:type', target, propertyKey);
    
    const metadata: FieldMetadata = {
      target: target.constructor,
      propertyKey,
      type,
      options: options || {},
      isOptional: detectOptionalType(target, propertyKey, type)
    };
    
    MetadataStorage.addFieldMetadata(metadata);
    DecoratorRegistry.applyDecorators(target, propertyKey, metadata);
  };
}
```

### 2. @SolidId Decorator

**File:** `packages-core/common/src/decorators/solid-id.decorator.ts`

```typescript
export function SolidId(options?: SolidIdOptions): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol) {
    const type = Reflect.getMetadata('design:type', target, propertyKey);
    
    const enhancedOptions: SolidFieldOptions = {
      ...options,
      unique: true,
      required: true,
      nullable: false,
      isPrimaryKey: true,
      adapters: {
        ...options?.adapters,
        typeorm: {
          primary: true,
          generated: options?.generated ?? 'uuid',
          ...options?.adapters?.typeorm
        },
        graphql: {
          type: 'ID',
          ...options?.adapters?.graphql
        }
      }
    };
    
    return SolidField(enhancedOptions)(target, propertyKey);
  };
}
```

### 3. @SolidEntity Decorator

**File:** `packages-core/common/src/decorators/solid-entity.decorator.ts`

```typescript
export interface SolidEntityOptions {
  name?: string;
  description?: string;
  tableName?: string;
  schema?: string;
  skip?: string[];
}

export function SolidEntity(options?: SolidEntityOptions): ClassDecorator {
  return function (target: Function) {
    // Store entity metadata
    MetadataStorage.addEntityMetadata({
      target,
      options: options || {},
      type: 'entity'
    });
    
    // Apply technology-specific decorators
    const adapters = DecoratorRegistry.getRegisteredAdapters();
    adapters.forEach(adapterName => {
      if (options?.skip?.includes(adapterName)) return;
      
      const adapter = DecoratorRegistry.getAdapter(adapterName);
      if (adapter && adapter.applyClassDecorator) {
        adapter.applyClassDecorator(target, 'entity', options);
      }
    });
  };
}
```

### 4. @SolidInput Decorator

**File:** `packages-core/common/src/decorators/solid-input.decorator.ts`

```typescript
export interface SolidInputOptions {
  name?: string;
  description?: string;
  skip?: string[];
  defaultSkip?: string[]; // Default: ['typeorm']
}

export function SolidInput(options?: SolidInputOptions): ClassDecorator {
  return function (target: Function) {
    const enhancedOptions = {
      ...options,
      skip: [...(options?.skip || []), ...(options?.defaultSkip || ['typeorm'])]
    };
    
    MetadataStorage.addEntityMetadata({
      target,
      options: enhancedOptions,
      type: 'input'
    });
    
    // Apply technology-specific decorators (excluding TypeORM by default)
    const adapters = DecoratorRegistry.getRegisteredAdapters();
    adapters.forEach(adapterName => {
      if (enhancedOptions.skip.includes(adapterName)) return;
      
      const adapter = DecoratorRegistry.getAdapter(adapterName);
      if (adapter && adapter.applyClassDecorator) {
        adapter.applyClassDecorator(target, 'input', enhancedOptions);
      }
    });
  };
}
```

### 5. Helper Utilities

**File:** `packages-core/common/src/decorators/decorator.utils.ts`

```typescript
export function detectOptionalType(
  target: any, 
  propertyKey: string | symbol, 
  type: any
): boolean {
  // Check if property is optional in TypeScript
  const designType = Reflect.getMetadata('design:type', target, propertyKey);
  const returnType = Reflect.getMetadata('design:returntype', target, propertyKey);
  
  // Check for undefined union type or optional modifier
  return designType === undefined || 
         returnType === undefined ||
         isOptionalProperty(target.constructor, propertyKey);
}

export function isOptionalProperty(
  targetClass: Function,
  propertyKey: string | symbol
): boolean {
  // Use TypeScript compiler API or metadata to detect optional properties
  // This may require additional metadata emission
  return false; // Placeholder implementation
}
```

## Testing Requirements

### Unit Tests

1. **@SolidField Tests**
   - Test basic field decoration
   - Test with various options
   - Test skip functionality
   - Test adapter-specific options
   - Test type detection

2. **@SolidId Tests**
   - Test primary key decoration
   - Test UUID generation option
   - Test auto-increment option
   - Test composite key support

3. **@SolidEntity Tests**
   - Test entity decoration
   - Test table name option
   - Test schema option
   - Test class-level skip

4. **@SolidInput Tests**
   - Test DTO decoration
   - Test automatic TypeORM skip
   - Test custom skip options
   - Test validation decorators

### Integration Tests

1. Test decorator combination (Entity + Fields)
2. Test with real TypeScript types
3. Test optional property detection
4. Test with different adapter combinations

## Success Criteria

- [ ] All basic decorators implemented
- [ ] Type detection working correctly
- [ ] Optional property detection functional
- [ ] Skip functionality working
- [ ] Adapter-specific options passing through
- [ ] All tests passing with >95% coverage
- [ ] Backward compatible with existing decorators

## Notes

- Consider using TypeScript transformer for better optional detection
- Ensure decorators can be composed with manual decorators
- Performance: Minimize reflection calls
- Consider caching type information