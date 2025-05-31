import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, ValidationPipe, Injectable } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  DataService,
  Entity,
  FindArgs,
  CurrentContext,
  BooleanType,
  If,
  NotNullableIf,
  Where,
} from '@solid-nestjs/common';
import { DataControllerFrom } from '../../src/mixins/data-controller.mixin';
import { PaginationResult } from '../../src/classes';

// Mock entity for testing
class TestEntity implements Entity<string> {
  id!: string;
  name!: string;
  email!: string;
  createdAt!: Date;
  updatedAt!: Date;
}

// Mock context for testing
interface TestContext {
  userId?: string;
}

// Mock find args
interface TestFindArgs extends FindArgs<TestEntity> {
  where?: Partial<TestEntity>;
  orderBy?: any;
  pagination?: any;
}

// Mock classes for constructor references
class TestFindArgsClass implements TestFindArgs {
  where?: Partial<TestEntity>;
  orderBy?: any;
  pagination?: any;
}

class TestContextClass implements TestContext {
  userId?: string;
}

// Mock data service
@Injectable()
class MockDataService implements DataService<string, TestEntity, TestContext> {
  async findAll<TBool extends BooleanType = false>(
    context: TestContext,
    args?: FindArgs<TestEntity>,
    withPagination?: TBool,
  ): Promise<
    If<
      TBool,
      { data: TestEntity[]; pagination: PaginationResult },
      TestEntity[]
    >
  > {
    const data = [
      {
        id: '1',
        name: 'Test User 1',
        email: 'test1@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        name: 'Test User 2',
        email: 'test2@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    if (withPagination) {
      const pagination = await this.pagination(context, args);
      return { data, pagination } as any;
    }
    return data as any;
  }
  async findOne<TBool extends BooleanType = false>(
    context: TestContext,
    id: string,
    orFail?: TBool,
  ): Promise<NotNullableIf<TBool, TestEntity>> {
    if (id === '1') {
      return {
        id: '1',
        name: 'Test User 1',
        email: 'test1@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;
    }
    if (orFail) {
      throw new Error('Entity not found');
    }
    return null as any;
  }

  async pagination(
    context: TestContext,
    args?: FindArgs<TestEntity>,
  ): Promise<PaginationResult> {
    return {
      total: 2,
      count: 2,
      limit: 10,
      page: 1,
      pageCount: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    };
  }

  async findAllPaginated(
    context: TestContext,
    args?: FindArgs<TestEntity>,
  ): Promise<{ data: TestEntity[]; pagination: PaginationResult }> {
    return this.findAll(context, args, true) as Promise<{
      data: TestEntity[];
      pagination: PaginationResult;
    }>;
  }
  async findOneBy<TBool extends BooleanType = false>(
    context: TestContext,
    where: Where<TestEntity>,
    orFail?: TBool,
  ): Promise<NotNullableIf<TBool, TestEntity>> {
    // Simple mock implementation
    return this.findOne(context, '1', orFail);
  }

  async runInTransaction<ReturnType>(
    context: TestContext,
    fn: (context: TestContext) => Promise<ReturnType>,
  ): Promise<ReturnType> {
    return fn(context);
  }

  async audit(
    context: TestContext,
    action: string,
    objectId?: string,
    valueBefore?: object,
    valueAfter?: object,
  ): Promise<void> {
    // Mock implementation - do nothing
  }
}

describe('DataControllerFrom', () => {
  let controller: any;
  let service: MockDataService;
  beforeEach(async () => {
    service = new MockDataService();
    const controllerStructure = {
      entityType: TestEntity,
      serviceType: MockDataService,
      findArgsType: TestFindArgsClass,
      contextType: TestContextClass,
      route: 'test',
      operations: {
        findAll: true,
        findOne: true,
        pagination: true,
        findAllPaginated: true,
      },
    };

    const ControllerClass = DataControllerFrom(controllerStructure);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ControllerClass],
      providers: [
        {
          provide: MockDataService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<any>(ControllerClass);
  });

  describe('findAll', () => {
    it('should return all entities', async () => {
      const context: TestContext = { userId: 'test-user' };
      const args: TestFindArgs = { where: { name: 'Test' } };

      const result = await controller.findAll(context, args);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(
        expect.objectContaining({
          id: '1',
          name: 'Test User 1',
          email: 'test1@example.com',
        }),
      );
    });

    it('should handle empty args', async () => {
      const context: TestContext = { userId: 'test-user' };

      const result = await controller.findAll(context, undefined);

      expect(result).toHaveLength(2);
    });
  });

  describe('findOne', () => {
    it('should return a single entity by id', async () => {
      const context: TestContext = { userId: 'test-user' };

      const result = await controller.findOne(context, '1');

      expect(result).toEqual(
        expect.objectContaining({
          id: '1',
          name: 'Test User 1',
          email: 'test1@example.com',
        }),
      );
    });
    it('should throw error for non-existent id', async () => {
      const context: TestContext = { userId: 'test-user' };

      await expect(controller.findOne(context, '999')).rejects.toThrow(
        'Entity not found',
      );
    });
  });

  describe('pagination', () => {
    it('should return pagination information', async () => {
      const context: TestContext = { userId: 'test-user' };
      const args: TestFindArgs = { pagination: { page: 1, limit: 10 } };

      const result = await controller.pagination(context, args);

      expect(result).toEqual(
        expect.objectContaining({
          total: 2,
          count: 2,
          limit: 10,
          page: 1,
          pageCount: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        }),
      );
    });
  });

  describe('findAllPaginated', () => {
    it('should return data with pagination', async () => {
      const context: TestContext = { userId: 'test-user' };
      const args: TestFindArgs = { pagination: { page: 1, limit: 10 } };

      const result = await controller.findAllPaginated(context, args);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(result.data).toHaveLength(2);
      expect(result.pagination).toEqual(
        expect.objectContaining({
          total: 2,
          count: 2,
          page: 1,
        }),
      );
    });
  });
  describe('controller metadata', () => {
    it('should create a valid controller class', () => {
      const controllerStructure = {
        entityType: TestEntity,
        serviceType: MockDataService,
        findArgsType: TestFindArgsClass,
        contextType: TestContextClass,
        route: 'test',
        operations: {
          findAll: true,
          findOne: true,
          pagination: true,
          findAllPaginated: true,
        },
      };

      const ControllerClass = DataControllerFrom(controllerStructure);

      // Verify that a controller class was created
      expect(ControllerClass).toBeDefined();
      expect(typeof ControllerClass).toBe('function');

      // Verify that the controller has the expected methods
      const instance = new ControllerClass();
      expect(typeof instance.findAll).toBe('function');
      expect(typeof instance.findOne).toBe('function');
      expect(typeof instance.pagination).toBe('function');
      expect(typeof instance.findAllPaginated).toBe('function');
    });
  });
});
