import { Type } from '@nestjs/common';
import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { DECORATORS } from '@nestjs/swagger/dist/constants';
import { ClassDecoratorFactory } from '@nestjs/graphql/dist/interfaces/class-decorator-factory.interface';
import { ModelPropertiesAccessor } from '@nestjs/swagger/dist/services/model-properties-accessor';
import { 
  extractAllPropertyNames,
  filterProperties,
  getPropertyDesignType,
  extractEntityFieldMetadata,
  getDefaultProperties,
  isSystemField,
  isRelationalField,
  isFlatType,
  validatePropertySelection,
  PropertyInclusionConfig,
  InferDtoType,
  applyInferredValidations,
  hasExistingValidation
} from '@solid-nestjs/common';

const modelPropertiesAccessor = new ModelPropertiesAccessor();

/**
 * Generates a DTO class from an entity for both GraphQL and REST with improved TypeScript inference
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
  
  // Get Swagger metadata from the original entity
  const fields = modelPropertiesAccessor.getModelProperties(EntityClass.prototype);
  
  // Add Swagger decorators and infer validation for selected properties
  selectedProperties.forEach(propertyKey => {
    // Add Swagger decorators if available
    if (fields.includes(propertyKey)) {
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
    }
    
    // Apply automatic validation inference if no existing validation decorators
    if (!hasExistingValidation(PickedClass, propertyKey)) {
      applyInferredValidations(PickedClass, EntityClass, propertyKey);
    }
  });
  
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

