import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { GenerateDtoFromEntity } from '@solid-nestjs/typeorm-crud';
import { Product } from '../../entities/product.entity';
import { Supplier } from '../../../suppliers/entities/supplier.entity';

// Generate DTO from Supplier entity, selecting only the 'id' property
// Automatic validation inference should apply @IsString() + @IsNotEmpty() for string type
export class ProductSupplierDto extends GenerateDtoFromEntity(Supplier, [
  'id',
]) {}

// Generate DTO from Product entity, selecting the basic properties we need for creation
// Automatic validation inference should apply:
// - name: @IsString() + @IsNotEmpty() (string type)
// - description: @IsString() + @IsNotEmpty() (string type)  
// - price: @IsNumber() (number type)
// - stock: @IsNumber() (number type)
export class CreateProductDto extends GenerateDtoFromEntity(Product, [
  'name',
  'description',
  'price',
  'stock',
]) {
  // Add the custom supplier relation field
  @ApiProperty({
    description: 'product Supplier',
    type: () => ProductSupplierDto,
  })
  @Type(() => ProductSupplierDto)
  @ValidateNested()
  supplier: ProductSupplierDto;
}
