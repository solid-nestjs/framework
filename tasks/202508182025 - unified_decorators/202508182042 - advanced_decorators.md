# Task: Advanced Decorators Implementation

**Created:** 2025-08-18 20:42  
**Status:** Pending  
**Priority:** Medium  
**Estimated Time:** 8 hours  
**Package:** @solid-nestjs/common

## Objective

Implement advanced unified decorators for specialized use cases: @SolidRelation, @SolidTimestamp, @SolidEnum, @SolidEmbedded, and @SolidComputed.

## Dependencies

- Requires: Core Infrastructure (202508182030)
- Requires: Basic Decorators (202508182032)
- Requires: All adapter implementations

## Implementation Details

### 1. @SolidRelation Decorator

**File:** `packages-core/common/src/decorators/solid-relation.decorator.ts`

```typescript
export interface SolidRelationOptions extends SolidFieldOptions {
  type: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';
  target: () => Function;
  inverseSide?: (object: any) => any;
  cascade?: boolean | ('insert' | 'update' | 'remove' | 'soft-remove' | 'recover')[];
  eager?: boolean;
  lazy?: boolean;
  onDelete?: 'RESTRICT' | 'CASCADE' | 'SET NULL' | 'DEFAULT' | 'NO ACTION';
  onUpdate?: 'RESTRICT' | 'CASCADE' | 'SET NULL' | 'DEFAULT' | 'NO ACTION';
  joinColumn?: boolean | { name?: string; referencedColumnName?: string };
  joinTable?: boolean | {
    name?: string;
    joinColumn?: { name?: string; referencedColumnName?: string };
    inverseJoinColumn?: { name?: string; referencedColumnName?: string };
  };
}

export function SolidRelation(options: SolidRelationOptions): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol) {
    const enhancedOptions: SolidFieldOptions = {
      ...options,
      relation: options.type,
      skip: options.skip || [],
      adapters: {
        ...options.adapters,
        typeorm: {
          relation: options.type,
          target: options.target,
          inverseSide: options.inverseSide,
          cascade: options.cascade,
          eager: options.eager,
          lazy: options.lazy,
          onDelete: options.onDelete,
          onUpdate: options.onUpdate,
          joinColumn: options.joinColumn,
          joinTable: options.joinTable,
          ...options.adapters?.typeorm
        },
        graphql: {
          type: options.target,
          nullable: options.type === 'many-to-one' || options.type === 'one-to-one',
          ...options.adapters?.graphql
        },
        swagger: {
          type: options.type.includes('many') ? [options.target] : options.target,
          ...options.adapters?.swagger
        },
        validation: {
          skip: true, // Relations typically don't need validation
          ...options.adapters?.validation
        }
      }
    };
    
    return SolidField(enhancedOptions)(target, propertyKey);
  };
}
```

### 2. @SolidTimestamp Decorator

**File:** `packages-core/common/src/decorators/solid-timestamp.decorator.ts`

```typescript
export type TimestampType = 'created' | 'updated' | 'deleted';

export interface SolidTimestampOptions extends Omit<SolidFieldOptions, 'nullable'> {
  type: TimestampType;
  updateOnUpdate?: boolean; // For updated timestamp
}

export function SolidTimestamp(
  type: TimestampType = 'created',
  options?: Partial<SolidTimestampOptions>
): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol) {
    const timestampConfig = {
      created: {
        description: 'Creation timestamp',
        createdAt: true,
      },
      updated: {
        description: 'Last update timestamp',
        updatedAt: true,
      },
      deleted: {
        description: 'Deletion timestamp (soft delete)',
        deletedAt: true,
        nullable: true,
      }
    };
    
    const config = timestampConfig[type];
    
    const enhancedOptions: SolidFieldOptions = {
      ...options,
      ...config,
      nullable: type === 'deleted' ? true : false,
      skip: ['validation'], // Timestamps don't need validation
      adapters: {
        ...options?.adapters,
        typeorm: {
          [type + 'At']: true,
          ...options?.adapters?.typeorm
        },
        graphql: {
          type: () => Date,
          ...options?.adapters?.graphql
        },
        swagger: {
          type: 'string',
          format: 'date-time',
          readOnly: true,
          ...options?.adapters?.swagger
        }
      }
    };
    
    return SolidField(enhancedOptions)(target, propertyKey);
  };
}

// Convenience decorators
export const SolidCreatedAt = (options?: Partial<SolidTimestampOptions>) => 
  SolidTimestamp('created', options);
  
export const SolidUpdatedAt = (options?: Partial<SolidTimestampOptions>) => 
  SolidTimestamp('updated', options);
  
export const SolidDeletedAt = (options?: Partial<SolidTimestampOptions>) => 
  SolidTimestamp('deleted', options);
```

### 3. @SolidEnum Decorator

**File:** `packages-core/common/src/decorators/solid-enum.decorator.ts`

