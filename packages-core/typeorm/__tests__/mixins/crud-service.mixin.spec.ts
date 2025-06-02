import { Test, TestingModule } from '@nestjs/testing';
import { Repository, EntityManager, DeepPartial, In } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CrudServiceFrom } from '../../src/mixins/crud-service.mixin';
import { QueryBuilderHelper, hasDeleteDateColumn } from '../../src/helpers';
import {
  AuditService,
  Entity,
  FindArgs,
  StandardActions,
  Where,
} from '@solid-nestjs/common';
import {
  Context,
  CrudServiceStructure,
  CreateOptions,
  BulkInsertOptions,
  BulkUpdateOptions,
  BulkDeleteOptions,
  BulkRemoveOptions,
  UpdateOptions,
  RemoveOptions,
  HardRemoveOptions,
} from '../../src/interfaces';

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
interface TestContext extends Context {
  userId?: string;
  transactionManager?: EntityManager;
}

// Mock input types
class TestCreateInput {
  id?: string;
  name!: string;
  email!: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class TestUpdateInput {
  id?: string;
  name?: string;
  email?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface TestFindArgs extends FindArgs<TestEntity> {
  where?: Partial<TestEntity>;
  orderBy?: any;
  pagination?: any;
}

// Mock the hasDeleteDateColumn helper
jest.mock('../../src/helpers/repository-columns.helper', () => ({
  hasDeleteDateColumn: jest.fn(),
}));

describe('CrudServiceFrom', () => {
  let service: any;
  let repository: jest.Mocked<Repository<TestEntity>>;
  let entityManager: jest.Mocked<EntityManager>;
  let auditService: jest.Mocked<AuditService>;
  let queryBuilderHelper: jest.Mocked<QueryBuilderHelper<string, TestEntity>>;
  let hasDeleteDateColumnMock: jest.MockedFunction<typeof hasDeleteDateColumn>;
  beforeEach(async () => {
    hasDeleteDateColumnMock = hasDeleteDateColumn as jest.MockedFunction<
      typeof hasDeleteDateColumn
    >;

    // Create mocks
    const mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue({
        connect: jest.fn().mockResolvedValue(undefined),
        startTransaction: jest.fn().mockResolvedValue(undefined),
        commitTransaction: jest.fn().mockResolvedValue(undefined),
        rollbackTransaction: jest.fn().mockResolvedValue(undefined),
        release: jest.fn().mockResolvedValue(undefined),
        manager: {
          getRepository: jest.fn(),
        },
      }),
    };

    entityManager = {
      getRepository: jest.fn(),
      connection: mockDataSource,
    } as any;

    repository = {
      create: jest.fn(),
      save: jest.fn(),
      softRemove: jest.fn(),
      remove: jest.fn(),
      findBy: jest.fn(),
      createQueryBuilder: jest.fn(),
      target: TestEntity,
      manager: entityManager,
    } as any;

    entityManager.getRepository.mockReturnValue(repository);

    auditService = {
      Audit: jest.fn(),
    } as any;

    queryBuilderHelper = {
      getRelationsInfo: jest.fn(),
      getQueryBuilder: jest.fn(),
      getNonMultiplyingPaginatedQueryBuilder: jest.fn(),
    } as any; // Create service structure for testing
    const serviceStructure: CrudServiceStructure<
      string,
      TestEntity,
      TestCreateInput,
      TestUpdateInput,
      TestFindArgs,
      TestContext
    > = {
      entityType: TestEntity,
      createInputType: TestCreateInput,
      updateInputType: TestUpdateInput,
      lockMode: { lockMode: 'optimistic', lockVersion: 1 },
      relationsConfig: {},
      functions: {
        create: {
          decorators: [],
          transactional: true,
          isolationLevel: 'READ COMMITTED',
        },
        update: {
          decorators: [],
          transactional: true,
        },
        remove: {
          decorators: [],
          transactional: false,
        },
        hardRemove: {
          decorators: [],
          transactional: true,
        },
      },
    };

    // Create the CRUD service class
    const CrudServiceClass = CrudServiceFrom(serviceStructure);

    // Set up testing module
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CrudServiceClass,
        {
          provide: getRepositoryToken(TestEntity),
          useValue: repository,
        },
        {
          provide: AuditService,
          useValue: auditService,
        },
        {
          provide: QueryBuilderHelper,
          useValue: queryBuilderHelper,
        },
      ],
    }).compile();
    service = module.get(CrudServiceClass);
    service._repository = repository;
    service._auditService = auditService;
    service._queryBuilderHelper = queryBuilderHelper;

    // Mock inherited methods from DataService
    service.findOne = jest.fn();
    service.audit = jest.fn();
    service.getQueryBuilder = jest.fn();
    service.getRepository = jest.fn().mockReturnValue(repository);

    // Set up lifecycle method spies
    service.beforeCreate = jest.fn().mockResolvedValue(undefined);
    service.afterCreate = jest.fn().mockResolvedValue(undefined);
    service.beforeBulkInsert = jest.fn().mockResolvedValue(undefined);
    service.afterBulkInsert = jest.fn().mockResolvedValue(undefined);
    service.beforeBulkUpdate = jest.fn().mockResolvedValue(undefined);
    service.afterBulkUpdate = jest.fn().mockResolvedValue(undefined);
    service.beforeBulkDelete = jest.fn().mockResolvedValue(undefined);
    service.afterBulkDelete = jest.fn().mockResolvedValue(undefined);
    service.beforeBulkRemove = jest.fn().mockResolvedValue(undefined);
    service.afterBulkRemove = jest.fn().mockResolvedValue(undefined);
    service.beforeUpdate = jest.fn().mockResolvedValue(undefined);
    service.afterUpdate = jest.fn().mockResolvedValue(undefined);
    service.beforeRemove = jest.fn().mockResolvedValue(undefined);
    service.afterRemove = jest.fn().mockResolvedValue(undefined);
    service.beforeHardRemove = jest.fn().mockResolvedValue(undefined);
    service.afterHardRemove = jest.fn().mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and save entity successfully', async () => {
      const context: TestContext = { userId: 'user1' };
      const createInput: TestCreateInput = {
        name: 'Test User',
        email: 'test@example.com',
      };

      const createdEntity = { id: '1', ...createInput };
      const savedEntity = { id: '1', ...createInput, createdAt: new Date() };

      repository.create.mockReturnValue(createdEntity as any);
      repository.save.mockResolvedValue(savedEntity as any);

      const result = await service.create(context, createInput);

      expect(repository.create).toHaveBeenCalledWith(createInput);
      expect(service.beforeCreate).toHaveBeenCalledWith(
        context,
        repository,
        createdEntity,
        createInput,
      );
      expect(repository.save).toHaveBeenCalledWith(createdEntity);
      expect(service.audit).toHaveBeenCalledWith(
        context,
        StandardActions.Create,
        '1',
        undefined,
        savedEntity,
      );
      expect(service.afterCreate).toHaveBeenCalledWith(
        context,
        repository,
        savedEntity,
        createInput,
      );
      expect(result).toBe(savedEntity);
    });

    it('should use custom event handler when provided in options', async () => {
      const context: TestContext = { userId: 'user1' };
      const createInput: TestCreateInput = {
        name: 'Test User',
        email: 'test@example.com',
      };

      const customEventHandler = {
        beforeCreate: jest.fn(),
        afterCreate: jest.fn(),
      };

      const options: CreateOptions<
        string,
        TestEntity,
        TestCreateInput,
        TestContext
      > = {
        eventHandler: customEventHandler,
      };

      const createdEntity = { id: '1', ...createInput };
      const savedEntity = { id: '1', ...createInput, createdAt: new Date() };

      repository.create.mockReturnValue(createdEntity as any);
      repository.save.mockResolvedValue(savedEntity as any);

      await service.create(context, createInput, options);

      expect(customEventHandler.beforeCreate).toHaveBeenCalledWith(
        context,
        repository,
        createdEntity,
        createInput,
      );
      expect(customEventHandler.afterCreate).toHaveBeenCalledWith(
        context,
        repository,
        savedEntity,
        createInput,
      );
    });
  });

  describe('bulkInsert', () => {
    it('should bulk insert and save entities successfully', async () => {
      const context: TestContext = { userId: 'user1' };
      const createInputs: TestCreateInput[] = [
        {
          name: 'Test User 1',
          email: 'test1@example.com',
        },
        {
          name: 'Test User 2',
          email: 'test2@example.com',
        },
      ];

      const createdEntities = [
        { id: '1', ...createInputs[0] },
        { id: '2', ...createInputs[1] },
      ];

      // Mock the query builder chain
      const mockQueryBuilder = {
        insert: jest.fn().mockReturnThis(),
        into: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({
          identifiers: [{ id: '1' }, { id: '2' }],
        }),
      };

      repository.create
        .mockReturnValueOnce(createdEntities[0] as any)
        .mockReturnValueOnce(createdEntities[1] as any);
      repository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      // Add beforeBulkInsert and afterBulkInsert method spies
      service.beforeBulkInsert = jest.fn().mockResolvedValue(undefined);
      service.afterBulkInsert = jest.fn().mockResolvedValue(undefined);

      const result = await service.bulkInsert(context, createInputs);

      expect(repository.create).toHaveBeenCalledTimes(2);
      expect(repository.create).toHaveBeenCalledWith(createInputs[0]);
      expect(repository.create).toHaveBeenCalledWith(createInputs[1]);
      expect(service.beforeBulkInsert).toHaveBeenCalledWith(
        context,
        repository,
        createdEntities,
        createInputs,
      );
      expect(repository.createQueryBuilder).toHaveBeenCalled();
      expect(mockQueryBuilder.insert).toHaveBeenCalled();
      expect(mockQueryBuilder.into).toHaveBeenCalledWith(TestEntity);
      expect(mockQueryBuilder.values).toHaveBeenCalledWith(createInputs);
      expect(mockQueryBuilder.execute).toHaveBeenCalled();
      // No longer fetching entities or auditing
      expect(repository.findBy).not.toHaveBeenCalled();
      expect(service.audit).not.toHaveBeenCalled();
      expect(service.afterBulkInsert).toHaveBeenCalledWith(
        context,
        repository,
        ['1', '2'], // Now receives IDs instead of entities
        createInputs,
      );
      expect(result).toEqual({ ids: ['1', '2'] });
    });

    it('should use custom event handler when provided in options', async () => {
      const context: TestContext = { userId: 'user1' };
      const createInputs: TestCreateInput[] = [
        {
          name: 'Test User 1',
          email: 'test1@example.com',
        },
        {
          name: 'Test User 2',
          email: 'test2@example.com',
        },
      ];

      const customEventHandler = {
        beforeBulkInsert: jest.fn(),
        afterBulkInsert: jest.fn(),
      };

      const options: BulkInsertOptions<string, TestEntity, TestContext> = {
        eventHandler: customEventHandler,
      };

      const createdEntities = [
        { id: '1', ...createInputs[0] },
        { id: '2', ...createInputs[1] },
      ];
      const savedEntities = [
        { id: '1', ...createInputs[0], createdAt: new Date() },
        { id: '2', ...createInputs[1], createdAt: new Date() },
      ];

      // Mock the query builder chain
      const mockQueryBuilder = {
        insert: jest.fn().mockReturnThis(),
        into: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({
          identifiers: [{ id: '1' }, { id: '2' }],
        }),
      };

      repository.create
        .mockReturnValueOnce(createdEntities[0] as any)
        .mockReturnValueOnce(createdEntities[1] as any);
      repository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await service.bulkInsert(context, createInputs, options);

      expect(customEventHandler.beforeBulkInsert).toHaveBeenCalledWith(
        context,
        repository,
        createdEntities,
        createInputs,
      );
      expect(customEventHandler.afterBulkInsert).toHaveBeenCalledWith(
        context,
        repository,
        ['1', '2'],
        createInputs,
      );
    });
  });

  describe('bulkUpdate', () => {
    it('should bulk update entities successfully', async () => {
      const context: TestContext = { userId: 'user1' };
      const updateInput: Partial<TestEntity> = {
        name: 'Updated Name',
      };
      const where: Where<TestEntity> = { email: 'test@example.com' };

      // Mock the query builder chain
      const mockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({
          affected: 3,
        }),
      };

      service.getQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.bulkUpdate(context, updateInput, where);

      expect(service.beforeBulkUpdate).toHaveBeenCalledWith(
        context,
        repository,
        updateInput,
        where,
      );
      expect(service.getQueryBuilder).toHaveBeenCalledWith(
        context,
        { where },
        {
          ignoreMultiplyingJoins: true,
          ignoreSelects: true,
        },
      );
      expect(mockQueryBuilder.update).toHaveBeenCalledWith(TestEntity);
      expect(mockQueryBuilder.set).toHaveBeenCalledWith(updateInput);
      expect(mockQueryBuilder.execute).toHaveBeenCalled();
      expect(service.afterBulkUpdate).toHaveBeenCalledWith(
        context,
        repository,
        3,
        updateInput,
        where,
      );
      expect(result).toEqual({ affected: 3 });
    });

    it('should use custom event handler when provided in options', async () => {
      const context: TestContext = { userId: 'user1' };
      const updateInput: Partial<TestEntity> = {
        name: 'Updated Name',
      };
      const where: Where<TestEntity> = { email: 'test@example.com' };

      const customEventHandler = {
        beforeBulkUpdate: jest.fn(),
        afterBulkUpdate: jest.fn(),
      };

      const options: BulkUpdateOptions<string, TestEntity, TestContext> = {
        eventHandler: customEventHandler,
      };

      // Mock the query builder chain
      const mockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({
          affected: 2,
        }),
      };

      service.getQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.bulkUpdate(context, updateInput, where, options);

      expect(customEventHandler.beforeBulkUpdate).toHaveBeenCalledWith(
        context,
        repository,
        updateInput,
        where,
      );
      expect(customEventHandler.afterBulkUpdate).toHaveBeenCalledWith(
        context,
        repository,
        2,
        updateInput,
        where,
      );
      // Ensure default handlers are NOT called
      expect(service.beforeBulkUpdate).not.toHaveBeenCalled();
      expect(service.afterBulkUpdate).not.toHaveBeenCalled();
    });

    it('should handle zero affected rows', async () => {
      const context: TestContext = { userId: 'user1' };
      const updateInput: Partial<TestEntity> = {
        name: 'Updated Name',
      };
      const where: Where<TestEntity> = { email: 'nonexistent@example.com' };

      // Mock the query builder chain
      const mockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({
          affected: 0,
        }),
      };

      service.getQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.bulkUpdate(context, updateInput, where);

      expect(service.beforeBulkUpdate).toHaveBeenCalledWith(
        context,
        repository,
        updateInput,
        where,
      );
      expect(service.afterBulkUpdate).toHaveBeenCalledWith(
        context,
        repository,
        0,
        updateInput,
        where,
      );
      expect(result).toEqual({ affected: 0 });
    });

    it('should handle undefined affected count', async () => {
      const context: TestContext = { userId: 'user1' };
      const updateInput: Partial<TestEntity> = {
        name: 'Updated Name',
      };
      const where: Where<TestEntity> = { email: 'test@example.com' };

      // Mock the query builder chain with undefined affected
      const mockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({
          affected: undefined,
        }),
      };

      service.getQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.bulkUpdate(context, updateInput, where);

      expect(service.afterBulkUpdate).toHaveBeenCalledWith(
        context,
        repository,
        0,
        updateInput,
        where,
      );
      expect(result).toEqual({ affected: undefined });
    });

    it('should handle database errors properly', async () => {
      const context: TestContext = { userId: 'user1' };
      const updateInput: Partial<TestEntity> = {
        name: 'Updated Name',
      };
      const where: Where<TestEntity> = { email: 'test@example.com' };

      const databaseError = new Error('Database connection failed');

      // Mock the query builder chain to throw error
      const mockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        execute: jest.fn().mockRejectedValue(databaseError),
      };

      service.getQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(
        service.bulkUpdate(context, updateInput, where),
      ).rejects.toThrow('Database connection failed');

      expect(service.beforeBulkUpdate).toHaveBeenCalledWith(
        context,
        repository,
        updateInput,
        where,
      );
      // afterBulkUpdate should not be called on error
      expect(service.afterBulkUpdate).not.toHaveBeenCalled();
    });

    it('should work with complex where conditions', async () => {
      const context: TestContext = { userId: 'user1' };
      const updateInput: Partial<TestEntity> = {
        name: 'Updated Name',
      };
      const where: Where<TestEntity> = {
        email: 'test@example.com',
        createdAt: { _gte: new Date('2023-01-01') },
      };

      // Mock the query builder chain
      const mockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({
          affected: 5,
        }),
      };

      service.getQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.bulkUpdate(context, updateInput, where);

      expect(service.getQueryBuilder).toHaveBeenCalledWith(
        context,
        { where },
        {
          ignoreMultiplyingJoins: true,
          ignoreSelects: true,
        },
      );
      expect(result).toEqual({ affected: 5 });
    });

    it('should work with DeepPartial update input', async () => {
      const context: TestContext = { userId: 'user1' };
      const updateInput: DeepPartial<TestEntity> = {
        name: 'Updated Name',
        email: 'updated@example.com',
        updatedAt: new Date(),
      };
      const where: Where<TestEntity> = { id: '1' };

      // Mock the query builder chain
      const mockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({
          affected: 1,
        }),
      };

      service.getQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.bulkUpdate(context, updateInput, where);

      expect(mockQueryBuilder.set).toHaveBeenCalledWith(updateInput);
      expect(result).toEqual({ affected: 1 });
    });

    it('should apply decorators correctly when configured', async () => {
      // Create a custom decorator for testing
      const customDecorator = jest.fn(
        () =>
          (
            target: any,
            propertyKey: string,
            descriptor: PropertyDescriptor,
          ) => {
            // Mock decorator implementation
          },
      );

      const serviceStructureWithBulkUpdateDecorators: CrudServiceStructure<
        string,
        TestEntity,
        TestCreateInput,
        TestUpdateInput,
        TestFindArgs,
        TestContext
      > = {
        entityType: TestEntity,
        createInputType: TestCreateInput,
        updateInputType: TestUpdateInput,
        lockMode: { lockMode: 'optimistic', lockVersion: 1 },
        relationsConfig: {},
        functions: {
          bulkUpdate: {
            decorators: [customDecorator as any],
            transactional: true,
            isolationLevel: 'READ COMMITTED',
          },
        },
      };

      const DecoratedCrudServiceClass = CrudServiceFrom(
        serviceStructureWithBulkUpdateDecorators,
      );

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          DecoratedCrudServiceClass,
          {
            provide: getRepositoryToken(TestEntity),
            useValue: repository,
          },
          {
            provide: AuditService,
            useValue: auditService,
          },
          {
            provide: QueryBuilderHelper,
            useValue: queryBuilderHelper,
          },
        ],
      }).compile();

      const decoratedService = module.get(DecoratedCrudServiceClass);
      expect(decoratedService).toBeDefined();
      expect(decoratedService.bulkUpdate).toBeDefined();

      // Verify that the decorator was applied
      expect(customDecorator).toHaveBeenCalled();
    });
  });

  describe('bulkDelete', () => {
    it('should bulk delete entities successfully', async () => {
      const context: TestContext = { userId: 'user1' };
      const where: Where<TestEntity> = { email: 'test@example.com' };

      // Mock the query builder chain
      const mockQueryBuilder = {
        delete: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({
          affected: 3,
        }),
      };

      service.getQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.bulkDelete(context, where);

      expect(service.beforeBulkDelete).toHaveBeenCalledWith(
        context,
        repository,
        where,
      );
      expect(service.getQueryBuilder).toHaveBeenCalledWith(
        context,
        { where },
        {
          ignoreMultiplyingJoins: true,
          ignoreSelects: true,
        },
      );
      expect(mockQueryBuilder.delete).toHaveBeenCalled();
      expect(mockQueryBuilder.execute).toHaveBeenCalled();
      expect(service.afterBulkDelete).toHaveBeenCalledWith(
        context,
        repository,
        3,
        where,
      );
      expect(result).toEqual({ affected: 3 });
    });

    it('should use custom event handler when provided in options', async () => {
      const context: TestContext = { userId: 'user1' };
      const where: Where<TestEntity> = { email: 'test@example.com' };

      const customEventHandler = {
        beforeBulkDelete: jest.fn(),
        afterBulkDelete: jest.fn(),
      };

      const options: BulkDeleteOptions<string, TestEntity, TestContext> = {
        eventHandler: customEventHandler,
      };

      // Mock the query builder chain
      const mockQueryBuilder = {
        delete: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({
          affected: 2,
        }),
      };

      service.getQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.bulkDelete(context, where, options);

      expect(customEventHandler.beforeBulkDelete).toHaveBeenCalledWith(
        context,
        repository,
        where,
      );
      expect(customEventHandler.afterBulkDelete).toHaveBeenCalledWith(
        context,
        repository,
        2,
        where,
      );
      // Ensure default handlers are NOT called
      expect(service.beforeBulkDelete).not.toHaveBeenCalled();
      expect(service.afterBulkDelete).not.toHaveBeenCalled();
    });

    it('should handle zero affected rows', async () => {
      const context: TestContext = { userId: 'user1' };
      const where: Where<TestEntity> = { email: 'nonexistent@example.com' };

      // Mock the query builder chain
      const mockQueryBuilder = {
        delete: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({
          affected: 0,
        }),
      };

      service.getQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.bulkDelete(context, where);

      expect(service.beforeBulkDelete).toHaveBeenCalledWith(
        context,
        repository,
        where,
      );
      expect(service.afterBulkDelete).toHaveBeenCalledWith(
        context,
        repository,
        0,
        where,
      );
      expect(result).toEqual({ affected: 0 });
    });

    it('should handle undefined affected count', async () => {
      const context: TestContext = { userId: 'user1' };
      const where: Where<TestEntity> = { email: 'test@example.com' };

      // Mock the query builder chain with undefined affected
      const mockQueryBuilder = {
        delete: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({
          affected: undefined,
        }),
      };

      service.getQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.bulkDelete(context, where);

      expect(service.afterBulkDelete).toHaveBeenCalledWith(
        context,
        repository,
        0,
        where,
      );
      expect(result).toEqual({ affected: undefined });
    });

    it('should handle database errors properly', async () => {
      const context: TestContext = { userId: 'user1' };
      const where: Where<TestEntity> = { email: 'test@example.com' };
      const dbError = new Error('Database connection failed');

      // Mock the query builder chain to throw an error
      const mockQueryBuilder = {
        delete: jest.fn().mockReturnThis(),
        execute: jest.fn().mockRejectedValue(dbError),
      };

      service.getQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(service.bulkDelete(context, where)).rejects.toThrow(
        'Database connection failed',
      );

      expect(service.beforeBulkDelete).toHaveBeenCalledWith(
        context,
        repository,
        where,
      );
      // afterBulkDelete should not be called on error
      expect(service.afterBulkDelete).not.toHaveBeenCalled();
    });

    it('should work with complex where conditions', async () => {
      const context: TestContext = { userId: 'user1' };
      const where: Where<TestEntity> = {
        email: 'test@example.com',
        createdAt: { _gte: new Date('2023-01-01') },
      };

      // Mock the query builder chain
      const mockQueryBuilder = {
        delete: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({
          affected: 5,
        }),
      };

      service.getQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.bulkDelete(context, where);

      expect(service.getQueryBuilder).toHaveBeenCalledWith(
        context,
        { where },
        {
          ignoreMultiplyingJoins: true,
          ignoreSelects: true,
        },
      );
      expect(result).toEqual({ affected: 5 });
    });

    it('should work with simple ID-based where conditions', async () => {
      const context: TestContext = { userId: 'user1' };
      const where: Where<TestEntity> = { id: '1' };

      // Mock the query builder chain
      const mockQueryBuilder = {
        delete: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({
          affected: 1,
        }),
      };

      service.getQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.bulkDelete(context, where);

      expect(mockQueryBuilder.delete).toHaveBeenCalled();
      expect(result).toEqual({ affected: 1 });
    });

    it('should apply decorators correctly when configured', async () => {
      // Create a custom decorator for testing
      const customDecorator = jest.fn(
        () =>
          (
            target: any,
            propertyKey: string,
            descriptor: PropertyDescriptor,
          ) => {
            // Mock decorator implementation
          },
      );

      const serviceStructureWithBulkDeleteDecorators: CrudServiceStructure<
        string,
        TestEntity,
        TestCreateInput,
        TestUpdateInput,
        TestFindArgs,
        TestContext
      > = {
        entityType: TestEntity,
        createInputType: TestCreateInput,
        updateInputType: TestUpdateInput,
        lockMode: { lockMode: 'optimistic', lockVersion: 1 },
        relationsConfig: {},
        functions: {
          bulkDelete: {
            decorators: [customDecorator as any],
            transactional: true,
            isolationLevel: 'READ COMMITTED',
          },
        },
      };

      const DecoratedCrudServiceClass = CrudServiceFrom(
        serviceStructureWithBulkDeleteDecorators,
      );

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          DecoratedCrudServiceClass,
          {
            provide: getRepositoryToken(TestEntity),
            useValue: repository,
          },
          {
            provide: AuditService,
            useValue: auditService,
          },
          {
            provide: QueryBuilderHelper,
            useValue: queryBuilderHelper,
          },
        ],
      }).compile();

      const decoratedService = module.get(DecoratedCrudServiceClass);
      expect(decoratedService).toBeDefined();
      expect(decoratedService.bulkDelete).toBeDefined();

      // Verify that the decorator was applied
      expect(customDecorator).toHaveBeenCalled();
    });
  });

  describe('bulkRemove', () => {
    it('should perform soft remove when repository has delete date column', async () => {
      const context: TestContext = { userId: 'user1' };
      const where: Where<TestEntity> = { email: 'test@example.com' };

      // Mock hasDeleteDateColumn to return true (soft delete enabled)
      hasDeleteDateColumnMock.mockReturnValue(true);

      // Mock the query builder chain for UPDATE operation with softDelete
      const mockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        softDelete: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({
          affected: 3,
        }),
      };

      service.getQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.bulkRemove(context, where);

      expect(hasDeleteDateColumnMock).toHaveBeenCalledWith(repository);
      expect(service.beforeBulkRemove).toHaveBeenCalledWith(
        context,
        repository,
        where,
      );
      expect(service.getQueryBuilder).toHaveBeenCalledWith(
        context,
        { where },
        {
          ignoreMultiplyingJoins: true,
          ignoreSelects: true,
        },
      );
      expect(mockQueryBuilder.update).toHaveBeenCalledWith(TestEntity);
      expect(mockQueryBuilder.softDelete).toHaveBeenCalled();
      expect(mockQueryBuilder.execute).toHaveBeenCalled();
      expect(service.afterBulkRemove).toHaveBeenCalledWith(
        context,
        repository,
        3,
        where,
      );
      expect(result).toEqual({ affected: 3 });
    });

    it('should delegate to bulkDelete when repository has no delete date column', async () => {
      const context: TestContext = { userId: 'user1' };
      const where: Where<TestEntity> = { email: 'test@example.com' };

      // Mock hasDeleteDateColumn to return false (hard delete)
      hasDeleteDateColumnMock.mockReturnValue(false);

      // Mock the bulkDelete method
      service.bulkDelete = jest.fn().mockResolvedValue({ affected: 2 });

      const result = await service.bulkRemove(context, where);

      expect(hasDeleteDateColumnMock).toHaveBeenCalledWith(repository);
      expect(service.beforeBulkRemove).toHaveBeenCalledWith(
        context,
        repository,
        where,
      );
      expect(service.bulkDelete).toHaveBeenCalledWith(context, where);
      expect(service.afterBulkRemove).toHaveBeenCalledWith(
        context,
        repository,
        2,
        where,
      );
      expect(result).toEqual({ affected: 2 });
    });

    it('should use custom event handler when provided in options', async () => {
      const context: TestContext = { userId: 'user1' };
      const where: Where<TestEntity> = { email: 'test@example.com' };

      const customEventHandler = {
        beforeBulkRemove: jest.fn(),
        afterBulkRemove: jest.fn(),
      };

      const options = {
        eventHandler: customEventHandler,
      };

      // Mock hasDeleteDateColumn to return true
      hasDeleteDateColumnMock.mockReturnValue(true);

      // Mock the query builder chain
      const mockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        softDelete: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({
          affected: 1,
        }),
      };

      service.getQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.bulkRemove(context, where, options);

      expect(customEventHandler.beforeBulkRemove).toHaveBeenCalledWith(
        context,
        repository,
        where,
      );
      expect(customEventHandler.afterBulkRemove).toHaveBeenCalledWith(
        context,
        repository,
        1,
        where,
      );
      // Ensure default handlers are NOT called
      expect(service.beforeBulkRemove).not.toHaveBeenCalled();
      expect(service.afterBulkRemove).not.toHaveBeenCalled();
    });

    it('should handle zero affected rows', async () => {
      const context: TestContext = { userId: 'user1' };
      const where: Where<TestEntity> = { email: 'nonexistent@example.com' };

      hasDeleteDateColumnMock.mockReturnValue(true);

      // Mock the query builder chain
      const mockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        softDelete: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({
          affected: 0,
        }),
      };

      service.getQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.bulkRemove(context, where);

      expect(service.beforeBulkRemove).toHaveBeenCalledWith(
        context,
        repository,
        where,
      );
      expect(service.afterBulkRemove).toHaveBeenCalledWith(
        context,
        repository,
        0,
        where,
      );
      expect(result).toEqual({ affected: 0 });
    });

    it('should handle undefined affected count', async () => {
      const context: TestContext = { userId: 'user1' };
      const where: Where<TestEntity> = { email: 'test@example.com' };

      hasDeleteDateColumnMock.mockReturnValue(false);

      // Mock the bulkDelete method
      service.bulkDelete = jest.fn().mockResolvedValue({ affected: undefined });

      const result = await service.bulkRemove(context, where);

      expect(service.afterBulkRemove).toHaveBeenCalledWith(
        context,
        repository,
        0,
        where,
      );
      expect(result).toEqual({ affected: undefined });
    });

    it('should handle database errors properly', async () => {
      const context: TestContext = { userId: 'user1' };
      const where: Where<TestEntity> = { email: 'test@example.com' };
      const dbError = new Error('Database connection failed');

      hasDeleteDateColumnMock.mockReturnValue(true);

      // Mock the query builder chain to throw an error
      const mockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        softDelete: jest.fn().mockReturnThis(),
        execute: jest.fn().mockRejectedValue(dbError),
      };

      service.getQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(service.bulkRemove(context, where)).rejects.toThrow(
        'Database connection failed',
      );

      expect(service.beforeBulkRemove).toHaveBeenCalledWith(
        context,
        repository,
        where,
      );
      // afterBulkRemove should not be called on error
      expect(service.afterBulkRemove).not.toHaveBeenCalled();
    });

    it('should work with complex where conditions', async () => {
      const context: TestContext = { userId: 'user1' };
      const where: Where<TestEntity> = {
        email: 'test@example.com',
        createdAt: { _gte: new Date('2023-01-01') },
      };

      hasDeleteDateColumnMock.mockReturnValue(true);

      // Mock the query builder chain
      const mockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        softDelete: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({
          affected: 5,
        }),
      };

      service.getQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.bulkRemove(context, where);

      expect(service.getQueryBuilder).toHaveBeenCalledWith(
        context,
        { where },
        {
          ignoreMultiplyingJoins: true,
          ignoreSelects: true,
        },
      );
      expect(mockQueryBuilder.update).toHaveBeenCalledWith(TestEntity);
      expect(mockQueryBuilder.softDelete).toHaveBeenCalled();
      expect(result).toEqual({ affected: 5 });
    });

    it('should work with simple ID-based where conditions for soft delete', async () => {
      const context: TestContext = { userId: 'user1' };
      const where: Where<TestEntity> = { id: '1' };

      hasDeleteDateColumnMock.mockReturnValue(true);

      // Mock the query builder chain
      const mockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        softDelete: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({
          affected: 1,
        }),
      };

      service.getQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.bulkRemove(context, where);

      expect(mockQueryBuilder.update).toHaveBeenCalledWith(TestEntity);
      expect(mockQueryBuilder.softDelete).toHaveBeenCalled();
      expect(result).toEqual({ affected: 1 });
    });

    it('should work with simple ID-based where conditions for hard delete', async () => {
      const context: TestContext = { userId: 'user1' };
      const where: Where<TestEntity> = { id: '1' };

      hasDeleteDateColumnMock.mockReturnValue(false);

      // Mock the bulkDelete method
      service.bulkDelete = jest.fn().mockResolvedValue({ affected: 1 });

      const result = await service.bulkRemove(context, where);

      expect(service.bulkDelete).toHaveBeenCalledWith(context, where);
      expect(result).toEqual({ affected: 1 });
    });

    it('should apply decorators correctly when configured', async () => {
      // Create a custom decorator for testing
      const customDecorator = jest.fn(
        () =>
          (
            target: any,
            propertyKey: string,
            descriptor: PropertyDescriptor,
          ) => {
            // Mock decorator implementation
          },
      );

      const serviceStructureWithBulkRemoveDecorators: CrudServiceStructure<
        string,
        TestEntity,
        TestCreateInput,
        TestUpdateInput,
        TestFindArgs,
        TestContext
      > = {
        entityType: TestEntity,
        createInputType: TestCreateInput,
        updateInputType: TestUpdateInput,
        lockMode: { lockMode: 'optimistic', lockVersion: 1 },
        relationsConfig: {},
        functions: {
          bulkRemove: {
            decorators: [customDecorator as any],
            transactional: true,
            isolationLevel: 'READ COMMITTED',
          },
        },
      };

      const DecoratedCrudServiceClass = CrudServiceFrom(
        serviceStructureWithBulkRemoveDecorators,
      );

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          DecoratedCrudServiceClass,
          {
            provide: getRepositoryToken(TestEntity),
            useValue: repository,
          },
          {
            provide: AuditService,
            useValue: auditService,
          },
          {
            provide: QueryBuilderHelper,
            useValue: queryBuilderHelper,
          },
        ],
      }).compile();

      const decoratedService = module.get(DecoratedCrudServiceClass);
      expect(decoratedService).toBeDefined();
      expect(decoratedService.bulkRemove).toBeDefined();

      // Verify that the decorator was applied
      expect(customDecorator).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update entity successfully', async () => {
      const context: TestContext = { userId: 'user1' };
      const id = '1';
      const updateInput: TestUpdateInput = {
        name: 'Updated Name',
      };

      const existingEntity = {
        id: '1',
        name: 'Original Name',
        email: 'test@example.com',
      };
      const updatedEntity = { ...existingEntity, ...updateInput };

      // Make sure findOne returns a copy so the original doesn't get mutated
      service.findOne.mockResolvedValue({ ...existingEntity });
      repository.save.mockResolvedValue(updatedEntity as any);

      const result = await service.update(context, id, updateInput);

      expect(service.findOne).toHaveBeenCalledWith(context, id, true);
      expect(service.beforeUpdate).toHaveBeenCalledWith(
        context,
        repository,
        updatedEntity,
        updateInput,
      );
      expect(repository.save).toHaveBeenCalledWith(updatedEntity);
      expect(service.audit).toHaveBeenCalledWith(
        context,
        StandardActions.Update,
        '1',
        existingEntity,
        updatedEntity,
      );
      expect(service.afterUpdate).toHaveBeenCalledWith(
        context,
        repository,
        updatedEntity,
        updateInput,
      );
      expect(result).toBe(updatedEntity);
    });

    it('should use custom event handler when provided in options', async () => {
      const context: TestContext = { userId: 'user1' };
      const id = '1';
      const updateInput: TestUpdateInput = {
        name: 'Updated Name',
      };

      const customEventHandler = {
        beforeUpdate: jest.fn(),
        afterUpdate: jest.fn(),
      };

      const options: UpdateOptions<
        string,
        TestEntity,
        TestUpdateInput,
        TestContext
      > = {
        eventHandler: customEventHandler,
      };

      const existingEntity = {
        id: '1',
        name: 'Original Name',
        email: 'test@example.com',
      };
      const updatedEntity = { ...existingEntity, ...updateInput };

      service.findOne.mockResolvedValue(existingEntity);
      repository.save.mockResolvedValue(updatedEntity as any);

      await service.update(context, id, updateInput, options);

      expect(customEventHandler.beforeUpdate).toHaveBeenCalledWith(
        context,
        repository,
        updatedEntity,
        updateInput,
      );
      expect(customEventHandler.afterUpdate).toHaveBeenCalledWith(
        context,
        repository,
        updatedEntity,
        updateInput,
      );
    });
  });

  describe('remove', () => {
    it('should soft remove entity when repository has delete date column', async () => {
      const context: TestContext = { userId: 'user1' };
      const id = '1';

      const entity = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
      };
      const removedEntity = { ...entity, deletedAt: new Date() };

      hasDeleteDateColumnMock.mockReturnValue(true);
      service.findOne.mockResolvedValue(entity);
      repository.softRemove.mockResolvedValue(removedEntity as any);

      const result = await service.remove(context, id);

      expect(service.findOne).toHaveBeenCalledWith(context, id, true);
      expect(service.beforeRemove).toHaveBeenCalledWith(
        context,
        repository,
        entity,
      );
      expect(repository.softRemove).toHaveBeenCalledWith(entity);
      expect(service.audit).toHaveBeenCalledWith(
        context,
        StandardActions.Remove,
        '1',
        removedEntity,
      );
      expect(service.afterRemove).toHaveBeenCalledWith(
        context,
        repository,
        removedEntity,
      );
      expect(result).toBe(removedEntity);
    });

    it('should hard remove entity when repository has no delete date column', async () => {
      const context: TestContext = { userId: 'user1' };
      const id = '1';

      const entity = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
      };
      const removedEntity = { ...entity };
      delete (removedEntity as any).id;

      hasDeleteDateColumnMock.mockReturnValue(false);
      service.findOne.mockResolvedValue(entity);
      repository.remove.mockResolvedValue(removedEntity as any);

      const result = await service.remove(context, id);

      expect(service.findOne).toHaveBeenCalledWith(context, id, true);
      expect(service.beforeRemove).toHaveBeenCalledWith(
        context,
        repository,
        entity,
      );
      expect(repository.remove).toHaveBeenCalledWith(entity);
      expect(result.id).toBe(id); // ID should be restored
    });

    it('should use custom event handler when provided in options', async () => {
      const context: TestContext = { userId: 'user1' };
      const id = '1';

      const customEventHandler = {
        beforeRemove: jest.fn(),
        afterRemove: jest.fn(),
      };

      const options: RemoveOptions<string, TestEntity, TestContext> = {
        eventHandler: customEventHandler,
      };

      const entity = { id: '1', name: 'Test User', email: 'test@example.com' };
      const removedEntity = { ...entity, deletedAt: new Date() };

      hasDeleteDateColumnMock.mockReturnValue(true);
      service.findOne.mockResolvedValue(entity);
      repository.softRemove.mockResolvedValue(removedEntity as any);

      await service.remove(context, id, options);

      expect(customEventHandler.beforeRemove).toHaveBeenCalledWith(
        context,
        repository,
        entity,
      );
      expect(customEventHandler.afterRemove).toHaveBeenCalledWith(
        context,
        repository,
        removedEntity,
      );
    });
  });

  describe('hardRemove', () => {
    it('should hard remove entity when repository has delete date column', async () => {
      const context: TestContext = { userId: 'user1' };
      const id = '1';

      const entity = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        deletedAt: new Date(),
      };
      const removedEntity = { ...entity };
      delete (removedEntity as any).id;

      hasDeleteDateColumnMock.mockReturnValue(true);
      service.findOne.mockResolvedValue(entity);
      repository.remove.mockResolvedValue(removedEntity as any);

      const result = await service.hardRemove(context, id);

      expect(service.findOne).toHaveBeenCalledWith(context, id, true, {
        withDeleted: true,
      });
      expect(service.beforeHardRemove).toHaveBeenCalledWith(
        context,
        repository,
        entity,
      );
      expect(repository.remove).toHaveBeenCalledWith(entity);
      expect(service.audit).toHaveBeenCalledWith(
        context,
        StandardActions.Remove,
        '1',
        removedEntity,
      );
      expect(service.afterHardRemove).toHaveBeenCalledWith(
        context,
        repository,
        removedEntity,
      );
      expect(result.id).toBe(id); // ID should be restored
    });

    it('should delegate to remove when repository has no delete date column', async () => {
      const context: TestContext = { userId: 'user1' };
      const id = '1';

      hasDeleteDateColumnMock.mockReturnValue(false);
      service.remove = jest
        .fn()
        .mockResolvedValue({ id: '1', name: 'Removed' });

      const result = await service.hardRemove(context, id);

      expect(service.remove).toHaveBeenCalledWith(context, id);
      expect(result).toEqual({ id: '1', name: 'Removed' });
    });

    it('should use custom event handler when provided in options', async () => {
      const context: TestContext = { userId: 'user1' };
      const id = '1';

      const customEventHandler = {
        beforeHardRemove: jest.fn(),
        afterHardRemove: jest.fn(),
      };

      const options: HardRemoveOptions<string, TestEntity, TestContext> = {
        eventHandler: customEventHandler,
      };

      const entity = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        deletedAt: new Date(),
      };
      const removedEntity = { ...entity };
      delete (removedEntity as any).id;

      hasDeleteDateColumnMock.mockReturnValue(true);
      service.findOne.mockResolvedValue(entity);
      repository.remove.mockResolvedValue(removedEntity as any);

      await service.hardRemove(context, id, options);

      expect(customEventHandler.beforeHardRemove).toHaveBeenCalledWith(
        context,
        repository,
        entity,
      );
      expect(customEventHandler.afterHardRemove).toHaveBeenCalledWith(
        context,
        repository,
        removedEntity,
      );
    });
  });

  describe('event handler methods', () => {
    it('should have default empty implementations for all before/after methods', async () => {
      const context: TestContext = {};
      const repository = {} as Repository<TestEntity>;
      const entity = { id: '1', name: 'Test' } as TestEntity;
      const input = { name: 'Test' };

      // These should not throw and should resolve successfully
      await expect(
        service.beforeCreate(context, repository, entity, input),
      ).resolves.toBeUndefined();
      await expect(
        service.afterCreate(context, repository, entity, input),
      ).resolves.toBeUndefined();
      await expect(
        service.beforeUpdate(context, repository, entity, input),
      ).resolves.toBeUndefined();
      await expect(
        service.afterUpdate(context, repository, entity, input),
      ).resolves.toBeUndefined();
      await expect(
        service.beforeRemove(context, repository, entity),
      ).resolves.toBeUndefined();
      await expect(
        service.afterRemove(context, repository, entity),
      ).resolves.toBeUndefined();
      await expect(
        service.beforeHardRemove(context, repository, entity),
      ).resolves.toBeUndefined();
      await expect(
        service.afterHardRemove(context, repository, entity),
      ).resolves.toBeUndefined();
    });
  });

  describe('service structure configuration', () => {
    it('should create service without optional function configurations', async () => {
      const minimalServiceStructure: CrudServiceStructure<
        string,
        TestEntity,
        TestCreateInput,
        TestUpdateInput,
        TestFindArgs,
        TestContext
      > = {
        entityType: TestEntity,
        createInputType: TestCreateInput,
        updateInputType: TestUpdateInput,
        lockMode: { lockMode: 'optimistic', lockVersion: 1 },
        relationsConfig: {},
      };

      const MinimalCrudServiceClass = CrudServiceFrom(minimalServiceStructure);

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          MinimalCrudServiceClass,
          {
            provide: getRepositoryToken(TestEntity),
            useValue: repository,
          },
          {
            provide: AuditService,
            useValue: auditService,
          },
          {
            provide: QueryBuilderHelper,
            useValue: queryBuilderHelper,
          },
        ],
      }).compile();

      const minimalService = module.get(MinimalCrudServiceClass);
      expect(minimalService).toBeDefined();
    });

    it('should handle custom decorators in service structure', async () => {
      const customDecorator = jest.fn(
        () =>
          (
            target: any,
            propertyKey: string,
            descriptor: PropertyDescriptor,
          ) => {
            // Mock decorator implementation
          },
      );
      const serviceStructureWithDecorators: CrudServiceStructure<
        string,
        TestEntity,
        TestCreateInput,
        TestUpdateInput,
        TestFindArgs,
        TestContext
      > = {
        entityType: TestEntity,
        createInputType: TestCreateInput,
        updateInputType: TestUpdateInput,
        lockMode: { lockMode: 'optimistic', lockVersion: 1 },
        relationsConfig: {},
        functions: {
          create: {
            decorators: [customDecorator as any],
            transactional: false,
          },
        },
      };

      const DecoratedCrudServiceClass = CrudServiceFrom(
        serviceStructureWithDecorators,
      );

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          DecoratedCrudServiceClass,
          {
            provide: getRepositoryToken(TestEntity),
            useValue: repository,
          },
          {
            provide: AuditService,
            useValue: auditService,
          },
          {
            provide: QueryBuilderHelper,
            useValue: queryBuilderHelper,
          },
        ],
      }).compile();

      const decoratedService = module.get(DecoratedCrudServiceClass);
      expect(decoratedService).toBeDefined();
    });
  });
});
