import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { InvoiceDetail } from './invoice-detail.entity';

@Entity()
export class Invoice {
  @ApiProperty({ description: 'The unique identifier of the invoice' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'The invoice number' })
  @Column({ unique: true })
  invoiceNumber: string;

  @ApiProperty({ description: 'The total amount of the invoice' })
  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;

  @ApiProperty({ description: 'The status of the invoice' })
  @Column({ default: 'pending' })
  status: string;

  @ApiProperty({ description: 'The date when the invoice was created' })
  @CreateDateColumn()
  invoiceDate: Date;

  @ApiProperty({
    description: 'Invoice details/line items',
    type: () => [InvoiceDetail],
  })
  @OneToMany(() => InvoiceDetail, (detail) => detail.invoice, {
    cascade: true,
  })
  details: InvoiceDetail[];
}
