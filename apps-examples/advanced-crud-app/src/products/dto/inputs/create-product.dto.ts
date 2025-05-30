import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class ProductSupplierDto {
  @ApiProperty({ description: 'supplier id' })
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  id: string;
}

export class CreateProductDto {
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

  @ApiProperty({
    description: 'product Supplier',
    type: () => ProductSupplierDto,
  })
  @Type(() => ProductSupplierDto)
  @ValidateNested()
  supplier: ProductSupplierDto;
}
