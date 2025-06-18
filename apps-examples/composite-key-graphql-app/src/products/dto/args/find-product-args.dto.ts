import { ArgsType, Field, InputType } from '@nestjs/graphql';
import {
  FindArgsFrom,
  getOrderByClass,
  getWhereClass,
  OrderBy,
  OrderByTypes,
  StringFilter,
  Where,
} from '@solid-nestjs/typeorm-graphql-crud';
import { FindSupplierArgs } from '../../../suppliers/dto';
import { Supplier } from '../../../suppliers/entities/supplier.entity';
import { Product } from '../../entities/product.entity';

const SupplierWhere = getWhereClass(FindSupplierArgs);

@InputType({ isAbstract: true })
class FindProductWhere implements Where<Product> {
  @Field(() => StringFilter)
  name: StringFilter;

  @Field(() => SupplierWhere)
  supplier: Where<Supplier> | undefined;
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
}) {}
