import { ArgsType } from '@nestjs/graphql';
import {
  FindArgsFrom,
  createWhereFields,
  createOrderByFields,
  getWhereClass,
  getOrderByClass,
} from '@solid-nestjs/typeorm-hybrid-crud';
import { InvoiceDetail } from '../../entities/invoice-detail.entity';
import { FindProductArgs } from '../../../products/dto';

// Get relation classes
const ProductWhere = getWhereClass(FindProductArgs);
const ProductOrderBy = getOrderByClass(FindProductArgs);

// Generated WHERE fields using helper with relations
const InvoiceDetailWhere = createWhereFields(InvoiceDetail, {
  id: true, // Auto-infers NumberFilter + applies all decorators
  quantity: true, // Auto-infers NumberFilter + applies all decorators
  unitPrice: true, // Auto-infers NumberFilter + applies all decorators
  totalAmount: true, // Auto-infers NumberFilter + applies all decorators
  productId: true, // Auto-infers StringFilter + applies all decorators
  product: ProductWhere, // Use existing Where class for relations
}, {
  name: 'InvoiceDetailWhere',
  description: 'WHERE conditions for InvoiceDetail queries'
});

// Generated ORDER BY fields using helper with relations
const InvoiceDetailOrderBy = createOrderByFields(InvoiceDetail, {
  id: true, // Enables ordering + applies all decorators
  quantity: true, // Enables ordering + applies all decorators
  unitPrice: true, // Enables ordering + applies all decorators
  totalAmount: true, // Enables ordering + applies all decorators
  productId: true, // Enables ordering + applies all decorators
  product: ProductOrderBy, // Use existing OrderBy class for relations
}, {
  name: 'InvoiceDetailOrderBy',
  description: 'ORDER BY options for InvoiceDetail queries'
});

@ArgsType()
export class FindInvoiceDetailArgs extends FindArgsFrom<InvoiceDetail>({
  whereType: InvoiceDetailWhere,
  orderByType: InvoiceDetailOrderBy,
}) {}