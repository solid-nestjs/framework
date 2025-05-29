import { WrappedBy } from '@solid-nestjs/common';
import { IsolationLevel } from 'typeorm/driver/types/IsolationLevel';
import { transactionalWrapper } from '../helpers/transaction.helper';

/**
 * Decorator to mark a method as transactional, ensuring that the method executes within a database transaction.
 * Optionally accepts an `isolationLevel` to specify the transaction isolation level.
 * !!! This should be used only in a DataService or CrudService !!!
 *
 * @param options - Optional configuration for the transaction.
 * @param options.isolationLevel - The isolation level for the transaction (if supported by the database).
 *
 * @example
 * ```typescript
 * @Transactional({ isolationLevel: 'SERIALIZABLE' })
 * async updateData() {
 *   // method body
 * }
 * ```
 */
export const Transactional = (options?: { isolationLevel?: IsolationLevel }) =>
  WrappedBy(transactionalWrapper, options);
