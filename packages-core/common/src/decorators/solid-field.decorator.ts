import 'reflect-metadata';
import { SolidFieldOptions, FieldMetadata } from '../interfaces';
import { MetadataStorage } from '../metadata';
import { DecoratorRegistry } from '../decorator-registry';
import { inferTypeFromMetadata } from '../helpers';

/**
 * Universal field decorator that applies appropriate decorators based on context
 */
export function SolidField(options?: SolidFieldOptions): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol) {
    // Get type information from TypeScript metadata
    const type = Reflect.getMetadata('design:type', target, propertyKey);
    const typeInfo = inferTypeFromMetadata(target, propertyKey);
    
    // Create field metadata
    const metadata: FieldMetadata = {
      target: target.constructor,
      propertyKey,
      type,
      options: options || {},
      isOptional: typeInfo.isOptional || detectOptionalFromOptions(options),
    };
    
    // Store metadata for later use
    MetadataStorage.addFieldMetadata(metadata);
    
    // Apply decorators from all registered adapters
    DecoratorRegistry.applyDecorators(target, propertyKey, metadata);
  };
}

/**
 * Detects if a field should be optional based on options
 */
function detectOptionalFromOptions(options?: SolidFieldOptions): boolean {
  if (!options) return false;
  
  // Explicit nullable setting
  if (options.nullable === true) return true;
  if (options.nullable === false) return false;
  
  // Required setting (inverse of optional)
  if (options.required === true) return false;
  if (options.required === false) return true;
  
  // Default value implies optional
  if (options.defaultValue !== undefined) return true;
  
  return false;
}