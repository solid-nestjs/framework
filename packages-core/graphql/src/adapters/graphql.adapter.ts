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
  
  apply(target: any, propertyKey: string | symbol, metadata: FieldMetadata): void {
    // Load GraphQL if not already loaded
    if (!this.graphqlLoaded) {
      this.loadGraphQL();
      if (!this.graphqlLoaded) return;
    }
    
    const { type, options, isOptional, adapterOptions } = metadata;
    
    // Skip hidden fields
    if (options.hidden || adapterOptions?.hidden) {
      if (HideField) {
        HideField()(target, propertyKey);
      }
      return;
    }
    
    // Build field options
    const fieldOptions: any = this.buildFieldOptions(
      type, options, isOptional, adapterOptions
    );
    
    // Determine GraphQL type
    const graphqlType = this.mapTypeToGraphQLType(type, options, adapterOptions);
    
    // Apply Field decorator
    if (graphqlType && Field) {
      Field(() => graphqlType, fieldOptions)(target, propertyKey);
    } else if (Field) {
      Field(fieldOptions)(target, propertyKey);
    }
  }
  
  applyClassDecorator(target: Function, type: 'entity' | 'input', options: any): void {
    if (!this.graphqlLoaded) {
      this.loadGraphQL();
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