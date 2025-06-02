import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Product } from '../../products/entities/product.entity';

@ObjectType()
@Entity()
export class Supplier {
  @ApiProperty({ description: 'The unique identifier of the supplier' })
  @Field(() => ID, { description: 'The unique identifier of the supplier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'The name of the supplier' })
  @Field({ description: 'The name of the supplier' })
  @Column()
  name: string;

  @ApiProperty({ description: 'email of the supplier' })
  @Field({ description: 'email of the supplier' })
  @Column()
  contactEmail: string;

  @ApiProperty({ description: 'Supplier Products', type: () => [Product] })
  @Field(() => [Product], { description: 'Supplier Products', nullable: true })
  @OneToMany(() => Product, product => product.supplier, {
    cascade: ['insert', 'update', 'remove'],
  })
  products: Product[];

  @ApiProperty({ description: 'The date when the supplier was created' })
  @Field({ description: 'The date when the supplier was created' })
  @CreateDateColumn()
  createdAt!: Date;

  @ApiProperty({ description: 'The date when the supplier was last updated' })
  @Field({ description: 'The date when the supplier was last updated' })
  @UpdateDateColumn()
  updatedAt!: Date;

  @ApiProperty({
    description: 'The date when the supplier was deleted (soft delete)',
    required: false,
  })
  @Field({
    description: 'The date when the supplier was deleted (soft delete)',
    nullable: true,
  })
  @DeleteDateColumn()
  deletedAt?: Date;
}
