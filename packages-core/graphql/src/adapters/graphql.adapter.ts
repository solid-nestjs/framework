import { DecoratorAdapter, FieldMetadata, RelationAdapterRegistry, RelationAdapterHelper } from '@solid-nestjs/common';

// Dynamic imports to avoid dependency issues when GraphQL is not available
let Field: any;
let ObjectType: any;
let InputType: any;
let Int: any;
let Float: any;
let ID: any;
let GraphQLISODateTime: any;
let HideField: any;
let registerEnumType: any;

// Relation adapter helper for GraphQL
class GraphQLRelationAdapterHelper implements RelationAdapterHelper {
  getRelationAdapterOptions(type: string, targetFn: () => Function, inverseSide: any, options: any): any {
    return {
      type: type === 'one-to-many' || type === 'many-to-many' ? [targetFn] : targetFn,
      nullable: type === 'one-to-many' || type === 'many-to-many' ? true : options.nullable,
    };
  }
}

export class GraphQLDecoratorAdapter implements DecoratorAdapter {
  name = 'graphql';
  private graphqlLoaded = false;
  
  isAvailable(): boolean {
    try {
      require.resolve('@nestjs/graphql');
      require.resolve('graphql');
      return true;
    } catch {
      return false;
    }
  }
  
  private loadGraphQLSync(): void {
    if (this.graphqlLoaded) return;
    
    try {
      const nestjsGraphql = require('@nestjs/graphql');
      
      // Assign decorators
      Field = nestjsGraphql.Field;
      ObjectType = nestjsGraphql.ObjectType;
      InputType = nestjsGraphql.InputType;
      Int = nestjsGraphql.Int;
      Float = nestjsGraphql.Float;
      ID = nestjsGraphql.ID;
      GraphQLISODateTime = nestjsGraphql.GraphQLISODateTime;
      HideField = nestjsGraphql.HideField;
      registerEnumType = nestjsGraphql.registerEnumType;
      
      this.graphqlLoaded = true;
    } catch (error) {
      console.warn('[SolidNestJS] Failed to load GraphQL decorators synchronously:', error);
    }
  }
  
  apply(target: any, propertyKey: string | symbol, metadata: FieldMetadata): void {
    // Load GraphQL if not already loaded synchronously
    if (!this.graphqlLoaded) {
      this.loadGraphQLSync();
      if (!this.graphqlLoaded) return;
    }
    
    const { type, options, isOptional, adapterOptions } = metadata;
    
    // Skip if GraphQL is explicitly disabled for this field
    if (options.adapters?.graphql === false || adapterOptions?.skip) {
      return;
    }
    
    // Skip hidden fields
    if (options.hidden || adapterOptions?.hidden) {
      if (HideField) {
        HideField()(target, propertyKey);
      }
      return;
    }
    
    // For relations, we need to apply the appropriate Field decorator directly
    if (options.relation || adapterOptions?.relation) {
      this.applyRelationField(target, propertyKey, metadata);
      return;
    }
    
    // For regular fields, apply Field decorator directly
    this.applyRegularField(target, propertyKey, metadata);
  }
  
  private applyRelationField(target: any, propertyKey: string | symbol, metadata: FieldMetadata): void {
    const { options, isOptional, adapterOptions } = metadata;
    const relationType = options.relation || adapterOptions?.relation;
    const relationTarget = options.target || adapterOptions?.target;
    
    if (!relationTarget || typeof relationTarget !== 'function') {
      console.warn(`[SolidNestJS] Invalid relation target for GraphQL field ${String(propertyKey)}`);
      return;
    }
    
    // Build field options
    const fieldOptions: any = {
      description: options.description,
      nullable: options.nullable ?? isOptional ?? true,
      defaultValue: options.defaultValue,
      ...adapterOptions // Allow override
    };
    
    // Remove undefined values
    Object.keys(fieldOptions).forEach(key => {
      if (fieldOptions[key] === undefined) {
        delete fieldOptions[key];
      }
    });
    
    // Apply the Field decorator directly based on relation type
    if (relationType === 'one-to-many' || relationType === 'many-to-many') {
      // Array relation: @Field(() => [TargetType], options)
      Field(() => [relationTarget()], fieldOptions)(target, propertyKey);
    } else {
      // Single relation: @Field(() => TargetType, options)
      Field(() => relationTarget(), fieldOptions)(target, propertyKey);
    }
  }
  
