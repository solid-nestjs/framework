import { ApiProperty } from '@nestjs/swagger';
import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AggregateFieldInput } from './aggregate-field.input';

/**
 * Hybrid base input type for GroupBy requests.
 * Works with both REST API (Swagger) and GraphQL.
 * This is a generic base that should be extended with specific groupBy fields.
 *
 * @class GroupByRequestInput
 *
 * @example REST API
 * ```typescript
 * // Extend this class with specific entity groupBy fields
 * export class ProductGroupByRequest extends GroupByRequestInput {
 *   @ApiProperty({ type: ProductGroupByFields, required: false })
 *   @Field(() => ProductGroupByFields, { nullable: true })
 *   fields?: ProductGroupByFields;
 * }
 * ```
 *
 * @example GraphQL
 * ```typescript
 * // Same class works for GraphQL
 * @InputType('ProductGroupByRequestInput')
 * export class ProductGroupByRequest extends GroupByRequestInput {
 *   @ApiProperty({ type: ProductGroupByFields, required: false })
 *   @Field(() => ProductGroupByFields, { nullable: true })
 *   fields?: ProductGroupByFields;
 * }
 * ```
 */
@InputType('GroupByRequestInput')
export class GroupByRequestInput {
  /**
   * Aggregate functions to apply
   */
  @ApiProperty({
    type: [AggregateFieldInput],
    required: false,
    description: 'Aggregate functions to apply to the grouped data',
  })
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
