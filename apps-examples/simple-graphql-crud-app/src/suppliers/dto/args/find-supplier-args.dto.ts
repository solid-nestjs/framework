import { ArgsType, Field, InputType } from '@nestjs/graphql';
import {
  FindArgsFrom,
  OrderBy,
  OrderByTypes,
  StringFilter,
  Where,
} from '@solid-nestjs/typeorm-graphql-crud';
import { Supplier } from '../../entities/supplier.entity';
import { IsBoolean, IsOptional } from 'class-validator';

@InputType({ isAbstract: true })
class FindSupplierWhere implements Where<Supplier> {
  @Field(() => StringFilter)
  name: StringFilter;

  @Field(() => StringFilter)
  contactEmail: StringFilter;
}

@InputType({ isAbstract: true })
class FindSupplierOrderBy implements OrderBy<Supplier> {
  @Field(() => OrderByTypes, { nullable: true })
  name?: OrderByTypes | undefined;

  @Field(() => OrderByTypes, { nullable: true })
  contactEmail?: OrderByTypes | undefined;
}

@ArgsType()
export class FindSupplierArgs extends FindArgsFrom<Supplier>({
  whereType: FindSupplierWhere,
  orderByType: FindSupplierOrderBy,
}) {
  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  ignoreSuppliersWithoutProducts?: Boolean | undefined;
}
