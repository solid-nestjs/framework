import { SolidInput, SolidField } from '@solid-nestjs/common';

@SolidInput()
export class CreateClientDto {
  @SolidField({
    description: 'The first name of the client'
  })
  firstName: string;

  @SolidField({
    description: 'The last name of the client'
  })
  lastName: string;

  @SolidField({
    description: 'The email address of the client',
    email: true
  })
  email: string;

  @SolidField({
    description: 'The phone number of the client',
    nullable: true
  })
  phone?: string;

  @SolidField({
    description: 'The address of the client',
    nullable: true
  })
  address?: string;

  @SolidField({
    description: 'The city of the client',
    nullable: true
  })
  city?: string;

  @SolidField({
    description: 'The country of the client',
    nullable: true
  })
  country?: string;
}
