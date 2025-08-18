import { ArgsType } from '@nestjs/graphql';
import {
  FindArgsFrom,
  getWhereClass,
  createWhereFields,
  createOrderByFields,
} from '@solid-nestjs/typeorm-hybrid-crud';
import { InvoiceDetail } from '../../entities/invoice-detail.entity';
import { FindProductArgs } from '../../../products/dto';

const ProductWhere = getWhereClass(FindProductArgs);

// Generated WHERE fields using helper including productId with hybrid type
const InvoiceDetailWhere = createWhereFields(
  InvoiceDetail,
  {
    id: true, // Auto-infers NumberFilter + applies all decorators
    quantity: true, // Auto-infers NumberFilter + applies all decorators
    unitPrice: true, // Auto-infers NumberFilter + applies all decorators
    totalAmount: true, // Auto-infers NumberFilter + applies all decorators
    productId: {
      isPlain: true, // Use plain String type instead of StringFilter
      description: 'Filter by product ID'
    },
    product: ProductWhere, // Use existing Where class for relations
  },
  {
    name: 'InvoiceDetailWhere',
    description: 'WHERE conditions for InvoiceDetail queries',
  },
);

// Generated ORDER BY fields using helper for all fields
const InvoiceDetailOrderBy = createOrderByFields(
  InvoiceDetail,
  {
    id: true, // Enables ordering + applies all decorators
    quantity: true, // Enables ordering + applies all decorators
    unitPrice: true, // Enables ordering + applies all decorators
    totalAmount: true, // Enables ordering + applies all decorators
    productId: true, // Enables ordering + applies all decorators
  },
  {
    name: 'InvoiceDetailOrderBy',
    description: 'ORDER BY options for InvoiceDetail queries',
  },
);

@ArgsType()
export class FindInvoiceDetailArgs extends FindArgsFrom<InvoiceDetail>({
  whereType: InvoiceDetailWhere,
  orderByType: InvoiceDetailOrderBy,
}) {}
