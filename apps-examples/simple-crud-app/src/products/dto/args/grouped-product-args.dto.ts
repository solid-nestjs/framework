import {
  createGroupByFields,
  GroupByArgsFrom,
} from '@solid-nestjs/typeorm-crud';
import { Product } from '../../entities/product.entity';
import { Supplier } from '../../../suppliers/entities/supplier.entity';
import { FindProductArgs } from './find-product-args.dto';

const SupplierGroupByFields = createGroupByFields(Supplier, {
  name: true,
  contactEmail: true,
});

const ProductGroupByFields = createGroupByFields(Product, {
  name: true,
  description: true,
  price: true,
  stock: true,
  supplier: SupplierGroupByFields,
});

export class GroupedProductArgs extends GroupByArgsFrom({
  findArgsType: FindProductArgs,
  groupByFields: ProductGroupByFields,
}) {}
