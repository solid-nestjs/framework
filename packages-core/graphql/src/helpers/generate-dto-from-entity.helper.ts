import { Type } from '@nestjs/common';
import { Field, InputType, PickType } from '@nestjs/graphql';
import { ClassDecoratorFactory } from '@nestjs/graphql/dist/interfaces/class-decorator-factory.interface';
import { 
  extractAllPropertyNames,
  getDefaultProperties,
  isSystemField,
  isRelationalField,
  isFlatType,
  validatePropertySelection,
  getPropertyDesignType,
  PropertyInclusionConfig,
  InferDtoType
} from '@solid-nestjs/common';

/**
 * Generates a DTO class from an entity for GraphQL with improved TypeScript inference
 * Supports both legacy array format and new object configuration for backward compatibility
 * 
 * @template TEntity - The source entity type
 * @template TPropertiesOrConfig - The properties selection (array, object config, or undefined)
 * @param EntityClass - The entity class to generate DTO from
 * @param propertiesOrConfig - Property selection configuration
 * @param decorator - GraphQL decorator to apply (defaults to InputType)
 * @returns A DTO class with only the selected primitive properties
 */
export function GenerateDtoFromEntity<
  TEntity extends object,
  TPropertiesOrConfig extends (keyof TEntity)[] | PropertyInclusionConfig<TEntity> | undefined = undefined
>(
  EntityClass: Type<TEntity>,
  propertiesOrConfig?: TPropertiesOrConfig,
  decorator?: ClassDecoratorFactory
): Type<InferDtoType<TEntity, TPropertiesOrConfig>> {
  // Get all properties and determine which ones to include
  const allProperties = extractAllPropertyNames(EntityClass);
  const selectedProperties = selectProperties(EntityClass, allProperties, propertiesOrConfig);
  
  // Use GraphQL PickType directly on SOLID entity (like PartialType does)
  const PickedClass = PickType(
    EntityClass, 
    selectedProperties as any,
    decorator || InputType
  );
  
  // Note: GraphQL PickType should handle the field decorators automatically
  // since SOLID entities already have the necessary GraphQL metadata
  
  // Set class name for debugging
  Object.defineProperty(PickedClass, 'name', {
    value: `Generated${EntityClass.name}Dto`
  });
  
  return PickedClass as any;
}

/**
 * Selects properties supporting both array (legacy) and object (new) formats
 */
function selectProperties<TEntity>(
  EntityClass: Type<TEntity>,
  allProperties: string[],
  propertiesOrConfig?: (keyof TEntity)[] | PropertyInclusionConfig<TEntity>
): string[] {
  if (!propertiesOrConfig) {
    // Use default rules when no config provided
    return getDefaultProperties(EntityClass, allProperties);
  }
  
  // Check if it's an array (legacy format)
  if (Array.isArray(propertiesOrConfig)) {
    // Legacy array format: validate and return selected properties
    // Allow system fields when explicitly specified in array format
    const selectedProperties = propertiesOrConfig as string[];
    validatePropertySelection(EntityClass, allProperties, selectedProperties, true);
    return selectedProperties;
  }
  
  // New object format: process boolean configuration
  const propertyConfig = propertiesOrConfig as PropertyInclusionConfig<TEntity>;
  const selectedProperties: string[] = [];
  
  allProperties.forEach(prop => {
    const configValue = propertyConfig[prop as keyof TEntity];
    
    if (configValue === true) {
      // Always include when explicitly set to true
      selectedProperties.push(prop);
    } else if (configValue === false) {
      // Always exclude when explicitly set to false
      return;
    } else if (configValue === undefined) {
      // Use default rules when undefined
      // Skip system fields
      if (isSystemField(prop)) return;
      
      // Skip relational fields
      if (isRelationalField(EntityClass, prop)) return;
      
      // Only include flat types
      const type = getPropertyDesignType(EntityClass, prop);
      if (isFlatType(type)) {
        selectedProperties.push(prop);
      }
    }
  });
  
  return selectedProperties;
}