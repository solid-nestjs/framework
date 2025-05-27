import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEmail, IsNotEmpty, IsNumber, IsString, Min, ValidateNested } from 'class-validator';

export class CreateSupplierDto {
  @ApiProperty({ description: 'The name of the supplier' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'The email of the supplier' })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  contactEmail: string;

  @ApiProperty({ description: 'The email of the supplier', type:() => [SupplierProductDto] })
  @Type(() => SupplierProductDto)
  @IsArray()
  @ValidateNested()
  products: SupplierProductDto[];
}

export class SupplierProductDto {
  @ApiProperty({ description: 'The name of the product' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'The description of the product' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ description: 'The price of the product' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'The stock quantity of the product' })
  @IsNumber()
  @Min(0)
  stock: number;
}