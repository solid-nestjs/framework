import { LockModeOptimistic, LockModeNotOptimistic } from './data-retrieval-options.interface';

/**
 * Options specific to GROUP BY queries.
 * Contains only the relevant properties for grouped data retrieval.
 *
 * @interface GroupByOptions
 * @template EntityType - The entity type being queried
 *
 * @example
 * ```typescript
 * const options: GroupByOptions<Product> = {
 *   mainAlias: 'product',
 *   withDeleted: false,
 *   lockMode: {
 *     lockMode: 'pessimistic_read',
 *     onLocked: 'nowait'
 *   }
 * };
 * ```
 */
export interface GroupByOptions<EntityType> {
  /**
   * Main alias for the entity in the query.
   * Defaults to 'entity' if not specified.
   */
  mainAlias?: string;

  /**
   * Lock mode configuration for the query.
   * Supports both optimistic and pessimistic locking.
   */
  lockMode?: LockModeOptimistic | LockModeNotOptimistic;

  /**
   * Whether to include soft-deleted entities in the results.
   * Defaults to false.
   */
  withDeleted?: boolean;
}