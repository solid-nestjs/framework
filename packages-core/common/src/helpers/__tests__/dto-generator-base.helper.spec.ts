import 'reflect-metadata';
import { DtoGeneratorBase } from '../dto-generator-base.helper';
import { SolidEntity, SolidField, SolidId } from '../../decorators';
import { MetadataStorage } from '../../metadata';

// Clean metadata before each test
beforeEach(() => {
  MetadataStorage.clearMetadata();
});

describe('DtoGeneratorBase', () => {
  @SolidEntity()
  class TestEntity {
    @SolidId()
    id: string;

    @SolidField({ description: 'User name' })
    name: string;

    @SolidField({ description: 'User email', email: true })
    email: string;

    @SolidField({ description: 'User age' })
    age: number;

    @SolidField()
    createdAt: Date;
  }

  describe('createBaseClass', () => {
    it('should create class with selected properties', () => {
      const GeneratedClass = DtoGeneratorBase['createBaseClass'](
        TestEntity, 
        ['name', 'email']
      );

      const instance = new GeneratedClass();
      
      expect(instance).toHaveProperty('name');
      expect(instance).toHaveProperty('email');
      expect(instance).not.toHaveProperty('id');
      expect(instance).not.toHaveProperty('age');
    });

    it('should set meaningful class name', () => {
      const GeneratedClass = DtoGeneratorBase['createBaseClass'](
        TestEntity, 
        ['name']
      );

      expect(GeneratedClass.name).toBe('GeneratedTestEntityDto');
    });

    it('should copy property descriptors', () => {
      // Add a property with a custom descriptor to the prototype
      Object.defineProperty(TestEntity.prototype, 'testProp', {
        get() { return 'test value'; },
        enumerable: true,
        configurable: true
      });

      const GeneratedClass = DtoGeneratorBase['createBaseClass'](
        TestEntity, 
        ['testProp']
      );

      const instance = new GeneratedClass();
      expect(instance.testProp).toBe('test value');
    });

    it('should create default descriptors for properties without descriptors', () => {
      const GeneratedClass = DtoGeneratorBase['createBaseClass'](
        TestEntity, 
        ['name']
      );

      const descriptor = Object.getOwnPropertyDescriptor(
        GeneratedClass.prototype, 
        'name'
      );

      expect(descriptor?.writable).toBe(true);
      expect(descriptor?.enumerable).toBe(true);
      expect(descriptor?.configurable).toBe(true);
    });
  });

  describe('generateDto', () => {
    it('should generate DTO with selected properties', () => {
      const GeneratedDto = DtoGeneratorBase['generateDto'](
        TestEntity,
        ['name', 'email'] as (keyof TestEntity)[]
      );

      const instance = new GeneratedDto();
      
      expect(instance).toHaveProperty('name');
      expect(instance).toHaveProperty('email');
      expect(instance).not.toHaveProperty('id');
    });

    it('should generate DTO with default properties when none specified', () => {
      const GeneratedDto = DtoGeneratorBase['generateDto'](TestEntity);

      const instance = new GeneratedDto();
      
      expect(instance).toHaveProperty('name');
      expect(instance).toHaveProperty('email');
      expect(instance).toHaveProperty('age');
      expect(instance).not.toHaveProperty('id');
      expect(instance).not.toHaveProperty('createdAt');
    });

    it('should call decorator transfer function if provided', () => {
      const mockTransferFn = jest.fn();
      
      DtoGeneratorBase['generateDto'](
        TestEntity,
        ['name', 'email'] as (keyof TestEntity)[],
        mockTransferFn
      );

      expect(mockTransferFn).toHaveBeenCalledTimes(2);
      expect(mockTransferFn).toHaveBeenCalledWith(
        TestEntity, 
        expect.any(Function), 
        'name'
      );
      expect(mockTransferFn).toHaveBeenCalledWith(
        TestEntity, 
        expect.any(Function), 
        'email'
      );
    });

    it('should throw error for invalid property selection', () => {
      expect(() => {
        DtoGeneratorBase['generateDto'](
          TestEntity,
          ['nonExistent'] as any
        );
      }).toThrow("Property 'nonExistent' does not exist");
    });
  });
});