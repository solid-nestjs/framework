import { AggregateFunctionTypes } from '../../enums';
import { GroupBy } from '../../types/find-args.type';

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
 *     { field: 'id', function: AggregateFunctionTypes.COUNT, alias: 'totalProducts' }
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

/**
 * Represents a single group result.
 *
 * @interface GroupResult
 * @template T - The entity type being grouped
 *
 * @example
 * ```typescript
 * const groupResult: GroupResult<Product> = {
 *   key: { category: 'Electronics', supplierName: 'TechCorp' },
 *   aggregates: { avgPrice: 1250.50, totalProducts: 15 },
 *   items: [product1, product2, ...] // optional
 * };
 * ```
 */
export interface GroupResult<T = any> {
  /**
   * The grouped key values (can be object or JSON string for GraphQL compatibility)
   */
  key: Record<string, any> | string;

  /**
   * The computed aggregate values (can be object or JSON string for GraphQL compatibility)
   */
  aggregates: Record<string, any> | string;

  /**
   * Individual items in this group (optional)
   */
  items?: T[];

  /**
   * Total count of items in this group
   */
  count: number;
}

/**
 * Represents the result of a grouped query with pagination.
 *
 * @interface GroupedPaginationResult
 * @template T - The entity type being grouped
 *
 * @example
 * ```typescript
 * const result: GroupedPaginationResult<Product> = {
 *   groups: [groupResult1, groupResult2, ...],
 *   totalGroups: 25,
 *   page: 1,
 *   limit: 10,
 *   totalItems: 150
 * };
 * ```
 */
export interface GroupedPaginationResult<T = any> {
  /**
   * Array of group results
   */
  groups: GroupResult<T>[];

  /**
   * Total number of groups
   */
  totalGroups: number;

  /**
   * Current page number
   */
  page: number;

  /**
   * Number of groups per page
   */
  limit: number;

  /**
   * Total number of individual items across all groups
   */
  totalItems: number;
}