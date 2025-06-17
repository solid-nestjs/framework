import { Column, Entity, OneToMany } from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { Product } from '../../products/entities/product.entity';
import { SupplierId } from './supplier.key';
import { AutoIncrement } from '@solid-nestjs/typeorm-graphql-crud';

@ObjectType()
@Entity()
@AutoIncrement<SupplierId>('code')
export class Supplier {
  @Field(() => SupplierId, { description: 'The id of the supplier' })
  @Column(() => SupplierId, { prefix: '' })
  id: SupplierId;

  @Field({ description: 'The name of the supplier' })
  @Column()
  name: string;

  @Field({ description: 'email of the supplier' })
  @Column()
  contactEmail: string;

  @Field(() => [Product], { description: 'Supplier Products', nullable: true })
  @OneToMany(() => Product, product => product.supplier, {
    cascade: ['insert', 'update', 'remove'],
  })
  products: Product[];
}
