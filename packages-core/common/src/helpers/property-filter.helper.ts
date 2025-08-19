import { Type } from '@nestjs/common';
import { 
  isFlatType, 
  isSystemField, 
  isRelationalField, 
  getPropertyDesignType 
} from './metadata-extractor.helper';

/**
 * Filters properties based on selection or defaults
 */
export function filterProperties(
  EntityClass: Type,
  allProperties: string[],
  selectedProperties?: string[]
): string[] {
  if (selectedProperties && selectedProperties.length > 0) {
    // Validate selected properties
    validatePropertySelection(EntityClass, allProperties, selectedProperties);
    return selectedProperties;
  }
  
  // Default: all flat properties except system fields
  return getDefaultProperties(EntityClass, allProperties);
}

/**
 * Gets default properties (all flat properties except system fields)
 */
export function getDefaultProperties(
  EntityClass: Type,
  allProperties: string[]
): string[] {
  return allProperties.filter(prop => {
    // Skip system fields
    if (isSystemField(prop)) return false;
    
    // Skip relational fields
    if (isRelationalField(EntityClass, prop)) return false;
    
    // Only include flat types
    const type = getPropertyDesignType(EntityClass, prop);
    return isFlatType(type);
  });
}

/**
 * Validates that selected properties exist and are valid for DTO generation
 * @param allowSystemFields - When true, allows system fields (id, timestamps) to be included
 */
export function validatePropertySelection(
  EntityClass: Type,
  allProperties: string[],
  selectedProperties: string[],
  allowSystemFields: boolean = false
): void {
  const entityName = EntityClass.name;
  
  selectedProperties.forEach(prop => {
    // Check property exists
    if (!allProperties.includes(prop)) {
      throw new Error(
        `Property '${prop}' does not exist on entity ${entityName}`
      );
    }
    
    // Check property is not a system field (unless explicitly allowed)
    if (!allowSystemFields && isSystemField(prop)) {
      throw new Error(
        `Property '${prop}' is a system field (id, timestamps) and cannot be included in generated DTO. ` +
        `Use the object format with explicit boolean configuration to include system fields.`
      );
    }
    
    // Check property is not relational
    if (isRelationalField(EntityClass, prop)) {
      throw new Error(
        `Property '${prop}' is a relational field and cannot be included in generated DTO. ` +
        `Use manual extension to add complex properties.`
      );
    }
    
    // Check property is flat type (system fields get special treatment for id)
    const type = getPropertyDesignType(EntityClass, prop);
    if (!isFlatType(type) && !(isSystemField(prop) && prop === 'id')) {
      throw new Error(
        `Property '${prop}' is not a flat type (string, number, boolean, Date) ` +
        `and cannot be included in generated DTO`
      );
    }
  });
}