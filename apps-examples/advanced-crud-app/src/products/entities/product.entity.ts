import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Supplier } from '../../suppliers/entities/supplier.entity';
import { IsNotEmpty, IsNumber, IsString, IsUUID, Min } from 'class-validator';

@Entity()
export class Product {
  @ApiProperty({ description: 'The unique identifier of the product' })
  @PrimaryGeneratedColumn('uuid')
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'The name of the product' })
  @Column()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'The description of the product' })
  @Column()
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ description: 'The price of the product' })
  @Column('decimal', { precision: 10, scale: 2 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'The stock quantity of the product' })
  @Column()
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiProperty({ description: 'Product Supplier', type: () => Supplier })
  @ManyToOne(() => Supplier, (supplier) => supplier.products, {
    onDelete: 'CASCADE',
  })
  supplier: Supplier;
}
