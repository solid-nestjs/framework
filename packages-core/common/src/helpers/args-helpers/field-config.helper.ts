import { Type } from '@nestjs/common';
import { FieldConfig, ParsedFieldConfig } from './type-inference.helper';

/**
 * Configuration types for different helper functions
 */
export type WhereFieldsConfig<T> = {
  [K in keyof T]?: FieldConfig;
} & {
  // Allow relation fields that are not part of T
  [relationName: string]: FieldConfig;
};

export type OrderByFieldConfig = 
  | true 
  | Type<any>                      // For relation OrderBy classes
  | {
      description?: string;
      required?: boolean;
      type?: Type<any>;             // Allow explicit type
    };

export type OrderByFieldsConfig<T> = {
  [K in keyof T]?: OrderByFieldConfig;
} & {
  // Allow relation fields that are not part of T
  [relationName: string]: OrderByFieldConfig;
};

export type GroupByFieldConfig = 
  | true 
  | Type<any>  // For nested GroupByFields
  | {
      description?: string;
      required?: boolean;
      type?: Type<any>;
    };

export type GroupByFieldsConfig<T> = {
  [K in keyof T]?: GroupByFieldConfig;
} & {
  // Allow relation fields that are not part of T
  [relationName: string]: GroupByFieldConfig;
};

/**
 * Options for configuring the generated class
 */
export interface ClassOptions {
  name?: string;                    // Custom class name
  description?: string;             // Class description for documentation
  isAbstract?: boolean;            // For @InputType({ isAbstract: true })
  decorators?: ClassDecorator[];    // Additional decorators to apply to the class
  metadata?: Record<string, any>;   // Custom metadata to attach
  extends?: Type<any>;             // Base class to extend from
}

/**
 * Parsed class options with default values
 */
export interface ParsedClassOptions {
  name: string;
  description?: string;
  isAbstract: boolean;
  decorators: ClassDecorator[];
  metadata: Record<string, any>;
  extends?: Type<any>;
}

/**
 * Parses field configuration into a normalized format
 * 
 * @param config - Raw field configuration
 * @returns Parsed configuration with defaults
 */
export function parseFieldConfig(config: FieldConfig): ParsedFieldConfig {
  if (config === true) {
    return {};
  }
  
  if (typeof config === 'function') {
    return { type: config };
  }
  
  if (typeof config === 'object' && config !== null) {
    return { ...config };
  }
  
  throw new Error(`Invalid field configuration: ${config}`);
}

/**
 * Parses OrderBy field configuration
 * 
 * @param config - Raw OrderBy field configuration
 * @returns Parsed configuration
 */
export function parseOrderByConfig(config: OrderByFieldConfig): ParsedFieldConfig {
  if (config === true) {
    return {};
  }
  
  if (typeof config === 'function') {
    return { type: config };
  }
  
  if (typeof config === 'object' && config !== null) {
    return { ...config };
  }
  
  throw new Error(`Invalid OrderBy field configuration: ${config}`);
}

/**
 * Parses GroupBy field configuration
 * 
 * @param config - Raw GroupBy field configuration
 * @returns Parsed configuration
 */
export function parseGroupByConfig(config: GroupByFieldConfig): ParsedFieldConfig {
  if (config === true) {
    return { type: Boolean };
  }
  
  if (typeof config === 'function') {
    return { type: config };
  }
  
  if (typeof config === 'object' && config !== null) {
    return { ...config };
  }
  
  throw new Error(`Invalid GroupBy field configuration: ${config}`);
}

/**
 * Parses class options with defaults
 * 
 * @param entityName - Name of the entity for default naming
 * @param suffix - Suffix for the class name (e.g., 'WhereFields')
 * @param options - Raw class options
 * @returns Parsed options with defaults
 */
export function parseClassOptions(
  entityName: string,
  suffix: string,
  options?: ClassOptions
): ParsedClassOptions {
  return {
    name: options?.name || `${entityName}${suffix}`,
    description: options?.description,
    isAbstract: options?.isAbstract ?? true,
    decorators: options?.decorators || [],
    metadata: options?.metadata || {},
    extends: options?.extends
  };
}

/**
 * Validates that a field configuration object is valid
 * 
 * @param config - Configuration to validate
 * @param fieldName - Name of the field (for error messages)
 * @throws Error if configuration is invalid
 */
export function validateFieldConfig(config: any, fieldName: string): void {
  if (config === undefined || config === null) {
    throw new Error(`Field configuration for '${fieldName}' cannot be null or undefined`);
  }
  
  if (config === true) {
    return; // Valid simple configuration
  }
  
  if (typeof config === 'function') {
    return; // Valid type configuration
  }
  
  if (typeof config === 'object') {
    // Validate object configuration
    const validKeys = ['type', 'isPlain', 'description', 'required', 'example', 'deprecated', 'enum', 'enumName', 'isRelation'];
    const configKeys = Object.keys(config);
    
    for (const key of configKeys) {
      if (!validKeys.includes(key)) {
        throw new Error(`Invalid configuration key '${key}' for field '${fieldName}'. Valid keys: ${validKeys.join(', ')}`);
      }
    }
    
    if (config.type && typeof config.type !== 'function') {
      throw new Error(`Type for field '${fieldName}' must be a class constructor`);
    }
    
    if (config.enumName && typeof config.enumName !== 'string') {
      throw new Error(`enumName for field '${fieldName}' must be a string`);
    }
    
    return;
  }
  
  throw new Error(`Invalid configuration type for field '${fieldName}'. Expected: true, Type<any>, or configuration object`);
}

/**
 * Validates class options
 * 
 * @param options - Options to validate
 * @throws Error if options are invalid
 */
export function validateClassOptions(options: ClassOptions): void {
  if (options.name && typeof options.name !== 'string') {
    throw new Error('Class name must be a string');
  }
  
  if (options.description && typeof options.description !== 'string') {
    throw new Error('Class description must be a string');
  }
  
  if (options.isAbstract !== undefined && typeof options.isAbstract !== 'boolean') {
    throw new Error('isAbstract option must be a boolean');
  }
  
  if (options.decorators && !Array.isArray(options.decorators)) {
    throw new Error('decorators option must be an array');
  }
  
  if (options.metadata && typeof options.metadata !== 'object') {
    throw new Error('metadata option must be an object');
  }
  
  if (options.extends && typeof options.extends !== 'function') {
    throw new Error('extends option must be a class constructor');
  }
}