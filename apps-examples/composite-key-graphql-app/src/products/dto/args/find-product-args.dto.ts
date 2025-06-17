import { ArgsType, Field, InputType } from '@nestjs/graphql';
import {
  FindArgsFrom,
  OrderBy,
  OrderByTypes,
  StringFilter,
  Where,
} from '@solid-nestjs/typeorm-graphql-crud';
import { Product } from '../../entities/product.entity';

@InputType({ isAbstract: true })
class FindProductWhere implements Where<Product> {
  @Field(() => StringFilter)
  name: StringFilter;
}

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
}

@ArgsType()
export class FindProductArgs extends FindArgsFrom<Product>({
  whereType: FindProductWhere,
  orderByType: FindProductOrderBy,
}) {}
