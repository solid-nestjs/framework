import { Test, TestingModule } from '@nestjs/testing';
import {
  Mutation,
  Resolver,
  ObjectType,
  Field,
  InputType,
} from '@nestjs/graphql';
import {
  CrudService,
  SoftDeletableCrudService,
  Entity,
  FindArgs,
  CurrentContext,
  DeepPartial,
  BooleanType,
  If,
  NotNullableIf,
  Where,
} from '@solid-nestjs/common';
import { CrudResolverFrom } from '../../src/mixins/crud-resolver.mixin';
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

// Mock input types
@InputType()
class TestCreateInput {
  name!: string;

  email!: string;
}

@InputType()
class TestUpdateInput {
  name?: string;

  email?: string;
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

// Mock crud service
class MockCrudService
  implements
    CrudService<
      string,
      TestEntity,
      TestCreateInput,
      TestUpdateInput,
      TestContext
    >
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

    if (id === '2') {
      return {
        id: '2',
        name: 'Test User 2',
        email: 'test2@example.com',
        createdAt: new Date('2023-01-02'),
        updatedAt: new Date('2023-01-02'),
      } as any;
    }

    if (orFail) {
      throw new Error('Entity not found');
    }

    return null as any;
  }

  async create(
    context: TestContext,
    createInput: TestCreateInput,
  ): Promise<TestEntity> {
    return {
      id: '3',
      name: createInput.name,
      email: createInput.email,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async update(
    context: TestContext,
    id: string,
    updateInput: TestUpdateInput,
  ): Promise<TestEntity> {
    const existing = await this.findOne(context, id, false);
    if (!existing) {
      throw new Error('Entity not found');
    }
    return {
      ...existing,
      ...updateInput,
      updatedAt: new Date(),
    };
  }

  async remove(context: TestContext, id: string): Promise<TestEntity> {
    const existing = await this.findOne(context, id, false);
    if (!existing) {
      throw new Error('Entity not found');
    }
    return {
      ...existing,
      deletedAt: new Date(),
    };
  }

  async hardRemove(context: TestContext, id: string): Promise<TestEntity> {
    const existing = await this.findOne(context, id, false);
    if (!existing) {
      throw new Error('Entity not found');
    }
    return existing;
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

  // Required methods to satisfy CrudService interface
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

// Mock soft deletable crud service - extends SoftDeletableCrudService for testing soft deletion operations
class MockSoftDeletableCrudService
  extends MockCrudService
  implements
    SoftDeletableCrudService<
      string,
      TestEntity,
      TestCreateInput,
      TestUpdateInput,
      TestContext
    >
{
  async softRemove(context: TestContext, id: string): Promise<TestEntity> {
    const existing = await this.findOne(context, id, false);
    if (!existing) {
      throw new Error('Entity not found');
    }
    return {
      ...existing,
      deletedAt: new Date(),
    };
  }

  async recover(context: TestContext, id: string): Promise<TestEntity> {
    const existing = await this.findOne(context, id, false);
    if (!existing) {
      throw new Error('Entity not found');
    }
    const recovered = { ...existing };
    delete (recovered as any).deletedAt;
    return recovered;
  }
}

describe('CrudResolverFrom', () => {
  let resolver: any;
  let service: MockCrudService;
  let module: TestingModule;

  beforeEach(async () => {
    service = new MockCrudService();

    const CrudResolverClass = CrudResolverFrom({
      entityType: TestEntity,
      createInputType: TestCreateInput,
      updateInputType: TestUpdateInput,
      serviceType: MockCrudService,
      findArgsType: TestFindArgsClass,
      operations: {
        findAll: true,
        findOne: true,
        pagination: true,
        create: true,
        update: true,
        remove: true,
      },
    });

    module = await Test.createTestingModule({
      providers: [
        CrudResolverClass,
        {
          provide: MockCrudService,
          useValue: service,
        },
      ],
    }).compile();

    resolver = module.get(CrudResolverClass);
  });

  afterEach(async () => {
    await module.close();
  });

  describe('inherited query operations', () => {
    it('should inherit findAll from DataResolver', async () => {
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
    });

    it('should inherit findOne from DataResolver', async () => {
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
    it('should inherit pagination from DataResolver', async () => {
      const context: TestContext = { userId: 'test-user' };
      const args: TestFindArgs = {
        pagination: { page: 1, limit: 10 },
      };

      const result = await resolver.pagination(context, args);

      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('count');
      expect(result).toHaveProperty('page');
      expect(result).toHaveProperty('limit');
      expect(result).toHaveProperty('pageCount');
      expect(result).toHaveProperty('hasNextPage');
      expect(result).toHaveProperty('hasPreviousPage');
      expect(result.total).toBe(2);
    });
  });

  describe('create', () => {
    it('should create a new entity', async () => {
      const context: TestContext = { userId: 'test-user' };
      const input: TestCreateInput = {
        name: 'New User',
        email: 'new@example.com',
      };

      const result = await resolver.create(context, input);

      expect(result).toEqual(
        expect.objectContaining({
          id: '3',
          name: 'New User',
          email: 'new@example.com',
        }),
      );
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    it('should handle create with minimal input', async () => {
      const context: TestContext = { userId: 'test-user' };
      const input: TestCreateInput = {
        name: 'Minimal User',
        email: 'minimal@example.com',
      };

      const result = await resolver.create(context, input);

      expect(result.name).toBe('Minimal User');
      expect(result.email).toBe('minimal@example.com');
    });

    it('should handle empty context', async () => {
      const context: TestContext = {};
      const input: TestCreateInput = {
        name: 'Test User',
        email: 'test@example.com',
      };

      const result = await resolver.create(context, input);

      expect(result).toEqual(
        expect.objectContaining({
          name: 'Test User',
          email: 'test@example.com',
        }),
      );
    });
  });
  describe('update', () => {
    it('should update an existing entity', async () => {
      const context: TestContext = { userId: 'test-user' };
      const id: string = '1';
      const input: TestUpdateInput = {
        name: 'Updated User',
      };

      const result = await resolver.update(context, id, input);

      expect(result).toEqual(
        expect.objectContaining({
          id: '1',
          name: 'Updated User',
          email: 'test1@example.com',
        }),
      );
      expect(result.updatedAt).toBeDefined();
    });

    it('should handle partial updates', async () => {
      const context: TestContext = { userId: 'test-user' };
      const id: string = '1';
      const input: TestUpdateInput = {
        email: 'updated@example.com',
      };

      const result = await resolver.update(context, id, input);

      expect(result.email).toBe('updated@example.com');
      expect(result.name).toBe('Test User 1'); // Should preserve existing values
    });

    it('should throw error for non-existent entity', async () => {
      const context: TestContext = { userId: 'test-user' };
      const input: TestUpdateInput & { id: string } = {
        id: '999',
        name: 'Updated User',
      };

      await expect(resolver.update(context, input)).rejects.toThrow(
        'Entity not found',
      );
    });

    it('should handle empty update input', async () => {
      const context: TestContext = { userId: 'test-user' };
      const id: string = '1';
      const input: TestUpdateInput = {};

      const result = await resolver.update(context, id, input);

      expect(result.id).toBe('1');
      expect(result.name).toBe('Test User 1'); // Should preserve all existing values
    });
  });

  describe('remove', () => {
    it('should soft remove an entity', async () => {
      const context: TestContext = { userId: 'test-user' };

      const result = await resolver.remove(context, '1');

      expect(result).toEqual(
        expect.objectContaining({
          id: '1',
          name: 'Test User 1',
          email: 'test1@example.com',
        }),
      );
      expect(result.deletedAt).toBeDefined();
    });

    it('should throw error for non-existent entity', async () => {
      const context: TestContext = { userId: 'test-user' };

      await expect(resolver.remove(context, '999')).rejects.toThrow(
        'Entity not found',
      );
    });

    it('should handle empty context', async () => {
      const context: TestContext = {};

      const result = await resolver.remove(context, '1');

      expect(result.id).toBe('1');
      expect(result.deletedAt).toBeDefined();
    });
  });

  describe('hardRemove (when enabled)', () => {
    let hardRemoveResolver: any;
    let softDeletableService: MockSoftDeletableCrudService;

    beforeEach(async () => {
      softDeletableService = new MockSoftDeletableCrudService();

      const CrudResolverClass = CrudResolverFrom({
        entityType: TestEntity,
        createInputType: TestCreateInput,
        updateInputType: TestUpdateInput,
        serviceType: MockSoftDeletableCrudService,
        operations: {
          hardRemove: true, // explicitly enabled
        },
      });

      const module = await Test.createTestingModule({
        providers: [
          CrudResolverClass,
          {
            provide: MockSoftDeletableCrudService,
            useValue: softDeletableService,
          },
        ],
      }).compile();

      hardRemoveResolver = module.get(CrudResolverClass);
    });

    it('should permanently remove an entity when hardRemove is enabled', async () => {
      const context: TestContext = { userId: 'test-user' };

      const result = await hardRemoveResolver.hardRemove(context, '1');

      expect(result).toEqual(
        expect.objectContaining({
          id: '1',
          name: 'Test User 1',
          email: 'test1@example.com',
        }),
      );
      expect(result.deletedAt).toBeUndefined(); // Hard remove doesn't set deletedAt
    });

    it('should throw error for non-existent entity in hardRemove', async () => {
      const context: TestContext = { userId: 'test-user' };

      await expect(
        hardRemoveResolver.hardRemove(context, '999'),
      ).rejects.toThrow('Entity not found');
    });
  });
  describe('GraphQL decorators', () => {
    it('should have @Mutation decorators on methods', () => {
      const CrudResolverClass = CrudResolverFrom({
        entityType: TestEntity,
        createInputType: TestCreateInput,
        updateInputType: TestUpdateInput,
        serviceType: MockCrudService,
      });

      // Check that mutation methods exist and are functions
      expect(CrudResolverClass.prototype.create).toBeDefined();
      expect(typeof CrudResolverClass.prototype.create).toBe('function');
      expect(CrudResolverClass.prototype.update).toBeDefined();
      expect(typeof CrudResolverClass.prototype.update).toBe('function');
      expect(CrudResolverClass.prototype.remove).toBeDefined();
      expect(typeof CrudResolverClass.prototype.remove).toBe('function');
    });

    it('should have @Resolver decorator on class', () => {
      const CrudResolverClass = CrudResolverFrom({
        entityType: TestEntity,
        createInputType: TestCreateInput,
        updateInputType: TestUpdateInput,
        serviceType: MockCrudService,
      });

      const resolverMetadata = Reflect.getMetadata(
        'graphql:resolver_type',
        CrudResolverClass,
      );
      expect(resolverMetadata).toBeDefined();
    });
  });
});

describe('CrudResolverFrom with disabled operations', () => {
  let resolver: any;
  let service: MockCrudService;
  let module: TestingModule;

  beforeEach(async () => {
    service = new MockCrudService();

    const CrudResolverClass = CrudResolverFrom({
      entityType: TestEntity,
      createInputType: TestCreateInput,
      updateInputType: TestUpdateInput,
      serviceType: MockCrudService,
      operations: {
        create: false,
        update: true,
        remove: false,
      },
    });

    module = await Test.createTestingModule({
      providers: [
        CrudResolverClass,
        {
          provide: MockCrudService,
          useValue: service,
        },
      ],
    }).compile();

    resolver = module.get(CrudResolverClass);
  });

  afterEach(async () => {
    await module.close();
  });

  it('should not have create method when disabled', () => {
    expect(resolver.create).toBeUndefined();
  });

  it('should have update method when enabled', () => {
    expect(resolver.update).toBeDefined();
  });

  it('should not have remove method when disabled', () => {
    expect(resolver.remove).toBeUndefined();
  });

  it('should not have hardRemove method when disabled', () => {
    expect(resolver.hardRemove).toBeUndefined();
  });
});

describe('CrudResolverFrom with custom method decorators', () => {
  it('should apply custom method decorators', () => {
    const customMutationDecorator =
      () =>
      (
        target: any,
        propertyKey: string | symbol,
        descriptor: PropertyDescriptor,
      ) => {
        // Mark the method as having been decorated
        Reflect.defineMetadata(
          'custom:mutation_decorated',
          true,
          target,
          propertyKey,
        );
      };

    const CrudResolverClass = CrudResolverFrom({
      entityType: TestEntity,
      createInputType: TestCreateInput,
      updateInputType: TestUpdateInput,
      serviceType: MockCrudService,
      operations: {
        create: {
          decorators: [customMutationDecorator],
        },
      },
    });

    expect(CrudResolverClass).toBeDefined();
    expect(typeof CrudResolverClass).toBe('function');

    // Verify custom decorator was applied
    const isMethodDecorated = Reflect.getMetadata(
      'custom:mutation_decorated',
      CrudResolverClass.prototype,
      'create',
    );
    expect(isMethodDecorated).toBe(true);
  });
});

// Test soft deletion operations
describe('CrudResolverFrom with soft deletion operations', () => {
  let softDeletableResolver: any;
  let softDeletableService: MockSoftDeletableCrudService;
  let module: TestingModule;

  beforeEach(async () => {
    softDeletableService = new MockSoftDeletableCrudService();

    const CrudResolverClass = CrudResolverFrom({
      entityType: TestEntity,
      createInputType: TestCreateInput,
      updateInputType: TestUpdateInput,
      serviceType: MockSoftDeletableCrudService,
      operations: {
        findAll: true,
        findOne: true,
        create: true,
        update: true,
        remove: true,
        softRemove: true,
        recover: true,
        hardRemove: true,
      },
    });

    module = await Test.createTestingModule({
      providers: [
        CrudResolverClass,
        {
          provide: MockSoftDeletableCrudService,
          useValue: softDeletableService,
        },
      ],
    }).compile();

    softDeletableResolver = module.get(CrudResolverClass);
  });

  afterEach(async () => {
    await module.close();
  });

  describe('softRemove', () => {
    it('should soft remove an entity', async () => {
      const context: TestContext = { userId: 'test-user' };

      const result = await softDeletableResolver.softRemove(context, '1');

      expect(result).toEqual(
        expect.objectContaining({
          id: '1',
          name: 'Test User 1',
          email: 'test1@example.com',
        }),
      );
      expect(result.deletedAt).toBeDefined();
    });

    it('should throw error for non-existent entity in softRemove', async () => {
      const context: TestContext = { userId: 'test-user' };

      await expect(
        softDeletableResolver.softRemove(context, '999'),
      ).rejects.toThrow('Entity not found');
    });

    it('should call service softRemove method', async () => {
      const context: TestContext = { userId: 'test-user' };
      const spy = jest.spyOn(softDeletableService, 'softRemove');

      await softDeletableResolver.softRemove(context, '1');

      expect(spy).toHaveBeenCalledWith(context, '1');
    });
  });

  describe('recover', () => {
    it('should recover a soft-deleted entity', async () => {
      const context: TestContext = { userId: 'test-user' };

      const result = await softDeletableResolver.recover(context, '1');

      expect(result).toEqual(
        expect.objectContaining({
          id: '1',
          name: 'Test User 1',
          email: 'test1@example.com',
        }),
      );
      expect(result.deletedAt).toBeUndefined();
    });

    it('should throw error for non-existent entity in recover', async () => {
      const context: TestContext = { userId: 'test-user' };

      await expect(
        softDeletableResolver.recover(context, '999'),
      ).rejects.toThrow('Entity not found');
    });

    it('should call service recover method', async () => {
      const context: TestContext = { userId: 'test-user' };
      const spy = jest.spyOn(softDeletableService, 'recover');

      await softDeletableResolver.recover(context, '1');

      expect(spy).toHaveBeenCalledWith(context, '1');
    });
  });

  describe('hardRemove', () => {
    it('should permanently remove an entity', async () => {
      const context: TestContext = { userId: 'test-user' };

      const result = await softDeletableResolver.hardRemove(context, '1');

      expect(result).toEqual(
        expect.objectContaining({
          id: '1',
          name: 'Test User 1',
          email: 'test1@example.com',
        }),
      );
      expect(result.deletedAt).toBeUndefined();
    });

    it('should throw error for non-existent entity in hardRemove', async () => {
      const context: TestContext = { userId: 'test-user' };

      await expect(
        softDeletableResolver.hardRemove(context, '999'),
      ).rejects.toThrow('Entity not found');
    });

    it('should call service hardRemove method', async () => {
      const context: TestContext = { userId: 'test-user' };
      const spy = jest.spyOn(softDeletableService, 'hardRemove');

      await softDeletableResolver.hardRemove(context, '1');

      expect(spy).toHaveBeenCalledWith(context, '1');
    });
  });

  describe('operation validation', () => {
    // Create a truly basic service without soft deletion methods for testing validation
    class BasicCrudService extends MockCrudService {
      // Remove hardRemove to make isSoftDeletableCrudService return false
      hardRemove = undefined as any;
      softRemove = undefined as any;
      recover = undefined as any;
    }

    it('should throw error when softRemove is called on non-soft-deletable service', async () => {
      const basicService = new BasicCrudService();
      // Create resolver with soft-deletable service type but inject basic service
      const CrudResolverClass = CrudResolverFrom({
        entityType: TestEntity,
        createInputType: TestCreateInput,
        updateInputType: TestUpdateInput,
        serviceType: MockSoftDeletableCrudService,
        operations: {
          softRemove: true,
        },
      });

      const basicModule = await Test.createTestingModule({
        providers: [
          CrudResolverClass,
          {
            provide: MockSoftDeletableCrudService,
            useValue: basicService, // Inject basic service at runtime
          },
        ],
      }).compile();

      const basicResolver = basicModule.get(CrudResolverClass);
      const context: TestContext = { userId: 'test-user' };

      await expect(basicResolver.softRemove!(context, '1')).rejects.toThrow(
        'Soft remove operation is not supported by this service',
      );

      await basicModule.close();
    });

    it('should throw error when recover is called on non-soft-deletable service', async () => {
      const basicService = new BasicCrudService();
      // Create resolver with soft-deletable service type but inject basic service
      const CrudResolverClass = CrudResolverFrom({
        entityType: TestEntity,
        createInputType: TestCreateInput,
        updateInputType: TestUpdateInput,
        serviceType: MockSoftDeletableCrudService,
        operations: {
          recover: true,
        },
      });

      const basicModule = await Test.createTestingModule({
        providers: [
          CrudResolverClass,
          {
            provide: MockSoftDeletableCrudService,
            useValue: basicService, // Inject basic service at runtime
          },
        ],
      }).compile();

      const basicResolver = basicModule.get(CrudResolverClass);
      const context: TestContext = { userId: 'test-user' };

      await expect(basicResolver.recover!(context, '1')).rejects.toThrow(
        'Recover operation is not supported by this service',
      );

      await basicModule.close();
    });

    it('should throw error when hardRemove is called on non-soft-deletable service', async () => {
      const basicService = new BasicCrudService();
      // Create resolver with soft-deletable service type but inject basic service
      const CrudResolverClass = CrudResolverFrom({
        entityType: TestEntity,
        createInputType: TestCreateInput,
        updateInputType: TestUpdateInput,
        serviceType: MockSoftDeletableCrudService,
        operations: {
          hardRemove: true,
        },
      });

      const basicModule = await Test.createTestingModule({
        providers: [
          CrudResolverClass,
          {
            provide: MockSoftDeletableCrudService,
            useValue: basicService, // Inject basic service at runtime
          },
        ],
      }).compile();

      const basicResolver = basicModule.get(CrudResolverClass);
      const context: TestContext = { userId: 'test-user' };

      await expect(basicResolver.hardRemove!(context, '1')).rejects.toThrow(
        'Hard remove operation is not supported by this service',
      );

      await basicModule.close();
    });
  });
});

describe('CrudResolverFrom with disabled soft deletion operations', () => {
  let resolverWithoutSoftDeletion: any;
  let softDeletableService: MockSoftDeletableCrudService;
  let module: TestingModule;

  beforeEach(async () => {
    softDeletableService = new MockSoftDeletableCrudService();

    const CrudResolverClass = CrudResolverFrom({
      entityType: TestEntity,
      createInputType: TestCreateInput,
      updateInputType: TestUpdateInput,
      serviceType: MockSoftDeletableCrudService,
      operations: {
        findAll: true,
        findOne: true,
        create: true,
        update: true,
        remove: true,
        softRemove: false,
        recover: false,
        hardRemove: false,
      },
    });

    module = await Test.createTestingModule({
      providers: [
        CrudResolverClass,
        {
          provide: MockSoftDeletableCrudService,
          useValue: softDeletableService,
        },
      ],
    }).compile();

    resolverWithoutSoftDeletion = module.get(CrudResolverClass);
  });

  afterEach(async () => {
    await module.close();
  });

  describe('disabled operations', () => {
    it('should not have soft deletion operations when disabled', () => {
      expect(resolverWithoutSoftDeletion.softRemove).toBeUndefined();
      expect(resolverWithoutSoftDeletion.recover).toBeUndefined();
      expect(resolverWithoutSoftDeletion.hardRemove).toBeUndefined();
    });
  });
});
