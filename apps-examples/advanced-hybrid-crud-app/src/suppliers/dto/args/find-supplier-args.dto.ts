import { ArgsType } from '@nestjs/graphql';
import {
  FindArgsFrom,
  createWhereFields,
  createOrderByFields,
} from '@solid-nestjs/typeorm-hybrid-crud';
import { Supplier } from '../../entities/supplier.entity';

// Generated WHERE fields using helper - auto-infers StringFilter for string fields
const SupplierWhere = createWhereFields(Supplier, {
  name: true, // Auto-infers StringFilter + applies all decorators
  contactEmail: true, // Auto-infers StringFilter + applies all decorators
}, {
  name: 'SupplierWhere',
  description: 'WHERE conditions for Supplier queries'
});

// Generated ORDER BY fields using helper - auto-infers OrderByTypes enum
const SupplierOrderBy = createOrderByFields(Supplier, {
  name: true, // Enables ordering + applies all decorators
  contactEmail: true, // Enables ordering + applies all decorators
}, {
  name: 'SupplierOrderBy',
  description: 'ORDER BY options for Supplier queries'
});

@ArgsType()
export class FindSupplierArgs extends FindArgsFrom<Supplier>({
  whereType: SupplierWhere,
  orderByType: SupplierOrderBy,
}) {}
