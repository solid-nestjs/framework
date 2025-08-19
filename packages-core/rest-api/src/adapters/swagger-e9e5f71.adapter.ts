//working on entities for output
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
let ApiResponseProperty: any;

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

  private async loadSwagger(): Promise<void> {
    if (this.swaggerLoaded) return;

    try {
      const swagger = await import('@nestjs/swagger');

      // Assign decorators
      ApiProperty = swagger.ApiProperty;
      ApiPropertyOptional = swagger.ApiPropertyOptional;
      ApiHideProperty = swagger.ApiHideProperty;
      ApiResponseProperty = swagger.ApiResponseProperty;

      this.swaggerLoaded = true;
    } catch (error) {
      console.warn('[SolidNestJS] Failed to load Swagger decorators:', error);
    }
  }

  private loadSwaggerSync(): void {
    if (this.swaggerLoaded) return;

    try {
      const swagger = require('@nestjs/swagger');

      // Assign decorators
      ApiProperty = swagger.ApiProperty;
      ApiPropertyOptional = swagger.ApiPropertyOptional;
      ApiHideProperty = swagger.ApiHideProperty;
      ApiResponseProperty = swagger.ApiResponseProperty;

      this.swaggerLoaded = true;
    } catch (error) {
      console.warn(
        '[SolidNestJS] Failed to load Swagger decorators synchronously:',
        error,
      );
    }
  }

  apply(
    target: any,
    propertyKey: string | symbol,
    metadata: FieldMetadata,
  ): void {
    // Load Swagger if not already loaded synchronously
    if (!this.swaggerLoaded) {
      this.loadSwaggerSync();
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

    // Build API property options
    const apiPropertyOptions: any = this.buildApiPropertyOptions(
      type,
      options,
      isOptional,
      adapterOptions,
    );

    // Apply appropriate decorator
    if (options.nullable ?? isOptional) {
      if (ApiPropertyOptional) {
        ApiPropertyOptional(apiPropertyOptions)(target, propertyKey);
      }
    } else {
      if (ApiProperty) {
        ApiProperty(apiPropertyOptions)(target, propertyKey);
      }
    }

    // Apply response property if specified
    if (
      (options.responseOnly || adapterOptions?.responseOnly) &&
      ApiResponseProperty
    ) {
      ApiResponseProperty(apiPropertyOptions)(target, propertyKey);
    }
  }

  applyClassDecorator(
    target: Function,
    type: 'entity' | 'input',
    options: any,
  ): void {
    // Swagger class decorators are typically handled at controller level
    // This adapter focuses on property decorators
  }

  private buildApiPropertyOptions(
    type: any,
    options: any,
    isOptional: boolean,
    adapterOptions: any,
  ): any {
    const apiOptions: any = {
      type: this.mapTypeToSwaggerType(type, options, adapterOptions),
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
      readOnly: options.readOnly,
      writeOnly: options.writeOnly,
      ...adapterOptions, // Allow full override
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

  private mapTypeToSwaggerType(
    type: any,
    options: any,
    adapterOptions?: any,
  ): any {
    // Check for explicit type override from adapter options
    if (adapterOptions?.type) {
      const explicitType =
        typeof adapterOptions.type === 'function'
          ? adapterOptions.type()
          : adapterOptions.type;

      // Handle array types like [CreateInvoiceDetailDto]
      if (Array.isArray(explicitType) && explicitType.length > 0) {
        return [explicitType[0]];
      }

      return explicitType;
    }

    // Handle arrays - check explicit array option first
    if (options.array || Array.isArray(type)) {
      let itemType = options.arrayType;

      // If explicit arrayType is a function, call it
      if (typeof itemType === 'function') {
        itemType = itemType();
      }

      // Fallback to other sources if no explicit arrayType
      if (!itemType) {
        itemType = type[0] || String;
      }

      return [this.mapTypeToSwaggerType(itemType, {}, {})];
    }

    // Handle enums
    if (options.enum) {
      return options.enum;
    }

    // Map primitive types
    const typeMap = new Map<any, string>([
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
    apiOptions: any,
    type: any,
    options: any,
    adapterOptions: any,
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
      if (options.binary || adapterOptions?.binary)
        apiOptions.format = 'binary';
      if (options.password || adapterOptions?.password)
        apiOptions.format = 'password';
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
      if (options.minSize !== undefined) apiOptions.minItems = options.minSize;
      if (options.maxSize !== undefined) apiOptions.maxItems = options.maxSize;
      if (options.uniqueItems || adapterOptions?.uniqueItems) {
        apiOptions.uniqueItems = true;
      }
    }

    // File upload handling
    if (options.file || adapterOptions?.file) {
      apiOptions.type = 'string';
      apiOptions.format = 'binary';
    }

    // Primary key handling
    if (options.isPrimaryKey) {
      apiOptions.description = apiOptions.description || 'Unique identifier';
      apiOptions.readOnly = true;
    }

    // Timestamp handling
    if (options.createdAt || options.updatedAt || options.deletedAt) {
      apiOptions.format = 'date-time';
      apiOptions.readOnly = true;
    }
  }
}

// Register the Swagger relation adapter
RelationAdapterRegistry.registerAdapter(
  'swagger',
  new SwaggerRelationAdapterHelper(),
);
