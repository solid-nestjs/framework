import { ApiProperty } from '@nestjs/swagger';
import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsArray, ValidateNested, IsBoolean, IsInt, Min } from 'class-validator';
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
    description: 'Aggregate functions to apply to the grouped data'
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

  /**
   * Whether to include individual items in each group
   * @default false
   */
  @ApiProperty({
    required: false,
    default: false,
    description: 'Whether to include individual items in each group'
  })
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
  @ApiProperty({
    required: false,
    default: 10,
    description: 'Maximum number of items to include per group when includeItems is true'
  })
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