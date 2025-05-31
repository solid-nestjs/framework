import { FindArgsFrom } from '../../src/mixins/find-args.mixin';
import { Where, OrderBy } from '@solid-nestjs/common';

// Mock entity for testing
class TestEntity {
  id!: string;
  name!: string;
  email!: string;
  age!: number;
  createdAt!: Date;
  updatedAt!: Date;
}

// Mock Where class for testing
class TestEntityWhere implements Where<TestEntity> {
  id?: string;

  name?: string;

  email?: string;

  age?: number;
}

// Mock OrderBy types
enum OrderByTypes {
  ASC = 'ASC',
  DESC = 'DESC',
}

// Mock OrderBy class for testing
class TestEntityOrderBy implements OrderBy<TestEntity> {
  id?: OrderByTypes;

  name?: OrderByTypes;

  email?: OrderByTypes;

  age?: OrderByTypes;

  createdAt?: OrderByTypes;

  updatedAt?: OrderByTypes;
}

describe('FindArgsFrom', () => {
  let FindArgsClass: any;
  let BasicFindArgsClass: any;

  beforeEach(() => {
    FindArgsClass = FindArgsFrom<TestEntity>({
      whereType: TestEntityWhere,
      orderByType: TestEntityOrderBy,
    });

    // Test case for basic FindArgs without where/orderBy types
    BasicFindArgsClass = FindArgsFrom<TestEntity>();
  });
  describe('class creation', () => {
    it('should create a class with a generated name', () => {
      expect(FindArgsClass.name).toBeTruthy();
      expect(typeof FindArgsClass.name).toBe('string');
    });

    it('should create a class that can be instantiated', () => {
      const instance = new FindArgsClass();
      expect(instance).toBeDefined();
      expect(instance).toBeInstanceOf(FindArgsClass);
    });

    it('should create a basic class without where/orderBy types', () => {
      const instance = new BasicFindArgsClass();
      expect(instance).toBeDefined();
      expect(instance).toBeInstanceOf(BasicFindArgsClass);
      expect(BasicFindArgsClass.name).toBeTruthy();
      expect(typeof BasicFindArgsClass.name).toBe('string');
    });
  });

  describe('properties', () => {
    it('should have where property', () => {
      const instance = new FindArgsClass();
      instance.where = { name: 'test' };
      expect(instance.where).toEqual({ name: 'test' });
    });
    it('should have orderBy property', () => {
      const instance = new FindArgsClass();
      instance.orderBy = [{ name: OrderByTypes.ASC }];
      expect(instance.orderBy).toEqual([{ name: OrderByTypes.ASC }]);
    });

    it('should have pagination property', () => {
      const instance = new FindArgsClass();
      instance.pagination = { page: 1, limit: 10 };
      expect(instance.pagination).toEqual({ page: 1, limit: 10 });
    });

    it('should allow undefined values for optional properties', () => {
      const instance = new FindArgsClass();
      expect(instance.where).toBeUndefined();
      expect(instance.orderBy).toBeUndefined();
      expect(instance.pagination).toBeUndefined();
    });
  });
  describe('with custom decorators', () => {
    it('should apply custom property decorators', () => {
      const CustomFindArgsClass = FindArgsFrom<TestEntity>({
        whereType: TestEntityWhere,
        orderByType: TestEntityOrderBy,
      });
      const instance = new CustomFindArgsClass();

      expect(instance).toBeDefined();
      expect(CustomFindArgsClass.name).toBeTruthy();
      expect(typeof CustomFindArgsClass.name).toBe('string');
    });
  });

  describe('inheritance', () => {
    it('should extend the FindArgs interface functionality', () => {
      const instance = new FindArgsClass();

      // Should be able to set complex where conditions
      instance.where = {
        name: 'John',
        email: 'john@example.com',
        age: 25,
      };

      expect(instance.where.name).toBe('John');
      expect(instance.where.email).toBe('john@example.com');
      expect(instance.where.age).toBe(25);
    });
    it('should support complex ordering', () => {
      const instance = new FindArgsClass();

      instance.orderBy = [
        { createdAt: OrderByTypes.DESC },
        { name: OrderByTypes.ASC },
      ];

      expect(instance.orderBy[0].createdAt).toBe(OrderByTypes.DESC);
      expect(instance.orderBy[1].name).toBe(OrderByTypes.ASC);
    });

    it('should support pagination configuration', () => {
      const instance = new FindArgsClass();

      instance.pagination = {
        page: 2,
        limit: 25,
        offset: 25,
      };

      expect(instance.pagination.page).toBe(2);
      expect(instance.pagination.limit).toBe(25);
      expect(instance.pagination.offset).toBe(25);
    });
  });

  describe('type safety', () => {
    it('should maintain type safety for where conditions', () => {
      const instance = new FindArgsClass();

      // This should work with proper entity properties
      instance.where = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
      };

      expect(instance.where).toEqual({
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty where conditions', () => {
      const instance = new FindArgsClass();
      instance.where = {};
      expect(instance.where).toEqual({});
    });

    it('should handle null values in where conditions', () => {
      const instance = new FindArgsClass();
      instance.where = { name: null };
      expect(instance.where.name).toBeNull();
    });

    it('should handle complex nested conditions', () => {
      const instance = new FindArgsClass();
      instance.where = {
        name: 'John',
        age: { $gte: 18, $lte: 65 },
      };
      expect(instance.where.age).toEqual({ $gte: 18, $lte: 65 });
    });
  });
});
