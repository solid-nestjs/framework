import { Type } from '@nestjs/common';
import {
  applyDecoratorToProperty,
  applyDecoratorsToProperty,
  applyDecoratorToClass,
  applyDecoratorsToClass
} from '../../../src/helpers/decorators/decorator-utils.helper';

describe('Decorator Utils Helper', () => {
  let TestClass: Type<any>;

  beforeEach(() => {
    // Create a fresh test class for each test
    TestClass = class TestClass {
      testProperty: string;
    };
  });

  describe('applyDecoratorToProperty', () => {
    it('should apply a property decorator correctly', () => {
      const decoratorSpy = jest.fn();
      const mockDecorator: PropertyDecorator = (target, propertyKey) => {
        decoratorSpy(target, propertyKey);
      };

      applyDecoratorToProperty(mockDecorator, TestClass, 'testProperty');

      expect(decoratorSpy).toHaveBeenCalledWith(TestClass.prototype, 'testProperty');
    });

    it('should apply metadata through decorator', () => {
      const testMetadataKey = 'test:metadata';
      const testMetadataValue = 'test value';
      
      const metadataDecorator: PropertyDecorator = (target, propertyKey) => {
        Reflect.defineMetadata(testMetadataKey, testMetadataValue, target, propertyKey);
      };

      applyDecoratorToProperty(metadataDecorator, TestClass, 'testProperty');

      const metadata = Reflect.getMetadata(testMetadataKey, TestClass.prototype, 'testProperty');
      expect(metadata).toBe(testMetadataValue);
    });
  });

  describe('applyDecoratorsToProperty', () => {
    it('should apply multiple property decorators in order', () => {
      const callOrder: string[] = [];
      
      const decorator1: PropertyDecorator = () => {
        callOrder.push('decorator1');
      };
      
      const decorator2: PropertyDecorator = () => {
        callOrder.push('decorator2');
      };
      
      const decorator3: PropertyDecorator = () => {
        callOrder.push('decorator3');
      };

      applyDecoratorsToProperty([decorator1, decorator2, decorator3], TestClass, 'testProperty');

      expect(callOrder).toEqual(['decorator1', 'decorator2', 'decorator3']);
    });

    it('should handle empty decorator array', () => {
      expect(() => {
        applyDecoratorsToProperty([], TestClass, 'testProperty');
      }).not.toThrow();
    });

    it('should apply all decorators even if one throws', () => {
      const successfulDecorator: PropertyDecorator = (target, propertyKey) => {
        Reflect.defineMetadata('success', true, target, propertyKey);
      };
      
      const failingDecorator: PropertyDecorator = () => {
        throw new Error('Decorator failed');
      };

      expect(() => {
        applyDecoratorsToProperty([successfulDecorator, failingDecorator], TestClass, 'testProperty');
      }).toThrow('Decorator failed');

      // The first decorator should still have been applied
      const metadata = Reflect.getMetadata('success', TestClass.prototype, 'testProperty');
      expect(metadata).toBe(true);
    });
  });

  describe('applyDecoratorToClass', () => {
    it('should apply a class decorator correctly', () => {
      const decoratorSpy = jest.fn();
      const mockDecorator: ClassDecorator = (target) => {
        decoratorSpy(target);
      };

      applyDecoratorToClass(mockDecorator, TestClass);

      expect(decoratorSpy).toHaveBeenCalledWith(TestClass);
    });

    it('should apply metadata through class decorator', () => {
      const testMetadataKey = 'class:metadata';
      const testMetadataValue = { version: '1.0' };
      
      const metadataDecorator: ClassDecorator = (target) => {
        Reflect.defineMetadata(testMetadataKey, testMetadataValue, target);
      };

      applyDecoratorToClass(metadataDecorator, TestClass);

      const metadata = Reflect.getMetadata(testMetadataKey, TestClass);
      expect(metadata).toEqual(testMetadataValue);
    });

    it('should modify class prototype through decorator', () => {
      const enhancingDecorator: ClassDecorator = (target: any) => {
        target.prototype.decoratorAdded = true;
        target.staticProperty = 'added by decorator';
      };

      applyDecoratorToClass(enhancingDecorator, TestClass);

      expect((TestClass.prototype as any).decoratorAdded).toBe(true);
      expect((TestClass as any).staticProperty).toBe('added by decorator');
    });
  });

  describe('applyDecoratorsToClass', () => {
    it('should apply multiple class decorators in order', () => {
      const callOrder: string[] = [];
      
      const decorator1: ClassDecorator = () => {
        callOrder.push('classDecorator1');
      };
      
      const decorator2: ClassDecorator = () => {
        callOrder.push('classDecorator2');
      };
      
      const decorator3: ClassDecorator = () => {
        callOrder.push('classDecorator3');
      };

      applyDecoratorsToClass([decorator1, decorator2, decorator3], TestClass);

      expect(callOrder).toEqual(['classDecorator1', 'classDecorator2', 'classDecorator3']);
    });

    it('should handle empty decorator array', () => {
      expect(() => {
        applyDecoratorsToClass([], TestClass);
      }).not.toThrow();
    });

    it('should accumulate effects of multiple decorators', () => {
      const decorator1: ClassDecorator = (target: any) => {
        target.prototype.prop1 = 'value1';
      };
      
      const decorator2: ClassDecorator = (target: any) => {
        target.prototype.prop2 = 'value2';
      };
      
      const decorator3: ClassDecorator = (target: any) => {
        target.staticProp = 'staticValue';
      };

      applyDecoratorsToClass([decorator1, decorator2, decorator3], TestClass);

      expect((TestClass.prototype as any).prop1).toBe('value1');
      expect((TestClass.prototype as any).prop2).toBe('value2');
      expect((TestClass as any).staticProp).toBe('staticValue');
    });
  });

  describe('integration with real decorators', () => {
    it('should work with typical validation decorators pattern', () => {
      // Simulate class-validator style decorators
      const IsOptional = (): PropertyDecorator => {
        return (target, propertyKey) => {
          const existingValidators = Reflect.getMetadata('validators', target, propertyKey) || [];
          existingValidators.push('isOptional');
          Reflect.defineMetadata('validators', existingValidators, target, propertyKey);
        };
      };

      const IsString = (): PropertyDecorator => {
        return (target, propertyKey) => {
          const existingValidators = Reflect.getMetadata('validators', target, propertyKey) || [];
          existingValidators.push('isString');
          Reflect.defineMetadata('validators', existingValidators, target, propertyKey);
        };
      };

      applyDecoratorsToProperty([IsOptional(), IsString()], TestClass, 'testProperty');

      const validators = Reflect.getMetadata('validators', TestClass.prototype, 'testProperty');
      expect(validators).toEqual(['isOptional', 'isString']);
    });
  });
});