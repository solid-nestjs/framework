import { SolidInput, SolidField } from '@solid-nestjs/common';
import { GenerateDtoFromEntity, PartialType } from '@solid-nestjs/rest-graphql';
import { Client } from '../../../clients/entities/client.entity';
import { CreateInvoiceDetailDto } from './create-invoice.dto';

@SolidInput()
export class UpdateInvoiceClientDto extends GenerateDtoFromEntity(Client, [
  'id',
]) {}

@SolidInput()
export class UpdateInvoiceDetailDto extends PartialType(
  CreateInvoiceDetailDto,
) {}

@SolidInput()
export class UpdateInvoiceDto {
  @SolidField({
    description: 'The invoice number',
    nullable: true,
  })
  invoiceNumber?: string;

  @SolidField({
    description: 'The status of the invoice',
    nullable: true,
    enum: ['pending', 'paid', 'cancelled'],
    adapters: {
      graphql: {
        defaultValue: 'pending',
      },
      swagger: {
        default: 'pending',
      },
    },
  })
  status?: string;

  @SolidField({
    description: 'Invoice details/line items',
    array: true,
    arrayType: () => UpdateInvoiceDetailDto,
    nullable: true,
  })
  details?: UpdateInvoiceDetailDto[];

  @SolidField({
    description: 'Invoice client',
    nullable: true,
  })
  client?: UpdateInvoiceClientDto;
}
