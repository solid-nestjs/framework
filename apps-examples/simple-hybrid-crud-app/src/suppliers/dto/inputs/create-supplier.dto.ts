import { IsArray, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';

@InputType()
export class CreateSupplierDto {
  @ApiProperty({ description: 'The name of the supplier' })
  @Field({ description: 'The name of the supplier' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'The email of the supplier' })
  @Field({ description: 'The email of the supplier' })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  contactEmail: string;

  @ApiProperty({ description: 'Supplier`s products', type:() => [SupplierProductDto], required:false })
  @Field(() => [SupplierProductDto],{ description: 'Supplier`s products', nullable:true })
  @Type(() => SupplierProductDto)
  @IsArray()
  @IsOptional()
  @ValidateNested()
  products?: SupplierProductDto[];
}

@InputType()
export class SupplierProductDto {
    @ApiProperty({ description: 'The name of the product' })
    @Field({ description: 'The name of the product' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ description: 'The description of the product' })
    @Field({ description: 'The description of the product' })
    @IsNotEmpty()
    @IsString()
    description: string;

    @ApiProperty({ description: 'The price of the product' })
    @Field(() => Float, { description: 'The price of the product' })
    @IsNumber()
    @IsPositive()
    price: number;

    @ApiProperty({ description: 'The stock quantity of the product' })
    @Field(() => Int, { description: 'The stock quantity of the product' })
    @IsNumber()
    @Min(0)
    stock: number;
}