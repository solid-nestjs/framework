/**
 * Enumeration of supported aggregate functions for database queries.
 *
 * @enum {string}
 * @readonly
 *
 * @example
 * ```typescript
 * // Using aggregate functions in groupBy operations
 * const aggregates = [
 *   { field: 'price', function: AggregateFunctionTypes.AVG },
 *   { field: 'id', function: AggregateFunctionTypes.COUNT }
 * ];
 * ```
 */
export enum AggregateFunctionTypes {
  /**
   * Count of non-null values
   */
  COUNT = 'COUNT',

  /**
   * Sum of numeric values
   */
  SUM = 'SUM',

  /**
   * Average of numeric values
   */
  AVG = 'AVG',

  /**
   * Minimum value
   */
  MIN = 'MIN',

  /**
   * Maximum value
   */
  MAX = 'MAX',

  /**
   * Count of distinct values
   */
  COUNT_DISTINCT = 'COUNT_DISTINCT',
}