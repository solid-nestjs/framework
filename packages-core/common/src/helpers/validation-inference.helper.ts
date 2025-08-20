import { Type } from '@nestjs/common';
import { getPropertyDesignType } from './metadata-extractor.helper';

/**
 * Infers validation decorators based on TypeScript design types
 * Following the DECORATORS_AUTOMATIC_VALIDATION_INFERENCE specification
 */
export function inferValidationDecorators(
  EntityClass: Type,
  propertyKey: string
): { decoratorName: string; args?: any[] }[] {
  const propertyType = getPropertyDesignType(EntityClass, propertyKey);
  const decorators: { decoratorName: string; args?: any[] }[] = [];

  if (!propertyType) {
    return decorators;
  }

  // Check if property is optional based on TypeScript metadata
  const isOptional = isPropertyOptional(EntityClass, propertyKey);

  if (isOptional) {
    decorators.push({ decoratorName: 'IsOptional' });
  }

  // Basic type inference according to the specification table
  switch (propertyType) {
    case String:
      decorators.push({ decoratorName: 'IsString' });
      if (!isOptional) {
        decorators.push({ decoratorName: 'IsNotEmpty' });
      }
      break;

    case Number:
      decorators.push({ decoratorName: 'IsNumber' });
      break;

    case Boolean:
      decorators.push({ decoratorName: 'IsBoolean' });
      break;

    case Date:
      decorators.push({ decoratorName: 'IsDate' });
      break;

    case Array:
      decorators.push({ decoratorName: 'IsArray' });
      break;

    default:
      // For custom classes/objects
      if (typeof propertyType === 'function' && propertyType.name) {
        // This is likely a custom class
        decorators.push({ decoratorName: 'IsObject' });
        decorators.push({ decoratorName: 'ValidateNested' });
      }
      break;
  }

  return decorators;
}

/**
 * Checks if a property is optional based on TypeScript metadata
 * This is a simplified check - in a full implementation, we might need
 * more sophisticated type analysis
 */
function isPropertyOptional(EntityClass: Type, propertyKey: string): boolean {
  // Check if the property has undefined in its type union
  // This is a simplified check - TypeScript reflection has limitations
  
  // For now, we'll return false and rely on explicit nullable configurations
  // In a full implementation, this would analyze the TypeScript AST or
  // use more advanced reflection techniques
  return false;
}

/**
 * Applies inferred validation decorators to a class property
 */
export function applyInferredValidations(
  targetClass: Type,
  sourceClass: Type,
  propertyKey: string
): void {
  const inferredDecorators = inferValidationDecorators(sourceClass, propertyKey);

  // Apply each inferred decorator
  inferredDecorators.forEach(({ decoratorName, args = [] }) => {
    try {
      // Dynamically import and apply the decorator
      const decoratorModule = require('class-validator');
      const decoratorFunction = decoratorModule[decoratorName];

      if (decoratorFunction) {
        const decorator = decoratorFunction(...args);
        decorator(targetClass.prototype, propertyKey);
      }
    } catch (error) {
      // Silently fail if decorator can't be applied
      // In production, this might be logged
      console.warn(`Failed to apply inferred decorator ${decoratorName} to ${propertyKey}:`, (error as Error).message);
    }
  });
}

/**
 * Checks if a property already has validation decorators applied
 */
export function hasExistingValidation(targetClass: Type, propertyKey: string): boolean {
  // Check for existing class-validator metadata
  const existingMetadata = Reflect.getMetadata('class-validator:validate', targetClass.prototype);
  
  if (existingMetadata) {
    return existingMetadata.some((meta: any) => meta.propertyName === propertyKey);
  }

  return false;
}