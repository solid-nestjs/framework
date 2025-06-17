import { Entity, Column, ManyToOne } from 'typeorm';
import { ObjectType, Field, Float, Int } from '@nestjs/graphql';
import { Supplier } from '../../suppliers/entities/supplier.entity';
import { ProductId } from './product.key';
import { AutoIncrement } from '@solid-nestjs/typeorm-graphql-crud';

@ObjectType()
@Entity()
@AutoIncrement<ProductId>('code')
export class Product {
  @Field(() => ProductId, { description: 'The id of the product' })
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

  @Field(() => Supplier, { description: 'Product Supplier', nullable: true })
  @ManyToOne(() => Supplier, supplier => supplier.products, {
    onDelete: 'CASCADE',
  })
  supplier: Supplier;
}
