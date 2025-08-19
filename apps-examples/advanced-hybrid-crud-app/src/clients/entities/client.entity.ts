import {
  SolidEntity,
  SolidField,
  SolidId,
  SolidCreatedAt,
  SolidUpdatedAt,
  SolidDeletedAt,
  SolidOneToMany,
} from '@solid-nestjs/common';

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

  @SolidOneToMany(
    () => {
      const { Invoice } = require('../../invoices/entities/invoice.entity');
      return Invoice;
    },
    (invoice: any) => invoice.client,
    {
      description: 'Client invoices',
    }
  )
  invoices?: any[];

  @SolidCreatedAt()
  createdAt!: Date;

  @SolidUpdatedAt()
  updatedAt!: Date;

  @SolidDeletedAt()
  deletedAt?: Date;
}
