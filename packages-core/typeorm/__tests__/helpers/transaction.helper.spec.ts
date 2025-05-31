import { DataSource, QueryRunner, EntityManager } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';
import {
  runInTransaction,
  transactionalWrapper,
} from '../../src/helpers/transaction.helper';
import { Context, EntityManagerProvider } from '../../src/interfaces';

describe('transaction.helper', () => {
  let dataSource: jest.Mocked<DataSource>;
  let queryRunner: jest.Mocked<QueryRunner>;
  let entityManager: jest.Mocked<EntityManager>;

  beforeEach(() => {
    entityManager = {
      connection: dataSource,
    } as any;

    queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: entityManager,
    } as any;

    dataSource = {
      createQueryRunner: jest.fn().mockReturnValue(queryRunner),
    } as any;

    // Use Object.defineProperty to set the readonly connection property
    Object.defineProperty(entityManager, 'connection', {
      value: dataSource,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('runInTransaction', () => {
    it('should execute function directly when context already has transaction manager', async () => {
      const context: Context = {
        transactionManager: entityManager,
      };

      const mockFn = jest.fn().mockResolvedValue('result');

      const result = await runInTransaction(context, dataSource, mockFn);

      expect(mockFn).toHaveBeenCalledWith(context);
      expect(result).toBe('result');
      expect(dataSource.createQueryRunner).not.toHaveBeenCalled();
    });

    it('should create new transaction and execute function successfully', async () => {
      const context: Context = {};
      const mockFn = jest.fn().mockResolvedValue('transaction-result');

      const result = await runInTransaction(context, dataSource, mockFn);

      expect(dataSource.createQueryRunner).toHaveBeenCalled();
      expect(queryRunner.connect).toHaveBeenCalled();
      expect(queryRunner.startTransaction).toHaveBeenCalledWith(undefined);
      expect(mockFn).toHaveBeenCalledWith({
        ...context,
        transactionManager: entityManager,
      });
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
      expect(result).toBe('transaction-result');
    });

    it('should create new transaction with specified isolation level', async () => {
      const context: Context = {};
      const mockFn = jest.fn().mockResolvedValue('result');
      const isolationLevel = 'READ COMMITTED' as any;

      await runInTransaction(context, dataSource, mockFn, isolationLevel);

      expect(queryRunner.startTransaction).toHaveBeenCalledWith(isolationLevel);
    });

    it('should rollback transaction and rethrow error when function fails', async () => {
      const context: Context = {};
      const error = new Error('Function failed');
      const mockFn = jest.fn().mockRejectedValue(error);

      await expect(
        runInTransaction(context, dataSource, mockFn),
      ).rejects.toThrow(error);

      expect(dataSource.createQueryRunner).toHaveBeenCalled();
      expect(queryRunner.connect).toHaveBeenCalled();
      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
      expect(queryRunner.commitTransaction).not.toHaveBeenCalled();
    });

    it('should release query runner even when commit fails', async () => {
      const context: Context = {};
      const mockFn = jest.fn().mockResolvedValue('result');
      const commitError = new Error('Commit failed');

      queryRunner.commitTransaction.mockRejectedValue(commitError);

      await expect(
        runInTransaction(context, dataSource, mockFn),
      ).rejects.toThrow(commitError);

      expect(queryRunner.release).toHaveBeenCalled();
    });
    it('should release query runner even when rollback fails', async () => {
      const context: Context = {};
      const functionError = new Error('Function failed');
      const rollbackError = new Error('Rollback failed');
      const mockFn = jest.fn().mockRejectedValue(functionError);

      queryRunner.rollbackTransaction.mockRejectedValue(rollbackError);

      await expect(
        runInTransaction(context, dataSource, mockFn),
      ).rejects.toThrow(rollbackError);

      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });
  });

  describe('transactionalWrapper', () => {
    let mockService: jest.Mocked<EntityManagerProvider<Context>>;
    let mockNext: jest.MockedFunction<(...args: any[]) => Promise<any>>;

    beforeEach(() => {
      mockService = {
        getEntityManager: jest.fn().mockReturnValue(entityManager),
      } as any;

      mockNext = jest.fn().mockResolvedValue('wrapper-result');
    });

    it('should execute function within transaction using service entity manager', async () => {
      const context: Context = {};
      const options = {
        injectable: mockService,
        isolationLevel: 'READ_COMMITTED',
      };
      const args = [context, 'arg1', 'arg2'];

      const result = await transactionalWrapper(options, mockNext, args);

      expect(mockService.getEntityManager).toHaveBeenCalledWith(context);
      expect(dataSource.createQueryRunner).toHaveBeenCalled();
      expect(queryRunner.startTransaction).toHaveBeenCalledWith(
        'READ_COMMITTED',
      );
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          transactionManager: entityManager,
        }),
        'arg1',
        'arg2',
      );
      expect(result).toBe('wrapper-result');
    });

    it('should work without isolation level', async () => {
      const context: Context = {};
      const options = {
        injectable: mockService,
      };
      const args = [context];

      await transactionalWrapper(options, mockNext, args);

      expect(queryRunner.startTransaction).toHaveBeenCalledWith(undefined);
    });

    it('should throw InternalServerErrorException when injectable has no getEntityManager method', async () => {
      const context: Context = {};
      const invalidService = {
        // Missing getEntityManager method
      };
      const options = {
        injectable: invalidService,
      };
      const args = [context];

      await expect(
        transactionalWrapper(options, mockNext, args),
      ).rejects.toThrow(InternalServerErrorException);
      await expect(
        transactionalWrapper(options, mockNext, args),
      ).rejects.toThrow(
        'cannot injectTransaction, function getEntityManager is needed in the service class',
      );
    });

    it('should throw InternalServerErrorException when injectable is undefined', async () => {
      const context: Context = {};
      const options = {
        injectable: undefined,
      };
      const args = [context];

      await expect(
        transactionalWrapper(options, mockNext, args),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should pass additional arguments correctly', async () => {
      const context: Context = {};
      const options = {
        injectable: mockService,
      };
      const args = [context, 'param1', { data: 'param2' }, 123];

      await transactionalWrapper(options, mockNext, args);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          transactionManager: entityManager,
        }),
        'param1',
        { data: 'param2' },
        123,
      );
    });

    it('should handle errors from next function properly', async () => {
      const context: Context = {};
      const options = {
        injectable: mockService,
      };
      const args = [context];
      const error = new Error('Next function failed');

      mockNext.mockRejectedValue(error);

      await expect(
        transactionalWrapper(options, mockNext, args),
      ).rejects.toThrow(error);

      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });
  });
});
