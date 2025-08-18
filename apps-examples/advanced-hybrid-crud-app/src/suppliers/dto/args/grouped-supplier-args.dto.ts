import { ArgsType } from '@nestjs/graphql';
import { GroupByArgsFrom, createGroupByFields } from '@solid-nestjs/typeorm-hybrid-crud';
import { FindSupplierArgs } from './find-supplier-args.dto';
import { Supplier } from '../../entities/supplier.entity';

// Generated GROUP BY fields using helper
export const SupplierGroupByFields = createGroupByFields(Supplier, {
  name: {
    description: 'Group by supplier name'
  },
  contactEmail: {
    description: 'Group by supplier contact email'
  },
}, {
  name: 'SupplierGroupByFields',
  description: 'GROUP BY fields for Supplier queries'
});

/**
 * GroupBy arguments for Supplier queries with both REST and GraphQL support
 * 
 * This class extends FindSupplierArgs to add groupBy functionality using the
 * SupplierGroupByFields generated with createGroupByFields helper.
 * 
 * Example usage:
 * - REST API: POST /suppliers/grouped with { groupBy: { fields: { name: true }, aggregates: [...] } }
 * - GraphQL: query { suppliersGrouped(groupBy: { fields: { name: true }, aggregates: [...] }) { ... } }
 */
@ArgsType()
export class GroupedSupplierArgs extends GroupByArgsFrom({
  findArgsType: FindSupplierArgs,
  groupByFieldsType: SupplierGroupByFields,
  options: {
    name: 'GroupedSupplierArgs',
    description: 'Arguments for grouping suppliers with filtering and aggregation support',
    groupByInputTypeName: 'SupplierGroupByInput',
  },
}) {}