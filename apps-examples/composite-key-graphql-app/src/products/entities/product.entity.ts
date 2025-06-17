import { Entity, Column } from 'typeorm';
import { ObjectType, Field, Float, Int } from '@nestjs/graphql';
import { ProductId } from './product.key';

@ObjectType()
@Entity()
export class Product {
  @Column(() => ProductId, { prefix: '' })
  id: ProductId;

  @Field({ description: 'The name of the product' })
  @Column()
  name: string;

  @Field({ description: 'The description of the product' })
  @Column()
  description: string;

  @Field(() => Float, { description: 'The price of the product' })
  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Field(() => Int, { description: 'The stock quantity of the product' })
  @Column()
  stock: number;
}
