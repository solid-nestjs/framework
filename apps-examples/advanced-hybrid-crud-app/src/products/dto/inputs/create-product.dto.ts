import { SolidInput, SolidField } from '@solid-nestjs/common';
import { GenerateDtoFromEntity } from '@solid-nestjs/rest-graphql';
import { Product } from '../../entities/product.entity';
import { Supplier } from '../../../suppliers/entities/supplier.entity';

// Using GenerateDtoFromEntity with Supplier entity for supplier reference
// This will include: name, contactEmail (flat properties, excluding system fields and relations)
// But we override to only include 'id' for the supplier reference
@SolidInput()
export class ProductSupplierDto extends GenerateDtoFromEntity(Supplier, [
  'id',
]) {}

// Alternative manual approach for ProductSupplierDto:
// @SolidInput()
// export class ProductSupplierDto {
//   @SolidField({
//     description: 'supplier id',
//     adapters: {
//       graphql: {
//         type: () => ID
//       }
//     }
//   })
//   id: string;
// }

// Using GenerateDtoFromEntity with Product entity (default rules)
// This will include: name, description, price, stock (flat properties, excluding system fields and relations)
@SolidInput()
export class CreateProductDto extends GenerateDtoFromEntity(Product) {
  // Custom field: supplier reference
  @SolidField({
    description: 'Product Supplier',
  })
  supplier: ProductSupplierDto;
}

// Alternative examples for CreateProductDto:

// Example 2: Using legacy array format (backward compatibility)
// @SolidInput()
// export class CreateProductDto extends GenerateDtoFromEntity(Product, [
//   'name', 'description', 'price', 'stock'
// ]) {
//   @SolidField({
//     description: 'Product Supplier'
//   })
//   supplier: ProductSupplierDto;
// }

// Example 3: Using new object format for fine control
// const productConfig: PropertyInclusionConfig<Product> = {
//   name: true,        // Always include
//   description: true, // Always include
//   price: true,       // Always include
//   stock: true,       // Always include
//   id: false,         // Always exclude
//   supplier: false,   // Always exclude (we'll add it manually)
//   createdAt: false,  // Always exclude
//   updatedAt: false,  // Always exclude
//   deletedAt: false,  // Always exclude
// };
// @SolidInput()
// export class CreateProductDto extends GenerateDtoFromEntity(Product, productConfig) {
//   @SolidField({
//     description: 'Product Supplier'
//   })
//   supplier: ProductSupplierDto;
// }
