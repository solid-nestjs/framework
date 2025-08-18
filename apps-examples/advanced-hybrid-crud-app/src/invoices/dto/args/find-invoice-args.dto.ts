import { ArgsType } from '@nestjs/graphql';
import {
  FindArgsFrom,
  createWhereFields,
  createOrderByFields,
  getWhereClass,
  getOrderByClass,
} from '@solid-nestjs/typeorm-hybrid-crud';
import { Invoice } from '../../entities/invoice.entity';
import { FindClientArgs } from '../../../clients/dto';
import { FindInvoiceDetailArgs } from './find-invoice-detail-args.dto';

// Get relation classes
const ClientWhere = getWhereClass(FindClientArgs);
const ClientOrderBy = getOrderByClass(FindClientArgs);
const InvoiceDetailWhere = getWhereClass(FindInvoiceDetailArgs);
const InvoiceDetailOrderBy = getOrderByClass(FindInvoiceDetailArgs);

// Generated WHERE fields using helper with relations
const InvoiceWhere = createWhereFields(Invoice, {
  id: true, // Auto-infers NumberFilter + applies all decorators
  invoiceNumber: true, // Auto-infers StringFilter + applies all decorators
  totalAmount: true, // Auto-infers NumberFilter + applies all decorators
  status: true, // Auto-infers StringFilter + applies all decorators
  invoiceDate: true, // Auto-infers DateFilter + applies all decorators
  client: ClientWhere, // Use existing Where class for relations
  details: InvoiceDetailWhere, // Use existing Where class for relations
}, {
  name: 'InvoiceWhere',
  description: 'WHERE conditions for Invoice queries'
});

// Generated ORDER BY fields using helper with relations
const InvoiceOrderBy = createOrderByFields(Invoice, {
  id: true, // Enables ordering + applies all decorators
  invoiceNumber: true, // Enables ordering + applies all decorators
  totalAmount: true, // Enables ordering + applies all decorators
  status: true, // Enables ordering + applies all decorators
  invoiceDate: true, // Enables ordering + applies all decorators
  client: ClientOrderBy, // Use existing OrderBy class for relations
  details: InvoiceDetailOrderBy, // Use existing OrderBy class for relations
}, {
  name: 'InvoiceOrderBy',
  description: 'ORDER BY options for Invoice queries'
});

@ArgsType()
export class FindInvoiceArgs extends FindArgsFrom<Invoice>({
  whereType: InvoiceWhere,
  orderByType: InvoiceOrderBy,
}) {}
