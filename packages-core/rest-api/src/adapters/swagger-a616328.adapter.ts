//ahora solo no funciona en los clientes
import {
  DecoratorAdapter,
  FieldMetadata,
  RelationAdapterRegistry,
  RelationAdapterHelper,
} from '@solid-nestjs/common';

// Dynamic imports to avoid dependency issues when Swagger is not available
let ApiProperty: any;
let ApiPropertyOptional: any;
let ApiHideProperty: any;
let ApiExtraModels: any;

// Relation adapter helper for Swagger
class SwaggerRelationAdapterHelper implements RelationAdapterHelper {
  getRelationAdapterOptions(
    type: string,
    targetFn: () => Function,
    inverseSide: any,
    options: any,
  ): any {
    return {
      type: () => {
        const targetClass = targetFn();
        // For array relations, return array type
        if (type === 'one-to-many' || type === 'many-to-many') {
          return [targetClass];
        }
        // For single relations, return single type
        return targetClass;
      },
      description: options.description || `Related ${targetFn().name} entities`,
    };
  }
}

export class SwaggerDecoratorAdapter implements DecoratorAdapter {
  name = 'swagger';
  private swaggerLoaded = false;

  isAvailable(): boolean {
    try {
      require.resolve('@nestjs/swagger');
      return true;
    } catch {
      return false;
    }
  }

  private loadSwagger(): void {
    if (this.swaggerLoaded) return;

    try {
      const swagger = require('@nestjs/swagger');

      ApiProperty = swagger.ApiProperty;
      ApiPropertyOptional = swagger.ApiPropertyOptional;
      ApiHideProperty = swagger.ApiHideProperty;
      ApiExtraModels = swagger.ApiExtraModels;

      this.swaggerLoaded = true;
    } catch (error) {
      console.warn('[SolidNestJS] Failed to load Swagger decorators:', error);
    }
  }

  apply(
    target: any,
    propertyKey: string | symbol,
    metadata: FieldMetadata,
  ): void {
    if (!this.swaggerLoaded) {
      this.loadSwagger();
      if (!this.swaggerLoaded) return;
    }

    const { type, options, isOptional, adapterOptions } = metadata;

    // Skip hidden fields
    if (options.hidden || adapterOptions?.hidden) {
      if (ApiHideProperty) {
        ApiHideProperty()(target, propertyKey);
      }
      return;
    }

    // Build Swagger property options
    const swaggerOptions = this.buildSwaggerOptions(
      type,
      options,
      isOptional,
      adapterOptions,
    );

    // Apply appropriate decorator
    const decorator =
      (options.nullable ?? isOptional) ? ApiPropertyOptional : ApiProperty;
    if (decorator) {
      decorator(swaggerOptions)(target, propertyKey);
    }
  }

  applyClassDecorator(
    target: Function,
    type: 'entity' | 'input',
    options: any,
  ): void {
    // No class decorators needed for this adapter
    // Schema registration is handled at the controller level
  }

  private buildSwaggerOptions(
    type: any,
    options: any,
    isOptional: boolean,
    adapterOptions?: any,
  ): any {
    const swaggerOptions: any = {
      description: options.description,
      example: options.example,
      default: options.defaultValue,
      deprecated: options.deprecated,
      minimum: options.min,
      maximum: options.max,
      minLength: options.minLength,
      maxLength: options.maxLength,
      pattern: options.pattern?.source,
      readOnly: options.readOnly,
      writeOnly: options.writeOnly,
      required: !(options.nullable ?? isOptional),
      ...adapterOptions, // Allow full override from adapter options
    };

    // Handle type mapping with unified logic for both entity relations and DTO arrays
    const resolvedType = this.resolveSwaggerType(type, options, adapterOptions);

    // Check if this is an array type (from either source)
    const isArrayType = this.isArrayType(
      type,
      options,
      adapterOptions,
      resolvedType,
    );

    if (isArrayType) {
      swaggerOptions.isArray = true;

      // Get the array item type
      const itemType = this.getArrayItemType(
        type,
        options,
        adapterOptions,
        resolvedType,
      );
      swaggerOptions.type = this.mapPrimitiveType(itemType);

      // Array-specific options
      if (options.minSize !== undefined)
        swaggerOptions.minItems = options.minSize;
      if (options.maxSize !== undefined)
        swaggerOptions.maxItems = options.maxSize;
      if (options.uniqueItems || adapterOptions?.uniqueItems)
        swaggerOptions.uniqueItems = true;
    } else {
      // Single value type
      swaggerOptions.type = this.mapPrimitiveType(resolvedType);
    }

    // Handle enums
    if (options.enum || adapterOptions?.enum) {
      swaggerOptions.enum = options.enum || adapterOptions.enum;
      if (options.enumName || adapterOptions?.enumName) {
        swaggerOptions.enumName = options.enumName || adapterOptions.enumName;
      }
    }

    // Handle special formatting
    this.applySpecialFormatting(
      swaggerOptions,
      resolvedType,
      options,
      adapterOptions,
    );

    // Remove undefined values
    Object.keys(swaggerOptions).forEach(key => {
      if (swaggerOptions[key] === undefined) {
        delete swaggerOptions[key];
      }
    });

    return swaggerOptions;
  }

