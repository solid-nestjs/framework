import { Controller } from '@nestjs/common';
import { CrudControllerFrom, CrudControllerStructure } from '@solid-nestjs/typeorm-hybrid-crud';
import { ProductsService, productsServiceStructure } from '../services/products.service';
import { Product } from '../entities/product.entity';
import { GroupedProductArgs } from '../dto/args/grouped-product-args.dto';

/**
 * Controller structure configuration for Products
 */
export const productsControllerStructure = CrudControllerStructure({
  ...productsServiceStructure,
  serviceType: ProductsService,
  groupByArgsType: GroupedProductArgs,
  operations: {
    findAll: true,
    findOne: true,
    create: true,
    update: true,
    remove: true,
  },
});

/**
 * REST Controller for Products entities
 * 
 * This controller extends the SOLID framework's CrudController with automatic REST endpoints.
 * It provides type-safe CRUD operations for Product entities.
 * 
 * Available endpoints:
 * - GET / - findAll
 * - GET //:id - findOne
 * - POST / - create
 * - PATCH //:id - update
 * - DELETE //:id - remove
 */
@Controller('products')
export class ProductsController extends CrudControllerFrom(productsControllerStructure) {
}