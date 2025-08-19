# Task: GraphQL Adapter Implementation

**Created:** 2025-08-18 20:40  
**Status:** Pending  
**Priority:** High  
**Estimated Time:** 5 hours  
**Package:** @solid-nestjs/graphql

## Objective

Implement the GraphQL adapter that applies @Field, @ObjectType, @InputType and related decorators for GraphQL schema generation.

## Dependencies

- Requires: Core Infrastructure (202508182030)
- Requires: Basic Decorators (202508182032)

## Implementation Details

### 1. GraphQL Adapter Class

**File:** `packages-core/graphql/src/adapters/graphql.adapter.ts`

```typescript
import {
  Field, FieldOptions, ObjectType, InputType,
  Int, Float, ID, GraphQLISODateTime,
  HideField, registerEnumType
} from '@nestjs/graphql';
import { GraphQLScalarType } from 'graphql';
import { DecoratorAdapter, FieldMetadata } from '@solid-nestjs/common';

export class GraphQLDecoratorAdapter implements DecoratorAdapter {
  name = 'graphql';
  
  isAvailable(): boolean {
    try {
      require.resolve('@nestjs/graphql');
      require.resolve('graphql');
      return true;
    } catch {
      return false;
    }
  }
  
  apply(target: any, propertyKey: string | symbol, metadata: FieldMetadata): void {
    const { type, options, isOptional, adapterOptions } = metadata;
    
    // Skip hidden fields
    if (options.hidden || adapterOptions?.hidden) {
      HideField()(target, propertyKey);
      return;
    }
    
    // Build field options
    const fieldOptions: FieldOptions = this.buildFieldOptions(
      type, options, isOptional, adapterOptions
    );
    
    // Determine GraphQL type
    const graphqlType = this.mapTypeToGraphQLType(type, options, adapterOptions);
    
    // Apply Field decorator
    if (graphqlType) {
      Field(() => graphqlType, fieldOptions)(target, propertyKey);
    } else {
      Field(fieldOptions)(target, propertyKey);
    }
  }
  
  applyClassDecorator(target: Function, type: 'entity' | 'input', options: any): void {
    const decoratorOptions = {
      description: options.description
    };
    
    if (type === 'entity') {
      ObjectType(options.name || target.name, decoratorOptions)(target);
    } else if (type === 'input') {
      InputType(options.name || `${target.name}Input`, decoratorOptions)(target);
    }
    
    // Register enums if specified
    if (options.enums) {
      Object.entries(options.enums).forEach(([name, enumType]) => {
        registerEnumType(enumType as any, { name });
      });
    }
  }
  
  private buildFieldOptions(
    type: any,
    options: any,
    isOptional: boolean,
    adapterOptions: any
  ): FieldOptions {
    const fieldOptions: FieldOptions = {
      description: options.description,
      nullable: options.nullable ?? isOptional,
      defaultValue: options.defaultValue,
      deprecationReason: options.deprecated ? 
        (typeof options.deprecated === 'string' ? options.deprecated : 'Deprecated field') : 
        undefined,
      complexity: adapterOptions?.complexity,
      ...adapterOptions // Allow full override
    };
    
    // Handle middleware
    if (adapterOptions?.middleware) {
      fieldOptions.middleware = adapterOptions.middleware;
    }
    
    // Remove undefined values
    Object.keys(fieldOptions).forEach(key => {
      if (fieldOptions[key] === undefined) {
        delete fieldOptions[key];
      }
    });
    
    return fieldOptions;
  }
  
  private mapTypeToGraphQLType(
    type: any,
    options: any,
    adapterOptions: any
  ): GraphQLScalarType | Function | [Function] | undefined {
    // Allow explicit type override
    if (adapterOptions?.type) {
      return adapterOptions.type;
    }
    
    // Handle ID fields
    if (options.isPrimaryKey || options.id || adapterOptions?.isId) {
      return ID;
    }
    
    // Handle arrays
    if (Array.isArray(type) || options.array || adapterOptions?.array) {
      const itemType = options.arrayType || type[0] || String;
      const mappedItemType = this.mapSingleType(itemType, options, adapterOptions);
      return mappedItemType ? [mappedItemType] : [String];
    }
    
    // Handle single types
    return this.mapSingleType(type, options, adapterOptions);
  }
  
  private mapSingleType(
    type: any,
    options: any,
    adapterOptions: any
  ): GraphQLScalarType | Function | undefined {
    // Handle enums
    if (options.enum || adapterOptions?.enum) {
      return options.enum || adapterOptions.enum;
    }
    
    // Handle primitive types
    if (type === String) {
      return String;
    }
    
    if (type === Number) {
      if (options.integer || adapterOptions?.integer) {
        return Int;
      }
      if (options.float || options.precision || adapterOptions?.float) {
        return Float;
      }
      return Int; // Default to Int for numbers
    }
    
    if (type === Boolean) {
      return Boolean;
    }
    
    if (type === Date) {
      return GraphQLISODateTime;
    }
    
    // Handle JSON/Object types
    if (type === Object || options.json || adapterOptions?.json) {
      // Return undefined to use GraphQLJSON scalar if available
      // Or return a custom JSON scalar type
      return adapterOptions?.jsonScalar;
    }
    
    // For custom classes, return the type itself
    if (typeof type === 'function') {
      return type;
    }
    
    // Let GraphQL infer the type
    return undefined;
  }
}
```

### 2. Auto-Registration

**File:** `packages-core/graphql/src/adapters/index.ts`

```typescript
import { DecoratorRegistry } from '@solid-nestjs/common';
import { GraphQLDecoratorAdapter } from './graphql.adapter';

// Auto-register when imported
const adapter = new GraphQLDecoratorAdapter();
if (adapter.isAvailable()) {
  DecoratorRegistry.registerAdapter('graphql', adapter);
}

export { GraphQLDecoratorAdapter };
```

## Testing Requirements

### Unit Tests

1. **Type Mapping Tests**
   - Test scalar type mappings (String, Int, Float, Boolean, Date)
   - Test ID type mapping
   - Test array type mappings
   - Test custom class mappings
   - Test enum mappings

2. **Field Options Tests**
   - Test nullable/required fields
   - Test descriptions
   - Test default values
   - Test deprecation reasons
   - Test complexity settings

3. **Class Decorator Tests**
   - Test ObjectType application
   - Test InputType application
   - Test enum registration

4. **Special Cases**
   - Test hidden fields
   - Test middleware application
   - Test custom scalar types
   - Test nested object types

## Success Criteria

- [ ] All GraphQL decorators properly applied
- [ ] Type mapping accurate for GraphQL schema
- [ ] Nullable fields handled correctly
- [ ] Array types working
- [ ] Enum support functional
- [ ] Class decorators applied correctly
- [ ] Hidden field support
- [ ] All tests passing
- [ ] Compatible with code-first approach

## Notes

- Support both ObjectType and InputType
- Handle custom scalars properly
- Ensure schema generation works
- Consider federation support
- Maintain compatibility with existing resolvers