import { ArgsType } from '@nestjs/graphql';
import { GroupByArgsFrom, createGroupByFields } from '@solid-nestjs/typeorm-hybrid-crud';
import { FindInvoiceArgs } from './find-invoice-args.dto';
import { Invoice } from '../../entities/invoice.entity';
import { ClientGroupByFields } from '../../../clients/dto/args/grouped-client-args.dto';
import { InvoiceDetailGroupByFields } from './grouped-invoice-detail-args.dto';

// Generated GROUP BY fields using helper
export const InvoiceGroupByFields = createGroupByFields(Invoice, {
  id: {
    description: 'Group by invoice ID'
  },
  invoiceNumber: {
    description: 'Group by invoice number'
  },
  totalAmount: {
    description: 'Group by total amount'
  },
  status: {
    description: 'Group by invoice status'
  },
  invoiceDate: {
    description: 'Group by invoice date'
  },
  client: ClientGroupByFields, // Reuse exported ClientGroupByFields
  details: InvoiceDetailGroupByFields, // Reuse exported InvoiceDetailGroupByFields
}, {
  name: 'InvoiceGroupByFields',
  description: 'GROUP BY fields for Invoice queries'
});

/**
 * GroupBy arguments for Invoice queries with both REST and GraphQL support
 * 
 * This class extends FindInvoiceArgs to add groupBy functionality using the
 * InvoiceGroupByFields generated with createGroupByFields helper.
 * 
 * Example usage:
 * - REST API: POST /invoices/grouped with { groupBy: { fields: { status: true, client: { city: true } }, aggregates: [...] } }
 * - GraphQL: query { invoicesGrouped(groupBy: { fields: { status: true, client: { city: true } }, aggregates: [...] }) { ... } }
 */
@ArgsType()
export class GroupedInvoiceArgs extends GroupByArgsFrom({
  findArgsType: FindInvoiceArgs,
  groupByFieldsType: InvoiceGroupByFields,
  options: {
    name: 'GroupedInvoiceArgs',
    description: 'Arguments for grouping invoices with filtering and aggregation support',
    groupByInputTypeName: 'InvoiceGroupByInput',
  },
}) {}