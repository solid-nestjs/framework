# Task: Core Infrastructure for Unified Decorators

**Created:** 2025-08-18 20:30  
**Status:** Pending  
**Priority:** High  
**Estimated Time:** 8 hours  
**Package:** @solid-nestjs/common

## Objective

Create the foundational infrastructure for the unified decorator system, including metadata storage, type inference utilities, and the decorator registry system.

## Dependencies

- Must be completed before any other decorator tasks
- No external task dependencies

## Implementation Details

### 1. Create Metadata Storage System

**File:** `packages-core/common/src/metadata/metadata-storage.ts`

```typescript
export interface FieldMetadata {
  target: Function;
  propertyKey: string | symbol;
  type: any;
  options: SolidFieldOptions;
  isOptional: boolean;
}

export class MetadataStorage {
  private static fields: Map<Function, Map<string | symbol, FieldMetadata>>;
  
  static addFieldMetadata(metadata: FieldMetadata): void;
  static getFieldMetadata(target: Function, propertyKey?: string | symbol): FieldMetadata[];
  static clearMetadata(): void;
}
```

### 2. Create Decorator Registry

**File:** `packages-core/common/src/decorator-registry/decorator-registry.ts`

```typescript
export interface DecoratorAdapter {
  name: string;
  apply(target: any, propertyKey: string | symbol, metadata: FieldMetadata): void;
  isAvailable(): boolean;
}

export class DecoratorRegistry {
  private static adapters: Map<string, DecoratorAdapter>;
  
  static registerAdapter(name: string, adapter: DecoratorAdapter): void;
  static applyDecorators(target: any, propertyKey: string | symbol, metadata: FieldMetadata): void;
  static getAdapter(name: string): DecoratorAdapter | undefined;
  static getRegisteredAdapters(): string[];
}
```

### 3. Type Inference Utilities

**File:** `packages-core/common/src/helpers/type-inference.helper.ts`

```typescript
export function inferTypeFromMetadata(type: any): TypeInfo;
export function isOptionalType(type: any): boolean;
export function isArrayType(type: any): boolean;
export function isEnumType(type: any): boolean;
export function getArrayElementType(type: any): any;
```

### 4. Package Detection Utilities

**File:** `packages-core/common/src/helpers/package-detector.helper.ts`

```typescript
export function isTypeOrmAvailable(): boolean;
export function isSwaggerAvailable(): boolean;
export function isGraphQLAvailable(): boolean;
export function isClassValidatorAvailable(): boolean;
export function isClassTransformerAvailable(): boolean;
```

### 5. Common Interfaces and Types

**File:** `packages-core/common/src/interfaces/decorators/solid-field-options.interface.ts`

```typescript
export interface SolidFieldOptions {
  // Common options
  description?: string;
  defaultValue?: any;
  transform?: boolean;
  
  // Adapter control
  skip?: string[];
  adapters?: {
    [adapterName: string]: any;
  };
  
  // Field characteristics
  required?: boolean;
  nullable?: boolean;
  unique?: boolean;
  index?: boolean;
  
  // Validation
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  
  // Database
  columnType?: string;
  length?: number;
  precision?: number;
  scale?: number;
  
  // API
  example?: any;
  deprecated?: boolean;
  hidden?: boolean;
}
```

## Testing Requirements

### Unit Tests

1. **MetadataStorage Tests**
   - Test metadata addition and retrieval
   - Test metadata clearing
   - Test multiple metadata per class

2. **DecoratorRegistry Tests**
   - Test adapter registration
   - Test duplicate registration prevention
   - Test adapter application with skip list
   - Test adapter-specific options

3. **Type Inference Tests**
   - Test type detection for primitives
   - Test optional type detection
   - Test array type detection
   - Test enum type detection

4. **Package Detection Tests**
   - Mock require.resolve for testing
   - Test available package detection
   - Test unavailable package detection

## Success Criteria

- [ ] MetadataStorage class implemented and tested
- [ ] DecoratorRegistry class implemented and tested
- [ ] Type inference utilities implemented and tested
- [ ] Package detection utilities implemented and tested
- [ ] All interfaces and types defined
- [ ] 100% test coverage for core infrastructure
- [ ] No breaking changes to existing code

## Notes

- This is the foundation - must be robust and well-tested
- Consider performance implications of metadata storage
- Ensure proper cleanup mechanisms for metadata
- Use WeakMap where appropriate for garbage collection