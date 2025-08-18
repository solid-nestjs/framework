import 'reflect-metadata';

export interface TypeInfo {
  type: any;
  isOptional: boolean;
  isArray: boolean;
  arrayElementType?: any;
  isEnum: boolean;
  isPrimitive: boolean;
  isDate: boolean;
  isObject: boolean;
}

/**
 * Infers type information from reflection metadata
 */
export function inferTypeFromMetadata(
  target: any,
  propertyKey: string | symbol
): TypeInfo {
  const designType = Reflect.getMetadata('design:type', target, propertyKey);
  const paramTypes = Reflect.getMetadata('design:paramtypes', target, propertyKey);
  
  return {
    type: designType,
    isOptional: isOptionalProperty(target, propertyKey),
    isArray: isArrayType(designType),
    arrayElementType: getArrayElementType(designType),
    isEnum: isEnumType(designType),
    isPrimitive: isPrimitiveType(designType),
    isDate: designType === Date,
    isObject: isObjectType(designType),
  };
}

/**
 * Checks if a property is optional based on TypeScript metadata
 */
export function isOptionalProperty(
  target: any,
  propertyKey: string | symbol
): boolean {
  // Check if the property descriptor exists and has a getter/setter
  const descriptor = Object.getOwnPropertyDescriptor(target, propertyKey);
  if (descriptor) {
    // For getters/setters, check if they're marked as optional
    return false; // TODO: Implement better optional detection
  }

  // For regular properties, check if they're in the class prototype
  const prototype = target.constructor?.prototype || target;
  const hasProperty = propertyKey in prototype;
  
  // If property is not in prototype, it might be optional
  // This is a heuristic approach since TypeScript optional info is lost at runtime
  return !hasProperty;
}

/**
 * More reliable optional detection using TypeScript compiler API metadata
 * This would require additional setup with TypeScript transformers
 */
export function isOptionalType(type: any): boolean {
  // Check if type includes undefined (union type)
  if (type === undefined) {
    return true;
  }
  
  // Check for union types that include undefined
  // This is a simplified check - in reality we'd need more sophisticated type checking
  return false;
}

/**
 * Checks if a type represents an array
 */
export function isArrayType(type: any): boolean {
  return type === Array || 
         (type && type.prototype && type.prototype.constructor === Array) ||
         Array.isArray(type);
}

/**
 * Gets the element type of an array type
 */
export function getArrayElementType(type: any): any {
  if (Array.isArray(type) && type.length > 0) {
    return type[0];
  }
  
  // For generic arrays, we can't determine the element type at runtime
  // without additional metadata
  return undefined;
}

/**
 * Checks if a type is an enum
 */
export function isEnumType(type: any): boolean {
  if (!type || typeof type !== 'object') {
    return false;
  }

  // Check if it's an enum by checking if it has numeric and string keys
  const keys = Object.keys(type);
  const values = Object.values(type);
  
  // TypeScript enums have both numeric and string keys
  const hasStringKeys = keys.some(key => isNaN(Number(key)));
  const hasNumericValues = values.some(value => typeof value === 'number');
  
  return hasStringKeys && (hasNumericValues || values.every(value => typeof value === 'string'));
}

/**
 * Checks if a type is a primitive type
 */
export function isPrimitiveType(type: any): boolean {
  return [String, Number, Boolean, Symbol, BigInt].includes(type);
}

/**
 * Checks if a type is a Date
 */
export function isDateType(type: any): boolean {
  return type === Date;
}

/**
 * Checks if a type is an object type (not primitive, not array, not date)
 */
export function isObjectType(type: any): boolean {
  return type && 
         typeof type === 'function' && 
         !isPrimitiveType(type) && 
         !isDateType(type) && 
         !isArrayType(type) &&
         type !== Object;
}

/**
 * Gets the constructor name of a type
 */
export function getTypeDisplayName(type: any): string {
  if (!type) return 'unknown';
  if (typeof type === 'function') return type.name || 'Function';
  if (typeof type === 'object') return type.constructor?.name || 'Object';
  return typeof type;
}

/**
 * Maps TypeScript types to database column types
 */
export function mapTypeToColumnType(type: any): string {
  const typeMap = new Map<any, string>([
    [String, 'varchar'],
    [Number, 'int'],
    [Boolean, 'boolean'],
    [Date, 'timestamp'],
    [Buffer, 'blob'],
    [Object, 'json'],
  ]);

  return typeMap.get(type) || 'varchar';
}

/**
 * Maps TypeScript types to GraphQL types
 */
export function mapTypeToGraphQLType(type: any): string {
  const typeMap = new Map<any, string>([
    [String, 'String'],
    [Number, 'Int'], // Could be Float depending on context
    [Boolean, 'Boolean'],
    [Date, 'DateTime'],
  ]);

  return typeMap.get(type) || 'String';
}

/**
 * Maps TypeScript types to Swagger/OpenAPI types
 */
export function mapTypeToSwaggerType(type: any): string {
  const typeMap = new Map<any, string>([
    [String, 'string'],
    [Number, 'number'],
    [Boolean, 'boolean'],
    [Date, 'string'], // with format: date-time
    [Array, 'array'],
    [Object, 'object'],
  ]);

  return typeMap.get(type) || 'string';
}

/**
 * Enhanced optional detection using property descriptor
 */
export function detectOptionalFromDescriptor(
  target: any,
  propertyKey: string | symbol
): boolean {
  const descriptor = Object.getOwnPropertyDescriptor(target, propertyKey);
  
  if (descriptor) {
    // Check if it has a getter (computed property)
    if (descriptor.get) {
      return false; // Getters are usually not optional
    }
    
    // Check if it has an initial value of undefined
    if (descriptor.value === undefined && descriptor.writable) {
      return true;
    }
  }

  // Check in constructor parameters (if available)
  const paramTypes = Reflect.getMetadata('design:paramtypes', target.constructor);
  if (paramTypes) {
    // This would require more sophisticated analysis of constructor parameters
    // to determine which properties are optional
  }

  return false;
}

/**
 * Utility to extract generic type information (limited at runtime)
 */
export function extractGenericTypes(target: any, propertyKey: string | symbol): any[] {
  // This is very limited at runtime in TypeScript
  // Would require compile-time analysis or additional metadata
  const designType = Reflect.getMetadata('design:type', target, propertyKey);
  
  if (isArrayType(designType)) {
    return [getArrayElementType(designType)];
  }
  
  return [];
}