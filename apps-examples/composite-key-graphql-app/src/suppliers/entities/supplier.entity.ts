import { Column, Entity, OneToMany } from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Product } from '../../products/entities/product.entity';
import { SupplierId } from './supplier.key';
import { AutoIncrement } from '@solid-nestjs/typeorm-graphql-crud';

@ObjectType()
@Entity()
@AutoIncrement<SupplierId>('code')
export class Supplier {
  //@Field(() => SupplierId, { description: 'The id of the supplier' })
  @Column(() => SupplierId, { prefix: '' })
  id: SupplierId;

  @Field(() => ID, {
    description: 'The type of the unique identifier of the supplier',
  })
  get type() {
    return this.id.type;
  }

  @Field(() => ID, {
    description: 'The code of the unique identifier of the supplier',
  })
  get code() {
    return this.id.code;
  }

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
