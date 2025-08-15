import { ApiProperty } from '@nestjs/swagger';
import { InputType, Field, registerEnumType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AggregateFunctionTypes } from '@solid-nestjs/common';

// Register the enum for GraphQL
registerEnumType(AggregateFunctionTypes, {
  name: 'AggregateFunctionTypes',
  description: 'Available aggregate functions for GROUP BY operations',
});

/**
 * Hybrid input type for defining aggregate field configurations in groupBy operations.
 * Works with both REST API (Swagger) and GraphQL.
 *
 * @class AggregateFieldInput
 *
 * @example REST API
 * ```json
 * {
 *   "field": "price",
 *   "function": "AVG",
 *   "alias": "avgPrice"
 * }
 * ```
 *
 * @example GraphQL
 * ```graphql
 * {
 *   field: "price",
 *   function: AVG,
 *   alias: "avgPrice"
 * }
 * ```
 */
@InputType('AggregateFieldInput')
export class AggregateFieldInput {
  /**
   * The field name to apply the aggregate function to
   *
   * @example "price", "id", "supplier.name"
   */
  @ApiProperty({
    description: 'The field name to apply the aggregate function to',
    example: 'price'
  })
  @Field(() => String, {
    description: 'The field name to apply the aggregate function to',
  })
  @IsNotEmpty()
  @IsString()
  field!: string;

  /**
   * The aggregate function to apply
   */
  @ApiProperty({
    enum: AggregateFunctionTypes,
    description: 'The aggregate function to apply',
    example: AggregateFunctionTypes.AVG
  })
  @Field(() => AggregateFunctionTypes, {
    description: 'The aggregate function to apply',
  })
  @IsEnum(AggregateFunctionTypes)
  function!: AggregateFunctionTypes;

  /**
   * Optional alias for the aggregate result
   * If not provided, defaults to `${function}_${field}`
   */
  @ApiProperty({
    required: false,
    description: 'Optional alias for the aggregate result',
    example: 'avgPrice'
  })
  @Field(() => String, {
    nullable: true,
    description: 'Optional alias for the aggregate result',
  })
  @IsOptional()
  @IsString()
  alias?: string;
}