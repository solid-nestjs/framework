import { InputType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { GenerateDtoFromEntity } from '@solid-nestjs/graphql';
import { Product } from '../../entities/product.entity';
import { Supplier } from '../../../suppliers/entities/supplier.entity';

// Using GenerateDtoFromEntity with Supplier entity for supplier reference
// Only include the composite key components
@InputType()
export class ProductSupplierDto extends GenerateDtoFromEntity(Supplier, [
  'type',
  'code',
]) {}

// Note: ProductId is already a proper GraphQL type, so we can use it directly
// But we can also show how it could be generated if needed:
// const productIdConfig: PropertyInclusionConfig<ProductId> = {
//   type: true,
//   code: false,  // Exclude code since this is for creation, not full id
// };
// @InputType()
// export class ProductIdDto extends GenerateDtoFromEntity(ProductId, productIdConfig) {}

@InputType()
export class ProductIdDto {
  @Field(() => ID, { description: 'The type of the product' })
  @IsNotEmpty()
  @IsString()
  type: string;
}

@InputType()
export class CreateProductDto extends GenerateDtoFromEntity(Product, [
  'name',
  'description',
  'price',
  'stock',
]) {
  // Custom field: composite key (only type, code is auto-generated)
  @Field(() => ProductIdDto, { description: 'id of the product' })
  @IsNotEmpty()
  //@ts-ignore
  id: ProductIdDto;

  // Custom field: supplier relation
  @Field(() => ProductSupplierDto, {
    description: 'product Supplier',
    nullable: true,
  })
  @IsOptional()
  //@ts-ignore
  supplier?: ProductSupplierDto;
}

// Alternative: Show manual approach for comparison
// @InputType()
// export class CreateProductDto {
//   @Field(() => ProductIdDto, { description: 'id of the product' })
//   @IsNotEmpty()
//   id: ProductIdDto;
//
//   @Field({ description: 'The name of the product' })
//   @IsNotEmpty()
//   @IsString()
//   name: string;
//
//   @Field({ description: 'The description of the product' })
//   @IsNotEmpty()
//   @IsString()
//   description: string;
//
//   @Field(() => Float, { description: 'The price of the product' })
//   @IsNumber()
//   @IsPositive()
//   price: number;
//
//   @Field(() => Int, { description: 'The stock quantity of the product' })
//   @IsNumber()
//   @Min(0)
//   stock: number;
//
//   @Field(() => ProductSupplierDto, {
//     description: 'product Supplier',
//     nullable: true,
//   })
//   @IsOptional()
//   supplier?: ProductSupplierDto;
// }
