import { Type } from '@nestjs/common';
import { Field, InputType } from '@nestjs/graphql';
import { 
  DtoGeneratorBase, 
  MetadataStorage, 
  SolidField,
  cleanSolidFieldOptions 
} from '@solid-nestjs/common';

// GraphQL metadata keys (from @nestjs/graphql internals)
const FIELD_METADATA_KEY = 'graphql:field_metadata';
const TYPE_METADATA_KEY = 'graphql:type_metadata';

/**
 * Generates a DTO class from an entity with automatic GraphQL decorator transfer
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
 * Transfers decorators for GraphQL (Field + validation)
 */
function transferDecorators(
  sourceClass: Type,
  targetClass: Type,
  propertyKey: string
): void {
  // Transfer GraphQL field metadata
  transferGraphQLDecorators(sourceClass, targetClass, propertyKey);
  
  // Transfer validation metadata
  transferValidationDecorators(sourceClass, targetClass, propertyKey);
  
  // Transfer SOLID metadata if present
  transferSolidDecorators(sourceClass, targetClass, propertyKey);
}

/**
 * Transfers GraphQL @Field decorators
 */
function transferGraphQLDecorators(
  sourceClass: Type,
  targetClass: Type,
  propertyKey: string
): void {
  // Get the TypeScript design type for the property
  const tsType = Reflect.getMetadata('design:type', sourceClass.prototype, propertyKey);
  
  // Try to get GraphQL field metadata
  const graphqlMetadata = Reflect.getMetadata(
    FIELD_METADATA_KEY,
    sourceClass.prototype,
    propertyKey
  );
  
  let fieldOptions: any = {
    nullable: true,
    description: `${String(propertyKey)} field`
  };
  
  // Apply @Field decorator with explicit type function
  let decorator;
  
  if (graphqlMetadata && graphqlMetadata.type && typeof graphqlMetadata.type === 'function') {
    // Use existing GraphQL type
    decorator = Field(graphqlMetadata.type, {
      ...graphqlMetadata.options,
      nullable: true
    });
  } else if (tsType) {
    // Create type function based on TypeScript type
    if (tsType === String) {
      decorator = Field(() => String, fieldOptions);
    } else if (tsType === Number) {
      decorator = Field(() => Number, fieldOptions);
    } else if (tsType === Boolean) {
      decorator = Field(() => Boolean, fieldOptions);
    } else if (tsType === Date) {
      decorator = Field(() => Date, fieldOptions);
    } else {
      // Fallback for unknown types
      decorator = Field(() => String, fieldOptions);
    }
  } else {
    // Last resort fallback
    decorator = Field(() => String, fieldOptions);
  }
  
  decorator(targetClass.prototype, propertyKey);
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
    
    // Remove graphql-specific adapters since we handle GraphQL separately
    if (cleanedOptions.adapters?.graphql) {
      cleanedOptions.adapters = { ...cleanedOptions.adapters };
      delete cleanedOptions.adapters.graphql;
    }
    
    // Apply @SolidField with cleaned options
    const decorator = SolidField(cleanedOptions);
    decorator(targetClass.prototype, propertyKey);
  }
}