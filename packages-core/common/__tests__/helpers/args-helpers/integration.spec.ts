import { Type } from '@nestjs/common';
import {
  FilterTypeRegistry,
  inferFilterType,
  GroupByArgsFrom
} from '../../../index';

// Mock filter types
class StringFilter {
  contains?: string;
  equals?: string;
}

class NumberFilter {
  gt?: number;
  lt?: number;
  equals?: number;
}

class DateFilter {
  gte?: Date;
  lte?: Date;
}

// Test entity
class Product {
  id: number;
  name: string;
  price: number;
  createdAt: Date;
  isActive: boolean;
}

// Add metadata manually for testing
Reflect.defineMetadata('design:type', Number, Product.prototype, 'id');
Reflect.defineMetadata('design:type', String, Product.prototype, 'name');
Reflect.defineMetadata('design:type', Number, Product.prototype, 'price');
Reflect.defineMetadata('design:type', Date, Product.prototype, 'createdAt');
Reflect.defineMetadata('design:type', Boolean, Product.prototype, 'isActive');

describe('Args Helpers Integration Tests', () => {
  beforeEach(() => {
    FilterTypeRegistry.register({
      StringFilter,
      NumberFilter,
      DateFilter
    });
  });

  afterEach(() => {
    FilterTypeRegistry.clear();
  });

  describe('Basic Type Inference', () => {
    it('should infer correct filter types for entity properties', () => {
      expect(inferFilterType(Product, 'name')).toBe(StringFilter);
      expect(inferFilterType(Product, 'price')).toBe(NumberFilter);
      expect(inferFilterType(Product, 'createdAt')).toBe(DateFilter);
      expect(inferFilterType(Product, 'isActive')).toBe(Boolean);
    });

    it('should respect explicit type configuration', () => {
      expect(inferFilterType(Product, 'name', StringFilter)).toBe(StringFilter);
      expect(inferFilterType(Product, 'price', { type: NumberFilter })).toBe(NumberFilter);
    });
  });

  describe('FilterTypeRegistry', () => {
    it('should register and retrieve filter types', () => {
      expect(FilterTypeRegistry.getStringFilter()).toBe(StringFilter);
      expect(FilterTypeRegistry.getNumberFilter()).toBe(NumberFilter);
      expect(FilterTypeRegistry.getDateFilter()).toBe(DateFilter);
      expect(FilterTypeRegistry.isRegistered()).toBe(true);
    });

    it('should throw when types not registered', () => {
      FilterTypeRegistry.clear();
      expect(() => FilterTypeRegistry.getStringFilter()).toThrow();
      expect(FilterTypeRegistry.isRegistered()).toBe(false);
    });
  });

  describe('GroupByArgsFrom Mixin', () => {
    class FindProductArgs {
      where?: any = undefined;
      orderBy?: any = undefined;
      take?: number = undefined;
    }

    it('should create GroupBy class with available fields', () => {
      const ProductGroupBy = GroupByArgsFrom({
        findArgsType: FindProductArgs,
        groupByFields: ['where', 'orderBy'],
        className: 'ProductGroupBy'
      });

      expect(ProductGroupBy.name).toBe('ProductGroupBy');
      
      const instance = new ProductGroupBy();
      expect(instance).toHaveProperty('where');
      expect(instance).toHaveProperty('orderBy');
    });

    it('should store correct metadata', () => {
      const ProductGroupBy = GroupByArgsFrom({
        findArgsType: FindProductArgs,
        groupByFields: ['where'],
        className: 'TestGroupBy'
      });

      const metadata = Reflect.getMetadata('groupby:config', ProductGroupBy);
      expect(metadata).toBeDefined();
      expect(metadata.sourceClass).toBe('FindProductArgs');
      expect(metadata.fields).toEqual(['where']);
    });

    it('should validate field names when they dont exist', () => {
      expect(() => {
        GroupByArgsFrom({
          findArgsType: FindProductArgs,
          groupByFields: ['totallyNonExistent']
        });
      }).toThrow('Invalid groupByFields specified');
    });
  });

  describe('Configuration Validation', () => {
    it('should validate basic field configurations', () => {
      // Test with explicit type
      expect(() => inferFilterType(Product, 'name', StringFilter)).not.toThrow();
      
      // Test with object config
      expect(() => inferFilterType(Product, 'name', { type: StringFilter })).not.toThrow();
      
      // Test with true config
      expect(() => inferFilterType(Product, 'name', true)).not.toThrow();
    });
  });
});

// Test that the main exports work
describe('Package Exports', () => {
  it('should export all necessary functions', () => {
    expect(typeof FilterTypeRegistry.register).toBe('function');
    expect(typeof inferFilterType).toBe('function');
    expect(typeof GroupByArgsFrom).toBe('function');
  });
});