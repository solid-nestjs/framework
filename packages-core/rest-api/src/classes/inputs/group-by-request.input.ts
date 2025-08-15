import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AggregateFieldInput } from './aggregate-field.input';

/**
 * Base REST API input type for GroupBy requests.
 * This is a generic base that should be extended with specific groupBy fields.
 *
 * @class GroupByRequestInput
 *
 * @example
 * ```typescript
 * // Extend this class with specific entity groupBy fields
 * export class ProductGroupByRequest extends GroupByRequestInput {
 *   @ApiProperty({ type: ProductGroupByFields, required: false })
 *   fields?: ProductGroupByFields;
 * }
 * ```
 */
export class GroupByRequestInput {
  /**
   * Aggregate functions to apply
   */
  @ApiProperty({
    type: [AggregateFieldInput],
    required: false,
    description: 'Aggregate functions to apply to the grouped data',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AggregateFieldInput)
  aggregates?: AggregateFieldInput[];
}
