import { Resolver } from '@nestjs/graphql';
import { CrudResolverFrom, CrudResolverStructure } from '@solid-nestjs/typeorm-hybrid-crud';
import { ProductsService, productsServiceStructure } from '../services/products.service';
import { Product } from '../entities/product.entity';
import { GroupedProductArgs } from '../dto/args/grouped-product-args.dto';

/**
 * Resolver structure configuration for Products
 */
export const productsResolverStructure = CrudResolverStructure({
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
 * GraphQL Resolver for Products entities
 *
 * This resolver extends the SOLID framework's CrudResolver with automatic GraphQL queries and mutations.
 * It provides type-safe CRUD operations for Product entities.
 *
 * Available operations:
 * - Query:  - findAll
 * - Query: (id: ID!) - findOne
 * - Mutation: create(input: CreateInput!) - create
 * - Mutation: update(id: ID!, input: UpdateInput!) - update
 * - Mutation: remove(id: ID!) - remove
 */
@Resolver(() => Product)
export class ProductsResolver extends CrudResolverFrom(productsResolverStructure) {
}