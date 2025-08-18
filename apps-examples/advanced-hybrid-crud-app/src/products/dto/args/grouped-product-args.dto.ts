import { ArgsType } from '@nestjs/graphql';
import {
  GroupByArgsFrom,
  createGroupByFields,
} from '@solid-nestjs/typeorm-hybrid-crud';
import { FindProductArgs } from './find-product-args.dto';
import { Product } from '../../entities/product.entity';
import { Supplier } from '../../../suppliers/entities/supplier.entity';

/**
 * GroupBy fields for Supplier using helper
 */
const SupplierGroupByFields = createGroupByFields(Supplier, {
  name: true,
  contactEmail: true,
});

/**
 * GroupBy fields for Product using helper
 */
const ProductGroupByFields = createGroupByFields(Product, {
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
