import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  CreateDateColumn,
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
  @Column('decimal', { precision: 10, scale: 2, transformer: {
    to: (value: number) => value,
    from: (value: string) => parseFloat(value)
  }})
  unitPrice: number;

  @ApiProperty({
    description: 'The total amount for this line item (quantity * unitPrice)',
  })
  @Field(() => Float, {
    description: 'The total amount for this line item (quantity * unitPrice)',
  })
  @Column('decimal', { precision: 10, scale: 2, transformer: {
    to: (value: number) => value,
    from: (value: string) => parseFloat(value)
  }})
  totalAmount: number;

  @ApiProperty({ description: 'Invoice Detail Product', type: () => Product })
  @Field(() => Product, { description: 'Invoice Detail Product' })
  @ManyToOne(() => Product, { eager: true, nullable: false })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @ApiProperty({ description: 'The ID of the product in this detail' })
  @Field(() => String, { description: 'The ID of the product in this detail' })
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

  @ApiProperty({ description: 'The date when the product was created' })
  @Field({ description: 'The date when the product was created' })
  @CreateDateColumn()
  createdAt!: Date;

  @ApiProperty({ description: 'The date when the product was last updated' })
  @Field({ description: 'The date when the product was last updated' })
  @UpdateDateColumn()
  updatedAt!: Date;

  @ApiProperty({
    description: 'The date when the product was deleted (soft delete)',
    required: false,
  })
  @Field({
    description: 'The date when the product was deleted (soft delete)',
    nullable: true,
  })
  @DeleteDateColumn()
  deletedAt?: Date;
}
