import { ArgsType } from '@nestjs/graphql';
import {
  FindArgsFrom,
  getWhereClass,
  getOrderByClass,
  createWhereFields,
  createOrderByFields,
} from '@solid-nestjs/typeorm-graphql-crud';
import { FindSupplierArgs } from '../../../suppliers/dto';
import { Product } from '../../entities/product.entity';

const SupplierWhere = getWhereClass(FindSupplierArgs);
const SupplierOrderBy = getOrderByClass(FindSupplierArgs);

// Generated WHERE fields using helper
const ProductWhere = createWhereFields(
  Product,
  {
    name: true, // Auto-infers StringFilter + applies all decorators
    description: true, // Auto-infers StringFilter + applies all decorators
    price: true, // Auto-infers NumberFilter + applies all decorators
    stock: true, // Auto-infers NumberFilter + applies all decorators
    supplier: SupplierWhere, // Use existing Where class for relations
  },
  {
    name: 'FindProductWhere',
    description: 'WHERE conditions for Product queries',
  },
);

// Generated ORDER BY fields using helper for all fields
const ProductOrderBy = createOrderByFields(
  Product,
  {
    name: true, // Enables ordering + applies all decorators
    description: true, // Enables ordering + applies all decorators
    price: true, // Enables ordering + applies all decorators
    stock: true, // Enables ordering + applies all decorators
    supplier: SupplierOrderBy, // Use existing OrderBy class for relations
  },
  {
    name: 'FindProductOrderBy',
    description: 'ORDER BY options for Product queries',
  },
);

@ArgsType()
export class FindProductArgs extends FindArgsFrom<Product>({
  whereType: ProductWhere,
  orderByType: ProductOrderBy,
}) {}
