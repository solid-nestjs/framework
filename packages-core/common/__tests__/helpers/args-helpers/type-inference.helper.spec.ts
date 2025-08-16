import { Type } from '@nestjs/common';
import {
  inferFilterType,
  FilterTypeRegistry,
  isSupportedPrimitiveType,
  getReflectedPropertyType,
  isEnum,
  getEnumInfo,
  shouldTreatAsEnum,
  FieldConfig
} from '../../../src/helpers/args-helpers/type-inference.helper';

// Mock filter types for testing
class MockStringFilter {}
class MockNumberFilter {}
class MockDateFilter {}

// Test enum
enum TestStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending'
}

// Test entity
class TestEntity {
  name: string;
  age: number;
  birthDate: Date;
  isActive: boolean;
  status: TestStatus;
}

// Manually set metadata for test entity (since TypeScript reflection requires decorators in real usage)
Reflect.defineMetadata('design:type', String, TestEntity.prototype, 'name');
Reflect.defineMetadata('design:type', Number, TestEntity.prototype, 'age');
Reflect.defineMetadata('design:type', Date, TestEntity.prototype, 'birthDate');
Reflect.defineMetadata('design:type', Boolean, TestEntity.prototype, 'isActive');
Reflect.defineMetadata('design:type', TestStatus, TestEntity.prototype, 'status');

