import { Type } from '@nestjs/common';
import {
  parseFieldConfig,
  parseOrderByConfig,
  parseGroupByConfig,
  parseClassOptions,
  validateFieldConfig,
  validateClassOptions,
  OrderByFieldConfig,
  GroupByFieldConfig,
  ClassOptions
} from '../../../src/helpers/args-helpers/field-config.helper';
import { FieldConfig } from '../../../src/helpers/args-helpers/type-inference.helper';

// Mock types for testing
class MockStringFilter {}
class MockNumberFilter {}

describe('Field Config Helper', () => {
  describe('parseFieldConfig', () => {
    it('should parse simple true configuration', () => {
      const config: FieldConfig = true;
      const result = parseFieldConfig(config);
      
      expect(result).toEqual({});
    });

    it('should parse explicit type configuration', () => {
      const config: FieldConfig = MockStringFilter;
      const result = parseFieldConfig(config);
      
      expect(result).toEqual({ type: MockStringFilter });
    });

    it('should parse object configuration', () => {
      const config: FieldConfig = {
        type: MockNumberFilter,
        description: 'Test field',
        required: true,
        example: 42,
        deprecated: false,
        enum: { VALUE1: 'value1', VALUE2: 'value2' },
        enumName: 'TestEnum'
      };
      
      const result = parseFieldConfig(config);
      
      expect(result).toEqual({
        type: MockNumberFilter,
        description: 'Test field',
        required: true,
        example: 42,
        deprecated: false,
        enum: { VALUE1: 'value1', VALUE2: 'value2' },
        enumName: 'TestEnum'
      });
    });

    it('should throw error for invalid configuration', () => {
      expect(() => parseFieldConfig(null as any)).toThrow('Invalid field configuration');
      expect(() => parseFieldConfig(undefined as any)).toThrow('Invalid field configuration');
      expect(() => parseFieldConfig('invalid' as any)).toThrow('Invalid field configuration');
    });
  });

  describe('parseOrderByConfig', () => {
    it('should parse simple true configuration', () => {
      const config: OrderByFieldConfig = true;
      const result = parseOrderByConfig(config);
      
      expect(result).toEqual({});
    });

    it('should parse object configuration', () => {
      const config: OrderByFieldConfig = {
        description: 'Sort by this field',
        required: false
      };
      
      const result = parseOrderByConfig(config);
      
      expect(result).toEqual({
        description: 'Sort by this field',
        required: false
      });
    });

    it('should throw error for invalid configuration', () => {
      expect(() => parseOrderByConfig(null as any)).toThrow('Invalid OrderBy field configuration');
      expect(() => parseOrderByConfig('invalid' as any)).toThrow('Invalid OrderBy field configuration');
    });
  });

  describe('parseGroupByConfig', () => {
    it('should parse simple true configuration with Boolean type', () => {
      const config: GroupByFieldConfig = true;
      const result = parseGroupByConfig(config);
      
      expect(result).toEqual({ type: Boolean });
    });

    it('should parse explicit type configuration', () => {
      const config: GroupByFieldConfig = MockStringFilter;
      const result = parseGroupByConfig(config);
      
      expect(result).toEqual({ type: MockStringFilter });
    });

    it('should parse object configuration', () => {
      const config: GroupByFieldConfig = {
        type: MockNumberFilter,
        description: 'Group by this field',
        required: true
      };
      
      const result = parseGroupByConfig(config);
      
      expect(result).toEqual({
        type: MockNumberFilter,
        description: 'Group by this field',
        required: true
      });
    });

    it('should throw error for invalid configuration', () => {
      expect(() => parseGroupByConfig(null as any)).toThrow('Invalid GroupBy field configuration');
      expect(() => parseGroupByConfig('invalid' as any)).toThrow('Invalid GroupBy field configuration');
    });
  });

  describe('parseClassOptions', () => {
    it('should return defaults when no options provided', () => {
      const result = parseClassOptions('Product', 'WhereFields');
      
      expect(result).toEqual({
        name: 'ProductWhereFields',
        description: undefined,
        isAbstract: true,
        decorators: [],
        metadata: {},
        extends: undefined
      });
    });

    it('should use custom options when provided', () => {
      const options: ClassOptions = {
        name: 'CustomName',
        description: 'Custom description',
        isAbstract: false,
        decorators: [() => {}] as any,
        metadata: { version: '1.0' },
        extends: MockStringFilter
      };
      
      const result = parseClassOptions('Product', 'WhereFields', options);
      
      expect(result).toEqual({
        name: 'CustomName',
        description: 'Custom description',
        isAbstract: false,
        decorators: options.decorators,
        metadata: { version: '1.0' },
        extends: MockStringFilter
      });
    });

    it('should merge defaults with partial options', () => {
      const options: ClassOptions = {
        description: 'Partial options',
        metadata: { custom: 'value' }
      };
      
      const result = parseClassOptions('User', 'OrderByFields', options);
      
      expect(result).toEqual({
        name: 'UserOrderByFields',
        description: 'Partial options',
        isAbstract: true,
        decorators: [],
        metadata: { custom: 'value' },
        extends: undefined
      });
    });
  });

  describe('validateFieldConfig', () => {
    it('should accept valid true configuration', () => {
      expect(() => validateFieldConfig(true, 'testField')).not.toThrow();
    });

    it('should accept valid type configuration', () => {
      expect(() => validateFieldConfig(MockStringFilter, 'testField')).not.toThrow();
    });

    it('should accept valid object configuration', () => {
      const config = {
        type: MockNumberFilter,
        description: 'Test description',
        required: true,
        example: 'test',
        deprecated: false,
        enum: { A: 'a' },
        enumName: 'TestEnum'
      };
      
      expect(() => validateFieldConfig(config, 'testField')).not.toThrow();
    });

    it('should reject null or undefined configurations', () => {
      expect(() => validateFieldConfig(null, 'testField')).toThrow(
        "Field configuration for 'testField' cannot be null or undefined"
      );
      expect(() => validateFieldConfig(undefined, 'testField')).toThrow(
        "Field configuration for 'testField' cannot be null or undefined"
      );
    });

    it('should reject invalid configuration types', () => {
      expect(() => validateFieldConfig('invalid', 'testField')).toThrow(
        "Invalid configuration type for field 'testField'"
      );
      expect(() => validateFieldConfig(42, 'testField')).toThrow(
        "Invalid configuration type for field 'testField'"
      );
    });

    it('should reject invalid keys in object configuration', () => {
      const config = {
        type: MockStringFilter,
        invalidKey: 'invalid'
      };
      
      expect(() => validateFieldConfig(config, 'testField')).toThrow(
        "Invalid configuration key 'invalidKey' for field 'testField'"
      );
    });

    it('should reject invalid type in object configuration', () => {
      const config = {
        type: 'not a constructor'
      };
      
      expect(() => validateFieldConfig(config, 'testField')).toThrow(
        "Type for field 'testField' must be a class constructor"
      );
    });

    it('should reject invalid enumName type', () => {
      const config = {
        type: MockStringFilter,
        enumName: 123
      };
      
      expect(() => validateFieldConfig(config, 'testField')).toThrow(
        "enumName for field 'testField' must be a string"
      );
    });
  });

  describe('validateClassOptions', () => {
    it('should accept valid class options', () => {
      const options: ClassOptions = {
        name: 'TestClass',
        description: 'Test description',
        isAbstract: true,
        decorators: [],
        metadata: { version: '1.0' },
        extends: MockStringFilter
      };
      
      expect(() => validateClassOptions(options)).not.toThrow();
    });

    it('should reject invalid name type', () => {
      const options = { name: 123 } as any;
      
      expect(() => validateClassOptions(options)).toThrow('Class name must be a string');
    });

    it('should reject invalid description type', () => {
      const options = { description: 123 } as any;
      
      expect(() => validateClassOptions(options)).toThrow('Class description must be a string');
    });

    it('should reject invalid isAbstract type', () => {
      const options = { isAbstract: 'yes' } as any;
      
      expect(() => validateClassOptions(options)).toThrow('isAbstract option must be a boolean');
    });

    it('should reject invalid decorators type', () => {
      const options = { decorators: 'invalid' } as any;
      
      expect(() => validateClassOptions(options)).toThrow('decorators option must be an array');
    });

    it('should reject invalid metadata type', () => {
      const options = { metadata: 'invalid' } as any;
      
      expect(() => validateClassOptions(options)).toThrow('metadata option must be an object');
    });

    it('should reject invalid extends type', () => {
      const options = { extends: 'invalid' } as any;
      
      expect(() => validateClassOptions(options)).toThrow('extends option must be a class constructor');
    });

    it('should accept undefined/null values for optional fields', () => {
      const options: ClassOptions = {
        name: undefined,
        description: undefined,
        isAbstract: undefined,
        decorators: undefined,
        metadata: undefined,
        extends: undefined
      };
      
      expect(() => validateClassOptions(options)).not.toThrow();
    });
  });

  describe('edge cases and integrations', () => {
    it('should handle empty object configurations', () => {
      const config = {};
      
      expect(() => validateFieldConfig(config, 'testField')).not.toThrow();
      const result = parseFieldConfig(config);
      expect(result).toEqual({});
    });

    it('should preserve all object properties during parsing', () => {
      const config = {
        type: MockStringFilter,
        description: 'Test',
        required: true,
        example: { complex: 'object' },
        deprecated: true,
        enum: { A: 'a', B: 'b' },
        enumName: 'TestEnum'
      };
      
      const result = parseFieldConfig(config);
      expect(result).toEqual(config);
    });

    it('should handle complex decorator arrays in class options', () => {
      const mockDecorator1 = () => {};
      const mockDecorator2 = () => {};
      const options: ClassOptions = {
        decorators: [mockDecorator1, mockDecorator2] as any
      };
      
      expect(() => validateClassOptions(options)).not.toThrow();
      const result = parseClassOptions('Test', 'Suffix', options);
      expect(result.decorators).toEqual([mockDecorator1, mockDecorator2]);
    });
  });
});