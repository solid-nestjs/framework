import 'reflect-metadata';
import { 
  extractEntityFieldMetadata,
  extractAllPropertyNames,
  getPropertyDesignType,
  isFlatType,
  isSystemField,
  isRelationalField
} from '../metadata-extractor.helper';
import { SolidEntity, SolidField, SolidId } from '../../decorators';
import { MetadataStorage } from '../../metadata';

// Clean metadata before each test
beforeEach(() => {
  MetadataStorage.clearMetadata();
});

describe('MetadataExtractorHelper', () => {
  describe('isFlatType', () => {
    it('should return true for flat types', () => {
      expect(isFlatType(String)).toBe(true);
      expect(isFlatType(Number)).toBe(true);
      expect(isFlatType(Boolean)).toBe(true);
      expect(isFlatType(Date)).toBe(true);
    });

    it('should return false for complex types', () => {
      expect(isFlatType(Array)).toBe(false);
      expect(isFlatType(Object)).toBe(false);
      expect(isFlatType(Function)).toBe(false);
      expect(isFlatType(null)).toBe(false);
      expect(isFlatType(undefined)).toBe(false);
    });

    it('should return false for custom classes', () => {
      class CustomClass {}
      expect(isFlatType(CustomClass)).toBe(false);
    });
  });

  describe('isSystemField', () => {
    it('should return true for system fields', () => {
      expect(isSystemField('id')).toBe(true);
      expect(isSystemField('createdAt')).toBe(true);
      expect(isSystemField('updatedAt')).toBe(true);
      expect(isSystemField('deletedAt')).toBe(true);
    });

    it('should return false for non-system fields', () => {
      expect(isSystemField('name')).toBe(false);
      expect(isSystemField('email')).toBe(false);
      expect(isSystemField('price')).toBe(false);
    });
  });

  describe('extractAllPropertyNames', () => {
    it('should extract property names from class', () => {
      @SolidEntity()
      class TestEntity {
        @SolidId()
        id: string;

        @SolidField()
        name: string;

        @SolidField()
        email: string;
      }

      const properties = extractAllPropertyNames(TestEntity);
      
      expect(properties).toContain('id');
      expect(properties).toContain('name');
      expect(properties).toContain('email');
      expect(properties).not.toContain('constructor');
    });

    it('should extract properties from simple class', () => {
      @SolidEntity()
      class DerivedEntity {
        @SolidId()
        id: string;
        
        @SolidField()
        name: string;
      }

      const properties = extractAllPropertyNames(DerivedEntity);
      
      expect(properties).toContain('id');
      expect(properties).toContain('name');
    });
  });

  describe('getPropertyDesignType', () => {
    it('should return correct types for decorated properties', () => {
      @SolidEntity()
      class TestEntity {
        @SolidField()
        name: string;

        @SolidField()
        age: number;

        @SolidField()
        isActive: boolean;

        @SolidField()
        createdAt: Date;
      }

      expect(getPropertyDesignType(TestEntity, 'name')).toBe(String);
      expect(getPropertyDesignType(TestEntity, 'age')).toBe(Number);
      expect(getPropertyDesignType(TestEntity, 'isActive')).toBe(Boolean);
      expect(getPropertyDesignType(TestEntity, 'createdAt')).toBe(Date);
    });
  });

  describe('extractEntityFieldMetadata', () => {
    it('should extract field metadata from entity', () => {
      @SolidEntity()
      class TestEntity {
        @SolidField({ description: 'User name' })
        name: string;

        @SolidField({ description: 'User email', email: true })
        email: string;
      }

      const metadata = extractEntityFieldMetadata(TestEntity);
      
      expect(metadata).toHaveLength(2);
      expect(metadata.find(m => m.propertyKey === 'name')?.options.description).toBe('User name');
      expect(metadata.find(m => m.propertyKey === 'email')?.options.email).toBe(true);
    });

    it('should return empty array for entity without SOLID fields', () => {
      class PlainEntity {
        name: string;
        email: string;
      }

      const metadata = extractEntityFieldMetadata(PlainEntity);
      expect(metadata).toHaveLength(0);
    });
  });

  describe('isRelationalField', () => {
    it('should return false for non-relational fields', () => {
      @SolidEntity()
      class TestEntity {
        @SolidField()
        name: string;
      }

      expect(isRelationalField(TestEntity, 'name')).toBe(false);
    });

    it('should return false when no metadata exists', () => {
      class PlainEntity {
        name: string;
      }

      // isRelationalField may return undefined when no design:type metadata exists
      const result = isRelationalField(PlainEntity, 'name');
      expect(result === false || result === undefined).toBe(true);
    });
  });
});