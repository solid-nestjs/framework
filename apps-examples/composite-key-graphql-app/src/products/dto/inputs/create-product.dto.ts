import { InputType, Field, Float, Int, ID } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsPositive,
  Min,
  IsOptional,
} from 'class-validator';

@InputType()
export class ProductSupplierDto {
  @Field(() => ID, {
    description: 'The type of the unique identifier of the supplier',
  })
  @IsNotEmpty()
  type: string;

  @Field(() => ID, {
    description: 'The code of the unique identifier of the supplier',
  })
  @IsNotEmpty()
  code: number;
}

@InputType()
export class ProductIdDto {
  @Field(() => ID, { description: 'The type of the product' })
  @IsNotEmpty()
  @IsString()
  type: string;
}

@InputType()
export class CreateProductDto {
  @Field(() => ProductIdDto, { description: 'id of the product' })
  @IsNotEmpty()
  id: ProductIdDto;

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

  @Field(() => ProductSupplierDto, {
    description: 'product Supplier',
    nullable: true,
  })
  @IsOptional()
  supplier?: ProductSupplierDto;
}
