import { Type } from '@nestjs/common';
import 'reflect-metadata';

/**
 * Configuration for GroupByArgsFrom mixin
 */
export interface GroupByArgsFromConfig {
  findArgsType: Type<any>;
  groupByFields: string[];
  className?: string;
  description?: string;
}

/**
 * Extracted metadata from FindArgs class for GroupBy generation
 */
export interface FindArgsMetadata {
  className: string;
  properties: Array<{
    name: string;
    type: any;
    isOptional: boolean;
    description?: string;
  }>;
  entityType?: Type<any>;
}

/**
 * GroupByArgsFrom mixin helper that creates a GroupBy class from a FindArgs constructor.
 * 
 * This function analyzes the provided FindArgs class and extracts relevant properties
 * to generate a boolean-based GroupBy class, where each specified field becomes a 
 * boolean property indicating whether to group by that field.
 * 
 * @template T - The FindArgs type
 * @param config - Configuration specifying FindArgs type and fields to include
 * @returns A function that can be used as a mixin base class
 * 
 * @example
 * ```typescript
 * // Define FindArgs class
 * export class FindProductArgs extends FindArgsFrom({
 *   whereType: ProductWhere,
 *   orderByType: ProductOrderBy
 * }) {}
 * 
 * // Create GroupBy from FindArgs
 * const ProductGroupByFromArgs = GroupByArgsFrom({
 *   findArgsType: FindProductArgs,
 *   groupByFields: ['category', 'supplier', 'status'],
 *   className: 'ProductGroupByFromFindArgs'
 * });
 * 
 * // Usage in service or resolver
 * function groupProducts(args: FindProductArgs): ProductGroupByFromArgs {
 *   return new ProductGroupByFromArgs();
 * }
 * ```
 */
export function GroupByArgsFrom<T>(config: GroupByArgsFromConfig): Type<any> {
  if (!config.findArgsType) {
    throw new Error('findArgsType is required in GroupByArgsFromConfig');
  }
  
  if (!config.groupByFields || config.groupByFields.length === 0) {
    throw new Error('groupByFields array is required and cannot be empty');
  }

  // Extract metadata from FindArgs class
  const findArgsMetadata = extractFindArgsMetadata(config.findArgsType);
  
  // Validate that specified fields exist in FindArgs
  const availableFields = findArgsMetadata.properties.map(p => p.name);
  const invalidFields = config.groupByFields.filter(field => !availableFields.includes(field));
  
  if (invalidFields.length > 0) {
    throw new Error(`Invalid groupByFields specified: ${invalidFields.join(', ')}. Available fields: ${availableFields.join(', ')}`);
  }

  // Generate class name
  const className = config.className || `${findArgsMetadata.className}GroupBy`;
  
  // Create dynamic class
  const GroupByClass = class {
    constructor() {
      // Initialize all group by fields as optional booleans
      config.groupByFields.forEach(fieldName => {
        (this as any)[fieldName] = undefined;
      });
    }
  };

  // Set class name for debugging and reflection
  Object.defineProperty(GroupByClass, 'name', {
    value: className,
    configurable: true
  });

  // Add metadata for each group by field
  config.groupByFields.forEach(fieldName => {
    const originalProperty = findArgsMetadata.properties.find(p => p.name === fieldName);
    
    // Set property metadata for TypeScript reflection
    Reflect.defineMetadata('design:type', Boolean, GroupByClass.prototype, fieldName);
    
    // Store custom metadata for the property
    Reflect.defineMetadata('groupby:field', {
      originalType: originalProperty?.type,
      description: originalProperty?.description || `Group by ${fieldName}`,
      isOptional: true,
      isGroupBy: true
    }, GroupByClass.prototype, fieldName);
  });

  // Store class-level metadata
  Reflect.defineMetadata('groupby:config', {
    sourceClass: config.findArgsType.name,
    className,
    description: config.description || `GroupBy fields derived from ${findArgsMetadata.className}`,
    fields: config.groupByFields,
    entityType: findArgsMetadata.entityType
  }, GroupByClass);

  return GroupByClass as Type<any>;
}

/**
 * Extracts metadata from a FindArgs class for use in GroupBy generation
 * 
 * @param findArgsType - The FindArgs class to analyze
 * @returns Extracted metadata including properties and class information
 */
export function extractFindArgsMetadata(findArgsType: Type<any>): FindArgsMetadata {
  const className = findArgsType.name;
  const properties: FindArgsMetadata['properties'] = [];
  
  // Get all property names from the class prototype
  const propertyNames = Object.getOwnPropertyNames(findArgsType.prototype);
  
  // Also check for properties defined via decorators/metadata
  const metadataKeys = Reflect.getMetadataKeys(findArgsType.prototype) || [];
  const additionalProperties = metadataKeys
    .filter(key => typeof key === 'string' && key.startsWith('design:type:'))
    .map(key => (key as string).replace('design:type:', ''));

  // Combine and deduplicate property names
  const allPropertyNames = Array.from(new Set([...propertyNames, ...additionalProperties]))
    .filter(name => name !== 'constructor');

  // Extract metadata for each property
  for (const propertyName of allPropertyNames) {
    const type = Reflect.getMetadata('design:type', findArgsType.prototype, propertyName);
    
    if (type) {
      properties.push({
        name: propertyName,
        type,
        isOptional: true, // Assume optional for GroupBy context
        description: `Property ${propertyName} from ${className}`
      });
    }
  }

  // Try to extract entity type if available in class metadata
  const entityType = Reflect.getMetadata('entity:type', findArgsType) || 
                    Reflect.getMetadata('crud:entity', findArgsType);

  return {
    className,
    properties,
    entityType
  };
}

/**
 * Gets the GroupBy configuration metadata from a class created by GroupByArgsFrom
 * 
 * @param groupByClass - The class created by GroupByArgsFrom
 * @returns The configuration metadata or undefined if not found
 */
export function getGroupByArgsMetadata(groupByClass: Type<any>): any {
  return Reflect.getMetadata('groupby:config', groupByClass);
}

/**
 * Gets the field metadata for a specific property in a GroupBy class
 * 
 * @param groupByClass - The class created by GroupByArgsFrom
 * @param fieldName - The field name to get metadata for
 * @returns The field metadata or undefined if not found
 */
export function getGroupByFieldMetadata(groupByClass: Type<any>, fieldName: string): any {
  return Reflect.getMetadata('groupby:field', groupByClass.prototype, fieldName);
}

/**
 * Validates that a class was created by GroupByArgsFrom
 * 
 * @param groupByClass - The class to validate
 * @returns True if the class was created by GroupByArgsFrom
 */
export function isGroupByArgsFromClass(groupByClass: Type<any>): boolean {
  return !!Reflect.getMetadata('groupby:config', groupByClass);
}