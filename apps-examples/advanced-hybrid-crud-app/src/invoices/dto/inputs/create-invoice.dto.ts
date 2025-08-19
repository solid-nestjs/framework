import { SolidInput, SolidField } from '@solid-nestjs/common';
import { Float, Int, ID } from '@nestjs/graphql';
import { IsFlexibleUUID } from '../../../common/validators/is-flexible-uuid.validator';

@SolidInput()
export class InvoiceClientDto {
  @SolidField({
    description: 'client id',
    adapters: {
      graphql: {
        type: () => ID,
      },
      validation: {
        validators: [IsFlexibleUUID],
      },
    },
  })
  id: string;
}

@SolidInput()
export class CreateInvoiceDetailDto {
  @SolidField({
    description: 'product id',
    adapters: {
      graphql: {
        type: () => ID,
      },
      validation: {
        validators: [IsFlexibleUUID],
      },
    },
  })
  productId: string;

  @SolidField({
    description: 'The quantity of the product',
    min: 1,
    adapters: {
      graphql: {
        type: () => Int,
      },
    },
  })
  quantity: number;

  @SolidField({
    description: 'The unit price of the product',
    min: 0,
    adapters: {
      graphql: {
        type: () => Float,
      },
    },
  })
  unitPrice: number;
}

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
    adapters: {
      graphql: {
        type: () => [CreateInvoiceDetailDto]
      },
      swagger: {
        type: () => [CreateInvoiceDetailDto]
      },
      validation: {
        isArray: true,
        arrayType: () => CreateInvoiceDetailDto
      }
    }
  })
  details: CreateInvoiceDetailDto[];

  @SolidField({
    description: 'Invoice client',
    adapters: {
      graphql: {
        type: () => InvoiceClientDto
      },
      swagger: {
        type: () => InvoiceClientDto
      }
    }
  })
  client: InvoiceClientDto;
}
