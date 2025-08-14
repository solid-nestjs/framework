import { ArgsType, Field } from '@nestjs/graphql';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationRequest } from '@solid-nestjs/graphql';
import { ProductGroupByRequest } from '../inputs';

@ArgsType()
export class GroupedProductArgs {
  @Field(() => PaginationRequest, { nullable: true })
  @IsOptional()
  pagination?: PaginationRequest;

  @Field(() => ProductGroupByRequest, { 
    description: 'GroupBy configuration for products'
  })
  @ValidateNested()
  @Type(() => ProductGroupByRequest)
  groupBy: ProductGroupByRequest;
}