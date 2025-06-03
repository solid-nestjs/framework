import { InputType, Field, Float, Int, ID } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsPositive,
  Min,
  ValidateNested,
} from 'class-validator';

@InputType()
export class ProductSupplierDto {
  @Field(() => ID)
  @IsNotEmpty()
  @IsString()
  id: string;
}

@InputType()
export class CreateProductDto {
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

  @Field(() => ProductSupplierDto, { description: 'product Supplier' })
  @Type(() => ProductSupplierDto)
  @ValidateNested()
  supplier: ProductSupplierDto;
}
