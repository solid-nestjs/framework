import { 
  SolidEntity, 
  SolidId, 
  SolidField, 
  SolidManyToOne, 
  SolidCreatedAt, 
  SolidUpdatedAt, 
  SolidDeletedAt 
} from '@solid-nestjs/common';
import { Supplier } from '../../suppliers/entities/supplier.entity';

@SolidEntity()
export class Product {
  @SolidId({
    generated: 'uuid',
    description: 'The unique identifier of the product',
  })
  id: string;

  @SolidField({
    description: 'The name of the product',
  })
  name: string;

  @SolidField({
    description: 'The description of the product',
  })
  description: string;

  @SolidField({
    description: 'The price of the product',
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
  price: number;

  @SolidField({
    description: 'The stock quantity of the product',
    integer: true,
    adapters: {
      graphql: {
        type: 'Int'
      }
    }
  })
  stock: number;

  @SolidManyToOne(() => Supplier, (supplier: Supplier) => supplier.products, {
    description: 'Product Supplier',
    onDelete: 'CASCADE',
  })
  supplier: Supplier;

  @SolidCreatedAt({
    description: 'The date when the product was created',
  })
  createdAt!: Date;

  @SolidUpdatedAt({
    description: 'The date when the product was last updated',
  })
  updatedAt!: Date;

  @SolidDeletedAt({
    description: 'The date when the product was deleted (soft delete)',
  })
  deletedAt?: Date;
}
