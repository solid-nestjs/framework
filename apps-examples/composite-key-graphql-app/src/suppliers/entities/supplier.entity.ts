import { Column, Entity, OneToMany } from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Product } from '../../products/entities/product.entity';
import { SupplierId } from './supplier.key';
import { AutoIncrement } from '@solid-nestjs/typeorm-graphql-crud';

@ObjectType()
@Entity()
@AutoIncrement<SupplierId>('code')
export class Supplier extends SupplierId {
  get id(): SupplierId {
    return { type: this.type, code: this.code };
  }
  set id(value) {
    this.type = value.type;
    this.code = value.code;
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
