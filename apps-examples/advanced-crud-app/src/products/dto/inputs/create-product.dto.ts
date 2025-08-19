import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsUUID, ValidateNested } from 'class-validator';
import { GenerateDtoFromEntity } from '@solid-nestjs/typeorm-crud';
import { Product } from '../../entities/product.entity';
import { Supplier } from '../../../suppliers/entities/supplier.entity';

// Generate DTO from Supplier entity, selecting only the 'id' property
export class ProductSupplierDto extends GenerateDtoFromEntity(Supplier, [
  'id',
]) {}

// Generate DTO from Product entity, selecting the basic properties we need for creation
export class CreateProductDto extends GenerateDtoFromEntity(Product, [
  'name',
  'description',
  'price',
  'stock',
]) {
  // All selected properties (name, description, price, stock) are automatically included
  // from the Product entity with their original Swagger decorators

  // Add the custom supplier relation field
  @ApiProperty({
    description: 'product Supplier',
    type: () => ProductSupplierDto,
  })
  @Type(() => ProductSupplierDto)
  @ValidateNested()
  supplier: ProductSupplierDto;
}
