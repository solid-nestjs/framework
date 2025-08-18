import { Type } from '@nestjs/common';
import 'reflect-metadata';

/**
 * Options for generating a dynamic class
 */
export interface ClassGeneratorOptions {
  className: string;
  baseClass?: Type<any>;
  interfaces?: Type<any>[];
  metadata?: Record<string, any>;
  isAbstract?: boolean;
  description?: string;
}

/**
 * Options for adding a property to a class
 */
export interface PropertyOptions {
  type: Type<any>;
  isOptional?: boolean;
  isArray?: boolean;
  description?: string;
  example?: any;
  deprecated?: boolean;
}

/**
 * Generates a base class with the specified options.
 * This is the foundation for creating dynamic DTO classes.
 * 
 * @param options - Configuration for the class generation
 * @returns A dynamically created class constructor
 * 
 * @example
 * ```typescript
 * const MyClass = generateBaseClass({
 *   className: 'ProductWhereFields',
 *   metadata: { version: '1.0' }
 * });
 * 
 * const instance = new MyClass();
 * console.log(instance.constructor.name); // 'ProductWhereFields'
 * ```
 */
export function generateBaseClass(options: ClassGeneratorOptions): Type<any> {
  const { className, baseClass, metadata } = options;
  
  // Create the dynamic class
  let DynamicClass: Type<any>;
  
  if (baseClass) {
    // Extend from base class if provided
    DynamicClass = class extends baseClass {};
  } else {
    // Create standalone class
    DynamicClass = class {};
  }
  
  // Set the class name
  Object.defineProperty(DynamicClass, 'name', { 
    value: className,
    configurable: true
  });
  
  // Apply custom metadata if provided
  if (metadata) {
    for (const [key, value] of Object.entries(metadata)) {
      Reflect.defineMetadata(key, value, DynamicClass);
    }
  }
  
  return DynamicClass;
}

/**
 * Adds a property to a class prototype with proper descriptors.
 * This function is used to dynamically add fields to generated DTO classes.
 * 
 * @param targetClass - The class to add the property to
 * @param propertyName - Name of the property to add
 * @param options - Configuration for the property
 * 
 * @example
 * ```typescript
 * const MyClass = generateBaseClass({ className: 'TestClass' });
 * 
 * addPropertyToClass(MyClass, 'name', {
 *   type: String,
 *   isOptional: true,
 *   description: 'The name field'
 * });
 * 
 * const instance = new MyClass();
 * instance.name = 'test'; // Property is now available
 * ```
 */
export function addPropertyToClass(
  targetClass: Type<any>,
  propertyName: string,
  options: PropertyOptions
): void {
  const { type, isOptional = true } = options;
  
  // Define property with getter/setter that creates enumerable instance property on first access
  Object.defineProperty(targetClass.prototype, propertyName, {
    get() {
      // If the property doesn't exist on the instance, return undefined
      if (!this.hasOwnProperty(propertyName)) {
        return undefined;
      }
      // Return the descriptor's value
      const descriptor = Object.getOwnPropertyDescriptor(this, propertyName);
      return descriptor?.value;
    },
    set(value) {
      // Define the property directly on the instance (not prototype) as enumerable
      // This makes it serializable with JSON.stringify
      Object.defineProperty(this, propertyName, {
        value: value,
        writable: true,
        enumerable: true,
        configurable: true
      });
    },
    enumerable: true,
    configurable: true
  });
  
  // Set design-time type metadata for reflection
  Reflect.defineMetadata('design:type', type, targetClass.prototype, propertyName);
  
  // Set parameter types metadata (for constructor injection if needed)
  const existingParamTypes = Reflect.getMetadata('design:paramtypes', targetClass) || [];
  Reflect.defineMetadata('design:paramtypes', existingParamTypes, targetClass);
  
  // Store additional property metadata
  const propertyMetadata = {
    type,
    isOptional,
    description: options.description,
    example: options.example,
    deprecated: options.deprecated
  };
  
  Reflect.defineMetadata(`property:${propertyName}`, propertyMetadata, targetClass.prototype);
}

/**
 * Gets metadata for a property from a class.
 * 
 * @param targetClass - The class to get metadata from
 * @param propertyName - The property name
 * @param metadataKey - The metadata key to retrieve
 * @returns The metadata value or undefined
 */
export function getPropertyMetadata(
  targetClass: Type<any>,
  propertyName: string,
  metadataKey: string
): any {
  return Reflect.getMetadata(metadataKey, targetClass.prototype, propertyName);
}

/**
 * Sets metadata for a property on a class.
 * 
 * @param targetClass - The class to set metadata on
 * @param propertyName - The property name
 * @param metadataKey - The metadata key
 * @param metadataValue - The metadata value
 */
export function setPropertyMetadata(
  targetClass: Type<any>,
  propertyName: string,
  metadataKey: string,
  metadataValue: any
): void {
  Reflect.defineMetadata(metadataKey, metadataValue, targetClass.prototype, propertyName);
}

/**
 * Gets all property names that have been defined on a class.
 * 
 * @param targetClass - The class to inspect
 * @returns Array of property names
 */
export function getDefinedProperties(targetClass: Type<any>): string[] {
  const properties: string[] = [];
  const prototype = targetClass.prototype;
  
  // Get own property names
  const ownProps = Object.getOwnPropertyNames(prototype);
  properties.push(...ownProps.filter(prop => prop !== 'constructor'));
  
  // Walk up the prototype chain to get inherited properties
  let currentProto = Object.getPrototypeOf(prototype);
  while (currentProto && currentProto !== Object.prototype) {
    const protoProps = Object.getOwnPropertyNames(currentProto);
    properties.push(...protoProps.filter(prop => 
      prop !== 'constructor' && !properties.includes(prop)
    ));
    currentProto = Object.getPrototypeOf(currentProto);
  }
  
  return properties;
}

/**
 * Clones a class constructor, creating a new class with the same properties.
 * This is useful for creating variations of existing classes.
 * 
 * @param sourceClass - The class to clone
 * @param newClassName - Name for the new class
 * @returns A new class constructor
 */
export function cloneClass(sourceClass: Type<any>, newClassName: string): Type<any> {
  // Create new class extending the source
  const ClonedClass = class extends sourceClass {};
  
  // Set the new name
  Object.defineProperty(ClonedClass, 'name', {
    value: newClassName,
    configurable: true
  });
  
  return ClonedClass;
}