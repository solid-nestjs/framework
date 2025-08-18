import { ArgsType } from '@nestjs/graphql';
import {
  FindArgsFrom,
  createWhereFields,
  createOrderByFields,
} from '@solid-nestjs/typeorm-graphql-crud';
import { Supplier } from '../../entities/supplier.entity';
import { Product } from '../../../products/entities/product.entity';

// Simplified Product Where to avoid circular reference
const ProductWhereForSupplier = createWhereFields(
  Product,
  {
    name: true, // Auto-infers StringFilter
    description: true, // Auto-infers StringFilter
    price: true, // Auto-infers NumberFilter
    stock: true, // Auto-infers NumberFilter
    // Explicitly NOT including supplier field to avoid circular reference
  },
  {
    name: 'ProductWhereForSupplier',
    description: 'Product filtering options for Supplier queries (avoiding circular reference)',
  },
);

// Generated WHERE fields using helper
const SupplierWhere = createWhereFields(
  Supplier,
  {
    name: true, // Auto-infers StringFilter + applies all decorators
    contactEmail: true, // Auto-infers StringFilter + applies all decorators
    products: ProductWhereForSupplier, // Use the simplified Product Where class
  },
  {
    name: 'FindSupplierWhere',
    description: 'WHERE conditions for Supplier queries',
  },
);

// Generated ORDER BY fields using helper
const SupplierOrderBy = createOrderByFields(
  Supplier,
  {
    name: true, // Enables ordering + applies all decorators
    contactEmail: true, // Enables ordering + applies all decorators
  },
  {
    name: 'FindSupplierOrderBy',
    description: 'ORDER BY options for Supplier queries',
  },
);

@ArgsType()
export class FindSupplierArgs extends FindArgsFrom<Supplier>({
  whereType: SupplierWhere,
  orderByType: SupplierOrderBy,
}) {}
