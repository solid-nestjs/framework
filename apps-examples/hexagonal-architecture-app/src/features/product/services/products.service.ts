import { Injectable } from '@nestjs/common';
import { CrudServiceFrom, CrudServiceStructure } from '@solid-nestjs/typeorm-hybrid-crud';
import { Context } from '@solid-nestjs/typeorm-hybrid-crud';
import { Product } from '../entities/product.entity';
import { CreateProductDto } from '../dto/inputs/create-product.dto';
import { UpdateProductDto } from '../dto/inputs/update-product.dto';
import { FindProductArgs } from '../dto/args/find-product-args.dto';

/**
 * Service structure configuration for Products
 */
export const productsServiceStructure = CrudServiceStructure({
  entityType: Product,
  createInputType: CreateProductDto,
  updateInputType: UpdateProductDto,
  findArgsType: FindProductArgs,
});

/**
 * Service for Products entity operations
 * 
 * This service extends the SOLID framework's CrudService with automatic CRUD operations.
 * It provides type-safe CRUD operations for Product entities.
 */
@Injectable()
export class ProductsService extends CrudServiceFrom(productsServiceStructure) {
  // Custom business logic methods can be added here
}