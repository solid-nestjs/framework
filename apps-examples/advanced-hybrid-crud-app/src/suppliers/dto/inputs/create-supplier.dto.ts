import { SolidInput, SolidField } from '@solid-nestjs/common';
import { GenerateDtoFromEntity } from '@solid-nestjs/rest-graphql';
import { Supplier } from '../../entities/supplier.entity';
import { Product } from '../../../products/entities/product.entity';

// Using GenerateDtoFromEntity with Product entity (default rules)
// This will include: name, description, price, stock (flat properties, excluding system fields and relations)
@SolidInput()
export class SupplierProductDto extends GenerateDtoFromEntity(Product) {}

// Alternative: Using object format for fine control
// const productConfig: PropertyInclusionConfig<Product> = {
//   name: true,        // Always include
//   description: true, // Always include
//   price: true,       // Always include
//   stock: true,       // Always include
//   id: false,         // Always exclude
//   supplier: false,   // Always exclude (relation)
//   createdAt: false,  // Always exclude
//   updatedAt: false,  // Always exclude
//   deletedAt: false,  // Always exclude
// };
// @SolidInput()
// export class SupplierProductDto extends GenerateDtoFromEntity(Product, productConfig) {}

// Example 1: Using default rules (no configuration)
// This will include: name, contactEmail (flat properties, excluding system fields and relations)
@SolidInput()
export class CreateSupplierDto extends GenerateDtoFromEntity(Supplier) {
  // Custom field: products array with nested DTOs
  @SolidField({
    description: 'Supplier`s products',
    nullable: true,
    array: true,
    arrayType: () => SupplierProductDto,
  })
  products?: SupplierProductDto[];
}

// Example 2: Using legacy array format (backward compatibility)
// @SolidInput()
// export class CreateSupplierDto extends GenerateDtoFromEntity(Supplier, [
//   'name', 'contactEmail'
// ]) {
//   @SolidField({
//     description: 'Supplier`s products',
//     nullable: true,
//     array: true,
//     arrayType: () => SupplierProductDto
//   })
//   products?: SupplierProductDto[];
// }

// Example 3: Using new object format for fine control
// const supplierConfig: PropertyInclusionConfig<Supplier> = {
//   name: true,         // Always include
//   contactEmail: true, // Always include
//   id: false,          // Always exclude
//   products: false,    // Always exclude (we'll add it manually)
//   createdAt: false,   // Always exclude
//   updatedAt: false,   // Always exclude
//   deletedAt: false,   // Always exclude
// };
// @SolidInput()
// export class CreateSupplierDto extends GenerateDtoFromEntity(Supplier, supplierConfig) {
//   @SolidField({
//     description: 'Supplier`s products',
//     nullable: true,
//     array: true,
//     arrayType: () => SupplierProductDto
//   })
//   products?: SupplierProductDto[];
// }
