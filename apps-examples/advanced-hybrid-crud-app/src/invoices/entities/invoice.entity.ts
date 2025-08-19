import { 
  SolidEntity, 
  SolidId, 
  SolidField, 
  SolidOneToMany, 
  SolidManyToOne, 
  SolidCreatedAt, 
  SolidUpdatedAt, 
  SolidDeletedAt 
} from '@solid-nestjs/common';
import { InvoiceDetail } from './invoice-detail.entity';
import { Client } from '../../clients/entities/client.entity';

@SolidEntity()
export class Invoice {
  @SolidId({
    generated: 'increment',
    description: 'The unique identifier of the invoice',
  })
  id: number;

  @SolidField({
    description: 'The invoice number',
    unique: true,
  })
  invoiceNumber: string;

  @SolidField({
    description: 'The total amount of the invoice',
    float: true,
    precision: 10,
    scale: 2,
    adapters: {
      typeorm: {
        columnType: 'decimal',
        transformer: {
          to: (value: number) => value,
          from: (value: string) => parseFloat(value)
        }
      },
      graphql: {
        type: 'Float'
      }
    }
  })
  totalAmount: number;

  @SolidField({
    description: 'The status of the invoice',
    defaultValue: 'pending',
  })
  status: string;

  @SolidCreatedAt({
    description: 'The date when the invoice was created',
  })
  invoiceDate: Date;

  @SolidOneToMany(
    () => InvoiceDetail,
    (detail: InvoiceDetail) => detail.invoice,
    {
      description: 'Invoice details/line items',
      cascade: ['insert', 'update', 'remove', 'soft-remove', 'recover'],
    }
  )
  details: InvoiceDetail[];

  @SolidManyToOne(() => Client, (client: Client) => client.invoices, {
    description: 'Invoice client',
    onDelete: 'CASCADE',
  })
  client: Client;

  @SolidUpdatedAt({
    description: 'The date when the invoice was last updated',
  })
  updatedAt!: Date;

  @SolidDeletedAt({
    description: 'The date when the invoice was deleted (soft delete)',
  })
  deletedAt?: Date;
}
