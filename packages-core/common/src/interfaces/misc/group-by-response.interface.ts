import { PaginationResult } from './pagination-result.interface';

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
 *   aggregates: { avgPrice: 1250.50, totalProducts: 15 }
 * };
 * ```
 */
export interface GroupResult<T = any> {
  /**
   * The grouped key values as an object
   */
  key: Record<string, any>;

  /**
   * The computed aggregate values as an object
   */
  aggregates: Record<string, any>;
}

/**
 * Represents the result of a grouped query with pagination.
 * Extends PaginationResult to reuse existing pagination properties.
 *
 * @interface GroupedPaginationResult
 * @template T - The entity type being grouped
 *
 * @example
 * ```typescript
 * const result: GroupedPaginationResult<Product> = {
 *   groups: [groupResult1, groupResult2, ...],
 *   pagination: {
 *     total: 25,
 *     count: 10,
 *     limit: 10,
 *     page: 1,
 *     pageCount: 3,
 *     hasNextPage: true,
 *     hasPreviousPage: false
 *   }
 * };
 * ```
 */
export interface GroupedPaginationResult<T = any> {
  /**
   * Array of group results
   */
  groups: GroupResult<T>[];

  /**
   * Pagination information for the groups
   */
  pagination: PaginationResult;
}