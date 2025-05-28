import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { Supplier } from '../../suppliers/entities/supplier.entity';

@ObjectType()
@Entity()
export class Product {

    @ApiProperty({ description: 'The unique identifier of the product' })
    @Field(() => ID, { description: 'The unique identifier of the product' })
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ApiProperty({ description: 'The name of the product' })
    @Field({ description: 'The name of the product' })
    @Column()
    name: string;

    @ApiProperty({ description: 'The description of the product' })
    @Field({ description: 'The description of the product' })
    @Column()
    description: string;

    @ApiProperty({ description: 'The price of the product' })
    @Field(() => Float, { description: 'The price of the product' })
    @Column('decimal', { precision: 10, scale: 2 })
    price: number;

    @ApiProperty({ description: 'The stock quantity of the product' })
    @Field(() => Int, { description: 'The stock quantity of the product' })
    @Column()
    stock: number;

    @ApiProperty({ description: 'Product Supplier', type: ()=> Supplier })
    @Field(()=> Supplier,{ description: 'Product Supplier', nullable:true })
    @ManyToOne(()=>Supplier, (supplier) => supplier.products)
    supplier:Supplier;
}
