import { 
  SolidEntity, 
  SolidId, 
  SolidField, 
  SolidOneToMany, 
  SolidCreatedAt, 
  SolidUpdatedAt, 
  SolidDeletedAt 
} from '@solid-nestjs/common';
import { Product } from '../../products/entities/product.entity';

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

  @SolidOneToMany(() => Product, product => product.supplier, {
    description: 'Supplier Products',
    cascade: ['insert', 'update', 'remove', 'soft-remove', 'recover'],
  })
  products: Product[];

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
