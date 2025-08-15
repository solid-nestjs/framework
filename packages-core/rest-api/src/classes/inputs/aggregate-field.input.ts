import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AggregateFunctionTypes } from '@solid-nestjs/common';

/**
 * REST API input type for defining aggregate field configurations in groupBy operations.
 *
 * @class AggregateFieldInput
 *
 * @example
 * ```json
 * {
 *   "field": "price",
 *   "function": "AVG",
 *   "alias": "avgPrice"
 * }
 * ```
 */
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
  @IsOptional()
  @IsString()
  alias?: string;
}