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
 *   aggregates: { avgPrice: 1250.50, totalProducts: 15 },
 *   items: [product1, product2, ...], // optional
 *   count: 15
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
 *   },
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
   * Pagination information for the groups
   */
  pagination: PaginationResult;

  /**
   * Total number of individual items across all groups
   * This is different from pagination.total which represents total number of groups
   */
  totalItems: number;
}