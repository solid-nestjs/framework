import {
  SolidEntity,
  SolidField,
  SolidId,
  SolidCreatedAt,
  SolidUpdatedAt,
  SolidDeletedAt,
  SolidOneToMany,
} from '@solid-nestjs/common';

// Import adapters to register them
import '@solid-nestjs/common/dist/adapters';
import '@solid-nestjs/typeorm/dist/adapters';
import '@solid-nestjs/rest-api/dist/adapters';
import '@solid-nestjs/graphql/dist/adapters';
import { Invoice } from '../../invoices/entities/invoice.entity';
import { Field } from '@nestjs/graphql';

@SolidEntity()
export class Client {
  @SolidId({
    generated: 'uuid',
    description: 'The unique identifier of the client',
  })
  id: string;

  @SolidField({
    maxLength: 100,
    description: 'The first name of the client',
  })
  firstName: string;

  @SolidField({
    maxLength: 100,
    description: 'The last name of the client',
  })
  lastName: string;

  @SolidField({
    maxLength: 255,
    unique: true,
    email: true,
    description: 'The email address of the client',
  })
  email: string;

  @SolidField({
    maxLength: 20,
    nullable: true,
    description: 'The phone number of the client',
  })
  phone?: string;

  @SolidField({
    maxLength: 500,
    nullable: true,
    description: 'The address of the client',
  })
  address?: string;

  @SolidField({
    maxLength: 100,
    nullable: true,
    description: 'The city of the client',
  })
  city?: string;

  @SolidField({
    maxLength: 100,
    nullable: true,
    description: 'The country of the client',
  })
  country?: string;

  @SolidOneToMany(() => Invoice, invoice => invoice.client, {
    description: 'Client invoices',
    skip: ['graphql'],
  })
  @Field(() => [Invoice], { description: 'Client invoices', nullable: true })
  invoices?: Invoice[];

  @SolidCreatedAt()
  createdAt!: Date;

  @SolidUpdatedAt()
  updatedAt!: Date;

  @SolidDeletedAt()
  deletedAt?: Date;
}
