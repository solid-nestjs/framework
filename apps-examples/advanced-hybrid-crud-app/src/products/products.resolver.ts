import { Resolver } from '@nestjs/graphql';
import {
  CrudResolverFrom,
  CrudResolverStructure,
} from '@solid-nestjs/typeorm-hybrid-crud';
import { ProductsService, serviceStructure } from './products.service';
import { Product } from './entities/product.entity';
import { GroupedProductArgs } from './dto';

const resolverStructure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: ProductsService,
  groupByArgsType: GroupedProductArgs,
  operations: {
    findAll: true,
    findOne: true,
    pagination: true,
    findAllGrouped: true,
    create: true,
    update: true,
    remove: true,
    recover: true,
    hardRemove: true,
  },
});

@Resolver(() => Product)
export class ProductsResolver extends CrudResolverFrom(resolverStructure) {}
