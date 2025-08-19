import 'reflect-metadata';
import { 
  filterProperties,
  getDefaultProperties,
  validatePropertySelection
} from '../property-filter.helper';
import { SolidEntity, SolidField, SolidId } from '../../decorators';
import { MetadataStorage } from '../../metadata';

// Clean metadata before each test
beforeEach(() => {
  MetadataStorage.clearMetadata();
});

describe('PropertyFilterHelper', () => {
  @SolidEntity()
  class TestEntity {
    @SolidId()
    id: string;

    @SolidField()
    name: string;

    @SolidField()
    email: string;

    @SolidField()
    age: number;

    @SolidField()
    isActive: boolean;

    @SolidField()
    createdAt: Date;

    @SolidField()
    updatedAt: Date;

    // Complex type (should be filtered out)
    complexField: { nested: string };

    // Array type (should be filtered out)
    tags: string[];
  }

  describe('getDefaultProperties', () => {
    it('should include only flat properties', () => {
      const allProperties = ['id', 'name', 'email', 'age', 'isActive', 'createdAt', 'updatedAt', 'complexField', 'tags'];
      const result = getDefaultProperties(TestEntity, allProperties);

      expect(result).toContain('name');
      expect(result).toContain('email');
      expect(result).toContain('age');
      expect(result).toContain('isActive');
    });

    it('should exclude system fields', () => {
      const allProperties = ['id', 'name', 'email', 'createdAt', 'updatedAt', 'deletedAt'];
      const result = getDefaultProperties(TestEntity, allProperties);

      expect(result).not.toContain('id');
      expect(result).not.toContain('createdAt');
      expect(result).not.toContain('updatedAt');
      expect(result).not.toContain('deletedAt');
      expect(result).toContain('name');
      expect(result).toContain('email');
    });

    it('should exclude complex types', () => {
      const allProperties = ['name', 'complexField', 'tags'];
      const result = getDefaultProperties(TestEntity, allProperties);

      expect(result).toContain('name');
      expect(result).not.toContain('complexField');
      expect(result).not.toContain('tags');
    });
  });

  describe('validatePropertySelection', () => {
    const allProperties = ['id', 'name', 'email', 'age', 'complexField'];

    it('should pass validation for existing flat properties', () => {
      expect(() => {
        validatePropertySelection(TestEntity, allProperties, ['name', 'email']);
      }).not.toThrow();
    });

    it('should throw error for non-existent property', () => {
      expect(() => {
        validatePropertySelection(TestEntity, allProperties, ['nonExistent']);
      }).toThrow("Property 'nonExistent' does not exist on entity TestEntity");
    });

    it('should throw error for system fields', () => {
      expect(() => {
        validatePropertySelection(TestEntity, allProperties, ['id']);
      }).toThrow("Property 'id' is a system field");
    });

    it('should throw error for complex properties', () => {
      expect(() => {
        validatePropertySelection(TestEntity, allProperties, ['complexField']);
      }).toThrow("Property 'complexField' is not a flat type");
    });
  });

  describe('filterProperties', () => {
    const allProperties = ['id', 'name', 'email', 'age', 'isActive', 'createdAt', 'complexField'];

    it('should return selected properties when specified', () => {
      const result = filterProperties(TestEntity, allProperties, ['name', 'email']);
      
      expect(result).toEqual(['name', 'email']);
    });

    it('should return default properties when none specified', () => {
      const result = filterProperties(TestEntity, allProperties);
      
      expect(result).toContain('name');
      expect(result).toContain('email');
      expect(result).toContain('age');
      expect(result).toContain('isActive');
      expect(result).not.toContain('id');
      expect(result).not.toContain('createdAt');
      expect(result).not.toContain('complexField');
    });

    it('should validate selected properties', () => {
      expect(() => {
        filterProperties(TestEntity, allProperties, ['nonExistent']);
      }).toThrow();
    });
  });
});