  private applyRegularField(target: any, propertyKey: string | symbol, metadata: FieldMetadata): void {
    const { type, options, isOptional, adapterOptions } = metadata;
    
    // Build field options
    const fieldOptions: any = {
      description: options.description,
      nullable: options.nullable ?? isOptional,
      defaultValue: options.defaultValue,
      ...adapterOptions // Allow override
    };
    
    // Remove undefined values
    Object.keys(fieldOptions).forEach(key => {
      if (fieldOptions[key] === undefined) {
        delete fieldOptions[key];
      }
    });
    
    // Determine GraphQL type
    const graphqlType = this.mapTypeToGraphQLType(type, options, adapterOptions);
    
    // Apply Field decorator directly
    if (graphqlType) {
      Field(() => graphqlType, fieldOptions)(target, propertyKey);
    } else {
      Field(fieldOptions)(target, propertyKey);
    }
  }
  
  private mapTypeToGraphQLType(type: any, options: any, adapterOptions: any): any {
    // Allow explicit type override
    if (adapterOptions?.type) {
      if (adapterOptions.type === 'ID') return ID;
      if (adapterOptions.type === 'Int') return Int;
      if (adapterOptions.type === 'Float') return Float;
      if (adapterOptions.type === 'String') return String;
      if (adapterOptions.type === 'Boolean') return Boolean;
      
      // Handle function types that return primitives or relations
      if (typeof adapterOptions.type === 'function') {
        try {
          const result = adapterOptions.type();
          if (result === Date) {
            return GraphQLISODateTime || Date;
          }
          return result;
        } catch (e) {
          console.warn(`[SolidNestJS] Failed to evaluate adapter type function:`, e);
        }
      }
      
      return adapterOptions.type;
    }
    
    // Handle ID fields
    if (options.isPrimaryKey || options.id) {
      return ID;
    }
    
    // Handle primitive types
    if (type === String) return String;
    if (type === Boolean) return Boolean;
    if (type === Date) {
      return GraphQLISODateTime || Date;
    }
    
    if (type === Number) {
      if (options.integer || adapterOptions?.integer) return Int;
      if (options.float || options.precision || adapterOptions?.float) return Float;
      return Int; // Default to Int for numbers
    }
    
    // Handle arrays
    if (Array.isArray(type) || options.array) {
      const itemType = options.arrayType || type[0] || String;
      const mappedItemType = this.mapSingleType(itemType);
      return mappedItemType ? [mappedItemType] : [String];
    }
    
    // For custom classes, return the type itself
    if (typeof type === 'function') {
      return type;
    }
    
    // Let GraphQL infer the type
    return undefined;
  }
  
  private mapSingleType(type: any): any {
    if (type === String) return String;
    if (type === Number) return Int;
    if (type === Boolean) return Boolean;
    if (type === Date) return GraphQLISODateTime || Date;
    if (typeof type === 'function') return type;
    return String;
  }
  
  applyClassDecorator(target: Function, type: 'entity' | 'input', options: any): void {
    if (!this.graphqlLoaded) {
      this.loadGraphQLSync();
      if (!this.graphqlLoaded) return;
    }
    
    const decoratorOptions: any = {
      description: options.description
    };
    
    if (type === 'entity' && ObjectType) {
      ObjectType(options.name || target.name, decoratorOptions)(target);
    } else if (type === 'input' && InputType) {
      InputType(options.name || `${target.name}Input`, decoratorOptions)(target);
    }
  }
}

// Register the GraphQL relation adapter
RelationAdapterRegistry.registerAdapter('graphql', new GraphQLRelationAdapterHelper());