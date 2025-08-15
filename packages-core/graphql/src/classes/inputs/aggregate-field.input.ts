import { InputType, Field } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AggregateFunctionTypes } from '../../enums';

/**
 * GraphQL input type for defining aggregate field configurations in groupBy operations.
 *
 * @class AggregateFieldInput
 *
 * @example
 * ```graphql
 * input AggregateFieldInput {
 *   field: String!
 *   function: AggregateFunctionTypes!
 *   alias: String
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Usage in GraphQL query
 * query {
 *   productsGrouped(
 *     groupBy: {
 *       aggregates: [
 *         { field: "price", function: AVG, alias: "avgPrice" },
 *         { field: "id", function: COUNT, alias: "totalProducts" }
 *       ]
 *     }
 *   ) {
 *     groups {
 *       aggregates
 *     }
 *   }
 * }
 * ```
 */
@InputType()
export class AggregateFieldInput {
  /**
   * The field name to apply the aggregate function to
   *
   * @example "price", "id", "supplier.name"
   */
  @Field(() => String, {
    description: 'The field name to apply the aggregate function to',
  })
  @IsNotEmpty()
  @IsString()
  field!: string;

  /**
   * The aggregate function to apply
   */
  @Field(() => AggregateFunctionTypes, {
    description: 'The aggregate function to apply',
  })
  @IsEnum(AggregateFunctionTypes)
  function!: AggregateFunctionTypes;

  /**
   * Optional alias for the aggregate result
   * If not provided, defaults to `${function}_${field}`
   */
  @Field(() => String, {
    nullable: true,
    description: 'Optional alias for the aggregate result',
  })
  @IsOptional()
  @IsString()
  alias?: string;
}