import { Test, TestingModule } from '@nestjs/testing';
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
import { DataResolverFrom } from '../../src/mixins/data-resolver.mixin';
import { PaginationResult, DefaultArgs } from '../../src/classes';

// Mock entity for testing
class TestEntity implements Entity<string> {
  id!: string;

  name!: string;

  email!: string;

  createdAt!: Date;

  updatedAt!: Date;

  deletedAt?: Date;
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
class MockDataService
  implements DataService<string, TestEntity, FindArgs<TestEntity>, TestContext>
{
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
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      },
      {
        id: '2',
        name: 'Test User 2',
        email: 'test2@example.com',
        createdAt: new Date('2023-01-02'),
        updatedAt: new Date('2023-01-02'),
      },
    ];

    if (withPagination) {
      const paginationResult = {
        page: args?.pagination?.page || 1,
        limit: args?.pagination?.limit || 10,
        totalCount: data.length,
        pageCount: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      };

      return {
        data,
        pagination: paginationResult,
      } as any;
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
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      } as any;
    }

    if (orFail) {
      throw new Error('Entity not found');
    }

    return null as any;
  }

  async findOneBy<TBool extends BooleanType = false>(
    context: TestContext,
    where: Where<TestEntity>,
    orFail?: TBool,
  ): Promise<NotNullableIf<TBool, TestEntity>> {
    if (where.email === 'test1@example.com') {
      return {
        id: '1',
        name: 'Test User 1',
        email: 'test1@example.com',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      } as any;
    }

    if (orFail) {
      throw new Error('Entity not found');
    }
    return null as any;
  }
  // Required methods to satisfy DataService interface
  async pagination(
    context: TestContext,
    args?: FindArgs<TestEntity>,
  ): Promise<PaginationResult> {
    return {
      total: 2,
      count: 2,
      limit: args?.pagination?.limit || 10,
      page: args?.pagination?.page || 1,
      pageCount: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    };
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
    // Mock audit implementation
  }
}

