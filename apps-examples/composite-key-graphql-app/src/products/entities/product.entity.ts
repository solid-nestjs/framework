import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { ObjectType, Field, Float, Int } from '@nestjs/graphql';
import { Supplier } from '../../suppliers/entities/supplier.entity';
import { ProductId } from './product.key';
import { AutoIncrement } from '@solid-nestjs/typeorm-graphql-crud';

@ObjectType()
@Entity()
@AutoIncrement<ProductId>('code')
export class Product {
  @Field(() => ProductId, { description: 'The id of the product' })
  get id(): ProductId {
    return { type: this.type, code: this.code };
  }
  set id(value) {
    this.type = value.type;
    this.code = value.code;
  }

  @PrimaryColumn()
  type: string;

  @PrimaryColumn()
  code: number;

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

  // Foreign key columns for the composite primary key relationship
  @Column({ nullable: true })
  supplier_id_type: string;

  @Column({ nullable: true })
  supplier_id_code: number;

  @Field(() => Supplier, { description: 'Product Supplier', nullable: true })
  @JoinColumn([
    { name: 'supplier_id_type', referencedColumnName: 'type' },
    { name: 'supplier_id_code', referencedColumnName: 'code' },
  ])
  @ManyToOne(() => Supplier, supplier => supplier.products, {
    onDelete: 'CASCADE',
  })
  supplier: Supplier;
}
