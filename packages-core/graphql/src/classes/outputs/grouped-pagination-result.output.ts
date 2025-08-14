import { ObjectType, Field, Int } from '@nestjs/graphql';
import { GroupResultOutput } from './group-result.output';
import { PaginationOutput } from './pagination.output';

/**
 * GraphQL output type representing paginated grouped query results.
 *
 * @class GroupedPaginationResultOutput
 *
 * @example
 * ```graphql
 * type GroupedPaginationResultOutput {
 *   groups: [GroupResultOutput!]!
 *   totalGroups: Int!
 *   page: Int!
 *   limit: Int!
 *   totalItems: Int!
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Example response structure
 * {
 *   groups: [
 *     {
 *       key: { category: "Electronics" },
 *       aggregates: { avgPrice: 1250.50, totalProducts: 15 },
 *       count: 15
 *     },
 *     {
 *       key: { category: "Books" },
 *       aggregates: { avgPrice: 25.75, totalProducts: 42 },
 *       count: 42
 *     }
 *   ],
 *   totalGroups: 25,
 *   page: 1,
 *   limit: 10,
 *   totalItems: 150
 * }
 * ```
 */
@ObjectType()
export class GroupedPaginationResultOutput {
  /**
   * Array of group results
   */
  @Field(() => [GroupResultOutput], {
    description: 'Array of group results',
  })
  groups!: GroupResultOutput[];

  /**
   * Pagination information for the groups
   */
  @Field(() => PaginationOutput, {
    description: 'Pagination information for the groups',
  })
  pagination!: PaginationOutput;

  /**
   * Total number of individual items across all groups
   */
  @Field(() => Int, {
    description: 'Total number of individual items across all groups',
  })
  totalItems!: number;
}