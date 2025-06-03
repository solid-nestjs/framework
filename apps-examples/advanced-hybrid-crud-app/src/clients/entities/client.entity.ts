import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Invoice } from '../../invoices/entities/invoice.entity';

@ObjectType()
@Entity()
export class Client {
  @ApiProperty({ description: 'The unique identifier of the client' })
  @Field(() => ID, { description: 'The unique identifier of the client' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'The first name of the client' })
  @Field({ description: 'The first name of the client' })
  @Column()
  firstName: string;

  @ApiProperty({ description: 'The last name of the client' })
  @Field({ description: 'The last name of the client' })
  @Column()
  lastName: string;

  @ApiProperty({ description: 'The email address of the client' })
  @Field({ description: 'The email address of the client' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ description: 'The phone number of the client' })
  @Field({ description: 'The phone number of the client', nullable: true })
  @Column({ nullable: true })
  phone?: string;

  @ApiProperty({ description: 'The address of the client' })
  @Field({ description: 'The address of the client', nullable: true })
  @Column({ nullable: true })
  address?: string;

  @ApiProperty({ description: 'The city of the client' })
  @Field({ description: 'The city of the client', nullable: true })
  @Column({ nullable: true })
  city?: string;

  @ApiProperty({ description: 'The country of the client' })
  @Field({ description: 'The country of the client', nullable: true })
  @Column({ nullable: true })
  country?: string;

  @ApiProperty({ description: 'Client invoices', type: () => [Invoice] })
  @Field(() => [Invoice], { description: 'Client invoices', nullable: true })
  @OneToMany(() => Invoice, invoice => invoice.client)
  invoices?: Invoice[];

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
