import { Type } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { DECORATORS } from '@nestjs/swagger/dist/constants';
import { 
  DtoGeneratorBase, 
  MetadataStorage, 
  SolidField,
  cleanSolidFieldOptions 
} from '@solid-nestjs/common';

/**
 * Generates a DTO class from an entity with automatic Swagger decorator transfer
 */
export function GenerateDtoFromEntity<TEntity extends object>(
  EntityClass: Type<TEntity>,
  properties?: (keyof TEntity)[]
): Type<Partial<TEntity>> {
  return DtoGeneratorBase['generateDto'](
    EntityClass,
    properties,
    transferDecorators
  );
}

/**
 * Transfers decorators for REST API (Swagger + validation)
 */
function transferDecorators(
  sourceClass: Type,
  targetClass: Type,
  propertyKey: string
): void {
  // Transfer Swagger metadata
  transferSwaggerDecorators(sourceClass, targetClass, propertyKey);
  
  // Transfer validation metadata
  transferValidationDecorators(sourceClass, targetClass, propertyKey);
  
  // Transfer SOLID metadata if present
  transferSolidDecorators(sourceClass, targetClass, propertyKey);
}

/**
 * Transfers Swagger @ApiProperty decorators
 */
function transferSwaggerDecorators(
  sourceClass: Type,
  targetClass: Type,
  propertyKey: string
): void {
  const swaggerMetadata = Reflect.getMetadata(
    DECORATORS.API_MODEL_PROPERTIES,
    sourceClass.prototype,
    propertyKey
  );
  
  if (swaggerMetadata) {
    // Make the field optional for DTOs
    const decoratorOptions = {
      ...swaggerMetadata,
      required: false
    };
    
    const decorator = ApiProperty(decoratorOptions);
    decorator(targetClass.prototype, propertyKey);
  }
}

/**
 * Transfers validation decorators
 */
function transferValidationDecorators(
  sourceClass: Type,
  targetClass: Type,
  propertyKey: string
): void {
  // Get all metadata keys for the property
  const metadataKeys = Reflect.getMetadataKeys(
    sourceClass.prototype,
    propertyKey
  ) || [];
  
  // Transfer validation-related metadata
  metadataKeys
    .filter(key => {
      const keyStr = key.toString();
      return keyStr.includes('validation') || 
             keyStr.includes('class-validator') ||
             keyStr.includes('__validator');
    })
    .forEach(key => {
      const metadata = Reflect.getMetadata(
        key,
        sourceClass.prototype,
        propertyKey
      );
      
      if (metadata !== undefined) {
        Reflect.defineMetadata(
          key,
          metadata,
          targetClass.prototype,
          propertyKey
        );
      }
    });
}

/**
 * Transfers SOLID field decorators
 */
function transferSolidDecorators(
  sourceClass: Type,
  targetClass: Type,
  propertyKey: string
): void {
  const solidMetadata = MetadataStorage.getFieldMetadata(sourceClass, propertyKey);
  
  if (solidMetadata.length > 0) {
    const fieldMetadata = solidMetadata[0];
    const cleanedOptions = cleanSolidFieldOptions(fieldMetadata.options);
    
    // Remove swagger-specific adapters since we handle Swagger separately
    if (cleanedOptions.adapters?.swagger) {
      cleanedOptions.adapters = { ...cleanedOptions.adapters };
      delete cleanedOptions.adapters.swagger;
    }
    
    // Apply @SolidField with cleaned options
    const decorator = SolidField(cleanedOptions);
    decorator(targetClass.prototype, propertyKey);
  }
}