  private resolveSwaggerType(
    type: any,
    options: any,
    adapterOptions?: any,
  ): any {
    // Priority 1: Explicit type override from adapter options
    if (adapterOptions?.type) {
      const explicitType =
        typeof adapterOptions.type === 'function'
          ? adapterOptions.type()
          : adapterOptions.type;
      return explicitType;
    }

    // Priority 2: Use the provided type
    return type;
  }

  private isArrayType(
    type: any,
    options: any,
    adapterOptions?: any,
    resolvedType?: any,
  ): boolean {
    // Check explicit array flag
    if (options.array || adapterOptions?.array) {
      return true;
    }

    // Check if resolved type is an array (from relation adapters)
    if (Array.isArray(resolvedType)) {
      return true;
    }

    // Check if original type is array
    if (Array.isArray(type)) {
      return true;
    }

    return false;
  }

  private getArrayItemType(
    type: any,
    options: any,
    adapterOptions?: any,
    resolvedType?: any,
  ): any {
    // Priority 1: From resolved type (relation adapters)
    if (Array.isArray(resolvedType) && resolvedType.length > 0) {
      return resolvedType[0];
    }

    // Priority 2: From explicit arrayType in options
    let itemType = options.arrayType;
    if (typeof itemType === 'function') {
      itemType = itemType();
    }
    if (itemType) {
      return itemType;
    }

    // Priority 3: From array type structure
    if (Array.isArray(type) && type.length > 0) {
      return type[0];
    }

    // Fallback: String type
    return String;
  }

  private applySpecialFormatting(
    swaggerOptions: any,
    type: any,
    options: any,
    adapterOptions?: any,
  ): void {
    // Handle special string formats
    if (type === String) {
      if (options.email) swaggerOptions.format = 'email';
      if (options.url) swaggerOptions.format = 'url';
      if (options.uuid) swaggerOptions.format = 'uuid';
      if (options.password || adapterOptions?.password)
        swaggerOptions.format = 'password';
    }

    // Handle date format
    if (type === Date) {
      swaggerOptions.format = adapterOptions?.format || 'date-time';
    }

    // Handle number formats
    if (type === Number) {
      if (options.integer || adapterOptions?.integer) {
        swaggerOptions.type = 'integer';
      }
      if (options.float || options.precision) {
        swaggerOptions.format = 'float';
      }
      if (options.double || adapterOptions?.double) {
        swaggerOptions.format = 'double';
      }
    }

    // Handle primary key
    if (options.isPrimaryKey) {
      swaggerOptions.description =
        swaggerOptions.description || 'Unique identifier';
      swaggerOptions.readOnly = true;
    }

    // Handle timestamps
    if (options.createdAt || options.updatedAt || options.deletedAt) {
      swaggerOptions.format = 'date-time';
      swaggerOptions.readOnly = true;
    }
  }

  private mapPrimitiveType(type: any): any {
    // For custom classes, return the class directly
    if (typeof type === 'function' && type.prototype && type.name) {
      return type;
    }

    // Map primitive types to Swagger types
    const typeMap = new Map<any, string>([
      [String, 'string'],
      [Number, 'number'],
      [Boolean, 'boolean'],
      [Date, 'string'],
      [Object, 'object'],
    ]);

    return typeMap.get(type) || type;
  }
}

// Register the Swagger relation adapter
RelationAdapterRegistry.registerAdapter(
  'swagger',
  new SwaggerRelationAdapterHelper(),
);
