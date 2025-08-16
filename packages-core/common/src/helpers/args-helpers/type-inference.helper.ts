import { Type } from '@nestjs/common';
import 'reflect-metadata';

/**
 * Configuration for a field in the helper functions
 */
export type FieldConfig = 
  | true                           // Simple enable with auto-inference
  | Type<any>                      // Explicit type
  | {                              // Full configuration
      type?: Type<any>;
      description?: string;
      required?: boolean;
      example?: any;
      deprecated?: boolean;
      enum?: any;                  // For enum fields
      enumName?: string;           // Custom name for the enum
    };

/**
 * Parsed field configuration with normalized values
 */
export interface ParsedFieldConfig {
  type?: Type<any>;
  description?: string;
  required?: boolean;
  example?: any;
  deprecated?: boolean;
  enum?: any;
  enumName?: string;
}

/**
 * Infers the appropriate filter type for an entity property based on its TypeScript type.
 * Uses reflection to determine the property type and maps it to the corresponding filter type.
 * 
 * @template T - The entity type
 * @param entity - The entity class constructor
 * @param propertyName - The name of the property to infer type for
 * @param config - Optional field configuration that may override the inferred type
 * @returns The filter type class constructor
 * 
 * @example
 * ```typescript
 * class Product {
 *   name: string;    // Will infer StringFilter
 *   price: number;   // Will infer NumberFilter
 *   createdAt: Date; // Will infer DateFilter
 *   isActive: boolean; // Will return Boolean
 * }
 * 
 * const nameFilterType = inferFilterType(Product, 'name'); // StringFilter
 * const priceFilterType = inferFilterType(Product, 'price'); // NumberFilter
 * ```
 */
export function inferFilterType(
  entity: Type<any>, 
  propertyName: string, 
  config?: FieldConfig
): Type<any> {
  // If explicit type is provided in config, use it
  if (typeof config === 'function') {
    return config;
  }
  if (typeof config === 'object' && config?.type) {
    return config.type;
  }
  
  // Check for explicit enum configuration
  if (typeof config === 'object' && config?.enum) {
    // For explicit enum configuration, use StringFilter as default
    return FilterTypeRegistry.getStringFilter();
  }
  
  // Use reflection to get property type from TypeScript metadata
  const type = Reflect.getMetadata('design:type', entity.prototype, propertyName);
  
  if (!type) {
    console.warn(`Could not infer type for property ${propertyName} on ${entity.name}. Using StringFilter as fallback.`);
    return FilterTypeRegistry.getStringFilter();
  }
  
  // Map native TypeScript types to filter types
  if (type === String) {
    return FilterTypeRegistry.getStringFilter();
  }
  if (type === Number) {
    return FilterTypeRegistry.getNumberFilter();
  }
  if (type === Date) {
    return FilterTypeRegistry.getDateFilter();
  }
  if (type === Boolean) {
    return Boolean; // Direct boolean, no filter wrapper needed
  }
  
  // Check if the type is an enum and treat it as StringFilter
  if (isEnum(type)) {
    return FilterTypeRegistry.getStringFilter();
  }
  
  // For complex types or unknown types, fallback to StringFilter
  console.warn(`Unknown type ${type.name} for property ${propertyName}. Using StringFilter as fallback.`);
  return FilterTypeRegistry.getStringFilter();
}

/**
 * Registry for filter types that can be set by each package
 */
class FilterTypeRegistry {
  private static stringFilter?: Type<any>;
  private static numberFilter?: Type<any>;
  private static dateFilter?: Type<any>;

  /**
   * Registers filter types for the current package context
   * 
   * @param types - Object containing the filter type constructors
   */
  static register(types: {
    StringFilter: Type<any>;
    NumberFilter: Type<any>;
    DateFilter: Type<any>;
  }): void {
    this.stringFilter = types.StringFilter;
    this.numberFilter = types.NumberFilter;
    this.dateFilter = types.DateFilter;
  }

  /**
   * Gets the registered StringFilter type
   * 
   * @returns The StringFilter type constructor
   * @throws Error if not registered
   */
  static getStringFilter(): Type<any> {
    if (!this.stringFilter) {
      throw new Error('StringFilter type not registered. Call FilterTypeRegistry.register() in your package initialization.');
    }
    return this.stringFilter;
  }

