import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Supplier } from '../../suppliers/entities/supplier.entity';

@Entity()
export class Product {
    @ApiProperty({ description: 'The unique identifier of the product' })
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ApiProperty({ description: 'The name of the product' })
    @Column()
    name: string;

    @ApiProperty({ description: 'The description of the product' })
    @Column()
    description: string;

    @ApiProperty({ description: 'The price of the product' })
    @Column('decimal', { precision: 10, scale: 2 })
    price: number;

    @ApiProperty({ description: 'The stock quantity of the product' })
    @Column()
    stock: number;

    @ApiProperty({ description: 'Product Supplier', type: ()=> Supplier })
    @ManyToOne(()=>Supplier, (supplier) => supplier.products)
    supplier:Supplier;
}