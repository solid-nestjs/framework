import { ArgsType } from '@nestjs/graphql';
import {
  GroupByArgsFrom,
  createGroupByFields,
} from '@solid-nestjs/typeorm-hybrid-crud';
import { FindProductArgs } from './find-product-args.dto';
import { Product } from '../../entities/product.entity';
import { SupplierGroupByFields } from '../../../suppliers/dto/args/grouped-supplier-args.dto';

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

@ArgsType()
export class GroupedProductArgs extends GroupByArgsFrom({
  findArgsType: FindProductArgs,
  groupByFieldsType: ProductGroupByFields,
  options: {
    name: 'GroupedProductArgs',
    description: 'Arguments for grouping products',
    groupByInputTypeName: 'ProductGroupByInput',
  },
}) {}
