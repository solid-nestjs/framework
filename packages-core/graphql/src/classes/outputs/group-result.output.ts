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
 *   count: Int!
 *   items: [EntityType]
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Example response structure
 * {
 *   key: { category: "Electronics", supplier_name: "TechCorp" },
 *   aggregates: { avgPrice: 1250.50, totalProducts: 15 },
 *   count: 15,
 *   items: [product1, product2, ...] // optional
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

  /**
   * Total count of items in this group
   */
  @Field(() => Int, {
    description: 'Total count of items in this group',
  })
  count!: number;

  /**
   * Individual items in this group (optional)
   * Only included when includeItems is true in the request
   * The actual type will be determined by the specific resolver implementation
   */
  @Field(() => [String], {
    nullable: true,
    description: 'Individual items in this group as JSON strings (optional)',
  })
  items?: string[];
}