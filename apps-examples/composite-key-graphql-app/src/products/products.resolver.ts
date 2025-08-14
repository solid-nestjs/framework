import { Resolver, Query, Args } from '@nestjs/graphql';
import {
  CrudResolverFrom,
  CrudResolverStructure,
} from '@solid-nestjs/typeorm-graphql-crud';
import { GroupedPaginationResultOutput } from '@solid-nestjs/graphql';
import { CurrentContext } from '@solid-nestjs/common';
import { ProductsService, serviceStructure } from './products.service';
import { Product } from './entities/product.entity';
import { GroupedProductArgs } from './dto';

const resolverStructure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: ProductsService,
});

@Resolver(() => Product)
export class ProductsResolver extends CrudResolverFrom(resolverStructure) {
  constructor(private readonly productsService: ProductsService) {
    super();
  }

  @Query(() => GroupedPaginationResultOutput, { 
    name: 'productsGrouped',
    description: 'Find products with grouping and aggregation'
  })
  async findAllGrouped(
    @Args() args: GroupedProductArgs,
    @CurrentContext() context: any,
  ): Promise<GroupedPaginationResultOutput> {
    const result = await this.productsService.findAllGrouped(context, args);
    
    // Convert to GraphQL output format
    return {
      groups: result.groups.map(group => ({
        key: typeof group.key === 'string' ? group.key : JSON.stringify(group.key),
        aggregates: typeof group.aggregates === 'string' ? group.aggregates : JSON.stringify(group.aggregates),
      })),
      pagination: result.pagination,
    };
  }
}
