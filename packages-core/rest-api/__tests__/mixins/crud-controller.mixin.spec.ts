import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBody } from '@nestjs/swagger';
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
import { CrudControllerFrom } from '../../src/mixins/crud-controller.mixin';
import { PaginationResult } from '../../src/classes';

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
class TestCreateInput {
  name!: string;
  email!: string;
}

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

// Mock crud service - basic version without soft deletion support
class MockCrudService
  implements
    CrudService<
      string,
      TestEntity,
      TestCreateInput,
      TestUpdateInput,
      FindArgs<TestEntity>,
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
    // Simple mock implementation
    if (where.email === 'test1@example.com') {
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

  async runInTransaction<T>(
    context: TestContext,
    callback: (transactionContext: TestContext) => Promise<T>,
  ): Promise<T> {
    // Simple mock implementation - just run the callback with the same context
    return callback(context);
  }

  async audit(
    context: TestContext,
    action: string,
    entityId: string,
    changes?: Record<string, any>,
  ): Promise<void> {
    // Simple mock implementation - do nothing
    return Promise.resolve();
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
      FindArgs<TestEntity>,
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
    return {
      ...existing,
      deletedAt: undefined,
    };
  }
}

describe('CrudControllerFrom', () => {
  let controller: any;
  let service: MockCrudService;
  beforeEach(async () => {
    service = new MockCrudService();

    const controllerStructure = {
      entityType: TestEntity,
      serviceType: MockCrudService,
      findArgsType: TestFindArgsClass,
      contextType: TestContextClass,
      createInputType: TestCreateInput,
      updateInputType: TestUpdateInput,
      controllerName: 'TestCrudController',
      route: 'test-crud',
      decorators: {
        class: [ApiTags('test-crud')],
        methods: {},
      },
      operations: {
        findAll: true,
        findOne: true,
        pagination: true,
        findAllPaginated: true,
        create: true,
        update: true,
        remove: true,
        // hardRemove omitted - not available for basic CrudService
      },
      idPipeTransform: undefined,
      idParamDecorators: [],
    };

    const ControllerClass = CrudControllerFrom(controllerStructure);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ControllerClass],
      providers: [
        {
          provide: MockCrudService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<any>(ControllerClass);
  });

  describe('create', () => {
    it('should create a new entity', async () => {
      const context: TestContext = { userId: 'test-user' };
      const input: TestCreateInput = {
        name: 'New User',
        email: 'newuser@example.com',
      };

      const result = await controller.create(context, input);

      expect(result).toEqual(
        expect.objectContaining({
          id: '3',
          name: 'New User',
          email: 'newuser@example.com',
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

      const result = await controller.create(context, input);

      expect(result.name).toBe('Minimal User');
      expect(result.email).toBe('minimal@example.com');
    });
  });

  describe('update', () => {
    it('should update an existing entity', async () => {
      const context: TestContext = { userId: 'test-user' };
      const input: TestUpdateInput = {
        name: 'Updated User',
      };

      const result = await controller.update(context, '1', input);

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
      const input: TestUpdateInput = {
        email: 'updated@example.com',
      };

      const result = await controller.update(context, '1', input);

      expect(result.email).toBe('updated@example.com');
      expect(result.name).toBe('Test User 1'); // Should preserve existing values
    });

    it('should throw error for non-existent entity', async () => {
      const context: TestContext = { userId: 'test-user' };
      const input: TestUpdateInput = {
        name: 'Updated User',
      };

      await expect(controller.update(context, '999', input)).rejects.toThrow(
        'Entity not found',
      );
    });
  });

  describe('remove', () => {
    it('should soft remove an entity', async () => {
      const context: TestContext = { userId: 'test-user' };

      const result = await controller.remove(context, '1');

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

      await expect(controller.remove(context, '999')).rejects.toThrow(
        'Entity not found',
      );
    });
  });

  describe('hardRemove', () => {
    it('should not be available when disabled', () => {
      // hardRemove should not be defined on the controller when disabled
      expect(controller.hardRemove).toBeUndefined();
    });
  });

  describe('controller with hardRemove enabled', () => {
    let controllerWithHardRemove: any;
    let softDeletableService: MockSoftDeletableCrudService;
    beforeEach(async () => {
      softDeletableService = new MockSoftDeletableCrudService();

      const controllerStructure = {
        entityType: TestEntity,
        serviceType: MockSoftDeletableCrudService,
        findArgsType: TestFindArgsClass,
        contextType: TestContextClass,
        createInputType: TestCreateInput,
        updateInputType: TestUpdateInput,
        controllerName: 'TestCrudControllerHard',
        route: 'test-crud-hard',
        decorators: {
          class: [ApiTags('test-crud-hard')],
          methods: {},
        },
        operations: {
          findAll: true,
          findOne: true,
          pagination: true,
          findAllPaginated: true,
          create: true,
          update: true,
          remove: true,
          hardRemove: true,
        },
        idPipeTransform: undefined,
        idParamDecorators: [],
      };

      const ControllerClass = CrudControllerFrom(controllerStructure);

      const module: TestingModule = await Test.createTestingModule({
        controllers: [ControllerClass],
        providers: [
          {
            provide: MockSoftDeletableCrudService,
            useValue: softDeletableService,
          },
        ],
      }).compile();

      controllerWithHardRemove = module.get<any>(ControllerClass);
    });

    it('should hard remove an entity when enabled', async () => {
      const context: TestContext = { userId: 'test-user' };

      const result = await controllerWithHardRemove.hardRemove(context, '1');

      expect(result).toEqual(
        expect.objectContaining({
          id: '1',
          name: 'Test User 1',
          email: 'test1@example.com',
        }),
      );
      expect(result.deletedAt).toBeUndefined();
    });
  });

  describe('controller with soft deletion operations', () => {
    let controllerWithSoftDeletion: any;
    let softDeletableService: MockSoftDeletableCrudService;

    beforeEach(async () => {
      softDeletableService = new MockSoftDeletableCrudService();

      const controllerStructure = {
        entityType: TestEntity,
        serviceType: MockSoftDeletableCrudService,
        findArgsType: TestFindArgsClass,
        contextType: TestContextClass,
        createInputType: TestCreateInput,
        updateInputType: TestUpdateInput,
        controllerName: 'TestSoftDeletableCrudController',
        route: 'test-soft-crud',
        decorators: {
          class: [ApiTags('test-soft-crud')],
          methods: {},
        },
        operations: {
          findAll: true,
          findOne: true,
          pagination: true,
          findAllPaginated: true,
          create: true,
          update: true,
          remove: true,
          hardRemove: true,
          softRemove: true,
          recover: true,
        },
        idPipeTransform: undefined,
        idParamDecorators: [],
      };

      const ControllerClass = CrudControllerFrom(controllerStructure);

      const module: TestingModule = await Test.createTestingModule({
        controllers: [ControllerClass],
        providers: [
          {
            provide: MockSoftDeletableCrudService,
            useValue: softDeletableService,
          },
        ],
      }).compile();

      controllerWithSoftDeletion = module.get<any>(ControllerClass);
    });

    describe('softRemove', () => {
      it('should soft remove an entity', async () => {
        const context: TestContext = { userId: 'test-user' };

        const result = await controllerWithSoftDeletion.softRemove(
          context,
          '1',
        );

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

        await expect(
          controllerWithSoftDeletion.softRemove(context, '999'),
        ).rejects.toThrow('Entity not found');
      });
    });

    describe('recover', () => {
      it('should recover a soft deleted entity', async () => {
        const context: TestContext = { userId: 'test-user' };

        const result = await controllerWithSoftDeletion.recover(context, '1');

        expect(result).toEqual(
          expect.objectContaining({
            id: '1',
            name: 'Test User 1',
            email: 'test1@example.com',
          }),
        );
        expect(result.deletedAt).toBeUndefined();
      });

      it('should throw error for non-existent entity', async () => {
        const context: TestContext = { userId: 'test-user' };

        await expect(
          controllerWithSoftDeletion.recover(context, '999'),
        ).rejects.toThrow('Entity not found');
      });
    });

    describe('operations availability', () => {
      it('should have all soft deletion operations available', () => {
        expect(controllerWithSoftDeletion.softRemove).toBeDefined();
        expect(controllerWithSoftDeletion.recover).toBeDefined();
        expect(controllerWithSoftDeletion.hardRemove).toBeDefined();
      });
    });
  });

  describe('controller without soft deletion operations', () => {
    let controllerWithoutSoftDeletion: any;
    let softDeletableService: MockSoftDeletableCrudService;

    beforeEach(async () => {
      softDeletableService = new MockSoftDeletableCrudService();

      const controllerStructure = {
        entityType: TestEntity,
        serviceType: MockSoftDeletableCrudService,
        findArgsType: TestFindArgsClass,
        contextType: TestContextClass,
        createInputType: TestCreateInput,
        updateInputType: TestUpdateInput,
        controllerName: 'TestSoftDeletableCrudControllerDisabled',
        route: 'test-soft-crud-disabled',
        decorators: {
          class: [ApiTags('test-soft-crud-disabled')],
          methods: {},
        },
        operations: {
          findAll: true,
          findOne: true,
          pagination: true,
          findAllPaginated: true,
          create: true,
          update: true,
          remove: true,
          hardRemove: false,
          softRemove: false,
          recover: false,
        },
        idPipeTransform: undefined,
        idParamDecorators: [],
      };

      const ControllerClass = CrudControllerFrom(controllerStructure);

      const module: TestingModule = await Test.createTestingModule({
        controllers: [ControllerClass],
        providers: [
          {
            provide: MockSoftDeletableCrudService,
            useValue: softDeletableService,
          },
        ],
      }).compile();

      controllerWithoutSoftDeletion = module.get<any>(ControllerClass);
    });

    describe('disabled operations', () => {
      it('should not have soft deletion operations when disabled', () => {
        expect(controllerWithoutSoftDeletion.softRemove).toBeUndefined();
        expect(controllerWithoutSoftDeletion.recover).toBeUndefined();
        expect(controllerWithoutSoftDeletion.hardRemove).toBeUndefined();
      });
    });
  });
});
