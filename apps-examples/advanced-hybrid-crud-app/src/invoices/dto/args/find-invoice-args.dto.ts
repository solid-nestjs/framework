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
import { Invoice } from '../../entities/invoice.entity';
import { FindClientArgs } from '../../../clients/dto';
import { FindInvoiceDetailArgs } from './find-invoice-detail-args.dto';

const ClientWhere = getWhereClass(FindClientArgs);
const InvoiceDetailWhere = getWhereClass(FindInvoiceDetailArgs);

// Generated WHERE fields using helper for most fields except string fields
const PartialInvoiceWhere = createWhereFields(
  Invoice,
  {
    id: true, // Auto-infers NumberFilter + applies all decorators
    totalAmount: true, // Auto-infers NumberFilter + applies all decorators
    invoiceDate: true, // Auto-infers DateFilter + applies all decorators
    client: ClientWhere, // Use existing Where class for relations
    details: InvoiceDetailWhere, // Use existing InvoiceDetail Where class
  },
  {
    name: 'PartialInvoiceWhere',
    description: 'Partial WHERE conditions for Invoice queries',
  },
);

@InputType({ isAbstract: true })
class FindInvoiceWhere extends PartialInvoiceWhere implements Where<Invoice> {
  @Field(() => String, { nullable: true })
  @ApiProperty({ type: () => String, required: false })
  @IsOptional()
  invoiceNumber?: string | string[] | StringFilter | undefined;

  @Field(() => String, { nullable: true })
  @ApiProperty({ type: () => String, required: false })
  @IsOptional()
  status?: string | string[] | StringFilter | undefined;
}

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
