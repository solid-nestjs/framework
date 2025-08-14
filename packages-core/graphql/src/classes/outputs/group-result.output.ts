import { ObjectType, Field, Int } from '@nestjs/graphql';

/**
 * GraphQL output type representing a single group result from grouped queries.
 *
 * @class GroupResultOutput
 * @template T - The entity type being grouped (handled generically in GraphQL)
 *
 * @example
 * ```graphql
 * type GroupResultOutput {
 *   key: JSONObject!
 *   aggregates: JSONObject!
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Example response structure
 * {
 *   key: { category: "Electronics", supplier_name: "TechCorp" },
 *   aggregates: { avgPrice: 1250.50, totalProducts: 15 }
 * }
 * ```
 */
@ObjectType()
export class GroupResultOutput {
  /**
   * The grouped key values as a JSON object
   * Keys correspond to the fields that were grouped by
   *
   * @example
   * { category: "Electronics", supplier_name: "TechCorp" }
   */
  @Field(() => String, {
    description: 'The grouped key values as JSON string',
  })
  key!: string;

  /**
   * The computed aggregate values as a JSON string
   * Keys correspond to the aliases of aggregate functions
   *
   * @example
   * "{ \"avgPrice\": 1250.50, \"totalProducts\": 15, \"maxPrice\": 2000.00 }"
   */
  @Field(() => String, {
    description: 'The computed aggregate values as JSON string',
  })
  aggregates!: string;
}