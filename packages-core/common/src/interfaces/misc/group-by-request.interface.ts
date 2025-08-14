import { AggregateFunctionTypes } from '../../enums';
import { GroupBy } from '../../types/group-by.type';

/**
 * Represents an aggregate field configuration for groupBy operations.
 *
 * @interface AggregateField
 *
 * @example
 * ```typescript
 * const aggregateField: AggregateField = {
 *   field: 'price',
 *   function: AggregateFunctionTypes.AVG,
 *   alias: 'averagePrice'
 * };
 * ```
 */
export interface AggregateField {
  /**
   * The field name to apply the aggregate function to
   */
  field: string;

  /**
   * The aggregate function to apply
   */
  function: AggregateFunctionTypes;

  /**
   * Optional alias for the aggregate result
   * If not provided, defaults to `${function}_${field}`
   */
  alias?: string;
}

/**
 * Represents the groupBy configuration for queries.
 *
 * @interface GroupByRequest
 * @template T - The entity type being grouped
 *
 * @example
 * ```typescript
 * const groupByRequest: GroupByRequest<Product> = {
 *   fields: { 
 *     category: true,
 *     supplier: { name: true }
 *   },
 *   aggregates: [
 *     { field: 'price', function: AggregateFunctionTypes.AVG, alias: 'avgPrice' },
 *     { field: 'type', function: AggregateFunctionTypes.COUNT, alias: 'totalProducts' }
 *   ],
 *   includeItems: false
 * };
 * ```
 */
export interface GroupByRequest<T = any> {
  /**
   * Fields to group by (similar to OrderBy structure)
   */
  fields?: GroupBy<T>;

  /**
   * Aggregate functions to apply
   */
  aggregates?: AggregateField[];

  /**
   * Whether to include individual items in each group
   * @default false
   */
  includeItems?: boolean;

  /**
   * Maximum number of items to include per group when includeItems is true
   * @default 10
   */
  maxItemsPerGroup?: number;
}