import { InputType, Field, Float, Int, ID } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsNumber, IsPositive, Min, ValidateNested } from 'class-validator';

@InputType()
export class ProductSupplierDto {
    @ApiProperty({ description: 'supplier id' })
    @Field(() => ID)
    @IsString()
    id: string;
}

@InputType()
export class CreateProductDto {

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

    @ApiProperty({ description: 'product Supplier', type:() => ProductSupplierDto })
    @Field(() => ProductSupplierDto, { description: 'product Supplier' })
    @Type(() => ProductSupplierDto)
    @ValidateNested()
    supplier: ProductSupplierDto;
}