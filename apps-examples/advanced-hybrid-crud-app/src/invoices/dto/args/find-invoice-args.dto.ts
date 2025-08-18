import { ArgsType } from '@nestjs/graphql';
import {
  FindArgsFrom,
  getWhereClass,
  createWhereFields,
  createOrderByFields,
} from '@solid-nestjs/typeorm-hybrid-crud';
import { Invoice } from '../../entities/invoice.entity';
import { FindClientArgs } from '../../../clients/dto';
import { FindInvoiceDetailArgs } from './find-invoice-detail-args.dto';

const ClientWhere = getWhereClass(FindClientArgs);
const InvoiceDetailWhere = getWhereClass(FindInvoiceDetailArgs);

// Generated WHERE fields using helper for most fields except string fields
const FindInvoiceWhere = createWhereFields(
  Invoice,
  {
    id: true, // Auto-infers NumberFilter + applies all decorators
    totalAmount: true, // Auto-infers NumberFilter + applies all decorators
    invoiceDate: true, // Auto-infers DateFilter + applies all decorators
    client: ClientWhere, // Use existing Where class for relations
    details: InvoiceDetailWhere, // Use existing InvoiceDetail Where class
    invoiceNumber: { isPlain: true },
    status: { isPlain: true },
  },
  {
    name: 'FindInvoiceWhere',
    description: 'Partial WHERE conditions for Invoice queries',
  },
);

// Generated ORDER BY fields using helper for all fields
const InvoiceOrderBy = createOrderByFields(
  Invoice,
  {
    id: true, // Enables ordering + applies all decorators
    invoiceNumber: true, // Enables ordering + applies all decorators
    totalAmount: true, // Enables ordering + applies all decorators
    status: true, // Enables ordering + applies all decorators
    invoiceDate: true, // Enables ordering + applies all decorators
  },
  {
    name: 'InvoiceOrderBy',
    description: 'ORDER BY options for Invoice queries',
  },
);

@ArgsType()
export class FindInvoiceArgs extends FindArgsFrom<Invoice>({
  whereType: FindInvoiceWhere,
  orderByType: InvoiceOrderBy,
}) {}
