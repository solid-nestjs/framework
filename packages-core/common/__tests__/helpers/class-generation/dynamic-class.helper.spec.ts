import { Type } from '@nestjs/common';
import {
  generateBaseClass,
  addPropertyToClass,
  getPropertyMetadata,
  setPropertyMetadata,
  getDefinedProperties,
  cloneClass,
  ClassGeneratorOptions,
  PropertyOptions
} from '../../../src/helpers/class-generation/dynamic-class.helper';

describe('Dynamic Class Helper', () => {
  describe('generateBaseClass', () => {
    it('should create a class with the specified name', () => {
      const options: ClassGeneratorOptions = {
        className: 'TestClass'
      };
      
      const DynamicClass = generateBaseClass(options);
      
      expect(DynamicClass.name).toBe('TestClass');
      expect(typeof DynamicClass).toBe('function');
    });

    it('should create a class that extends a base class', () => {
      class BaseClass {
        baseProperty = 'base';
      }

      const options: ClassGeneratorOptions = {
        className: 'ExtendedClass',
        baseClass: BaseClass
      };
      
      const DynamicClass = generateBaseClass(options);
      const instance = new DynamicClass();
      
      expect(DynamicClass.name).toBe('ExtendedClass');
      expect(instance).toBeInstanceOf(BaseClass);
      expect((instance as any).baseProperty).toBe('base');
    });

    it('should apply custom metadata to the class', () => {
      const metadata = { version: '1.0', author: 'test' };
      const options: ClassGeneratorOptions = {
        className: 'MetadataClass',
        metadata
      };
      
      const DynamicClass = generateBaseClass(options);
      
      expect(Reflect.getMetadata('version', DynamicClass)).toBe('1.0');
      expect(Reflect.getMetadata('author', DynamicClass)).toBe('test');
    });
  });

  describe('addPropertyToClass', () => {
    let TestClass: Type<any>;

    beforeEach(() => {
      TestClass = generateBaseClass({ className: 'TestClass' });
    });

    it('should add a property to a class with correct type metadata', () => {
      const options: PropertyOptions = {
        type: String,
        isOptional: true,
        description: 'Test string property'
      };

      addPropertyToClass(TestClass, 'testProp', options);

      const instance = new TestClass();
      const propertyType = Reflect.getMetadata('design:type', TestClass.prototype, 'testProp');
      
      expect(propertyType).toBe(String);
      expect('testProp' in instance).toBe(true);
    });

    it('should store property metadata correctly', () => {
      const options: PropertyOptions = {
        type: Number,
        isOptional: false,
        description: 'Test number property',
        example: 42,
        deprecated: true
      };

      addPropertyToClass(TestClass, 'numberProp', options);

      const metadata = Reflect.getMetadata('property:numberProp', TestClass.prototype);
      
      expect(metadata.type).toBe(Number);
      expect(metadata.isOptional).toBe(false);
      expect(metadata.description).toBe('Test number property');
      expect(metadata.example).toBe(42);
      expect(metadata.deprecated).toBe(true);
    });

    it('should default isOptional to true when not specified', () => {
      const options: PropertyOptions = {
        type: Boolean
      };

      addPropertyToClass(TestClass, 'boolProp', options);

      const metadata = Reflect.getMetadata('property:boolProp', TestClass.prototype);
      expect(metadata.isOptional).toBe(true);
    });
  });

  describe('getPropertyMetadata', () => {
    let TestClass: Type<any>;

    beforeEach(() => {
      TestClass = generateBaseClass({ className: 'TestClass' });
    });

    it('should retrieve property metadata correctly', () => {
      const expectedMetadata = { test: 'value' };
      Reflect.defineMetadata('custom:meta', expectedMetadata, TestClass.prototype, 'testProp');

      const metadata = getPropertyMetadata(TestClass, 'testProp', 'custom:meta');
      
      expect(metadata).toEqual(expectedMetadata);
    });

    it('should return undefined for non-existent metadata', () => {
      const metadata = getPropertyMetadata(TestClass, 'nonExistent', 'custom:meta');
      
      expect(metadata).toBeUndefined();
    });
  });

  describe('setPropertyMetadata', () => {
    let TestClass: Type<any>;

    beforeEach(() => {
      TestClass = generateBaseClass({ className: 'TestClass' });
    });

    it('should set property metadata correctly', () => {
      const testMetadata = { custom: 'data', number: 123 };
      
      setPropertyMetadata(TestClass, 'testProp', 'custom:key', testMetadata);
      
      const retrievedMetadata = Reflect.getMetadata('custom:key', TestClass.prototype, 'testProp');
      expect(retrievedMetadata).toEqual(testMetadata);
    });
  });

  describe('getDefinedProperties', () => {
    it('should return all defined properties on a class', () => {
      const TestClass = generateBaseClass({ className: 'TestClass' });
      
      addPropertyToClass(TestClass, 'prop1', { type: String });
      addPropertyToClass(TestClass, 'prop2', { type: Number });
      addPropertyToClass(TestClass, 'prop3', { type: Boolean });

      const properties = getDefinedProperties(TestClass);
      
      expect(properties).toContain('prop1');
      expect(properties).toContain('prop2');
      expect(properties).toContain('prop3');
      expect(properties).not.toContain('constructor');
    });

    it('should include properties added to class', () => {
      const TestClass = generateBaseClass({ className: 'TestClass' });
      
      addPropertyToClass(TestClass, 'prop1', { type: String });
      addPropertyToClass(TestClass, 'prop2', { type: Number });

      const properties = getDefinedProperties(TestClass);
      
      expect(properties).toContain('prop1');
      expect(properties).toContain('prop2');
    });
  });

  describe('cloneClass', () => {
    it('should create a new class that extends the source class', () => {
      class SourceClass {
        sourceProperty = 'source';
        
        getSource() {
          return this.sourceProperty;
        }
      }

      const ClonedClass = cloneClass(SourceClass, 'ClonedClass');
      const instance = new ClonedClass();
      
      expect(ClonedClass.name).toBe('ClonedClass');
      expect(instance).toBeInstanceOf(SourceClass);
      expect((instance as any).sourceProperty).toBe('source');
      expect((instance as any).getSource()).toBe('source');
    });

    it('should create independent classes', () => {
      class SourceClass {
        value = 'original';
      }

      const Clone1 = cloneClass(SourceClass, 'Clone1');
      const Clone2 = cloneClass(SourceClass, 'Clone2');
      
      expect(Clone1.name).toBe('Clone1');
      expect(Clone2.name).toBe('Clone2');
      expect(Clone1).not.toBe(Clone2);
      
      const instance1 = new Clone1();
      const instance2 = new Clone2();
      
      expect(instance1).toBeInstanceOf(SourceClass);
      expect(instance2).toBeInstanceOf(SourceClass);
      expect(instance1.constructor).not.toBe(instance2.constructor);
    });
  });
});