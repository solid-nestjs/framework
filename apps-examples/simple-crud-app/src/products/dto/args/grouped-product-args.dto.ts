import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { GroupByArgs } from '@solid-nestjs/common';
import { FindProductArgs } from './find-product-args.dto';
import { ProductGroupByRequest } from '../inputs';
import { Product } from '../../entities/product.entity';

export class GroupedProductArgs extends FindProductArgs implements GroupByArgs<Product> {
  @ApiProperty({ 
    type: ProductGroupByRequest, 
    description: 'GroupBy configuration for products' 
  })
  @ValidateNested()
  @Type(() => ProductGroupByRequest)
  groupBy!: ProductGroupByRequest;
}