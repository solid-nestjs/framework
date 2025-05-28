import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';

@ObjectType()
@Entity()
export class Product {
    @Field(() => ID, { description: 'The unique identifier of the product' })
    @PrimaryGeneratedColumn("uuid")
    id: string;

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

    @Field({ description: 'The creation date of the product' })
    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Field({ description: 'The last update date of the product' })
    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;
}
