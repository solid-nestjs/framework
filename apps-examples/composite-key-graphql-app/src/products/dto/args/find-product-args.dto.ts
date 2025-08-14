import { ArgsType, Field, InputType } from '@nestjs/graphql';
import {
  FindArgsFrom,
  getOrderByClass,
  getWhereClass,
  NumberFilter,
  OrderBy,
  OrderByTypes,
  StringFilter,
  Where,
} from '@solid-nestjs/typeorm-graphql-crud';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { FindSupplierArgs } from '../../../suppliers/dto';
import { Supplier } from '../../../suppliers/entities/supplier.entity';
import { Product } from '../../entities/product.entity';
import { ProductGroupByRequest } from '../inputs';

const SupplierWhere = getWhereClass(FindSupplierArgs);

@InputType({ isAbstract: true })
class FindProductWhere implements Where<Product> {
  @Field(() => StringFilter, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => StringFilter)
  name?: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => StringFilter)
  description?: StringFilter;

  @Field(() => NumberFilter, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => NumberFilter)
  price?: NumberFilter;

  @Field(() => NumberFilter, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => NumberFilter)
  stock?: NumberFilter;

  @Field(() => SupplierWhere, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => SupplierWhere)
  supplier?: Where<Supplier> | undefined;
}

const SupplierOrderBy = getOrderByClass(FindSupplierArgs);

@InputType({ isAbstract: true })
class FindProductOrderBy implements OrderBy<Product> {
  @Field(() => OrderByTypes, { nullable: true })
  description?: OrderByTypes | undefined;

  @Field(() => OrderByTypes, { nullable: true })
  name?: OrderByTypes | undefined;

  @Field(() => OrderByTypes, { nullable: true })
  price?: OrderByTypes | undefined;

  @Field(() => OrderByTypes, { nullable: true })
  stock?: OrderByTypes | undefined;

  @Field(() => SupplierOrderBy, { nullable: true })
  supplier?: OrderBy<Supplier> | undefined;
}

@ArgsType()
export class FindProductArgs extends FindArgsFrom<Product>({
  whereType: FindProductWhere,
  orderByType: FindProductOrderBy,
  groupByType: ProductGroupByRequest,
}) {}