  /**
   * Gets the registered NumberFilter type
   * 
   * @returns The NumberFilter type constructor
   * @throws Error if not registered
   */
  static getNumberFilter(): Type<any> {
    if (!this.numberFilter) {
      throw new Error('NumberFilter type not registered. Call FilterTypeRegistry.register() in your package initialization.');
    }
    return this.numberFilter;
  }

  /**
   * Gets the registered DateFilter type
   * 
   * @returns The DateFilter type constructor
   * @throws Error if not registered
   */
  static getDateFilter(): Type<any> {
    if (!this.dateFilter) {
      throw new Error('DateFilter type not registered. Call FilterTypeRegistry.register() in your package initialization.');
    }
    return this.dateFilter;
  }

  /**
   * Checks if filter types are registered
   * 
   * @returns True if all filter types are registered
   */
  static isRegistered(): boolean {
    return !!(this.stringFilter && this.numberFilter && this.dateFilter);
  }

  /**
   * Clears all registered filter types (mainly for testing)
   */
  static clear(): void {
    this.stringFilter = undefined;
    this.numberFilter = undefined;
    this.dateFilter = undefined;
  }
}

/**
 * Sets the default filter types for the type inference system.
 * This should be called by each package (rest-api, graphql, rest-graphql) 
 * during initialization to provide the appropriate filter types.
 * 
 * @param filterTypes - Object containing the filter type constructors
 * @deprecated Use FilterTypeRegistry.register() instead
 */
export function setDefaultFilterTypes(filterTypes: {
  StringFilter: Type<any>;
  NumberFilter: Type<any>;
  DateFilter: Type<any>;
}): void {
  FilterTypeRegistry.register(filterTypes);
}

export { FilterTypeRegistry };

/**
 * Checks if a given type is a primitive type that can be auto-inferred
 * 
 * @param type - The type to check
 * @returns True if the type is a supported primitive
 */
export function isSupportedPrimitiveType(type: any): boolean {
  return type === String || type === Number || type === Date || type === Boolean;
}

/**
 * Gets the property type using reflection
 * 
 * @param entity - The entity class
 * @param propertyName - The property name
 * @returns The reflected type or undefined if not found
 */
export function getReflectedPropertyType(entity: Type<any>, propertyName: string): any {
  return Reflect.getMetadata('design:type', entity.prototype, propertyName);
}

/**
 * Checks if a given type appears to be an enum
 * 
 * @param type - The type to check
 * @returns True if the type appears to be an enum
 */
export function isEnum(type: any): boolean {
  if (!type || typeof type !== 'object') {
    return false;
  }
  
  // Check if it has both string keys and values (typical enum structure)
  const values = Object.values(type);
  const keys = Object.keys(type);
  
  // Enums typically have string or number values
  const hasValidValues = values.every(v => 
    typeof v === 'string' || typeof v === 'number'
  );
  
  // Should have at least one key-value pair
  return keys.length > 0 && hasValidValues;
}

/**
 * Extracts enum information for use in decorators
 * 
 * @param enumObject - The enum object
 * @returns Information about the enum
 */
export function getEnumInfo(enumObject: any): {
  values: any[];
  example: any;
  description: string;
} {
  const values = Object.values(enumObject);
  const keys = Object.keys(enumObject);
  
  return {
    values,
    example: values[0],
    description: `One of: ${values.join(', ')}`
  };
}

/**
 * Determines if a field should be treated as an enum field
 * 
 * @param entity - The entity class
 * @param propertyName - The property name
 * @param config - Field configuration
 * @returns True if it should be treated as enum
 */
export function shouldTreatAsEnum(
  entity: Type<any>, 
  propertyName: string, 
  config?: FieldConfig
): boolean {
  // Explicit enum configuration
  if (typeof config === 'object' && config?.enum) {
    return true;
  }
  
  // Auto-detection (could be enabled/disabled via settings)
  const type = Reflect.getMetadata('design:type', entity.prototype, propertyName);
  return isEnum(type);
}