import { InputType, Field, Float, Int, ID } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsPositive,
  Min,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { SupplierId } from '../../../suppliers/entities/supplier.key';
import { Code } from 'typeorm';

@InputType()
export class ProductSupplierDto {
  // @Field(() => SupplierId)
  // @IsNotEmpty()
  // id: SupplierId;

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

  @IsOptional()
  prSupplier?: ProductSupplierDto;

  @Field(() => ProductSupplierDto, {
    description: 'product Supplier',
    nullable: true,
  })
  @IsOptional()
  set supplier(value) {
    this.prSupplier = value as any;
  }

  get supplier() {
    if (!this.prSupplier) return undefined;

    return { id: { type: this.prSupplier.type, code: this.prSupplier.code } };
  }
}
