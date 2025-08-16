import { Type } from '@nestjs/common';
import {
  GroupByArgsFrom,
  extractFindArgsMetadata,
  getGroupByArgsMetadata,
  getGroupByFieldMetadata,
  isGroupByArgsFromClass,
  GroupByArgsFromConfig,
  FindArgsMetadata
} from '../../../src/helpers/args-helpers/groupby-args-from.helper';

// Test classes
class TestEntity {
  id: number;
  name: string;
  email: string;
  status: string;
  createdAt: Date;
}

class TestFindArgs {
  where?: any = undefined;
  orderBy?: any = undefined;
  take?: number = undefined;
  skip?: number = undefined;
}

// Manually set metadata for TestFindArgs properties
Reflect.defineMetadata('design:type', Object, TestFindArgs.prototype, 'where');
Reflect.defineMetadata('design:type', Object, TestFindArgs.prototype, 'orderBy');
Reflect.defineMetadata('design:type', Number, TestFindArgs.prototype, 'take');
Reflect.defineMetadata('design:type', Number, TestFindArgs.prototype, 'skip');

describe('GroupByArgsFrom Helper', () => {
  describe('extractFindArgsMetadata', () => {
    it('should extract basic metadata from FindArgs class', () => {
      const metadata = extractFindArgsMetadata(TestFindArgs);
      
      expect(metadata.className).toBe('TestFindArgs');
      expect(Array.isArray(metadata.properties)).toBe(true);
      // Note: metadata extraction in test environment may not work exactly like in real usage
    });

    it('should not include constructor in properties', () => {
      const metadata = extractFindArgsMetadata(TestFindArgs);
      
      const constructorProperty = metadata.properties.find(p => p.name === 'constructor');
      expect(constructorProperty).toBeUndefined();
    });

    it('should handle class with no properties', () => {
      class EmptyClass {}
      
      const metadata = extractFindArgsMetadata(EmptyClass);
      
      expect(metadata.className).toBe('EmptyClass');
      expect(Array.isArray(metadata.properties)).toBe(true);
    });
  });

  describe('GroupByArgsFrom', () => {
    it('should create a GroupBy class when fields exist', () => {
      // Use simple test case that will work
      class SimpleClass {
        field1: string = '';
        field2: number = 0;
      }

      const config: GroupByArgsFromConfig = {
        findArgsType: SimpleClass,
        groupByFields: ['field1', 'field2'],
        className: 'TestGroupBy'
      };

      const GroupByClass = GroupByArgsFrom(config);
      
      expect(GroupByClass.name).toBe('TestGroupBy');
      expect(typeof GroupByClass).toBe('function');
    });

    it('should create instances with correct initial values', () => {
      class SimpleClass {
        prop1: string = '';
        prop2: number = 0;
      }

      const config: GroupByArgsFromConfig = {
        findArgsType: SimpleClass,
        groupByFields: ['prop1', 'prop2']
      };

      const GroupByClass = GroupByArgsFrom(config);
      const instance = new GroupByClass();
      
      expect(instance.prop1).toBeUndefined();
      expect(instance.prop2).toBeUndefined();
      expect(instance.hasOwnProperty('prop1')).toBe(true);
      expect(instance.hasOwnProperty('prop2')).toBe(true);
    });

    it('should generate default class name when not provided', () => {
      class SimpleClass {
        field: string = '';
      }

      const config: GroupByArgsFromConfig = {
        findArgsType: SimpleClass,
        groupByFields: ['field']
      };

      const GroupByClass = GroupByArgsFrom(config);
      
      expect(GroupByClass.name).toBe('SimpleClassGroupBy');
    });

    it('should set correct metadata for each field', () => {
      const config: GroupByArgsFromConfig = {
        findArgsType: TestFindArgs,
        groupByFields: ['where', 'orderBy']
      };

      const GroupByClass = GroupByArgsFrom(config);
      
      // Check design:type metadata
      expect(Reflect.getMetadata('design:type', GroupByClass.prototype, 'where')).toBe(Boolean);
      expect(Reflect.getMetadata('design:type', GroupByClass.prototype, 'orderBy')).toBe(Boolean);
      
      // Check custom metadata
      const whereMetadata = Reflect.getMetadata('groupby:field', GroupByClass.prototype, 'where');
      expect(whereMetadata.isOptional).toBe(true);
      expect(whereMetadata.isGroupBy).toBe(true);
      expect(whereMetadata.description).toContain('Property where from TestFindArgs');
    });

    it('should store class-level metadata', () => {
      const config: GroupByArgsFromConfig = {
        findArgsType: TestFindArgs,
        groupByFields: ['where', 'orderBy'],
        className: 'CustomGroupBy',
        description: 'Custom description'
      };

      const GroupByClass = GroupByArgsFrom(config);
      const metadata = Reflect.getMetadata('groupby:config', GroupByClass);
      
      expect(metadata.sourceClass).toBe('TestFindArgs');
      expect(metadata.className).toBe('CustomGroupBy');
      expect(metadata.description).toBe('Custom description');
      expect(metadata.fields).toEqual(['where', 'orderBy']);
    });

    it('should throw error when findArgsType is not provided', () => {
      const config = {
        groupByFields: ['where']
      } as GroupByArgsFromConfig;

      expect(() => GroupByArgsFrom(config)).toThrow('findArgsType is required');
    });

    it('should throw error when groupByFields is empty', () => {
      const config: GroupByArgsFromConfig = {
        findArgsType: TestFindArgs,
        groupByFields: []
      };

      expect(() => GroupByArgsFrom(config)).toThrow('groupByFields array is required and cannot be empty');
    });

    it('should throw error when invalid fields are specified', () => {
      class SimpleClass {
        validField: string = '';
      }

      const config: GroupByArgsFromConfig = {
        findArgsType: SimpleClass,
        groupByFields: ['nonExistent', 'alsoInvalid']
      };

      expect(() => GroupByArgsFrom(config)).toThrow(
        'Invalid groupByFields specified: nonExistent, alsoInvalid. Available fields: validField'
      );
    });

    it('should allow partial invalid fields in error message', () => {
      class SimpleClass {
        validField: string = '';
      }

      const config: GroupByArgsFromConfig = {
        findArgsType: SimpleClass,
        groupByFields: ['validField', 'nonExistent']
      };

      expect(() => GroupByArgsFrom(config)).toThrow(
        'Invalid groupByFields specified: nonExistent. Available fields: validField'
      );
    });
  });

  describe('getGroupByArgsMetadata', () => {
    it('should retrieve metadata from GroupBy class', () => {
      const config: GroupByArgsFromConfig = {
        findArgsType: TestFindArgs,
        groupByFields: ['where', 'orderBy'],
        className: 'TestGroupBy'
      };

      const GroupByClass = GroupByArgsFrom(config);
      const metadata = getGroupByArgsMetadata(GroupByClass);
      
      expect(metadata).toBeDefined();
      expect(metadata.sourceClass).toBe('TestFindArgs');
      expect(metadata.className).toBe('TestGroupBy');
      expect(metadata.fields).toEqual(['where', 'orderBy']);
    });

    it('should return undefined for non-GroupBy classes', () => {
      class RegularClass {}
      
      const metadata = getGroupByArgsMetadata(RegularClass);
      expect(metadata).toBeUndefined();
    });
  });

  describe('getGroupByFieldMetadata', () => {
    it('should retrieve field metadata from GroupBy class', () => {
      const config: GroupByArgsFromConfig = {
        findArgsType: TestFindArgs,
        groupByFields: ['where']
      };

      const GroupByClass = GroupByArgsFrom(config);
      const fieldMetadata = getGroupByFieldMetadata(GroupByClass, 'where');
      
      expect(fieldMetadata).toBeDefined();
      expect(fieldMetadata.isOptional).toBe(true);
      expect(fieldMetadata.isGroupBy).toBe(true);
      expect(fieldMetadata.description).toContain('Property where from TestFindArgs');
    });

    it('should return undefined for non-existent fields', () => {
      const config: GroupByArgsFromConfig = {
        findArgsType: TestFindArgs,
        groupByFields: ['where']
      };

      const GroupByClass = GroupByArgsFrom(config);
      const fieldMetadata = getGroupByFieldMetadata(GroupByClass, 'nonExistent');
      
      expect(fieldMetadata).toBeUndefined();
    });
  });

  describe('isGroupByArgsFromClass', () => {
    it('should return true for classes created by GroupByArgsFrom', () => {
      const config: GroupByArgsFromConfig = {
        findArgsType: TestFindArgs,
        groupByFields: ['where']
      };

      const GroupByClass = GroupByArgsFrom(config);
      
      expect(isGroupByArgsFromClass(GroupByClass)).toBe(true);
    });

    it('should return false for regular classes', () => {
      class RegularClass {}
      
      expect(isGroupByArgsFromClass(RegularClass)).toBe(false);
    });
  });

  describe('integration scenarios', () => {
    it('should work with inherited properties', () => {
      class BaseArgs {
        baseField: string = '';
      }

      class ExtendedArgs extends BaseArgs {
        extendedField: number = 0;
      }

      // Set metadata for the test classes
      Reflect.defineMetadata('design:type', String, BaseArgs.prototype, 'baseField');
      Reflect.defineMetadata('design:type', Number, ExtendedArgs.prototype, 'extendedField');

      const config: GroupByArgsFromConfig = {
        findArgsType: ExtendedArgs,
        groupByFields: ['baseField', 'extendedField']
      };

      const GroupByClass = GroupByArgsFrom(config);
      const instance = new GroupByClass();
      
      expect(instance.hasOwnProperty('baseField')).toBe(true);
      expect(instance.hasOwnProperty('extendedField')).toBe(true);
    });

    it('should maintain separate instances for different GroupBy classes', () => {
      const config1: GroupByArgsFromConfig = {
        findArgsType: TestFindArgs,
        groupByFields: ['where'],
        className: 'GroupBy1'
      };

      const config2: GroupByArgsFromConfig = {
        findArgsType: TestFindArgs,
        groupByFields: ['orderBy'],
        className: 'GroupBy2'
      };

      const GroupBy1 = GroupByArgsFrom(config1);
      const GroupBy2 = GroupByArgsFrom(config2);

      const instance1 = new GroupBy1();
      const instance2 = new GroupBy2();

      expect(instance1.constructor).not.toBe(instance2.constructor);
      expect(instance1.hasOwnProperty('where')).toBe(true);
      expect(instance1.hasOwnProperty('orderBy')).toBe(false);
      expect(instance2.hasOwnProperty('where')).toBe(false);
      expect(instance2.hasOwnProperty('orderBy')).toBe(true);
    });
  });
});