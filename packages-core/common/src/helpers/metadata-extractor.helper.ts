import { Type } from '@nestjs/common';
import { MetadataStorage } from '../metadata';
import { FieldMetadata } from '../interfaces';

/**
 * Extracts field metadata from an entity class
 */
export function extractEntityFieldMetadata(EntityClass: Type): FieldMetadata[] {
  return MetadataStorage.getAllFieldMetadata(EntityClass);
}

/**
 * Gets all property names from a class using SOLID metadata and reflection
 */
export function extractAllPropertyNames(EntityClass: Type): string[] {
  const properties = new Set<string>();
  
  // First, get properties from SOLID metadata
  const fieldMetadata = extractEntityFieldMetadata(EntityClass);
  fieldMetadata.forEach(meta => {
    if (typeof meta.propertyKey === 'string') {
      properties.add(meta.propertyKey);
    }
  });
  
  // Also get properties from prototype reflection
  let obj = EntityClass.prototype;
  while (obj && obj !== Object.prototype) {
    Object.getOwnPropertyNames(obj).forEach(prop => {
      if (prop !== 'constructor' && typeof prop === 'string') {
        properties.add(prop);
      }
    });
    obj = Object.getPrototypeOf(obj);
  }
  
  // Get properties from design metadata keys
  const metadataKeys = Reflect.getMetadataKeys(EntityClass.prototype) || [];
  metadataKeys.forEach(key => {
    if (key === 'design:type') {
      // This means there are properties with TypeScript metadata
      const propertyKeys = Reflect.getOwnMetadataKeys(EntityClass.prototype);
      propertyKeys.forEach(propKey => {
        if (typeof propKey === 'string' && propKey !== 'constructor') {
          properties.add(propKey);
        }
      });
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
 * Checks if a type is a flat type (string, number, boolean, Date)
 */
export function isFlatType(type: any): boolean {
  if (!type) return false;
  
  return (
    type === String ||
    type === Number ||
    type === Boolean ||
    type === Date
  );
}

/**
 * Checks if a field name is a system field (id, timestamps)
 */
export function isSystemField(fieldName: string): boolean {
  const systemFields = ['id', 'createdAt', 'updatedAt', 'deletedAt'];
  return systemFields.includes(fieldName);
}

/**
 * Checks if a field is a relational field based on SOLID metadata
 */
export function isRelationalField(
  EntityClass: Type,
  fieldName: string
): boolean {
  const metadata = MetadataStorage.getFieldMetadata(EntityClass, fieldName);
  if (!metadata.length) return false;
  
  const fieldMetadata = metadata[0];
  
  // Check if field has relation decorators
  return !!(
    fieldMetadata.options?.relation ||
    fieldName.includes('OneToMany') ||
    fieldName.includes('ManyToOne') ||
    fieldName.includes('OneToOne') ||
    fieldName.includes('ManyToMany')
  );
}