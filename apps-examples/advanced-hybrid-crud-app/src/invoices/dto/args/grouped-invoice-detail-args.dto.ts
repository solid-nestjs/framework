import { ArgsType } from '@nestjs/graphql';
import { GroupByArgsFrom, createGroupByFields } from '@solid-nestjs/typeorm-hybrid-crud';
import { FindInvoiceDetailArgs } from './find-invoice-detail-args.dto';
import { InvoiceDetail } from '../../entities/invoice-detail.entity';
import { ProductGroupByFields } from '../../../products/dto/args/grouped-product-args.dto';

// Generated GROUP BY fields using helper
export const InvoiceDetailGroupByFields = createGroupByFields(InvoiceDetail, {
  id: {
    description: 'Group by invoice detail ID'
  },
  quantity: {
    description: 'Group by quantity'
  },
  unitPrice: {
    description: 'Group by unit price'
  },
  totalAmount: {
    description: 'Group by total amount'
  },
  productId: {
    description: 'Group by product ID'
  },
  product: ProductGroupByFields, // Reuse exported ProductGroupByFields
}, {
  name: 'InvoiceDetailGroupByFields',
  description: 'GROUP BY fields for InvoiceDetail queries'
});

/**
 * GroupBy arguments for InvoiceDetail queries with both REST and GraphQL support
 * 
 * This class extends FindInvoiceDetailArgs to add groupBy functionality using the
 * InvoiceDetailGroupByFields generated with createGroupByFields helper.
 * 
 * Example usage:
 * - REST API: POST /invoice-details/grouped with { groupBy: { fields: { product: { name: true } }, aggregates: [...] } }
 * - GraphQL: query { invoiceDetailsGrouped(groupBy: { fields: { product: { name: true } }, aggregates: [...] }) { ... } }
 */
@ArgsType()
export class GroupedInvoiceDetailArgs extends GroupByArgsFrom({
  findArgsType: FindInvoiceDetailArgs,
  groupByFieldsType: InvoiceDetailGroupByFields,
  options: {
    name: 'GroupedInvoiceDetailArgs',
    description: 'Arguments for grouping invoice details with filtering and aggregation support',
    groupByInputTypeName: 'InvoiceDetailGroupByInput',
  },
}) {}