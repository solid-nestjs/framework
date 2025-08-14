import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsArray, ValidateNested, IsBoolean, IsInt, Min } from 'class-validator';
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

  /**
   * Whether to include individual items in each group
   * @default false
   */
  @Field(() => Boolean, {
    nullable: true,
    defaultValue: false,
    description: 'Whether to include individual items in each group',
  })
  @IsOptional()
  @IsBoolean()
  includeItems?: boolean;

  /**
   * Maximum number of items to include per group when includeItems is true
   * @default 10
   */
  @Field(() => Int, {
    nullable: true,
    defaultValue: 10,
    description: 'Maximum number of items to include per group when includeItems is true',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxItemsPerGroup?: number;
}