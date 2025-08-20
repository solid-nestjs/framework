import { SolidInput, SolidField } from '@solid-nestjs/common';
import { GenerateDtoFromEntity } from '@solid-nestjs/rest-graphql';
import { InvoiceDetail } from '../../entities/invoice-detail.entity';
import { Client } from '../../../clients/entities/client.entity';

// Using GenerateDtoFromEntity with Client entity for client reference
// Only include 'id' for the client reference
@SolidInput()
export class InvoiceClientDto extends GenerateDtoFromEntity(Client, ['id']) {}

// Using GenerateDtoFromEntity with InvoiceDetail entity
// Include only the needed properties for creation

@SolidInput()
export class CreateInvoiceDetailDto extends GenerateDtoFromEntity(
  InvoiceDetail,
  ['productId', 'quantity', 'unitPrice'],
) {}

// For complex DTOs with relations and type conflicts, we demonstrate a hybrid approach:
// - Use GenerateDtoFromEntity for simple child DTOs (InvoiceClientDto, CreateInvoiceDetailDto)
// - Keep main DTO manual to avoid TypeScript conflicts with relation types
// This approach still provides significant value by automating the simpler parts

@SolidInput()
export class CreateInvoiceDto {
  @SolidField({
    description: 'The invoice number',
  })
  invoiceNumber: string;

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
    arrayType: () => CreateInvoiceDetailDto,
  })
  details: CreateInvoiceDetailDto[];

  @SolidField({
    description: 'Invoice client',
  })
  client: InvoiceClientDto;
}

// Alternative examples for reference:

// Example 1: Using legacy array format for InvoiceClientDto
// @SolidInput()
// export class InvoiceClientDto extends GenerateDtoFromEntity(Client, ['id']) {
//   @SolidField({
//     description: 'client id',
//     adapters: {
//       graphql: { type: () => ID },
//       validation: { validators: [IsFlexibleUUID] },
//     },
//   })
//   id: string;
// }

// Example 2: Using default rules for CreateInvoiceDetailDto
// @SolidInput()
// export class CreateInvoiceDetailDto extends GenerateDtoFromEntity(InvoiceDetail) {
//   // This would include: quantity, unitPrice, totalAmount, productId (flat properties)
//   // But we override specific fields for custom validation
// }
