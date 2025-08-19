import { SolidEntity, SolidField, SolidOneToMany } from '@solid-nestjs/common';
import { Product } from '../../products/entities/product.entity';
import { SupplierId } from './supplier.key';
import { AutoIncrement } from '@solid-nestjs/typeorm-graphql-crud';

@SolidEntity()
@AutoIncrement<SupplierId>('code')
export class Supplier extends SupplierId {
  @SolidField({
    description: 'The id of the supplier',
    skip: ['typeorm'], // Skip TypeORM adapter for computed getter
  })
  get id(): SupplierId {
    return { type: this.type, code: this.code };
  }
  set id(value) {
    this.type = value.type;
    this.code = value.code;
  }

  @SolidField({
    description: 'The name of the supplier',
  })
  name: string;

  @SolidField({
    description: 'email of the supplier',
  })
  contactEmail: string;

  @SolidOneToMany(() => Product, product => product.supplier, {
    description: 'Supplier Products',
    nullable: true,
    cascade: ['insert', 'update', 'remove'],
  })
  products: Product[];
}
