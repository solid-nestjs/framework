import { ArgsType } from '@nestjs/graphql';
import {
  FindArgsFrom,
  createWhereFields,
  createOrderByFields,
} from '@solid-nestjs/typeorm-hybrid-crud';
import { Product } from '../../entities/product.entity';

// Generated WHERE fields using helper - auto-infers filters for entity fields
const ProductWhere = createWhereFields(Product, {
  name: true, // Auto-infers StringFilter + applies all decorators
  price: true, // Auto-infers NumberFilter + applies all decorators
  stock: true, // Auto-infers NumberFilter + applies all decorators
}, {
  name: 'ProductWhere',
  description: 'WHERE conditions for Product queries'
});

// Generated ORDER BY fields using helper - auto-infers OrderByTypes enum
const ProductOrderBy = createOrderByFields(Product, {
  name: true, // Enables ordering + applies all decorators
  price: true, // Enables ordering + applies all decorators
  stock: true, // Enables ordering + applies all decorators
}, {
  name: 'ProductOrderBy',
  description: 'ORDER BY options for Product queries'
});

@ArgsType()
export class FindProductArgs extends FindArgsFrom<Product>({
  whereType: ProductWhere,
  orderByType: ProductOrderBy,
}) {}