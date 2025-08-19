import { DecoratorAdapter, FieldMetadata, RelationAdapterRegistry, RelationAdapterHelper } from '@solid-nestjs/common';

// Dynamic imports to avoid dependency issues when TypeORM is not available
let Entity: any;
let Column: any;
let PrimaryColumn: any;
let PrimaryGeneratedColumn: any;
let CreateDateColumn: any;
let UpdateDateColumn: any;
let DeleteDateColumn: any;
let ManyToOne: any;
let OneToMany: any;
let ManyToMany: any;
let OneToOne: any;
let JoinColumn: any;
let JoinTable: any;
let Index: any;
let Unique: any;

// Relation adapter helper for TypeORM
class TypeOrmRelationAdapterHelper implements RelationAdapterHelper {
  getRelationAdapterOptions(type: string, targetFn: () => Function, inverseSide: any, options: any): any {
    return {
      relation: type,
      target: targetFn,
      inverseSide,
      cascade: options.cascade,
      eager: options.eager,
      lazy: options.lazy,
      onDelete: options.onDelete,
      onUpdate: options.onUpdate,
      orphanedRowAction: options.orphanedRowAction,
    };
  }
}

export class TypeOrmDecoratorAdapter implements DecoratorAdapter {
  name = 'typeorm';
  private typeormLoaded = false;
  
  isAvailable(): boolean {
    try {
      require.resolve('typeorm');
      require.resolve('@nestjs/typeorm');
      return true;
    } catch {
      return false;
    }
  }
  
  private async loadTypeORM(): Promise<void> {
    if (this.typeormLoaded) return;
    
    try {
      const typeorm = await import('typeorm');
      
      // Assign decorators
      Entity = typeorm.Entity;
      Column = typeorm.Column;
      PrimaryColumn = typeorm.PrimaryColumn;
      PrimaryGeneratedColumn = typeorm.PrimaryGeneratedColumn;
      CreateDateColumn = typeorm.CreateDateColumn;
      UpdateDateColumn = typeorm.UpdateDateColumn;
      DeleteDateColumn = typeorm.DeleteDateColumn;
      ManyToOne = typeorm.ManyToOne;
      OneToMany = typeorm.OneToMany;
      ManyToMany = typeorm.ManyToMany;
      OneToOne = typeorm.OneToOne;
      JoinColumn = typeorm.JoinColumn;
      JoinTable = typeorm.JoinTable;
      Index = typeorm.Index;
      Unique = typeorm.Unique;
      
      this.typeormLoaded = true;
    } catch (error) {
      console.warn('[SolidNestJS] Failed to load TypeORM decorators:', error);
    }
  }

  private loadTypeORMSync(): void {
    if (this.typeormLoaded) return;
    
    try {
      const typeorm = require('typeorm');
      
      // Assign decorators
      Entity = typeorm.Entity;
      Column = typeorm.Column;
      PrimaryColumn = typeorm.PrimaryColumn;
      PrimaryGeneratedColumn = typeorm.PrimaryGeneratedColumn;
      CreateDateColumn = typeorm.CreateDateColumn;
      UpdateDateColumn = typeorm.UpdateDateColumn;
      DeleteDateColumn = typeorm.DeleteDateColumn;
      ManyToOne = typeorm.ManyToOne;
      OneToMany = typeorm.OneToMany;
      ManyToMany = typeorm.ManyToMany;
      OneToOne = typeorm.OneToOne;
      JoinColumn = typeorm.JoinColumn;
      JoinTable = typeorm.JoinTable;
      Index = typeorm.Index;
      Unique = typeorm.Unique;
      
      this.typeormLoaded = true;
    } catch (error) {
      console.warn('[SolidNestJS] Failed to load TypeORM decorators synchronously:', error);
    }
  }
  
  apply(target: any, propertyKey: string | symbol, metadata: FieldMetadata): void {
    // Load TypeORM if not already loaded synchronously
    if (!this.typeormLoaded) {
      this.loadTypeORMSync();
      if (!this.typeormLoaded) return;
    }
    
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
    // Load TypeORM if not already loaded synchronously
    if (!this.typeormLoaded) {
      this.loadTypeORMSync();
      if (!this.typeormLoaded) return;
    }
    
    if (type !== 'entity' || !Entity) return;
    
    const entityOptions: any = {
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
    if (!PrimaryGeneratedColumn || !PrimaryColumn) return;
    
    const generated = options.generated ?? adapterOptions?.generated;
    
    if (generated) {
      const generationType = generated === true ? 'uuid' : generated;
      PrimaryGeneratedColumn(generationType, adapterOptions || {})(target, propertyKey);
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
    
    if ((fieldName === 'createdat' || options.createdAt) && CreateDateColumn) {
      CreateDateColumn(options.columnOptions || {})(target, propertyKey);
    } else if ((fieldName === 'updatedat' || options.updatedAt) && UpdateDateColumn) {
      UpdateDateColumn(options.columnOptions || {})(target, propertyKey);
    } else if ((fieldName === 'deletedat' || options.deletedAt) && DeleteDateColumn) {
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
    const relationTarget = options.target || adapterOptions?.target || type;
    const inverseProperty = options.inverseSide || adapterOptions?.inverseSide;
    
    
    if (!relationTarget || typeof relationTarget !== 'function') {
      console.warn(`[SolidNestJS] Invalid relation target for ${target.constructor.name}.${String(propertyKey)}`);
      return;
    }
    
    switch (relationType) {
      case 'many-to-one':
        if (ManyToOne) {
          ManyToOne(
            () => relationTarget,
            inverseProperty,
            adapterOptions?.relationOptions || {}
          )(target, propertyKey);
          
          if (options.joinColumn !== false && adapterOptions?.joinColumn !== false && JoinColumn) {
            JoinColumn(adapterOptions?.joinColumnOptions || {})(target, propertyKey);
          }
        }
        break;
        
      case 'one-to-many':
        if (OneToMany) {
          OneToMany(
            relationTarget, // Use relationTarget directly (it's already a function)
            inverseProperty,
            adapterOptions?.relationOptions || {}
          )(target, propertyKey);
        }
        break;
        
      case 'many-to-many':
        if (ManyToMany) {
          ManyToMany(
            () => relationTarget,
            inverseProperty,
            adapterOptions?.relationOptions || {}
          )(target, propertyKey);
          
          if ((options.joinTable || adapterOptions?.joinTable) && JoinTable) {
            JoinTable(adapterOptions?.joinTableOptions || {})(target, propertyKey);
          }
        }
        break;
        
      case 'one-to-one':
        if (OneToOne) {
          OneToOne(
            () => relationTarget,
            inverseProperty,
            adapterOptions?.relationOptions || {}
          )(target, propertyKey);
          
          if (options.joinColumn !== false && adapterOptions?.joinColumn !== false && JoinColumn) {
            JoinColumn(adapterOptions?.joinColumnOptions || {})(target, propertyKey);
          }
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
    if (!Column) return;
    
    const columnOptions: any = {
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
    if ((options.index || adapterOptions?.index) && Index) {
      const indexOptions = typeof options.index === 'object' ? options.index : {};
      Index(indexOptions)(target, propertyKey);
    }
    
    if ((options.uniqueConstraint || adapterOptions?.uniqueConstraint) && Unique) {
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
    const typeMap = new Map<any, string>([
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
    columnOptions: any,
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

// Register the TypeORM relation adapter
RelationAdapterRegistry.registerAdapter('typeorm', new TypeOrmRelationAdapterHelper());