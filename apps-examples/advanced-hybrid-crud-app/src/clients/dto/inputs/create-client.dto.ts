import { InputType, Field } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail, IsOptional } from 'class-validator';

@InputType()
export class CreateClientDto {
  @ApiProperty({ description: 'The first name of the client' })
  @Field({ description: 'The first name of the client' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'The last name of the client' })
  @Field({ description: 'The last name of the client' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ description: 'The email address of the client' })
  @Field({ description: 'The email address of the client' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The phone number of the client',
    required: false,
  })
  @Field({ description: 'The phone number of the client', nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'The address of the client', required: false })
  @Field({ description: 'The address of the client', nullable: true })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'The city of the client', required: false })
  @Field({ description: 'The city of the client', nullable: true })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ description: 'The country of the client', required: false })
  @Field({ description: 'The country of the client', nullable: true })
  @IsOptional()
  @IsString()
  country?: string;
}
