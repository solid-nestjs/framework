# Task 9: Create Common Base Implementation

**Feature**: Entity-to-DTO Code Generation  
**Task ID**: 202508191045  
**Status**: Pending  
**Estimated Time**: 2 hours  
**Dependencies**: Task 1, Task 2  

## Objective

Create a common base implementation in the `packages-core/common` package that will be used by the three specific implementations (rest-api, graphql, rest-graphql).

## Requirements

1. **Location**: `packages-core/common/src/helpers/`

2. **Core Files**:
   - `metadata-extractor.helper.ts` - Extract metadata from entities
   - `property-filter.helper.ts` - Filter properties logic
   - `dto-generator-base.helper.ts` - Base class generation logic

## Implementation

### 1. Metadata Extractor Helper

```typescript
// packages-core/common/src/helpers/metadata-extractor.helper.ts

import { Type } from '@nestjs/common';
import { MetadataStorage } from '../metadata';
import { FieldMetadata } from '../interfaces';

export function extractEntityFieldMetadata(EntityClass: Type): FieldMetadata[] {
  return MetadataStorage.getAllFieldMetadata(EntityClass);
}

export function extractAllPropertyNames(EntityClass: Type): string[] {
  const properties = new Set<string>();
  
  // Get properties from prototype
  let obj = EntityClass.prototype;
  while (obj && obj !== Object.prototype) {
    Object.getOwnPropertyNames(obj).forEach(prop => {
      if (prop !== 'constructor') {
        properties.add(prop);
      }
    });
    obj = Object.getPrototypeOf(obj);
  }
  
  return Array.from(properties);
}

export function getPropertyType(
  EntityClass: Type,
  propertyKey: string
): any {
  return Reflect.getMetadata('design:type', EntityClass.prototype, propertyKey);
}

export function isFlatType(type: any): boolean {
  if (!type) return false;
  
  // Check for basic flat types
  return (
    type === String ||
    type === Number ||
    type === Boolean ||
    type === Date
  );
}

export function isSystemField(fieldName: string): boolean {
  const systemFields = ['id', 'createdAt', 'updatedAt', 'deletedAt'];
  return systemFields.includes(fieldName);
}
```

### 2. Property Filter Helper

```typescript
// packages-core/common/src/helpers/property-filter.helper.ts

import { FieldMetadata } from '../interfaces';
import { isFlatType, isSystemField, getPropertyType } from './metadata-extractor.helper';
import { Type } from '@nestjs/common';

export function filterProperties(
  EntityClass: Type,
  allProperties: string[],
  selectedProperties?: string[]
): string[] {
  if (selectedProperties && selectedProperties.length > 0) {
    // Validate selected properties
    validatePropertySelection(EntityClass, allProperties, selectedProperties);
    return selectedProperties;
  }
  
  // Default: all flat properties except system fields
  return getDefaultProperties(EntityClass, allProperties);
}

export function getDefaultProperties(
  EntityClass: Type,
  allProperties: string[]
): string[] {
  return allProperties.filter(prop => {
    // Skip system fields
    if (isSystemField(prop)) return false;
    
    // Only include flat types
    const type = getPropertyType(EntityClass, prop);
    return isFlatType(type);
  });
}

export function validatePropertySelection(
  EntityClass: Type,
  allProperties: string[],
  selectedProperties: string[]
): void {
  const entityName = EntityClass.name;
  
  selectedProperties.forEach(prop => {
    // Check property exists
    if (!allProperties.includes(prop)) {
      throw new Error(
        `Property '${prop}' does not exist on entity ${entityName}`
      );
    }
    
    // Check property is flat type
    const type = getPropertyType(EntityClass, prop);
    if (!isFlatType(type)) {
      throw new Error(
        `Property '${prop}' is not a flat type (string, number, boolean, Date) ` +
        `and cannot be included in generated DTO`
      );
    }
  });
}
```

### 3. Base DTO Generator

```typescript
// packages-core/common/src/helpers/dto-generator-base.helper.ts

import { Type } from '@nestjs/common';

export abstract class DtoGeneratorBase {
  /**
   * Creates a new class with selected properties from source
   */
  protected static createBaseClass<T>(
    sourceClass: Type<T>,
    properties: string[]
  ): Type {
    class GeneratedDto {}
    
    // Copy property descriptors
    properties.forEach(prop => {
      const descriptor = Object.getOwnPropertyDescriptor(
        sourceClass.prototype,
        prop
      );
      
      if (descriptor) {
        Object.defineProperty(
          GeneratedDto.prototype,
          prop,
          descriptor
        );
      } else {
        // Create default descriptor for properties without descriptors
        Object.defineProperty(
          GeneratedDto.prototype,
          prop,
          {
            writable: true,
            enumerable: true,
            configurable: true
          }
        );
      }
    });
    
    // Set class name for debugging
    Object.defineProperty(GeneratedDto, 'name', {
      value: `Generated${sourceClass.name}Dto`
    });
    
    return GeneratedDto;
  }
  
  /**
   * Abstract method to be implemented by specific packages
   */
  protected abstract transferDecorators(
    sourceClass: Type,
    targetClass: Type,
    propertyKey: string
  ): void;
}
```

### 4. Export from Index

```typescript
// packages-core/common/src/helpers/index.ts

export * from './metadata-extractor.helper';
export * from './property-filter.helper';
export * from './dto-generator-base.helper';
// ... existing exports
```

## Testing

Create unit tests for each helper:

1. **metadata-extractor.helper.spec.ts**:
   - Test metadata extraction
   - Test flat type detection
   - Test system field detection

2. **property-filter.helper.spec.ts**:
   - Test property filtering with selection
   - Test default property selection
   - Test validation errors

3. **dto-generator-base.helper.spec.ts**:
   - Test base class creation
   - Test property descriptor copying

## Success Criteria

- [ ] All helper functions implemented and exported
- [ ] Unit tests for each helper function
- [ ] No circular dependencies
- [ ] Compatible with all three package implementations
- [ ] Type safety maintained