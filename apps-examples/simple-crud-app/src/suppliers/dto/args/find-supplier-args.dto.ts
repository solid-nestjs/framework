import {
  FindArgsFrom,
  createWhereFields,
  createOrderByFields,
} from '@solid-nestjs/typeorm-crud';
import { Supplier } from '../../entities/supplier.entity';

// Generated WHERE fields using helper
const SupplierWhere = createWhereFields(
  Supplier,
  {
    name: true, // Auto-infers StringFilter + applies all decorators
    contactEmail: true, // Auto-infers StringFilter + applies all decorators
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

export class FindSupplierArgs extends FindArgsFrom<Supplier>({
  whereType: SupplierWhere,
  orderByType: SupplierOrderBy,
}) {}
