import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ArgsType, Field, InputType } from '@nestjs/graphql';
import {
  FindArgsFrom,
  StringFilter,
  Where,
  getWhereClass,
  createWhereFields,
  createOrderByFields,
} from '@solid-nestjs/typeorm-hybrid-crud';
import { InvoiceDetail } from '../../entities/invoice-detail.entity';
import { FindProductArgs } from '../../../products/dto';

const ProductWhere = getWhereClass(FindProductArgs);

// Generated WHERE fields using helper for most fields, productId manual
const PartialInvoiceDetailWhere = createWhereFields(
  InvoiceDetail,
  {
    id: true, // Auto-infers NumberFilter + applies all decorators
    quantity: true, // Auto-infers NumberFilter + applies all decorators
    unitPrice: true, // Auto-infers NumberFilter + applies all decorators
    totalAmount: true, // Auto-infers NumberFilter + applies all decorators
    product: ProductWhere, // Use existing Where class for relations
  },
  {
    name: 'PartialInvoiceDetailWhere',
    description: 'Partial WHERE conditions for InvoiceDetail queries',
  },
);

@InputType({ isAbstract: true })
class FindInvoiceDetailWhere
  extends PartialInvoiceDetailWhere
  implements Where<InvoiceDetail>
{
  @Field(() => String, { nullable: true })
  @ApiProperty({ type: () => String, required: false })
  @IsOptional()
  productId?: string | string[] | StringFilter | undefined;
}

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
  whereType: FindInvoiceDetailWhere,
  orderByType: InvoiceDetailOrderBy,
}) {}
