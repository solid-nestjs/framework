# Task: TypeORM Adapter Implementation

**Created:** 2025-08-18 20:36  
**Status:** Pending  
**Priority:** High  
**Estimated Time:** 6 hours  
**Package:** @solid-nestjs/typeorm

## Objective

Implement the TypeORM adapter that applies Entity, Column, and relationship decorators based on unified decorator metadata.

## Dependencies

- Requires: Core Infrastructure (202508182030)
- Requires: Basic Decorators (202508182032)

## Implementation Details

### 1. TypeORM Adapter Class

**File:** `packages-core/typeorm/src/adapters/typeorm.adapter.ts`

```typescript
import {
  Entity, Column, PrimaryColumn, PrimaryGeneratedColumn,
  CreateDateColumn, UpdateDateColumn, DeleteDateColumn,
  ManyToOne, OneToMany, ManyToMany, OneToOne,
  JoinColumn, JoinTable, Index, Unique,
  ColumnOptions, EntityOptions
} from 'typeorm';
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
    
    // Handle primary key fields
    if (options.isPrimaryKey) {
      this.applyPrimaryKeyDecorator(target, propertyKey, options, adapterOptions);
      return;
    }
    
    // Handle timestamp fields
    if (this.isTimestampField(propertyKey, options)) {
      this.applyTimestampDecorator(target, propertyKey, options);
      return;
    }
    
    // Handle relationship fields
    if (options.relation || adapterOptions?.relation) {
      this.applyRelationDecorator(target, propertyKey, type, options, adapterOptions);
      return;
    }
    
    // Handle regular columns
    this.applyColumnDecorator(target, propertyKey, type, options, isOptional, adapterOptions);
    
    // Apply indexes if specified
    this.applyIndexes(target, propertyKey, options, adapterOptions);
  }
  
  applyClassDecorator(target: Function, type: 'entity' | 'input', options: any): void {
    if (type !== 'entity') return;
    
    const entityOptions: EntityOptions = {
      name: options.tableName || options.name,
      schema: options.schema,
      database: options.database,
      synchronize: options.synchronize,
      orderBy: options.orderBy
    };
    
    // Remove undefined values
    Object.keys(entityOptions).forEach(key => {
      if (entityOptions[key] === undefined) {
        delete entityOptions[key];
      }
    });
    
    Entity(entityOptions)(target);
  }
  
  private applyPrimaryKeyDecorator(
    target: any,
    propertyKey: string | symbol,
    options: any,
    adapterOptions: any
  ): void {
    const generated = options.generated ?? adapterOptions?.generated;
    
    if (generated) {
      PrimaryGeneratedColumn(generated, adapterOptions || {})(target, propertyKey);
    } else {
      PrimaryColumn(adapterOptions || {})(target, propertyKey);
    }
  }
  
  private applyTimestampDecorator(
    target: any,
    propertyKey: string | symbol,
    options: any
  ): void {
    const fieldName = String(propertyKey).toLowerCase();
    
    if (fieldName === 'createdat' || options.createdAt) {
      CreateDateColumn(options.columnOptions || {})(target, propertyKey);
    } else if (fieldName === 'updatedat' || options.updatedAt) {
      UpdateDateColumn(options.columnOptions || {})(target, propertyKey);
    } else if (fieldName === 'deletedat' || options.deletedAt) {
      DeleteDateColumn(options.columnOptions || {})(target, propertyKey);
    }
  }
  
  private applyRelationDecorator(
    target: any,
    propertyKey: string | symbol,
    type: any,
    options: any,
    adapterOptions: any
  ): void {
    const relationType = options.relation || adapterOptions?.relation;
    const relationTarget = options.target || type;
    const inverseProperty = options.inverseSide || adapterOptions?.inverseSide;
    
    switch (relationType) {
      case 'many-to-one':
        ManyToOne(
          () => relationTarget,
          inverseProperty,
          adapterOptions?.relationOptions || {}
        )(target, propertyKey);
        
        if (options.joinColumn !== false && adapterOptions?.joinColumn !== false) {
          JoinColumn(adapterOptions?.joinColumnOptions || {})(target, propertyKey);
        }
        break;
        
      case 'one-to-many':
        OneToMany(
          () => relationTarget,
          inverseProperty,
          adapterOptions?.relationOptions || {}
        )(target, propertyKey);
        break;
        
      case 'many-to-many':
        ManyToMany(
          () => relationTarget,
          inverseProperty,
          adapterOptions?.relationOptions || {}
        )(target, propertyKey);
        
        if (options.joinTable || adapterOptions?.joinTable) {
          JoinTable(adapterOptions?.joinTableOptions || {})(target, propertyKey);
        }
        break;
        
      case 'one-to-one':
        OneToOne(
          () => relationTarget,
          inverseProperty,
          adapterOptions?.relationOptions || {}
        )(target, propertyKey);
        
        if (options.joinColumn !== false && adapterOptions?.joinColumn !== false) {
          JoinColumn(adapterOptions?.joinColumnOptions || {})(target, propertyKey);
        }
        break;
    }
  }
  
  private applyColumnDecorator(
    target: any,
    propertyKey: string | symbol,
    type: any,
    options: any,
    isOptional: boolean,
    adapterOptions: any
  ): void {
    const columnOptions: ColumnOptions = {
      type: this.mapTypeToColumnType(type, options, adapterOptions),
      nullable: options.nullable ?? isOptional,
      default: options.defaultValue,
      unique: options.unique,
      length: options.length || options.maxLength,
      width: options.width,
      precision: options.precision,
      scale: options.scale,
      charset: adapterOptions?.charset,
      collation: adapterOptions?.collation,
      comment: options.description,
      ...adapterOptions // Allow full override
    };
    
    // Special handling for different types
    this.enhanceColumnOptions(columnOptions, type, options, adapterOptions);
    
    // Remove undefined values
    Object.keys(columnOptions).forEach(key => {
      if (columnOptions[key] === undefined) {
        delete columnOptions[key];
      }
    });
    
    Column(columnOptions)(target, propertyKey);
  }
  
  private applyIndexes(
    target: any,
    propertyKey: string | symbol,
    options: any,
    adapterOptions: any
  ): void {
    if (options.index || adapterOptions?.index) {
      const indexOptions = typeof options.index === 'object' ? options.index : {};
      Index(indexOptions)(target, propertyKey);
    }
    
    if (options.unique && !options.uniqueConstraint) {
      // Unique is already handled in column options
    } else if (options.uniqueConstraint || adapterOptions?.uniqueConstraint) {
      const uniqueOptions = typeof options.uniqueConstraint === 'object' 
        ? options.uniqueConstraint 
        : {};
      Unique(uniqueOptions)(target, propertyKey);
    }
  }
  
  private mapTypeToColumnType(type: any, options: any, adapterOptions: any): string {
    // Allow explicit type override
    if (adapterOptions?.type) return adapterOptions.type;
    if (options.columnType) return options.columnType;
    
    // Handle special cases
    if (options.enum || adapterOptions?.enum) return 'enum';
    if (options.json || type === Object) return 'json';
    if (options.uuid) return 'uuid';
    
    // Map TypeScript types to database types
    const typeMap = new Map([
      [String, 'varchar'],
      [Number, this.getNumberColumnType(options, adapterOptions)],
      [Boolean, 'boolean'],
      [Date, 'timestamp'],
      [Buffer, 'blob'],
    ]);
    
    return typeMap.get(type) || 'varchar';
  }
  
  private getNumberColumnType(options: any, adapterOptions: any): string {
    if (options.integer || adapterOptions?.integer) return 'int';
    if (options.bigint || adapterOptions?.bigint) return 'bigint';
    if (options.precision || options.scale) return 'decimal';
    if (options.float || adapterOptions?.float) return 'float';
    if (options.double || adapterOptions?.double) return 'double';
    return 'int';
  }
  
  private enhanceColumnOptions(
    columnOptions: ColumnOptions,
    type: any,
    options: any,
    adapterOptions: any
  ): void {
    // Handle enum types
    if (options.enum || adapterOptions?.enum) {
      columnOptions.enum = options.enum || adapterOptions.enum;
      if (options.enumName || adapterOptions?.enumName) {
        columnOptions.enumName = options.enumName || adapterOptions.enumName;
      }
    }
    
    // Handle array types
    if (Array.isArray(type) || options.array || adapterOptions?.array) {
      columnOptions.array = true;
      if (!columnOptions.type) {
        columnOptions.type = 'simple-array';
      }
    }
    
    // Handle transformers
    if (options.transformer || adapterOptions?.transformer) {
      columnOptions.transformer = options.transformer || adapterOptions.transformer;
    }
    
    // Handle decimal precision for numbers
    if (type === Number && (options.precision || options.scale)) {
      columnOptions.type = 'decimal';
      columnOptions.precision = options.precision || 10;
      columnOptions.scale = options.scale || 2;
    }
  }
  
  private isTimestampField(propertyKey: string | symbol, options: any): boolean {
    const fieldName = String(propertyKey).toLowerCase();
    return fieldName === 'createdat' || fieldName === 'updatedat' || fieldName === 'deletedat' ||
           options.createdAt || options.updatedAt || options.deletedAt;
  }
}
```

