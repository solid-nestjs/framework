import 'reflect-metadata';
import { createWhereFields } from '../../../src/helpers/args-helpers/create-where-fields.helper';

// Mock entity for testing
class TestEntity {
  id: string;
  name: string;
  age: number;
  createdAt: Date;
  isActive: boolean;
}

describe('createWhereFields Helper (REST-GraphQL)', () => {
  
  describe('Basic functionality', () => {
    it('should create a WhereFields class with auto-inferred types', () => {
      const WhereFields = createWhereFields(TestEntity, {
        id: true,
        name: true,
        age: true,
        createdAt: true,
        isActive: true
      });

      expect(WhereFields).toBeDefined();
      expect(WhereFields.name).toContain('TestEntityWhereFields');

      const instance = new WhereFields();
      expect(instance).toHaveProperty('id');
      expect(instance).toHaveProperty('name');
      expect(instance).toHaveProperty('age');
      expect(instance).toHaveProperty('createdAt');
      expect(instance).toHaveProperty('isActive');
    });

    it('should add logical operators (_and, _or)', () => {
      const WhereFields = createWhereFields(TestEntity, {
        name: true
      });

      const instance = new WhereFields();
      expect(instance).toHaveProperty('_and');
      expect(instance).toHaveProperty('_or');
    });

    it('should validate required parameters', () => {
      expect(() => {
        createWhereFields(null as any, { name: true });
      }).toThrow('Entity class is required');

      expect(() => {
        createWhereFields(TestEntity, {});
      }).toThrow('Field configuration is required and cannot be empty');
    });

    it('should support custom class options', () => {
      const WhereFields = createWhereFields(
        TestEntity,
        { name: true },
        {
          name: 'CustomWhereFields',
          description: 'Custom description'
        }
      );

      expect(WhereFields.name).toBe('CustomWhereFields');
    });
  });
});