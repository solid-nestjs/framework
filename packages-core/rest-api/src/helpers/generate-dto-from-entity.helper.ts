import { Type } from '@nestjs/common';
import { PickType } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { DECORATORS } from '@nestjs/swagger/dist/constants';
import { ModelPropertiesAccessor } from '@nestjs/swagger/dist/services/model-properties-accessor';
import { 
  extractAllPropertyNames,
  getDefaultProperties,
  isSystemField,
  isRelationalField,
  isFlatType,
  validatePropertySelection,
  getPropertyDesignType
} from '@solid-nestjs/common';

const modelPropertiesAccessor = new ModelPropertiesAccessor();

/**
 * Property inclusion configuration for GenerateDtoFromEntity
 * - undefined: use default rules (include if flat type and not system field)
 * - true: always include the property
 * - false: always exclude the property
 */
export type PropertyInclusionConfig<TEntity> = Partial<Record<keyof TEntity, boolean>>;

/**
 * Generates a DTO class from an entity for REST API with Swagger decorators
 * Supports both legacy array format and new object configuration for backward compatibility
 */
export function GenerateDtoFromEntity<TEntity extends object>(
  EntityClass: Type<TEntity>,
  propertiesOrConfig?: (keyof TEntity)[] | PropertyInclusionConfig<TEntity>
): Type<Partial<TEntity>> {
  // Get all properties and determine which ones to include
  const allProperties = extractAllPropertyNames(EntityClass);
  const selectedProperties = selectProperties(EntityClass, allProperties, propertiesOrConfig);
  
  // Use Swagger PickType directly on SOLID entity
  const PickedClass = PickType(
    EntityClass, 
    selectedProperties as any
  );
  
  // Get Swagger metadata from the original entity
  const fields = modelPropertiesAccessor.getModelProperties(EntityClass.prototype);
  
  // Add Swagger decorators to selected properties only
  selectedProperties.forEach(propertyKey => {
    if (!fields.includes(propertyKey)) return;
    
    const metadata = Reflect.getMetadata(
      DECORATORS.API_MODEL_PROPERTIES,
      EntityClass.prototype,
      propertyKey,
    ) || {};
    
    const swaggerDecorator = ApiProperty({
      ...metadata,
      required: false, // Make all properties optional in DTOs
    });
    
    swaggerDecorator(PickedClass.prototype, propertyKey);
  });
  
  // Set class name for debugging
  Object.defineProperty(PickedClass, 'name', {
    value: `Generated${EntityClass.name}Dto`
  });
  
  return PickedClass as Type<Partial<TEntity>>;
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