import { DataSource, QueryRunner } from 'typeorm';
import { IsolationLevel } from 'typeorm/driver/types/IsolationLevel';
import { InternalServerErrorException } from '@nestjs/common';
import { Context, EntityManagerProvider } from '../interfaces';

/**
 * Executes the provided asynchronous function within a database transaction context.
 *
 * If the given context already contains a `transactionManager`, the function is executed directly without starting a new transaction.
 * Otherwise, a new transaction is started using the provided `DataSource`, and the function is executed with a new context containing the transaction manager.
 * The transaction is committed if the function resolves successfully, or rolled back if an error is thrown.
 * The query runner is always released after execution.
 *
 * @template ContextType - The type of the context object, which must extend `Context`.
 * @template ReturnType - The return type of the asynchronous function.
 * @param context - The current context, potentially containing a `transactionManager`.
 * @param dataSource - The TypeORM `DataSource` used to create a new query runner and manage the transaction.
 * @param fn - An asynchronous function to execute within the transaction. Receives a context with the transaction manager.
 * @param isolationLevel - (Optional) The isolation level for the transaction.
 * @returns A promise that resolves with the result of the provided function.
 * @throws Rethrows any error encountered during the execution of the function, after rolling back the transaction.
 */
export async function runInTransaction<ContextType extends Context, ReturnType>(
  context: ContextType,
  dataSource: DataSource,
  fn: (context: ContextType) => Promise<ReturnType>,
  isolationLevel?: IsolationLevel,
): Promise<ReturnType> {
  //If there is a transactionManager already, do not start a new transaction
  if (context.transactionManager)
    //If a different transaction is needed, then remove the transactionManager from the context before calling this function
    return fn(context);

  const queryRunner: QueryRunner = dataSource.createQueryRunner();

  await queryRunner.connect();

  await queryRunner.startTransaction(isolationLevel);

  try {
    const transactionManager = queryRunner.manager;

    const newContext = { ...context, transactionManager };

    const result = await fn(newContext);

    await queryRunner.commitTransaction();

    return result;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}

/**
 * Wraps the execution of a function within a database transaction using the provided entity manager.
 *
 * @param options - An object containing configuration options, including an `injectable` service with a `getEntityManager` method and an optional `isolationLevel`.
 * @param next - The function to be executed within the transaction. Receives the context and additional arguments.
 * @param args - An array where the first element is the transaction context, followed by any additional arguments for `next`.
 * @returns A promise resolving to the result of the `next` function executed within the transaction.
 * @throws InternalServerErrorException If the `injectable` service does not provide a `getEntityManager` function.
 */
export async function transactionalWrapper(
  options: any,
  next: (...args: any[]) => Promise<any>,
  args: any[],
): Promise<any> {
  if (typeof options?.injectable?.getEntityManager !== 'function')
    throw new InternalServerErrorException(
      'cannot injectTransaction, function getEntityManager is needed in the service class',
      { cause: { obj: options, args } },
    );

  const service = options.injectable as EntityManagerProvider<Context>;
  const isolationLevel = options.isolationLevel as IsolationLevel;

  const [context, ...otherArgs] = args as [Context, ...any[]];

  const manager = service.getEntityManager(context);

  return runInTransaction(
    context,
    manager.connection,
    context => next(context, ...otherArgs),
    isolationLevel,
  );
}
