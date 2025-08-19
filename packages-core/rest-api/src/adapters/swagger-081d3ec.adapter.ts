//working on creation dto for input
import { DecoratorAdapter, FieldMetadata } from '@solid-nestjs/common';

// Dynamic imports to avoid dependency issues when Swagger is not available
let ApiProperty: any;
let ApiPropertyOptional: any;
let ApiHideProperty: any;
let ApiExtraModels: any;

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

    const { type, options, isOptional } = metadata;

    // Skip hidden fields
    if (options.hidden) {
      if (ApiHideProperty) {
        ApiHideProperty()(target, propertyKey);
      }
      return;
    }

    // Build Swagger property options
    const swaggerOptions = this.buildSwaggerOptions(type, options);

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

  private buildSwaggerOptions(type: any, options: any): any {
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
    };

    // Handle type mapping
    if (options.array) {
      swaggerOptions.isArray = true;

      // Get array item type
      let itemType = options.arrayType;
      if (typeof itemType === 'function') {
        itemType = itemType();
      }

      if (itemType) {
        // For custom classes, use the class directly
        if (typeof itemType === 'function' && itemType.prototype) {
          swaggerOptions.type = itemType;
        } else {
          // For primitives, map them
          swaggerOptions.type = this.mapPrimitiveType(itemType);
        }
      } else {
        swaggerOptions.type = this.mapPrimitiveType(type);
      }

      // Array-specific options
      if (options.minSize !== undefined)
        swaggerOptions.minItems = options.minSize;
      if (options.maxSize !== undefined)
        swaggerOptions.maxItems = options.maxSize;
      if (options.uniqueItems) swaggerOptions.uniqueItems = true;
    } else {
      // Single value type
      swaggerOptions.type = this.mapPrimitiveType(type);
    }

    // Handle enums
    if (options.enum) {
      swaggerOptions.enum = options.enum;
      if (options.enumName) {
        swaggerOptions.enumName = options.enumName;
      }
    }

    // Handle special string formats
    if (type === String) {
      if (options.email) swaggerOptions.format = 'email';
      if (options.url) swaggerOptions.format = 'url';
      if (options.uuid) swaggerOptions.format = 'uuid';
      if (options.password) swaggerOptions.format = 'password';
    }

    // Handle date format
    if (type === Date) {
      swaggerOptions.format = 'date-time';
    }

    // Handle number formats
    if (type === Number) {
      if (options.integer) {
        swaggerOptions.type = 'integer';
      }
      if (options.float || options.precision) {
        swaggerOptions.format = 'float';
      }
      if (options.double) {
        swaggerOptions.format = 'double';
      }
    }

    // Remove undefined values
    Object.keys(swaggerOptions).forEach(key => {
      if (swaggerOptions[key] === undefined) {
        delete swaggerOptions[key];
      }
    });

    return swaggerOptions;
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
