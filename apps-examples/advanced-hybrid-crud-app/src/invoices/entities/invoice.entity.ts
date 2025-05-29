import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import type { InvoiceDetail } from './invoice-detail.entity';

@ObjectType()
@Entity()
export class Invoice {
  @ApiProperty({ description: 'The unique identifier of the invoice' })
  @Field(() => ID, { description: 'The unique identifier of the invoice' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'The invoice number' })
  @Field({ description: 'The invoice number' })
  @Column({ unique: true })
  invoiceNumber: string;

  @ApiProperty({ description: 'The total amount of the invoice' })
  @Field(() => Float, { description: 'The total amount of the invoice' })
  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;

  @ApiProperty({ description: 'The status of the invoice' })
  @Field({ description: 'The status of the invoice' })
  @Column({ default: 'pending' })
  status: string;

  @ApiProperty({ description: 'The date when the invoice was created' })
  @Field({ description: 'The date when the invoice was created' })
  @CreateDateColumn()
  invoiceDate: Date;

  @ApiProperty({
    description: 'Invoice details/line items',
    type: () => require('./invoice-detail.entity').InvoiceDetail,
  })
  @Field(() => [require('./invoice-detail.entity').InvoiceDetail], {
    description: 'Invoice details/line items',
  })
  @OneToMany(
    () => require('./invoice-detail.entity').InvoiceDetail,
    (detail: any) => detail.invoice,
    {
      cascade: true,
    },
  )
  details: InvoiceDetail[];
}
