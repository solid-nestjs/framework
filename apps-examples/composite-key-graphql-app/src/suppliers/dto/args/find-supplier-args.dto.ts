import { ArgsType, Field, InputType } from '@nestjs/graphql';
import {
  FindArgsFrom,
  NumberFilter,
  OrderBy,
  OrderByTypes,
  StringFilter,
  Where,
} from '@solid-nestjs/typeorm-graphql-crud';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Supplier } from '../../entities/supplier.entity';
import { Product } from '../../../products/entities/product.entity';

// Simplified Product Where to avoid circular reference
@InputType({ isAbstract: true })
class ProductWhereForSupplier implements Partial<Where<Product>> {
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

  // Explicitly NOT including supplier field to avoid circular reference
}

@InputType({ isAbstract: true })
class FindSupplierWhere implements Where<Supplier> {
  @Field(() => StringFilter, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => StringFilter)
  name?: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => StringFilter)
  contactEmail?: StringFilter;

  @Field(() => ProductWhereForSupplier, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductWhereForSupplier)
  products?: ProductWhereForSupplier;
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
}) {}
