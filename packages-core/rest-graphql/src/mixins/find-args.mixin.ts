import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type as TransformerType } from 'class-transformer';
import { SetMetadata, Type, mixin } from '@nestjs/common';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { Constructable, FindArgs, OrderBy, Where } from '@solid-nestjs/common';
import { PaginationRequest } from '../classes/inputs';
import { FindArgsStructure } from '../interfaces';
import { PartialType } from '../helpers';

export const WHERE_CLASS_KEY = 'WhereClass';
export const ORDER_BY_CLASS_KEY = 'OrderByClass';

/**
 * Dynamically generates a Rest-API + GraphQL argument type for querying entities with optional pagination, filtering (where), and sorting (orderBy) capabilities.
 *
 * @template EntityType - The entity type for which the arguments are being generated.
 * @template WhereType - The type representing the filtering criteria, extending `Where<EntityType>`.
 * @template OrderByType - The type representing the sorting criteria, extending `OrderBy<EntityType>`.
 *
 * @param findArgsStructure - Optional structure containing the types for `where` and `orderBy` arguments.
 * @param findArgsStructure.whereType - The input type for filtering (where) conditions.
 * @param findArgsStructure.orderByType - The input type for sorting (orderBy) conditions.
 *
 * @returns A dynamically constructed class (decorated with GraphQL and validation decorators) that implements `FindArgs<EntityType>`, including optional `pagination`, `where`, and `orderBy` fields as appropriate.
 *
 * @remarks
 * - The returned class is decorated for use with GraphQL and class-validator.
 * - If `whereType` is provided, a nested input type is created to support logical `_and` and `_or` conditions.
 * - If `orderByType` is provided, an array of sorting criteria is supported.
 * - Useful for building flexible and type-safe Rest-Api + GraphQL query argument types in NestJS applications.
 */
export function FindArgsFrom<
  EntityType,
  WhereType extends Where<EntityType> = Where<EntityType>,
  OrderByType extends OrderBy<EntityType> = OrderBy<EntityType>,
>(
  findArgsStructure?: FindArgsStructure<EntityType, WhereType, OrderByType>,
): Type<FindArgs<EntityType>> {
  const { whereType, orderByType } = findArgsStructure ?? {};

  @ArgsType()
  class ArgsClass implements FindArgs<EntityType> {
    @ApiProperty({ type: () => PaginationRequest, required: false })
    @Field(() => PaginationRequest, { nullable: true })
    @TransformerType(() => PaginationRequest)
    @IsOptional()
    @ValidateNested()
    pagination?: PaginationRequest;
  }

  let returnedClass: Constructable<ArgsClass> = ArgsClass;

  if (whereType) {
    @ApiSchema({ name: whereType.name })
    @InputType(whereType.name)
    class WhereClass extends PartialType(whereType as Constructable) {
      @ApiProperty({ type: () => [whereType], required: false, example: [] })
      @Field(() => [WhereClass], { nullable: true })
      @IsArray()
      @TransformerType(() => WhereClass)
      @IsOptional()
      @ValidateNested()
      _and?: WhereClass[];

      @ApiProperty({ type: () => [whereType], required: false, example: [] })
      @Field(() => [WhereClass], { nullable: true })
      @IsArray()
      @TransformerType(() => WhereClass)
      @IsOptional()
      @ValidateNested()
      _or?: WhereClass[];
    }

    @ArgsType()
    @SetMetadata(WHERE_CLASS_KEY, WhereClass)
    class ArgsClassWithWhere extends returnedClass {
      @Field(() => WhereClass, { nullable: true })
      @ApiProperty({ type: () => WhereClass, required: false })
      @TransformerType(() => WhereClass)
      @IsOptional()
      @ValidateNested()
      where?: WhereClass;
    }

    returnedClass = ArgsClassWithWhere;
  }

  if (orderByType) {
    @ApiSchema({ name: orderByType.name })
    @InputType(orderByType.name)
    class OrderByClass extends PartialType(orderByType as Constructable) {}

    @ArgsType()
    @SetMetadata(ORDER_BY_CLASS_KEY, OrderByClass)
    class ArgsClassWithOrderBy extends returnedClass {
      @Field(() => [OrderByClass], { nullable: true })
      @ApiProperty({ type: () => [OrderByClass], required: false })
      @IsArray()
      @TransformerType(() => OrderByClass)
      @IsOptional()
      @ValidateNested()
      orderBy?: OrderByClass[];
    }

    returnedClass = ArgsClassWithOrderBy;
  }

  return mixin(returnedClass);
}

export function getWhereClass(findArgsType) {
  return Reflect.getMetadata(WHERE_CLASS_KEY, findArgsType);
}

export function getOrderByClass(findArgsType) {
  return Reflect.getMetadata(ORDER_BY_CLASS_KEY, findArgsType);
}
