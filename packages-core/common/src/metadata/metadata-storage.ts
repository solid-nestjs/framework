import { FieldMetadata, EntityMetadata } from '../interfaces';

export class MetadataStorage {
  private static fieldMetadata = new Map<Function, Map<string | symbol, FieldMetadata>>();
  private static entityMetadata = new Map<Function, EntityMetadata>();

  /**
   * Adds field metadata for a specific class property
   */
  static addFieldMetadata(metadata: FieldMetadata): void {
    let classMetadata = this.fieldMetadata.get(metadata.target);
    if (!classMetadata) {
      classMetadata = new Map();
      this.fieldMetadata.set(metadata.target, classMetadata);
    }
    classMetadata.set(metadata.propertyKey, metadata);
  }

  /**
   * Gets field metadata for a class or specific property
   */
  static getFieldMetadata(
    target: Function,
    propertyKey?: string | symbol
  ): FieldMetadata[] {
    const classMetadata = this.fieldMetadata.get(target);
    if (!classMetadata) {
      return [];
    }

    if (propertyKey !== undefined) {
      const fieldMetadata = classMetadata.get(propertyKey);
      return fieldMetadata ? [fieldMetadata] : [];
    }

    return Array.from(classMetadata.values());
  }

  /**
   * Gets all field metadata for a class including inherited fields
   */
  static getAllFieldMetadata(target: Function): FieldMetadata[] {
    const allMetadata: FieldMetadata[] = [];
    let currentTarget = target;

    // Walk up the prototype chain to collect metadata from parent classes
    while (currentTarget && currentTarget !== Object) {
      const metadata = this.getFieldMetadata(currentTarget);
      allMetadata.push(...metadata);
      currentTarget = Object.getPrototypeOf(currentTarget);
    }

    return allMetadata;
  }

  /**
   * Adds entity metadata for a class
   */
  static addEntityMetadata(metadata: EntityMetadata): void {
    this.entityMetadata.set(metadata.target, metadata);
  }

  /**
   * Gets entity metadata for a class
   */
  static getEntityMetadata(target: Function): EntityMetadata | undefined {
    return this.entityMetadata.get(target);
  }

  /**
   * Gets all entity metadata
   */
  static getAllEntityMetadata(): EntityMetadata[] {
    return Array.from(this.entityMetadata.values());
  }

  /**
   * Checks if a class has field metadata
   */
  static hasFieldMetadata(target: Function): boolean {
    return this.fieldMetadata.has(target);
  }

  /**
   * Checks if a class has entity metadata
   */
  static hasEntityMetadata(target: Function): boolean {
    return this.entityMetadata.has(target);
  }

  /**
   * Removes all metadata for a specific class
   */
  static removeMetadata(target: Function): void {
    this.fieldMetadata.delete(target);
    this.entityMetadata.delete(target);
  }

  /**
   * Clears all metadata (useful for testing)
   */
  static clearMetadata(): void {
    this.fieldMetadata.clear();
    this.entityMetadata.clear();
  }

  /**
   * Gets statistics about stored metadata
   */
  static getStats(): {
    totalClasses: number;
    totalFields: number;
    totalEntities: number;
  } {
    let totalFields = 0;
    this.fieldMetadata.forEach(classMetadata => {
      totalFields += classMetadata.size;
    });

    return {
      totalClasses: this.fieldMetadata.size,
      totalFields,
      totalEntities: this.entityMetadata.size,
    };
  }
}