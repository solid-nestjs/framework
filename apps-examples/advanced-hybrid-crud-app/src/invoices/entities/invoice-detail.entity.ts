import { 
  SolidEntity, 
  SolidId, 
  SolidField, 
  SolidManyToOne, 
  SolidCreatedAt, 
  SolidUpdatedAt, 
  SolidDeletedAt 
} from '@solid-nestjs/common';
import { Product } from '../../products/entities/product.entity';

@SolidEntity()
export class InvoiceDetail {
  @SolidId({
    generated: 'increment',
    description: 'The unique identifier of the invoice detail',
  })
  id: number;

  @SolidField({
    description: 'The quantity of the product in this line item',
    adapters: {
      graphql: {
        type: 'Int'
      }
    }
  })
  quantity: number;

  @SolidField({
    description: 'The unit price of the product at the time of invoice',
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
  unitPrice: number;

  @SolidField({
    description: 'The total amount for this line item (quantity * unitPrice)',
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

  @SolidManyToOne(() => Product, null, {
    description: 'Invoice Detail Product',
    eager: true,
    nullable: false,
    adapters: {
      typeorm: {
        eager: true,
        nullable: false,
        joinColumn: { name: 'productId' }
      },
      graphql: {
        nullable: false
      }
    }
  })
  product: Product;

  @SolidField({
    description: 'The ID of the product in this detail',
  })
  productId: string;

  @SolidManyToOne(
    () => {
      const { Invoice } = require('./invoice.entity');
      return Invoice;
    },
    (invoice: any) => invoice.details,
    {
      description: 'Invoice this detail belongs to',
      onDelete: 'CASCADE',
      adapters: {
        typeorm: {
          joinColumn: { name: 'invoiceId' }
        }
      }
    }
  )
  invoice: any;

  @SolidCreatedAt({
    description: 'The date when the invoice detail was created',
  })
  createdAt!: Date;

  @SolidUpdatedAt({
    description: 'The date when the invoice detail was last updated',
  })
  updatedAt!: Date;

  @SolidDeletedAt({
    description: 'The date when the invoice detail was deleted (soft delete)',
  })
  deletedAt?: Date;
}
