import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { Product } from '../../products/entities/product.entity';

@ObjectType()
@Entity()
export class InvoiceDetail {
  @ApiProperty({ description: 'The unique identifier of the invoice detail' })
  @Field(() => ID, {
    description: 'The unique identifier of the invoice detail',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'The quantity of the product in this line item' })
  @Field(() => Int, {
    description: 'The quantity of the product in this line item',
  })
  @Column()
  quantity: number;

  @ApiProperty({
    description: 'The unit price of the product at the time of invoice',
  })
  @Field(() => Float, {
    description: 'The unit price of the product at the time of invoice',
  })
  @Column('decimal', { precision: 10, scale: 2 })
  unitPrice: number;

  @ApiProperty({
    description: 'The total amount for this line item (quantity * unitPrice)',
  })
  @Field(() => Float, {
    description: 'The total amount for this line item (quantity * unitPrice)',
  })
  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;

  @ApiProperty({ description: 'Invoice Detail Product', type: () => Product })
  @Field(() => Product, { description: 'Invoice Detail Product' })
  @ManyToOne(() => Product, { eager: true, nullable: false })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  productId: string;

  @ApiProperty({
    description: 'Invoice this detail belongs to',
    type: () => require('./invoice.entity').Invoice,
  })
  @Field(() => require('./invoice.entity').Invoice, {
    description: 'Invoice this detail belongs to',
  })
  @ManyToOne(
    () => require('./invoice.entity').Invoice,
    (invoice: any) => invoice.details,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'invoiceId' })
  invoice: any;
}
