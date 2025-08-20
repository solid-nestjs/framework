import { Type } from '@nestjs/common';
import { extractAllPropertyNames } from './metadata-extractor.helper';
import { filterProperties } from './property-filter.helper';

/**
 * Base class for DTO generators
 */
export abstract class DtoGeneratorBase {
  /**
   * Creates a new class with selected properties from source
   */
  protected static createBaseClass<T>(
    sourceClass: Type<T>,
    properties: string[]
  ): Type {
    class GeneratedDto {}
    
    // Copy property descriptors
    properties.forEach(prop => {
      const descriptor = Object.getOwnPropertyDescriptor(
        sourceClass.prototype,
        prop
      );
      
      if (descriptor) {
        Object.defineProperty(
          GeneratedDto.prototype,
          prop,
          descriptor
        );
      } else {
        // Create default descriptor for properties without descriptors
        Object.defineProperty(
          GeneratedDto.prototype,
          prop,
          {
            writable: true,
            enumerable: true,
            configurable: true
          }
        );
      }
    });
    
    // Set class name for debugging
    Object.defineProperty(GeneratedDto, 'name', {
      value: `Generated${sourceClass.name}Dto`
    });
    
    return GeneratedDto;
  }
  
  /**
   * Main generation logic - to be used by specific implementations
   */
  protected static generateDto<TEntity extends object>(
    EntityClass: Type<TEntity>,
    properties?: (keyof TEntity)[],
    decoratorTransferFn?: (sourceClass: Type, targetClass: Type, propertyKey: string) => void
  ): Type<Partial<TEntity>> {
    // Extract all properties
    const allProperties = extractAllPropertyNames(EntityClass);
    
    // Filter properties based on selection or defaults
    const selectedProperties = filterProperties(
      EntityClass,
      allProperties,
      properties as string[]
    );
    
    // Create base class with properties
    const GeneratedDto = this.createBaseClass(EntityClass, selectedProperties);
    
    // Transfer decorators if function provided
    if (decoratorTransferFn) {
      selectedProperties.forEach(prop => {
        decoratorTransferFn(EntityClass, GeneratedDto, prop);
      });
    }
    
    return GeneratedDto as Type<Partial<TEntity>>;
  }
}

/**
 * Common helper to clean SOLID field options
 */
export function cleanSolidFieldOptions(options: any): any {
  if (!options) return options;
  
  const cleaned = { ...options };
  
  // Remove TypeORM-specific configurations
  if (cleaned.adapters?.typeorm) {
    cleaned.adapters = { ...cleaned.adapters };
    delete cleaned.adapters.typeorm;
  }
  
  return cleaned;
}