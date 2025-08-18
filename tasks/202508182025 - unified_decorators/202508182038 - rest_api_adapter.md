# Task: REST API (Swagger) Adapter Implementation

**Created:** 2025-08-18 20:38  
**Status:** Pending  
**Priority:** High  
**Estimated Time:** 4 hours  
**Package:** @solid-nestjs/rest-api

## Objective

Implement the Swagger adapter that applies @ApiProperty and related decorators for REST API documentation.

## Dependencies

- Requires: Core Infrastructure (202508182030)
- Requires: Basic Decorators (202508182032)

## Implementation Details

### 1. Swagger Adapter Class

**File:** `packages-core/rest-api/src/adapters/swagger.adapter.ts`

```typescript
import {
  ApiProperty, ApiPropertyOptions,
  ApiHideProperty, ApiResponseProperty,
  ApiPropertyOptional
} from '@nestjs/swagger';
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
    
    // Skip hidden fields
    if (options.hidden || adapterOptions?.hidden) {
      ApiHideProperty()(target, propertyKey);
      return;
    }
    
    // Build API property options
    const apiPropertyOptions: ApiPropertyOptions = this.buildApiPropertyOptions(
      type, options, isOptional, adapterOptions
    );
    
    // Apply appropriate decorator
    if (options.nullable ?? isOptional) {
      ApiPropertyOptional(apiPropertyOptions)(target, propertyKey);
    } else {
      ApiProperty(apiPropertyOptions)(target, propertyKey);
    }
    
    // Apply response property if specified
    if (options.responseOnly || adapterOptions?.responseOnly) {
      ApiResponseProperty(apiPropertyOptions)(target, propertyKey);
    }
  }
  
  applyClassDecorator(target: Function, type: 'entity' | 'input', options: any): void {
    // Swagger class decorators are handled at controller level
    // This adapter focuses on property decorators
  }
  
  private buildApiPropertyOptions(
    type: any,
    options: any,
    isOptional: boolean,
    adapterOptions: any
  ): ApiPropertyOptions {
    const apiOptions: ApiPropertyOptions = {
      type: this.mapTypeToSwaggerType(type, options),
      description: options.description,
      required: !(options.nullable ?? isOptional),
      example: options.example,
      deprecated: options.deprecated,
      default: options.defaultValue,
      minimum: options.min,
      maximum: options.max,
      minLength: options.minLength,
      maxLength: options.maxLength,
      pattern: options.pattern?.source,
      ...adapterOptions // Allow full override
    };
    
    // Handle special types
    this.enhanceForSpecialTypes(apiOptions, type, options, adapterOptions);
    
    // Remove undefined values
    Object.keys(apiOptions).forEach(key => {
      if (apiOptions[key] === undefined) {
        delete apiOptions[key];
      }
    });
    
    return apiOptions;
  }
  
  private mapTypeToSwaggerType(type: any, options: any): any {
    // Handle arrays
    if (Array.isArray(type) || options.array) {
      const itemType = options.arrayType || type[0] || String;
      return [this.mapTypeToSwaggerType(itemType, {})];
    }
    
    // Handle enums
    if (options.enum) {
      return options.enum;
    }
    
    // Map primitive types
    const typeMap = new Map([
      [String, 'string'],
      [Number, 'number'],
      [Boolean, 'boolean'],
      [Date, 'string'], // With format: date-time
      [Object, 'object'],
    ]);
    
    // Return mapped type or the type itself for custom classes
    return typeMap.get(type) || type;
  }
  
  private enhanceForSpecialTypes(
    apiOptions: ApiPropertyOptions,
    type: any,
    options: any,
    adapterOptions: any
  ): void {
    // Date formatting
    if (type === Date) {
      apiOptions.format = adapterOptions?.format || 'date-time';
    }
    
    // Number formatting
    if (type === Number) {
      if (options.integer || adapterOptions?.integer) {
        apiOptions.type = 'integer';
      }
      if (options.float || options.precision) {
        apiOptions.format = 'float';
      }
      if (options.double || adapterOptions?.double) {
        apiOptions.format = 'double';
      }
    }
    
    // String formatting
    if (type === String) {
      if (options.email) apiOptions.format = 'email';
      if (options.url) apiOptions.format = 'url';
      if (options.uuid) apiOptions.format = 'uuid';
      if (options.binary) apiOptions.format = 'binary';
      if (options.password) apiOptions.format = 'password';
    }
    
    // Enum handling
    if (options.enum || adapterOptions?.enum) {
      apiOptions.enum = options.enum || adapterOptions.enum;
      if (options.enumName || adapterOptions?.enumName) {
        apiOptions.enumName = options.enumName || adapterOptions.enumName;
      }
    }
    
    // Array handling
    if (Array.isArray(type) || options.array || adapterOptions?.array) {
      apiOptions.isArray = true;
      if (options.minSize) apiOptions.minItems = options.minSize;
      if (options.maxSize) apiOptions.maxItems = options.maxSize;
      if (options.uniqueItems) apiOptions.uniqueItems = true;
    }
    
    // File upload handling
    if (options.file || adapterOptions?.file) {
      apiOptions.type = 'string';
      apiOptions.format = 'binary';
    }
  }
}
```

### 2. Auto-Registration

**File:** `packages-core/rest-api/src/adapters/index.ts`

```typescript
import { DecoratorRegistry } from '@solid-nestjs/common';
import { SwaggerDecoratorAdapter } from './swagger.adapter';

// Auto-register when imported
const adapter = new SwaggerDecoratorAdapter();
if (adapter.isAvailable()) {
  DecoratorRegistry.registerAdapter('swagger', adapter);
}

export { SwaggerDecoratorAdapter };
```

## Testing Requirements

### Unit Tests

1. **Type Mapping Tests**
   - Test primitive type mappings
   - Test array type mappings
   - Test custom class mappings
   - Test enum mappings

2. **Property Options Tests**
   - Test required/optional properties
   - Test descriptions and examples
   - Test deprecated properties
   - Test default values

3. **Constraint Tests**
   - Test min/max values
   - Test length constraints
   - Test pattern validation
   - Test array constraints

4. **Format Tests**
   - Test date-time format
   - Test email format
   - Test UUID format
   - Test number formats

5. **Special Cases**
   - Test hidden properties
   - Test response-only properties
   - Test file upload properties

## Success Criteria

- [ ] All Swagger decorators properly applied
- [ ] Type mapping accurate for OpenAPI spec
- [ ] Format specifications correct
- [ ] Enum support working
- [ ] Array handling functional
- [ ] Hidden property support
- [ ] All tests passing
- [ ] Compatible with existing Swagger setup

## Notes

- Ensure OpenAPI 3.0 compatibility
- Support both required and optional properties
- Handle complex types properly
- Consider custom example generation
- Maintain compatibility with Swagger UI