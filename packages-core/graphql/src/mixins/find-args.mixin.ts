import { IsOptional } from 'class-validator';
import { SetMetadata, Type, mixin } from '@nestjs/common';
import { ArgsType, Field, InputType, PartialType } from '@nestjs/graphql';
import { Constructable, FindArgs, OrderBy, Where, GroupBy, GroupByRequest } from '@solid-nestjs/common';
import { PaginationRequest, GroupByRequestInput } from '../classes/inputs';
import { FindArgsStructure } from '../interfaces';

export const WHERE_CLASS_KEY = 'WhereClass';
export const ORDER_BY_CLASS_KEY = 'OrderByClass';
export const GROUP_BY_CLASS_KEY = 'GroupByClass';

/**
 * Dynamically generates a GraphQL argument type for querying entities with optional pagination, filtering (where), sorting (orderBy), and grouping (groupBy) capabilities.
 *
 * @template EntityType - The entity type for which the arguments are being generated.
 * @template WhereType - The type representing the filtering criteria, extending `Where<EntityType>`.
 * @template OrderByType - The type representing the sorting criteria, extending `OrderBy<EntityType>`.
 * @template GroupByType - The type representing the grouping criteria, extending `GroupByRequest<EntityType>`.
 *
 * @param findArgsStructure - Optional structure containing the types for `where`, `orderBy`, and `groupBy` arguments.
 * @param findArgsStructure.whereType - The input type for filtering (where) conditions.
 * @param findArgsStructure.orderByType - The input type for sorting (orderBy) conditions.
 * @param findArgsStructure.groupByType - The input type for grouping (groupBy) conditions.
 *
 * @returns A dynamically constructed class (decorated with GraphQL and validation decorators) that implements `FindArgs<EntityType>`, including optional `pagination`, `where`, `orderBy`, and `groupBy` fields as appropriate.
 *
 * @remarks
 * - The returned class is decorated for use with GraphQL and class-validator.
 * - If `whereType` is provided, a nested input type is created to support logical `_and` and `_or` conditions.
 * - If `orderByType` is provided, an array of sorting criteria is supported.
 * - If `groupByType` is provided, grouping and aggregation capabilities are enabled.
 * - Useful for building flexible and type-safe GraphQL query argument types in NestJS applications.
 */
export function FindArgsFrom<
  EntityType,
  WhereType extends Where<EntityType> = Where<EntityType>,
  OrderByType extends OrderBy<EntityType> = OrderBy<EntityType>,
  GroupByType extends GroupByRequest<EntityType> = GroupByRequest<EntityType>,
>(
  findArgsStructure?: FindArgsStructure<EntityType, WhereType, OrderByType, GroupByType>,
): Type<FindArgs<EntityType>> {
  const { whereType, orderByType, groupByType } = findArgsStructure ?? {};

  @ArgsType()
  class ArgsClass implements FindArgs<EntityType> {
    @Field(() => PaginationRequest, { nullable: true })
    @IsOptional()
    pagination?: PaginationRequest;
  }

  let returnedClass: Constructable<ArgsClass> = ArgsClass;

  if (whereType) {
    @InputType(whereType.name)
    class WhereClass extends PartialType(whereType as Constructable) {
      @Field(() => [WhereClass], { nullable: true })
      @IsOptional()
      _and?: WhereClass[];

      @Field(() => [WhereClass], { nullable: true })
      @IsOptional()
      _or?: WhereClass[];
    }

    @ArgsType()
    @SetMetadata(WHERE_CLASS_KEY, WhereClass)
    class ArgsClassWithWhere extends returnedClass {
      @Field(() => WhereClass, { nullable: true })
      @IsOptional()
      where?: WhereClass;
    }

    returnedClass = ArgsClassWithWhere;
  }

  if (orderByType) {
    @InputType(orderByType.name)
    class OrderByClass extends PartialType(orderByType as Constructable) {}

    @ArgsType()
    @SetMetadata(ORDER_BY_CLASS_KEY, OrderByClass)
    class ArgsClassWithOrderBy extends returnedClass {
      @Field(() => [OrderByClass], { nullable: true })
      @IsOptional()
      orderBy?: OrderByClass[];
    }

    returnedClass = ArgsClassWithOrderBy;
  }

  if (groupByType) {
    @InputType(groupByType.name)
    class GroupByClass extends PartialType(groupByType as Constructable) {}

    @ArgsType()
    @SetMetadata(GROUP_BY_CLASS_KEY, GroupByClass)
    class ArgsClassWithGroupBy extends returnedClass {
      @Field(() => GroupByClass, { nullable: true })
      @IsOptional()
      groupBy?: GroupByClass;
    }

    returnedClass = ArgsClassWithGroupBy;
  }

  return mixin(returnedClass);
}

export function getWhereClass(findArgsType) {
  return Reflect.getMetadata(WHERE_CLASS_KEY, findArgsType);
}

export function getOrderByClass(findArgsType) {
  return Reflect.getMetadata(ORDER_BY_CLASS_KEY, findArgsType);
}

export function getGroupByClass(findArgsType) {
  return Reflect.getMetadata(GROUP_BY_CLASS_KEY, findArgsType);
}
