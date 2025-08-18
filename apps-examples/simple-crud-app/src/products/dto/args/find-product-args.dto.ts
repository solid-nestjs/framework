import {
  createOrderByFields,
  createWhereFields,
  FindArgsFrom,
  getOrderByClass,
  getWhereClass,
} from '@solid-nestjs/typeorm-crud';
import { FindSupplierArgs } from '../../../suppliers/dto';
import { Product } from '../../entities/product.entity';

const SupplierWhere = getWhereClass(FindSupplierArgs);

const FindProductWhere = createWhereFields(Product, {
  name: true,
  description: true,
  price: true,
  stock: true,
  supplier: SupplierWhere,
});

const SupplierOrderBy = getOrderByClass(FindSupplierArgs);

const FindProductOrderBy = createOrderByFields(Product, {
  description: true,
  name: true,
  price: true,
  stock: true,
  supplier: SupplierOrderBy,
});

export class FindProductArgs extends FindArgsFrom<Product>({
  whereType: FindProductWhere,
  orderByType: FindProductOrderBy,
}) {}
