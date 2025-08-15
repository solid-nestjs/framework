import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AggregateFieldInput } from './aggregate-field.input';

/**
 * Base GraphQL input type for GroupBy requests.
 * This is a generic base that should be extended with specific groupBy fields.
 *
 * @class GroupByRequestInput
 *
 * @example
 * ```typescript
 * // Extend this class with specific entity groupBy fields
 * @InputType()
 * class ProductGroupByRequestInput extends GroupByRequestInput {
 *   @Field(() => ProductGroupByFieldsInput, { nullable: true })
 *   fields?: ProductGroupByFieldsInput;
 * }
 * ```
 */
@InputType()
export class GroupByRequestInput {
  /**
   * Aggregate functions to apply
   */
  @Field(() => [AggregateFieldInput], {
    nullable: true,
    description: 'Aggregate functions to apply to the grouped data',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AggregateFieldInput)
  aggregates?: AggregateFieldInput[];
}
