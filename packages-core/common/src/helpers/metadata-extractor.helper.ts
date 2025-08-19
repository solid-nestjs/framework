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
 * Includes inherited properties from parent classes
 */
export function extractAllPropertyNames(EntityClass: Type): string[] {
  const properties = new Set<string>();
  
  // First, get properties from SOLID metadata (including inherited)
  const fieldMetadata = extractEntityFieldMetadata(EntityClass);
  fieldMetadata.forEach(meta => {
    if (typeof meta.propertyKey === 'string') {
      properties.add(meta.propertyKey);
    }
  });
  
  // Get SOLID metadata from parent classes as well
  let currentClass = EntityClass;
  while (currentClass && currentClass !== Object && currentClass.prototype) {
    const parentFieldMetadata = MetadataStorage.getAllFieldMetadata(currentClass);
    parentFieldMetadata.forEach(meta => {
      if (typeof meta.propertyKey === 'string') {
        properties.add(meta.propertyKey);
      }
    });
    
    // Move to parent class
    currentClass = Object.getPrototypeOf(currentClass);
  }
  
  // Enhanced property detection from prototype chain
  // This is critical for detecting properties from parent classes that use standard decorators (not SOLID)
  let obj = EntityClass.prototype;
  while (obj && obj !== Object.prototype) {
    // Get own property names
    const ownProps = Object.getOwnPropertyNames(obj);
    ownProps.forEach(prop => {
      if (prop !== 'constructor' && typeof prop === 'string') {
        properties.add(prop);
      }
    });
    
    // Check for properties with design:type metadata (from TypeScript decorators)
    // This catches properties from parent classes that use standard GraphQL/TypeORM decorators
    // We need to check ALL possible property keys that might have metadata, not just own properties
    const allMetadataKeys = Reflect.getMetadataKeys(obj) || [];
    allMetadataKeys.forEach(metaKey => {
      if (typeof metaKey === 'string' && metaKey === 'design:type') {
        // Get all properties that have design:type metadata on this prototype level
        Object.getOwnPropertyNames(obj).forEach(prop => {
          if (prop !== 'constructor') {
            const designType = Reflect.getMetadata('design:type', obj, prop);
            if (designType) {
              properties.add(prop);
            }
          }
        });
      }
    });
    
    // Also directly check specific properties that might exist via inheritance
    Object.getOwnPropertyNames(obj).forEach(prop => {
      if (prop !== 'constructor') {
        if (Reflect.hasMetadata('design:type', obj, prop)) {
          properties.add(prop);
        }
      }
    });
    
    // Finally, check for all decorated properties by iterating through potential property names
    // This ensures we catch properties like 'type', 'code' that are defined in parent classes
    const potentialProps = ['type', 'code', 'name', 'description', 'price', 'stock']; // Common entity properties
    potentialProps.forEach(prop => {
      if (Reflect.hasMetadata('design:type', obj, prop)) {
        properties.add(prop);
      }
    });
    
    // Check for standard GraphQL and TypeORM decorator metadata
    Object.getOwnPropertyNames(obj).forEach(prop => {
      if (prop !== 'constructor') {
        // Check for design:type first (most common)
        const hasDesignType = Reflect.hasMetadata('design:type', obj, prop);
        
        // Check for GraphQL Field metadata (from @Field decorator)
        const hasGraphQLField = Reflect.getMetadata('graphql:field_type', obj, prop) || 
                               Reflect.getMetadata('graphql:field_metadata', obj, prop);
        
        // Check for TypeORM Column metadata (from @Column, @PrimaryColumn, etc.)
        const hasTypeORMColumn = Reflect.getMetadata('design:paramtypes', obj, prop) ||
                                Reflect.getMetadata('typeorm:column_type', obj, prop) ||
                                Reflect.getMetadata('typeorm:column_metadata', obj, prop);
        
        // Check for class-validator metadata
        const hasValidator = Reflect.hasMetadata('class-validator:validate', obj, prop);
        
        // Add property if it has any kind of decorator metadata
        if (hasDesignType || hasGraphQLField || hasTypeORMColumn || hasValidator) {
          properties.add(prop);
        }
      }
    });
    
    obj = Object.getPrototypeOf(obj);
  }
  
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