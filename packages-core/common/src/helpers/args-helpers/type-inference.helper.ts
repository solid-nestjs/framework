import { Type } from '@nestjs/common';
import 'reflect-metadata';

/**
 * Configuration for a field in the helper functions
 */
export type FieldConfig = 
  | true                           // Simple enable with auto-inference
  | Type<any>                      // Explicit type
  | {                              // Full configuration
      type?: Type<any>;            // Explicit type for API (Swagger/GraphQL)
      isPlain?: boolean;           // If true, use plain types (String, Number, Date) instead of filters
      description?: string;
      required?: boolean;
      example?: any;
      deprecated?: boolean;
      enum?: any;                  // For enum fields
      enumName?: string;           // Custom name for the enum
      isRelation?: boolean;        // Mark as relation field
    };

/**
 * Parsed field configuration with normalized values
 */
export interface ParsedFieldConfig {
  type?: Type<any>;
  isPlain?: boolean;
  description?: string;
  required?: boolean;
  example?: any;
  deprecated?: boolean;
  enum?: any;
  enumName?: string;
  isRelation?: boolean;
}

/**
 * Infers the appropriate plain type (String, Number, Date) for an entity property.
 * Used when isPlain: true is specified in the field configuration.
 * 
 * @template T - The entity type
 * @param entity - The entity class constructor
 * @param propertyName - The name of the property to infer type for
 * @returns The plain type class constructor (String, Number, Date, Boolean)
 * 
 * @example
 * ```typescript
 * class Product {
 *   name: string;    // Will infer String
 *   price: number;   // Will infer Number
 *   createdAt: Date; // Will infer Date
 *   isActive: boolean; // Will infer Boolean
 * }
 * 
 * const nameType = inferPlainType(Product, 'name'); // String
 * const priceType = inferPlainType(Product, 'price'); // Number
 * ```
 */
export function inferPlainType(
  entity: Type<any>, 
  propertyName: string
): Type<any> {
  // Use reflection to get property type from TypeScript metadata
  const type = Reflect.getMetadata('design:type', entity.prototype, propertyName);
  
  if (!type) {
    console.warn(`Could not infer type for property ${propertyName} on ${entity.name}. Using String as fallback.`);
    return String;
  }
  
  // Map native TypeScript types to plain types
  if (type === String) {
    return String;
  }
  if (type === Number) {
    return Number;
  }
  if (type === Date) {
    return Date;
  }
  if (type === Boolean) {
    return Boolean;
  }
  
  // For enums, treat as String
  if (isEnum(type)) {
    return String;
  }
  
  // For unknown types, fallback to String
  console.warn(`Unknown type ${type.name} for property ${propertyName}. Using String as fallback.`);
  return String;
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
    // Check if it's a relation type and return it directly
    if (isRelationType(config)) {
      return config;
    }
    return config;
  }
  if (typeof config === 'object' && config?.type) {
    // Check if it's a relation type and return it directly
    if (isRelationType(config.type)) {
      return config.type;
    }
    return config.type;
  }
  
  // If explicitly marked as relation, return the type as-is without inference
  if (typeof config === 'object' && config?.isRelation) {
    return config.type || FilterTypeRegistry.getStringFilter();
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
 * Checks if a given type appears to be a relation type (Where/OrderBy/GroupBy class)
 * by examining the class name patterns commonly used in the framework
 * 
 * @param type - The type to check
 * @returns True if it appears to be a relation type
 */
export function isRelationType(type: Type<any>): boolean {
  if (!type || !type.name) {
    return false;
  }
  
  const className = type.name;
  
  // Check for common relation type patterns
  return (
    className.includes('Where') ||
    className.includes('OrderBy') ||
    className.includes('GroupBy') ||
    className.includes('FindArgs') ||
    // Add other patterns as needed
    className.endsWith('Fields')
  );
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
  
  const values = Object.values(type);
  const keys = Object.keys(type);
  
  // Should have at least one key-value pair
  if (keys.length === 0) {
    return false;
  }
  
  // Enums typically have string or number values
  const hasValidValues = values.every(v => 
    typeof v === 'string' || typeof v === 'number'
  );
  
  if (!hasValidValues) {
    return false;
  }
  
  // For numeric enums, TypeScript generates reverse mapping
  // Check if this looks like a TypeScript enum structure
  const numericValues = values.filter(v => typeof v === 'number');
  if (numericValues.length > 0) {
    // Should have reverse mappings for numeric enums
    const hasReverseMappings = numericValues.every(numVal => 
      keys.some(key => type[numVal] === key)
    );
    return hasReverseMappings;
  }
  
  // For string enums, check that all values are strings and keys match a pattern
  // Also verify this isn't just a plain object by checking key structure
  const stringValues = values.filter(v => typeof v === 'string');
  if (stringValues.length === values.length && stringValues.length > 0) {
    // Additional check: enum keys are typically uppercase or camelCase constants
    // This helps distinguish from regular objects like { key: 'value' }
    return keys.some(key => 
      key === key.toUpperCase() || // CONSTANT_CASE
      /^[A-Z][A-Z_0-9]*$/.test(key) // SCREAMING_SNAKE_CASE
    );
  }
  
  return false;
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