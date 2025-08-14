import { ArgsType, Field } from '@nestjs/graphql';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationRequest } from '@solid-nestjs/graphql';
import { GroupByArgs } from '@solid-nestjs/common';
import { ProductGroupByRequest } from '../inputs';
import { FindProductArgs } from './find-product-args.dto';
import { Product } from '../../entities/product.entity';

@ArgsType()
export class GroupedProductArgs extends FindProductArgs implements GroupByArgs<Product> {
  @Field(() => ProductGroupByRequest, { 
    description: 'GroupBy configuration for products'
  })
  @ValidateNested()
  @Type(() => ProductGroupByRequest)
  groupBy!: ProductGroupByRequest;
}