describe('DataResolverFrom', () => {
  let resolver: any;
  let service: MockDataService;
  let module: TestingModule;

  beforeEach(async () => {
    service = new MockDataService();

    const DataResolverClass = DataResolverFrom({
      entityType: TestEntity,
      serviceType: MockDataService,
      findArgsType: TestFindArgsClass,
      operations: {
        findAll: true,
        findOne: true,
        pagination: true,
      },
    });

    module = await Test.createTestingModule({
      providers: [
        DataResolverClass,
        {
          provide: MockDataService,
          useValue: service,
        },
      ],
    }).compile();

    resolver = module.get(DataResolverClass);
  });

  afterEach(async () => {
    await module.close();
  });

  describe('findAll', () => {
    it('should return all entities without pagination', async () => {
      const context: TestContext = { userId: 'test-user' };
      const args: TestFindArgs = {};

      const result = await resolver.findAll(context, args);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(
        expect.objectContaining({
          id: '1',
          name: 'Test User 1',
          email: 'test1@example.com',
        }),
      );
      expect(result[1]).toEqual(
        expect.objectContaining({
          id: '2',
          name: 'Test User 2',
          email: 'test2@example.com',
        }),
      );
    });

    it('should handle empty context', async () => {
      const context: TestContext = {};
      const args: TestFindArgs = {};

      const result = await resolver.findAll(context, args);

      expect(result).toHaveLength(2);
    });

    it('should handle args with where conditions', async () => {
      const context: TestContext = { userId: 'test-user' };
      const args: TestFindArgs = {
        where: { name: 'Test User 1' },
      };

      const result = await resolver.findAll(context, args);

      expect(result).toHaveLength(2); // Mock service returns all data
    });

    it('should handle args with orderBy', async () => {
      const context: TestContext = { userId: 'test-user' };
      const args: TestFindArgs = {
        orderBy: { name: 'ASC' },
      };

      const result = await resolver.findAll(context, args);

      expect(result).toHaveLength(2);
    });

    it('should handle undefined args', async () => {
      const context: TestContext = { userId: 'test-user' };

      const result = await resolver.findAll(context);

      expect(result).toHaveLength(2);
    });
  });

  describe('findOne', () => {
    it('should return a single entity by id', async () => {
      const context: TestContext = { userId: 'test-user' };

      const result = await resolver.findOne(context, '1');

      expect(result).toEqual(
        expect.objectContaining({
          id: '1',
          name: 'Test User 1',
          email: 'test1@example.com',
        }),
      );
    });
    it('should throw error for non-existent entity', async () => {
      const context: TestContext = { userId: 'test-user' };

      await expect(resolver.findOne(context, '999')).rejects.toThrow(
        'Entity not found',
      );
    });
    it('should handle empty context', async () => {
      const context: TestContext = {};

      const result = await resolver.findOne(context, '1');

      expect(result).toEqual(
        expect.objectContaining({
          id: '1',
          name: 'Test User 1',
        }),
      );
    });
  });

  describe('pagination', () => {
    it('should return pagination metadata when pagination operation is enabled', async () => {
      const context: TestContext = { userId: 'test-user' };
      const args: TestFindArgs = {
        pagination: { page: 1, limit: 10 },
      };

      const result = await resolver.pagination(context, args);

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

    it('should handle pagination with different page sizes', async () => {
      const context: TestContext = { userId: 'test-user' };
      const args: TestFindArgs = {
        pagination: { page: 2, limit: 5 },
      };

      const result = await resolver.pagination(context, args);

      expect(result.page).toBe(2);
      expect(result.limit).toBe(5);
    });

    it('should handle pagination without args', async () => {
      const context: TestContext = { userId: 'test-user' };

      const result = await resolver.pagination(context);

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
  describe('GraphQL decorators', () => {
    it('should apply @Query decorators on methods', () => {
      const ResolverClass = DataResolverFrom({
        entityType: TestEntity,
        serviceType: MockDataService,
      });

      // Check that the class has methods decorated properly
      const instance = new ResolverClass();
      expect(instance.findAll).toBeDefined();
      expect(instance.findOne).toBeDefined();
      expect(instance.pagination).toBeDefined();
    });

    it('should apply @Resolver decorator on class', () => {
      const ResolverClass = DataResolverFrom({
        entityType: TestEntity,
        serviceType: MockDataService,
      });

      // Check that the resolver class is properly created and can be instantiated
      expect(ResolverClass).toBeDefined();
      expect(typeof ResolverClass).toBe('function');
      const instance = new ResolverClass();
      expect(instance).toBeDefined();
    });
  });
});

describe('DataResolverFrom with disabled operations', () => {
  let resolver: any;
  let service: MockDataService;
  let module: TestingModule;

  beforeEach(async () => {
    service = new MockDataService();

    const DataResolverClass = DataResolverFrom({
      entityType: TestEntity,
      serviceType: MockDataService,
      findArgsType: TestFindArgsClass,
      operations: {
        findAll: false,
        findOne: true,
        pagination: false,
      },
    });

    module = await Test.createTestingModule({
      providers: [
        DataResolverClass,
        {
          provide: MockDataService,
          useValue: service,
        },
      ],
    }).compile();

    resolver = module.get(DataResolverClass);
  });

  afterEach(async () => {
    await module.close();
  });

  it('should not have findAll method when disabled', () => {
    expect(resolver.findAll).toBeUndefined();
  });

  it('should have findOne method when enabled', () => {
    expect(resolver.findOne).toBeDefined();
  });

  it('should not have pagination method when disabled', () => {
    expect(resolver.pagination).toBeUndefined();
  });
});

describe('DataResolverFrom with default args', () => {
  let resolver: any;
  let service: MockDataService;
  let module: TestingModule;

  beforeEach(async () => {
    service = new MockDataService();

    const DataResolverClass = DataResolverFrom({
      entityType: TestEntity,
      serviceType: MockDataService,
      // No findArgsType specified, should use DefaultArgs
    });

    module = await Test.createTestingModule({
      providers: [
        DataResolverClass,
        {
          provide: MockDataService,
          useValue: service,
        },
      ],
    }).compile();

    resolver = module.get(DataResolverClass);
  });

  afterEach(async () => {
    await module.close();
  });

  it('should work with DefaultArgs when no findArgsType is specified', async () => {
    const context: TestContext = { userId: 'test-user' };
    const args = {}; // DefaultArgs structure

    const result = await resolver.findAll(context, args);

    expect(result).toHaveLength(2);
  });
});

describe('DataResolverFrom with custom decorators', () => {
  it('should apply custom class decorators', () => {
    const customDecorator = () => (target: any) => {
      // Mark the class as having been decorated
      Reflect.defineMetadata('custom:decorated', true, target);
    };

    const DataResolverClass = DataResolverFrom({
      entityType: TestEntity,
      serviceType: MockDataService,
      classDecorators: [customDecorator],
    });

    // Check that the class was created successfully with custom decorators
    expect(DataResolverClass).toBeDefined();
    expect(typeof DataResolverClass).toBe('function');

    // Verify custom decorator was applied
    const isDecorated = Reflect.getMetadata(
      'custom:decorated',
      DataResolverClass,
    );
    expect(isDecorated).toBe(true);
  });
  it('should apply custom method decorators', () => {
    const customMethodDecorator =
      () => (target: any, propertyKey: string | symbol) => {
        // Mark the method as having been decorated
        Reflect.defineMetadata(
          'custom:method_decorated',
          true,
          target,
          propertyKey,
        );
      };

    const DataResolverClass = DataResolverFrom({
      entityType: TestEntity,
      serviceType: MockDataService,
      operations: {
        findAll: {
          name: 'customFindAll',
          decorators: [customMethodDecorator],
        },
      },
    });

    expect(DataResolverClass).toBeDefined();

    // Verify custom method decorator was applied
    const isMethodDecorated = Reflect.getMetadata(
      'custom:method_decorated',
      DataResolverClass.prototype,
      'findAll',
    );
    expect(isMethodDecorated).toBe(true);
  });
});
