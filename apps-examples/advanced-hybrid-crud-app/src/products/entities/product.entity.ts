import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { Supplier } from '../../suppliers/entities/supplier.entity';

@ObjectType()
@Entity()
export class Product {
  @ApiProperty({ description: 'The unique identifier of the product' })
  @Field(() => ID, { description: 'The unique identifier of the product' })
  @PrimaryGeneratedColumn('uuid')
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

  @ApiProperty({ description: 'Product Supplier', type: () => Supplier })
  @Field(() => Supplier, { description: 'Product Supplier', nullable: true })
  @ManyToOne(() => Supplier, supplier => supplier.products, {
    onDelete: 'CASCADE',
  })
  supplier: Supplier;

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
