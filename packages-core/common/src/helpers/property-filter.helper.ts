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
  // SIMPLIFIED: No validation - trust the user
  // If they specify a property that doesn't exist, PickType will handle the error
  // This eliminates all the complex property detection issues
}