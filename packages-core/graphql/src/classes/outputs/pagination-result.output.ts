import { ObjectType, Field, Int } from '@nestjs/graphql';

/**
 * GraphQL output type representing pagination metadata.
 * Based on the PaginationResult interface from @solid-nestjs/common.
 *
 * @class PaginationResultOutput
 *
 * @example
 * ```graphql
 * type PaginationResultOutput {
 *   total: Int!
 *   count: Int!
 *   limit: Int
 *   page: Int!
 *   pageCount: Int!
 *   hasNextPage: Boolean!
 *   hasPreviousPage: Boolean!
 * }
 * ```
 */
@ObjectType()
export class PaginationResultOutput {
  /**
   * Total number of items across all pages
   */
  @Field(() => Int, {
    description: 'Total number of items across all pages',
  })
  total!: number;

  /**
   * Number of items on the current page
   */
  @Field(() => Int, {
    description: 'Number of items on the current page',
  })
  count!: number;

  /**
   * Maximum number of items per page
   */
  @Field(() => Int, {
    nullable: true,
    description: 'Maximum number of items per page',
  })
  limit?: number;

  /**
   * Current page number
   */
  @Field(() => Int, {
    description: 'Current page number',
  })
  page!: number;

  /**
   * Total number of pages
   */
  @Field(() => Int, {
    description: 'Total number of pages',
  })
  pageCount!: number;

  /**
   * Whether there is a next page
   */
  @Field(() => Boolean, {
    description: 'Whether there is a next page',
  })
  hasNextPage!: boolean;

  /**
   * Whether there is a previous page
   */
  @Field(() => Boolean, {
    description: 'Whether there is a previous page',
  })
  hasPreviousPage!: boolean;
}