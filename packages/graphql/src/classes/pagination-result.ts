import { Field, Int, ObjectType } from "@nestjs/graphql";
import { PaginationResult as CommonPaginationResult } from "@solid-nestjs/common";

/**
 * Represents the result of a paginated query.
 * 
 * @implements {CommonPaginationResult}
 * 
 * @property {number} total - The total number of items available.
 * @property {number} count - The number of items returned in the current page.
 * @property {number} [limit] - The maximum number of items per page (optional).
 * @property {number} page - The current page number.
 * @property {number} pageCount - The total number of pages available.
 * @property {boolean} hasNextPage - Indicates if there is a next page.
 * @property {boolean} hasPreviousPage - Indicates if there is a previous page.
 */
@ObjectType()
export class PaginationResult implements CommonPaginationResult {

  @Field(() => Int)
  total!: number;

  @Field(() => Int)
  count!: number;

  @Field(() => Int,{ nullable:true })
  limit?: number;

  @Field(() => Int)
  page!: number;

  @Field(() => Int)
  pageCount!: number;

  @Field(() => Boolean)
  hasNextPage!: boolean;

  @Field(() => Boolean)
  hasPreviousPage!: boolean;
}