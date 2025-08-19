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
  extractEntityFieldMetadata
} from '@solid-nestjs/common';

const modelPropertiesAccessor = new ModelPropertiesAccessor();

/**
 * Generates a DTO class from an entity for both GraphQL and REST
 */
export function GenerateDtoFromEntity<TEntity extends object>(
  EntityClass: Type<TEntity>,
  properties?: (keyof TEntity)[],
  decorator?: ClassDecoratorFactory
): Type<Partial<TEntity>> {
  // Get all properties and filter them
  const allProperties = extractAllPropertyNames(EntityClass);
  const selectedProperties = filterProperties(EntityClass, allProperties, properties as string[]);
  
  // Use GraphQL PickType directly on SOLID entity (like PartialType does)
  const PickedClass = PickType(
    EntityClass, 
    selectedProperties as any,
    decorator || InputType
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

