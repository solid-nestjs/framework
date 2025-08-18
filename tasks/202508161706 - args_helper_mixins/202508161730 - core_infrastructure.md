# Task 1: Core Infrastructure and Shared Logic

**Related Spec**: [Args Helper Mixins](../../specs/202508161706%20-%20args_helper_mixins.md)  
**Status**: Pending  
**Priority**: High (Foundation for other tasks)

## Objective

Implement the core infrastructure and shared logic in the `common` package that will be used by all helper functions across the different protocol packages.

## Scope

### Files to Create

1. **packages-core/common/src/helpers/args-helpers/type-inference.helper.ts**
   - Type reflection utilities using `Reflect.getMetadata`
   - Filter type inference logic (String → StringFilter, Number → NumberFilter, etc.)
   - Property type detection

2. **packages-core/common/src/helpers/args-helpers/field-config.helper.ts**
   - Configuration parsing utilities
   - Field configuration normalization
   - Default value handling

3. **packages-core/common/src/helpers/args-helpers/class-generator.helper.ts**
   - Base class generation logic
   - Dynamic property addition
   - Metadata management utilities

4. **packages-core/common/src/helpers/args-helpers/decorator-builder.helper.ts**
   - Common decorator building logic
   - Property decorator application
   - Class decorator application

5. **packages-core/common/src/helpers/args-helpers/index.ts**
   - Export all helpers

## Implementation Details

### Type Inference Helper

```typescript
// type-inference.helper.ts
export function inferFilterType(entity: Type<any>, propertyName: string, config?: FieldConfig): Type<any> {
  // If explicit type is provided in config
  if (typeof config === 'function') return config;
  if (typeof config === 'object' && config.type) return config.type;
  
  // Use reflection to get property type
  const type = Reflect.getMetadata('design:type', entity.prototype, propertyName);
  
  // Map native types to filter types
  if (type === String) return StringFilter;
  if (type === Number) return NumberFilter;
  if (type === Date) return DateFilter;
  if (type === Boolean) return Boolean; // Direct boolean, no filter
  
  // Default fallback
  return StringFilter;
}
```

### Class Generator Helper

```typescript
// class-generator.helper.ts
export interface ClassGeneratorOptions {
  className: string;
  baseClass?: Type<any>;
  interfaces?: Type<any>[];
  metadata?: Record<string, any>;
}

export function generateBaseClass(options: ClassGeneratorOptions): Type<any> {
  const { className, baseClass, metadata } = options;
  
  // Create dynamic class
  const DynamicClass = baseClass 
    ? class extends baseClass {}
    : class {};
    
  // Set class name
  Object.defineProperty(DynamicClass, 'name', { value: className });
  
  // Apply metadata
  if (metadata) {
    for (const [key, value] of Object.entries(metadata)) {
      Reflect.defineMetadata(key, value, DynamicClass);
    }
  }
  
  return DynamicClass;
}
```

## Testing Requirements

1. **Unit Tests**:
   - Type inference for all supported types
   - Configuration parsing edge cases
   - Class generation with various options
   - Metadata application

2. **Test Files**:
   - `packages-core/common/__tests__/helpers/args-helpers/type-inference.helper.spec.ts`
   - `packages-core/common/__tests__/helpers/args-helpers/field-config.helper.spec.ts`
   - `packages-core/common/__tests__/helpers/args-helpers/class-generator.helper.spec.ts`

## Dependencies

- `reflect-metadata`
- TypeScript reflection API
- Existing filter types from common package

## Acceptance Criteria

- [ ] All helper functions are implemented and exported
- [ ] Type inference correctly maps all supported types
- [ ] Class generation supports all configuration options
- [ ] Unit tests pass with 100% coverage
- [ ] Code follows existing patterns in the framework
- [ ] JSDoc documentation for all public functions

## Notes

- This is the foundation layer - must be completed before protocol-specific implementations
- Ensure compatibility with existing framework patterns
- Consider performance implications of reflection usage

---
*Task created: 2025-08-16 17:30*  
*Last updated: 2025-08-16 17:30*