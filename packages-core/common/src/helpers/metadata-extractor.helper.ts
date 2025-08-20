import { Type } from '@nestjs/common';
import { MetadataStorage } from '../metadata/metadata-storage';

/**
 * Gets all property names from a class - SIMPLIFIED VERSION
 */
export function extractAllPropertyNames(EntityClass: Type): string[] {
  const properties = new Set<string>();
  
  // Basic SOLID metadata detection (this works reliably)
  const fieldMetadata = extractEntityFieldMetadata(EntityClass);
  fieldMetadata.forEach(meta => {
    if (typeof meta.propertyKey === 'string') {
      properties.add(meta.propertyKey);
    }
  });
  
  // Simple prototype property detection (no complex inheritance handling)
  const ownProps = Object.getOwnPropertyNames(EntityClass.prototype);
  ownProps.forEach(prop => {
    if (prop !== 'constructor') {
      properties.add(prop);
    }
  });
  
  return Array.from(properties);
}

/**
 * Gets the TypeScript design type for a property
 */
export function getPropertyDesignType(
  EntityClass: Type,
  propertyKey: string
): any {
  return Reflect.getMetadata('design:type', EntityClass.prototype, propertyKey);
}

/**
 * Extracts field metadata from an entity class using SOLID metadata storage
 */
export function extractEntityFieldMetadata(EntityClass: Type) {
  return MetadataStorage.getAllFieldMetadata(EntityClass);
}

/**
 * Checks if a field is a system field (id, timestamps)
 */
export function isSystemField(propertyKey: string): boolean {
  const systemFields = ['id', 'createdAt', 'updatedAt', 'deletedAt'];
  return systemFields.includes(propertyKey);
}

/**
 * Checks if a field is relational (OneToMany, ManyToOne, etc.)
 */
export function isRelationalField(EntityClass: Type, propertyKey: string): boolean {
  // Simple check - if it's an object or array type, likely relational
  const type = getPropertyDesignType(EntityClass, propertyKey);
  return type && (type === Array || (typeof type === 'function' && type.name && type.name !== 'String' && type.name !== 'Number' && type.name !== 'Boolean' && type.name !== 'Date'));
}

/**
 * Checks if a type is a flat/simple type (string, number, boolean, Date)
 */
export function isFlatType(type: any): boolean {
  if (!type) return false;
  
  const flatTypes = [String, Number, Boolean, Date];
  return flatTypes.includes(type);
}