describe('Type Inference Helper', () => {
  beforeEach(() => {
    // Register mock filter types
    FilterTypeRegistry.register({
      StringFilter: MockStringFilter,
      NumberFilter: MockNumberFilter,
      DateFilter: MockDateFilter
    });
  });

  afterEach(() => {
    // Clear registry after each test
    FilterTypeRegistry.clear();
  });

  describe('FilterTypeRegistry', () => {
    it('should register and retrieve filter types correctly', () => {
      expect(FilterTypeRegistry.getStringFilter()).toBe(MockStringFilter);
      expect(FilterTypeRegistry.getNumberFilter()).toBe(MockNumberFilter);
      expect(FilterTypeRegistry.getDateFilter()).toBe(MockDateFilter);
    });

    it('should throw error when filter types not registered', () => {
      FilterTypeRegistry.clear();
      
      expect(() => FilterTypeRegistry.getStringFilter()).toThrow('StringFilter type not registered');
      expect(() => FilterTypeRegistry.getNumberFilter()).toThrow('NumberFilter type not registered');
      expect(() => FilterTypeRegistry.getDateFilter()).toThrow('DateFilter type not registered');
    });

    it('should check if types are registered', () => {
      expect(FilterTypeRegistry.isRegistered()).toBe(true);
      
      FilterTypeRegistry.clear();
      expect(FilterTypeRegistry.isRegistered()).toBe(false);
    });
  });

  describe('inferFilterType', () => {
    it('should return explicit type when provided in config', () => {
      const explicitConfig: FieldConfig = MockStringFilter;
      const result = inferFilterType(TestEntity, 'name', explicitConfig);
      
      expect(result).toBe(MockStringFilter);
    });

    it('should return explicit type from object config', () => {
      const objectConfig: FieldConfig = { type: MockNumberFilter };
      const result = inferFilterType(TestEntity, 'age', objectConfig);
      
      expect(result).toBe(MockNumberFilter);
    });

    it('should infer StringFilter for string properties', () => {
      const result = inferFilterType(TestEntity, 'name');
      
      expect(result).toBe(MockStringFilter);
    });

    it('should infer NumberFilter for number properties', () => {
      const result = inferFilterType(TestEntity, 'age');
      
      expect(result).toBe(MockNumberFilter);
    });

    it('should infer DateFilter for Date properties', () => {
      const result = inferFilterType(TestEntity, 'birthDate');
      
      expect(result).toBe(MockDateFilter);
    });

    it('should return Boolean for boolean properties', () => {
      const result = inferFilterType(TestEntity, 'isActive');
      
      expect(result).toBe(Boolean);
    });

    it('should return StringFilter for enum properties', () => {
      const result = inferFilterType(TestEntity, 'status');
      
      expect(result).toBe(MockStringFilter);
    });

    it('should handle explicit enum configuration', () => {
      const enumConfig: FieldConfig = { enum: TestStatus };
      const result = inferFilterType(TestEntity, 'status', enumConfig);
      
      expect(result).toBe(MockStringFilter);
    });

    it('should fallback to StringFilter for unknown types', () => {
      class UnknownEntity {
        unknownProp: any;
      }

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const result = inferFilterType(UnknownEntity, 'unknownProp');
      
      expect(result).toBe(MockStringFilter);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Could not infer type')
      );
      
      consoleSpy.mockRestore();
    });

    it('should fallback to StringFilter when no metadata available', () => {
      class EmptyEntity {}

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const result = inferFilterType(EmptyEntity, 'nonExistent');
      
      expect(result).toBe(MockStringFilter);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Could not infer type')
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('isSupportedPrimitiveType', () => {
    it('should return true for supported primitive types', () => {
      expect(isSupportedPrimitiveType(String)).toBe(true);
      expect(isSupportedPrimitiveType(Number)).toBe(true);
      expect(isSupportedPrimitiveType(Date)).toBe(true);
      expect(isSupportedPrimitiveType(Boolean)).toBe(true);
    });

    it('should return false for unsupported types', () => {
      expect(isSupportedPrimitiveType(Object)).toBe(false);
      expect(isSupportedPrimitiveType(Array)).toBe(false);
      expect(isSupportedPrimitiveType(MockStringFilter)).toBe(false);
      expect(isSupportedPrimitiveType(null)).toBe(false);
      expect(isSupportedPrimitiveType(undefined)).toBe(false);
    });
  });

  describe('getReflectedPropertyType', () => {
    it('should return the correct reflected type for entity properties', () => {
      expect(getReflectedPropertyType(TestEntity, 'name')).toBe(String);
      expect(getReflectedPropertyType(TestEntity, 'age')).toBe(Number);
      expect(getReflectedPropertyType(TestEntity, 'birthDate')).toBe(Date);
      expect(getReflectedPropertyType(TestEntity, 'isActive')).toBe(Boolean);
    });

    it('should return undefined for non-existent properties', () => {
      expect(getReflectedPropertyType(TestEntity, 'nonExistent')).toBeUndefined();
    });
  });

  describe('isEnum', () => {
    it('should return true for valid enums', () => {
      expect(isEnum(TestStatus)).toBe(true);
    });

    it('should return true for numeric enums', () => {
      enum NumericEnum {
        FIRST = 1,
        SECOND = 2,
        THIRD = 3
      }
      
      expect(isEnum(NumericEnum)).toBe(true);
    });

    it('should return false for non-enum objects', () => {
      expect(isEnum({})).toBe(false);
      expect(isEnum({ key: 'value' })).toBe(false);
      expect(isEnum(String)).toBe(false);
      expect(isEnum(null)).toBe(false);
      expect(isEnum(undefined)).toBe(false);
      expect(isEnum('string')).toBe(false);
      expect(isEnum(42)).toBe(false);
    });

    it('should return false for objects with invalid enum structure', () => {
      const invalidEnum = {
        key1: { nested: 'object' },
        key2: 'valid'
      };
      
      expect(isEnum(invalidEnum)).toBe(false);
    });
  });

  describe('getEnumInfo', () => {
    it('should extract correct information from string enum', () => {
      const info = getEnumInfo(TestStatus);
      
      expect(info.values).toEqual(['active', 'inactive', 'pending']);
      expect(info.example).toBe('active');
      expect(info.description).toBe('One of: active, inactive, pending');
    });

    it('should handle numeric enum', () => {
      enum NumericEnum {
        FIRST = 1,
        SECOND = 2,
        THIRD = 3
      }
      
      const info = getEnumInfo(NumericEnum);
      
      // Numeric enums have both keys and values in Object.values()
      expect(info.values).toContain(1);
      expect(info.values).toContain(2);
      expect(info.values).toContain(3);
      expect(info.values.includes(info.example)).toBe(true);
    });

    it('should handle mixed enum', () => {
      enum MixedEnum {
        STRING_VALUE = 'string',
        NUMERIC_VALUE = 42
      }
      
      const info = getEnumInfo(MixedEnum);
      
      expect(info.values).toContain('string');
      expect(info.values).toContain(42);
      expect(info.values.includes(info.example)).toBe(true);
    });
  });

  describe('shouldTreatAsEnum', () => {
    it('should return true when explicit enum config is provided', () => {
      const config: FieldConfig = { enum: TestStatus };
      const result = shouldTreatAsEnum(TestEntity, 'name', config);
      
      expect(result).toBe(true);
    });

    it('should return true for enum properties through auto-detection', () => {
      const result = shouldTreatAsEnum(TestEntity, 'status');
      
      expect(result).toBe(true);
    });

    it('should return false for non-enum properties', () => {
      expect(shouldTreatAsEnum(TestEntity, 'name')).toBe(false);
      expect(shouldTreatAsEnum(TestEntity, 'age')).toBe(false);
      expect(shouldTreatAsEnum(TestEntity, 'birthDate')).toBe(false);
      expect(shouldTreatAsEnum(TestEntity, 'isActive')).toBe(false);
    });

    it('should return false when no config is provided for non-enum property', () => {
      const result = shouldTreatAsEnum(TestEntity, 'name');
      
      expect(result).toBe(false);
    });
  });
});