```typescript
export interface SolidEnumOptions extends SolidFieldOptions {
  enum: object;
  enumName?: string;
  defaultValue?: any;
}

export function SolidEnum(
  enumType: object,
  options?: Partial<SolidEnumOptions>
): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol) {
    const enumName = options?.enumName || enumType.constructor.name;
    const enumValues = Object.values(enumType);
    
    const enhancedOptions: SolidFieldOptions = {
      ...options,
      enum: enumType,
      enumName,
      adapters: {
        ...options?.adapters,
        typeorm: {
          type: 'enum',
          enum: enumType,
          enumName,
          default: options?.defaultValue,
          ...options?.adapters?.typeorm
        },
        graphql: {
          type: () => enumType,
          ...options?.adapters?.graphql
        },
        swagger: {
          enum: enumValues,
          enumName,
          ...options?.adapters?.swagger
        },
        validation: {
          validators: [IsEnum(enumType)],
          ...options?.adapters?.validation
        }
      }
    };
    
    // Register enum for GraphQL if needed
    if (typeof registerEnumType === 'function') {
      registerEnumType(enumType, { name: enumName });
    }
    
    return SolidField(enhancedOptions)(target, propertyKey);
  };
}
```

### 4. @SolidEmbedded Decorator

**File:** `packages-core/common/src/decorators/solid-embedded.decorator.ts`

```typescript
export interface SolidEmbeddedOptions extends SolidFieldOptions {
  type: () => Function;
  prefix?: string | boolean;
  columnPrefix?: string;
}

export function SolidEmbedded(
  type: () => Function,
  options?: Partial<SolidEmbeddedOptions>
): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol) {
    const enhancedOptions: SolidFieldOptions = {
      ...options,
      skip: ['validation'], // Embedded entities handle their own validation
      adapters: {
        ...options?.adapters,
        typeorm: {
          embedded: true,
          type,
          prefix: options?.prefix,
          columnPrefix: options?.columnPrefix,
          ...options?.adapters?.typeorm
        },
        graphql: {
          type,
          ...options?.adapters?.graphql
        },
        swagger: {
          type,
          ...options?.adapters?.swagger
        }
      }
    };
    
    return SolidField(enhancedOptions)(target, propertyKey);
  };
}
```

### 5. @SolidComputed Decorator

**File:** `packages-core/common/src/decorators/solid-computed.decorator.ts`

```typescript
export interface SolidComputedOptions extends SolidFieldOptions {
  dependsOn?: string[]; // Fields this computed field depends on
  cache?: boolean; // Whether to cache the computed value
  persist?: boolean; // Whether to persist in database (generated column)
}

export function SolidComputed(options?: SolidComputedOptions): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol) {
    const descriptor = Object.getOwnPropertyDescriptor(target, propertyKey);
    const isGetter = descriptor && descriptor.get;
    
    const enhancedOptions: SolidFieldOptions = {
      ...options,
      skip: options?.persist ? [] : ['typeorm'], // Skip DB if not persisted
      adapters: {
        ...options?.adapters,
        typeorm: options?.persist ? {
          generated: true,
          generatedType: 'STORED',
          asExpression: options.adapters?.typeorm?.asExpression,
          ...options?.adapters?.typeorm
        } : undefined,
        graphql: {
          complexity: options?.dependsOn?.length || 1,
          ...options?.adapters?.graphql
        },
        swagger: {
          readOnly: true,
          ...options?.adapters?.swagger
        },
        validation: {
          skip: true, // Computed fields don't need validation
          ...options?.adapters?.validation
        }
      }
    };
    
    return SolidField(enhancedOptions)(target, propertyKey);
  };
}
```

## Testing Requirements

### Unit Tests

1. **@SolidRelation Tests**
   - Test all relation types
   - Test cascade options
   - Test eager/lazy loading
   - Test join configurations

2. **@SolidTimestamp Tests**
   - Test created timestamp
   - Test updated timestamp
   - Test deleted timestamp
   - Test auto-update behavior

3. **@SolidEnum Tests**
   - Test enum registration
   - Test enum validation
   - Test default values
   - Test GraphQL enum registration

4. **@SolidEmbedded Tests**
   - Test embedded entity mapping
   - Test column prefixing
   - Test nested validation

5. **@SolidComputed Tests**
   - Test getter properties
   - Test dependency tracking
   - Test caching behavior
   - Test persisted computed columns

## Success Criteria

- [ ] All advanced decorators implemented
- [ ] Proper integration with adapters
- [ ] Type safety maintained
- [ ] Validation rules applied correctly
- [ ] Database mappings accurate
- [ ] API documentation correct
- [ ] All tests passing
- [ ] Performance optimized

## Notes

- Consider lazy evaluation for computed fields
- Ensure proper cascade handling
- Support complex enum types
- Handle circular dependencies in relations
- Optimize for common use cases