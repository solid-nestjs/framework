import { DecoratorAdapter, FieldMetadata } from '@solid-nestjs/common';

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
  
  private async loadGraphQL(): Promise<void> {
    if (this.graphqlLoaded) return;
    
    try {
      const nestjsGraphql = await import('@nestjs/graphql');
      
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
      console.warn('[SolidNestJS] Failed to load GraphQL decorators:', error);
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
      console.log('[SolidNestJS] GraphQL decorators loaded successfully');
      console.log(`[SolidNestJS] Available decorators: Field=${!!Field}, ID=${!!ID}, Int=${!!Int}, Float=${!!Float}`);
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
    
    console.log(`[SolidNestJS] Applying GraphQL decorator to ${target.constructor.name}.${String(metadata.propertyKey)}`);
    
    const { type, options, isOptional, adapterOptions } = metadata;
    
    // Debug options for id field
    if (String(metadata.propertyKey) === 'id') {
      console.log(`[SolidNestJS] ID field options:`, options);
      console.log(`[SolidNestJS] ID field isPrimaryKey:`, options.isPrimaryKey);
      console.log(`[SolidNestJS] ID field id:`, (options as any).id);
    }
    
    // Skip hidden fields
    if (options.hidden || adapterOptions?.hidden) {
      if (HideField) {
        console.log(`[SolidNestJS] Applying HideField to ${String(metadata.propertyKey)}`);
        HideField()(target, propertyKey);
      }
      return;
    }
    
    // Extract GraphQL-specific adapter options
    const graphqlAdapterOptions = options.adapters?.graphql || adapterOptions;
    
    // Build field options
    const fieldOptions: any = this.buildFieldOptions(
      type, options, isOptional, graphqlAdapterOptions
    );
    
    // Determine GraphQL type
    const graphqlType = this.mapTypeToGraphQLType(type, options, graphqlAdapterOptions);
    
    // Skip field if GraphQL type cannot be determined (null)
    if (graphqlType === null) {
      console.log(`[SolidNestJS] Skipping GraphQL field ${String(metadata.propertyKey)} - type cannot be determined`);
      return;
    }
    
    
    // Apply Field decorator with lazy type resolution for relations
    if (graphqlType && Field) {
      try {
        // For all GraphQL fields, use lazy evaluation to ensure types are resolved properly
        Field(() => graphqlType, fieldOptions)(target, propertyKey);
        console.log(`[SolidNestJS] Successfully applied GraphQL Field decorator to ${String(metadata.propertyKey)}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn(`[SolidNestJS] Failed to apply GraphQL Field decorator to ${String(metadata.propertyKey)}: ${errorMessage}`);
        
        // For relation fields, this is expected if the target type isn't available yet
        // The error will be caught during schema building, not here
        if (options.relation) {
          console.warn(`[SolidNestJS] Relation field ${String(metadata.propertyKey)} will be resolved during schema building`);
          // Still apply the decorator - let GraphQL handle the resolution later
          try {
            Field(() => {
              console.log(`[SolidNestJS] Late-resolving relation type for ${String(metadata.propertyKey)}`);
              return graphqlType;
            }, fieldOptions)(target, propertyKey);
          } catch (laterError) {
            console.warn(`[SolidNestJS] Could not apply deferred Field decorator for ${String(metadata.propertyKey)}`);
            // Skip this field completely if it cannot be resolved
            return;
          }
        }
        return;
      }
    } else if (Field) {
      try {
        Field(fieldOptions)(target, propertyKey);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn(`[SolidNestJS] Failed to apply GraphQL Field decorator to ${String(metadata.propertyKey)}: ${errorMessage}`);
        return;
      }
    } else {
      console.warn(`[SolidNestJS] Cannot apply Field decorator - Field function not available`);
    }
    
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
    
    // Register enums if specified
    if (options.enums && registerEnumType) {
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
  ): any {
    const fieldOptions: any = {
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
  ): any {
    
    // Allow explicit type override
    if (adapterOptions?.type) {
      // Convert string types to actual GraphQL types
      if (adapterOptions.type === 'ID') return ID;
      if (adapterOptions.type === 'Int') return Int;
      if (adapterOptions.type === 'Float') return Float;
      if (adapterOptions.type === 'String') return String;
      if (adapterOptions.type === 'Boolean') return Boolean;
      // Handle function types (for relations and Date)
      if (typeof adapterOptions.type === 'function') {
        // Special case: if function returns Date, use GraphQLISODateTime
        try {
          const result = adapterOptions.type();
          if (result === Date) {
            return GraphQLISODateTime || Date;
          }
          // For other functions that succeed, check if it's a relation
          if (options.relation && result && typeof result === 'function') {
            // This is a relation type, return the function for lazy evaluation
            return adapterOptions.type;
          }
        } catch (e) {
          // If function fails, it's likely a relation that needs lazy evaluation
          if (options.relation) {
            return adapterOptions.type; // Return the function as-is for lazy evaluation
          }
        }
        return adapterOptions.type;
      }
      // Handle array types for relations
      if (Array.isArray(adapterOptions.type) && adapterOptions.type.length === 1 && typeof adapterOptions.type[0] === 'function') {
        // For array relations, return the array type directly for lazy evaluation
        console.log(`[SolidNestJS] Applying array relation type for GraphQL:`, adapterOptions.type);
        return adapterOptions.type; // Return the array as-is for GraphQL lazy evaluation
      }
      return adapterOptions.type;
    }
    
    // Handle ID fields
    if (options.isPrimaryKey || options.id || adapterOptions?.isId) {
      console.log(`[SolidNestJS] ID field detected for ${options.isPrimaryKey ? 'isPrimaryKey' : 'options.id'}, returning ID=${!!ID}`);
      console.log(`[SolidNestJS] ID variable value:`, ID);
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
  ): any {
    // Handle enums
    if (options.enum || adapterOptions?.enum) {
      const enumType = options.enum || adapterOptions.enum;
      // Auto-register enum if not already registered
      if (registerEnumType && !this.isEnumRegistered(enumType)) {
        const enumName = options.enumName || adapterOptions?.enumName || enumType.constructor?.name || 'Enum';
        try {
          registerEnumType(enumType, { name: enumName });
        } catch (error) {
          console.warn(`[SolidNestJS] Failed to register enum ${enumName}:`, error);
        }
      }
      return enumType;
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
      return GraphQLISODateTime || Date;
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
  
  private isEnumRegistered(enumType: any): boolean {
    // This is a simplified check - in practice you might want to keep track
    // of registered enums to avoid duplicate registration
    try {
      // Try to see if the enum is already registered by checking its name
      // This is a heuristic approach
      return false; // For now, always try to register
    } catch {
      return false;
    }
  }

}