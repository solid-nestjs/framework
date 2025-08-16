import 'reflect-metadata';
import { 
  inferFilterType, 
  setDefaultFilterTypes, 
  isSupportedPrimitiveType,
  getPropertyType 
} from '../../../src/helpers/args-helpers/type-inference.helper';

// Mock filter types for testing
class MockStringFilter {}
class MockNumberFilter {}
class MockDateFilter {}
class MockCustomFilter {}

describe('Type Inference Helper', () => {
  
  beforeAll(() => {
    // Set up mock filter types
    setDefaultFilterTypes({
      StringFilter: MockStringFilter,
      NumberFilter: MockNumberFilter,
      DateFilter: MockDateFilter
    });
  });

  describe('inferFilterType', () => {
    class TestEntity {
      name: string;
      age: number;
      createdAt: Date;
      isActive: boolean;
      customField: any;
    }

    it('should infer StringFilter for string properties', () => {
      const result = inferFilterType(TestEntity, 'name');
      expect(result).toBe(MockStringFilter);
    });

    it('should infer NumberFilter for number properties', () => {
      const result = inferFilterType(TestEntity, 'age');
      expect(result).toBe(MockNumberFilter);
    });

    it('should infer DateFilter for Date properties', () => {
      const result = inferFilterType(TestEntity, 'createdAt');
      expect(result).toBe(MockDateFilter);
    });

    it('should return Boolean for boolean properties', () => {
      const result = inferFilterType(TestEntity, 'isActive');
      expect(result).toBe(Boolean);
    });

    it('should use explicit type when provided as function', () => {
      const result = inferFilterType(TestEntity, 'name', MockCustomFilter);
      expect(result).toBe(MockCustomFilter);
    });

    it('should use explicit type when provided in config object', () => {
      const result = inferFilterType(TestEntity, 'name', { type: MockCustomFilter });
      expect(result).toBe(MockCustomFilter);
    });

    it('should fallback to StringFilter for unknown types', () => {
      // Spy on console.warn to check warning is logged
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const result = inferFilterType(TestEntity, 'customField');
      expect(result).toBe(MockStringFilter);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Unknown type')
      );
      
      warnSpy.mockRestore();
    });

    it('should fallback to StringFilter when reflection fails', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      // Test with a property that doesn't exist
      const result = inferFilterType(TestEntity, 'nonExistentProperty');
      expect(result).toBe(MockStringFilter);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Could not infer type')
      );
      
      warnSpy.mockRestore();
    });

    it('should handle config with additional properties', () => {
      const result = inferFilterType(TestEntity, 'name', {
        type: MockCustomFilter,
        description: 'Test description',
        required: false
      });
      expect(result).toBe(MockCustomFilter);
    });
  });

  describe('isSupportedPrimitiveType', () => {
    it('should return true for String', () => {
      expect(isSupportedPrimitiveType(String)).toBe(true);
    });

    it('should return true for Number', () => {
      expect(isSupportedPrimitiveType(Number)).toBe(true);
    });

    it('should return true for Date', () => {
      expect(isSupportedPrimitiveType(Date)).toBe(true);
    });

    it('should return true for Boolean', () => {
      expect(isSupportedPrimitiveType(Boolean)).toBe(true);
    });

    it('should return false for custom types', () => {
      expect(isSupportedPrimitiveType(MockCustomFilter)).toBe(false);
    });

    it('should return false for null/undefined', () => {
      expect(isSupportedPrimitiveType(null)).toBe(false);
      expect(isSupportedPrimitiveType(undefined)).toBe(false);
    });
  });

  describe('getPropertyType', () => {
    class TestEntity {
      name: string;
      age: number;
    }

    it('should return the correct type for existing properties', () => {
      expect(getPropertyType(TestEntity, 'name')).toBe(String);
      expect(getPropertyType(TestEntity, 'age')).toBe(Number);
    });

    it('should return undefined for non-existent properties', () => {
      expect(getPropertyType(TestEntity, 'nonExistent')).toBeUndefined();
    });
  });

  describe('setDefaultFilterTypes', () => {
    it('should throw error before filter types are set', () => {
      // Reset filter types by creating a new module context
      jest.resetModules();
      
      const { inferFilterType: freshInferFilterType } = require('../../../src/helpers/args-helpers/type-inference.helper');
      
      class TestEntity {
        name: string;
      }

      expect(() => {
        freshInferFilterType(TestEntity, 'name');
      }).toThrow('StringFilter type not available');
    });

    it('should update filter types when called', () => {
      class NewStringFilter {}
      class NewNumberFilter {}
      class NewDateFilter {}

      setDefaultFilterTypes({
        StringFilter: NewStringFilter,
        NumberFilter: NewNumberFilter,
        DateFilter: NewDateFilter
      });

      class TestEntity {
        name: string;
      }

      const result = inferFilterType(TestEntity, 'name');
      expect(result).toBe(NewStringFilter);
    });
  });
});