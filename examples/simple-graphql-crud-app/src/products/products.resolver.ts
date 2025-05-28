import { CrudResolverFrom, CrudResolverStructure } from '@solid-nestjs/typeorm-graphql-crud';
import { ProductsService, serviceStructure } from './products.service';
import { Resolver } from '@nestjs/graphql';
import { Product } from './entities/product.entity';

const resolverStructure = CrudResolverStructure({
    ...serviceStructure,
    serviceType:ProductsService,
});

@Resolver(() => Product)
export class ProductsResolver extends CrudResolverFrom(resolverStructure) {
    
}
