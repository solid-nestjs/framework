import { 
  SolidEntity, 
  SolidId, 
  SolidField, 
  SolidOneToMany, 
  SolidCreatedAt, 
  SolidUpdatedAt, 
  SolidDeletedAt 
} from '@solid-nestjs/common';

@SolidEntity()
export class Supplier {
  @SolidId({
    generated: 'uuid',
    description: 'The unique identifier of the supplier',
  })
  id: string;

  @SolidField({
    description: 'The name of the supplier',
  })
  name: string;

  @SolidField({
    description: 'email of the supplier',
    email: true,
  })
  contactEmail: string;

  @SolidOneToMany(
    () => {
      const { Product } = require('../../products/entities/product.entity');
      return Product;
    },
    (product: any) => product.supplier,
    {
      description: 'Supplier Products',
      cascade: ['insert', 'update', 'remove', 'soft-remove', 'recover'],
    }
  )
  products: any[];

  @SolidCreatedAt({
    description: 'The date when the supplier was created',
  })
  createdAt!: Date;

  @SolidUpdatedAt({
    description: 'The date when the supplier was last updated',
  })
  updatedAt!: Date;

  @SolidDeletedAt({
    description: 'The date when the supplier was deleted (soft delete)',
  })
  deletedAt?: Date;
}
