import { Test, TestingModule } from '@nestjs/testing';
import { Repository, EntityManager, DeepPartial } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CrudServiceFrom } from '../../src/mixins/crud-service.mixin';
import { QueryBuilderHelper, hasDeleteDateColumn } from '../../src/helpers';
import {
  AuditService,
  Entity,
  FindArgs,
  StandardActions,
} from '@solid-nestjs/common';
import {
  Context,
  CrudServiceStructure,
  CreateOptions,
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

    // Set up lifecycle method spies
    service.beforeCreate = jest.fn().mockResolvedValue(undefined);
    service.afterCreate = jest.fn().mockResolvedValue(undefined);
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