### 2. Auto-Registration

**File:** `packages-core/typeorm/src/adapters/index.ts`

```typescript
import { DecoratorRegistry } from '@solid-nestjs/common';
import { TypeOrmDecoratorAdapter } from './typeorm.adapter';

// Auto-register when imported
const adapter = new TypeOrmDecoratorAdapter();
if (adapter.isAvailable()) {
  DecoratorRegistry.registerAdapter('typeorm', adapter);
}

export { TypeOrmDecoratorAdapter };
```

## Testing Requirements

### Unit Tests

1. **Column Type Mapping**
   - Test all TypeScript to database type mappings
   - Test custom type overrides
   - Test special types (enum, json, uuid)

2. **Column Options**
   - Test nullable/required columns
   - Test default values
   - Test unique constraints
   - Test length, precision, scale

3. **Primary Key Tests**
   - Test generated UUID primary keys
   - Test auto-increment primary keys
   - Test composite primary keys

4. **Timestamp Tests**
   - Test createdAt column
   - Test updatedAt column
   - Test deletedAt column (soft delete)

5. **Relationship Tests**
   - Test ManyToOne relationships
   - Test OneToMany relationships
   - Test ManyToMany relationships
   - Test OneToOne relationships

6. **Index Tests**
   - Test index creation
   - Test unique constraints
   - Test composite indexes

## Success Criteria

- [ ] All TypeORM decorators properly applied
- [ ] Type mapping working correctly
- [ ] Relationship decorators functional
- [ ] Timestamp fields auto-detected
- [ ] Index and constraint support
- [ ] Entity decorator applied at class level
- [ ] Tests covering all scenarios
- [ ] No conflicts with manual decorators

## Notes

- Must handle all TypeORM column types
- Support for custom transformers
- Ensure compatibility with TypeORM migrations
- Consider database-specific types
- Handle composite keys properly