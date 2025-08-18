import { ArgsType, Field, InputType } from '@nestjs/graphql';
import {
  GroupByArgs,
  GroupByArgsFrom,
  createGroupByFields,
} from '@solid-nestjs/typeorm-hybrid-crud';
import { FindProductArgs } from './find-product-args.dto';
import { Product } from '../../entities/product.entity';
import { Supplier } from '../../../suppliers/entities/supplier.entity';
import { ApiProperty } from '@nestjs/swagger';
import { GroupByRequestInput } from '@solid-nestjs/rest-graphql';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * GroupBy fields for Supplier using helper
 */
export const SupplierGroupByFields = createGroupByFields(Supplier, {
  name: true,
  contactEmail: true,
});

/**
 * GroupBy fields for Product using helper
 */
export const ProductGroupByFields = createGroupByFields(Product, {
  name: true,
  description: true,
  price: true,
  stock: true,
  supplier: SupplierGroupByFields,
});

// Old Implementation that works
/*
@InputType('ProductGroupByInput')
export class ProductGroupByRequest extends GroupByRequestInput {
  @ApiProperty({
    type: ProductGroupByFields,
    required: false,
    description: 'Fields to group by',
  })
  @Field(() => ProductGroupByFields, {
    nullable: true,
    description: 'Fields to group by',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductGroupByFields)
  fields?: typeof ProductGroupByFields;
}

@ArgsType()
export class GroupedProductArgs
  extends FindProductArgs
  implements GroupByArgs<Product>
{
  @ApiProperty({
    type: ProductGroupByRequest,
    description: 'GroupBy configuration for products',
  })
  @Field(() => ProductGroupByRequest, {
    description: 'GroupBy configuration for products',
  })
  @ValidateNested()
  @Type(() => ProductGroupByRequest)
  groupBy;
}
*/
//Our implementation that doesn't work

@ArgsType()
export class GroupedProductArgs extends GroupByArgsFrom({
  findArgsType: FindProductArgs,
  groupByFieldsType: ProductGroupByFields,
  options: {
    name: 'GroupedProductArgs',
    description: 'Arguments for grouping products',
  },
}) {}
/**/
