import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Product } from '../../products/entities/product.entity';

@ObjectType()
@Entity()
export class Supplier {
  @Field(() => ID, { description: 'The unique identifier of the supplier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

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
