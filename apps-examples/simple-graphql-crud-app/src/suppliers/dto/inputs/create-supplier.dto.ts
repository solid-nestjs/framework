import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { Field, Float, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateSupplierDto {
  @Field({ description: 'The name of the supplier' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field({ description: 'The email of the supplier' })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  contactEmail: string;

  @Field(() => [SupplierProductDto], {
    description: 'Supplier`s products',
    nullable: true,
  })
  @IsArray()
  @IsOptional()
  products?: SupplierProductDto[];
}

@InputType()
export class SupplierProductDto {
  @Field({ description: 'The name of the product' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field({ description: 'The description of the product' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @Field(() => Float, { description: 'The price of the product' })
  @IsNumber()
  @IsPositive()
  price: number;

  @Field(() => Int, { description: 'The stock quantity of the product' })
  @IsNumber()
  @Min(0)
  stock: number;
}
