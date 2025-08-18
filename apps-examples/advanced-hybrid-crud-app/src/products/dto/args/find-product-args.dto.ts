import { ArgsType } from '@nestjs/graphql';
import {
  FindArgsFrom,
  createWhereFields,
  createOrderByFields,
  getWhereClass,
  getOrderByClass,
} from '@solid-nestjs/typeorm-hybrid-crud';
import { FindSupplierArgs } from '../../../suppliers/dto';
import { Product } from '../../entities/product.entity';

// Get relation classes
const SupplierWhere = getWhereClass(FindSupplierArgs);

// Generate WhereFields automatically with type inference (replaces 50+ lines)
const FindProductWhere = createWhereFields(
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
    description: 'Filter fields for Product entity',
  },
);

// Get relation OrderBy class
const SupplierOrderBy = getOrderByClass(FindSupplierArgs);

// Generate OrderByFields automatically (replaces 50+ lines)
const FindProductOrderBy = createOrderByFields(
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
    description: 'Order by fields for Product entity',
  },
);

// Final FindArgs - identical interface to the original!
@ArgsType()
export class FindProductArgs extends FindArgsFrom<Product>({
  whereType: FindProductWhere,
  orderByType: FindProductOrderBy,
}) {}
