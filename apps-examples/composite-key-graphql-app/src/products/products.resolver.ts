import { Resolver } from '@nestjs/graphql';
import {
  CrudResolverFrom,
  CrudResolverStructure,
} from '@solid-nestjs/typeorm-graphql-crud';
import { ProductsService, serviceStructure } from './products.service';
import { Product } from './entities/product.entity';
import { ProductId } from './entities/product.key';

const resolverStructure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: ProductsService,
  entityId: {
    type: ProductId,
  },
});

@Resolver(() => Product)
export class ProductsResolver extends CrudResolverFrom(resolverStructure) {}
