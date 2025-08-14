import { FindArgs } from './find-args.interface';
import { GroupByRequest } from './group-by-request.interface';

/**
 * Extended find arguments that include groupBy configuration.
 * This interface extends FindArgs to add GROUP BY functionality
 * without polluting the base FindArgs interface.
 *
 * @interface GroupByArgs
 * @template T - The entity type being queried
 * @extends {FindArgs<T>}
 *
 * @example
 * ```typescript
 * const args: GroupByArgs<Product> = {
 *   where: { category: 'Electronics' },
 *   groupBy: {
 *     fields: { supplier: { name: true } },
 *     aggregates: [
 *       { field: 'price', function: AggregateFunctionTypes.AVG }
 *     ]
 *   },
 *   pagination: { page: 1, limit: 10 }
 * };
 * ```
 */
export interface GroupByArgs<T> extends FindArgs<T> {
  /**
   * GroupBy configuration for the query.
   * This property is required for grouped queries.
   */
  groupBy: GroupByRequest<T>;
}