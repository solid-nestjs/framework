import { ArgsType } from '@nestjs/graphql';
import { GroupByArgsFrom, createGroupByFields } from '@solid-nestjs/typeorm-hybrid-crud';
import { FindProductArgs } from './find-product-args.dto';
import { Product } from '../../entities/product.entity';

// Generated GROUP BY fields using helper
export const ProductGroupByFields = createGroupByFields(Product, {
  name: {
    description: 'Group by name'
  },
  price: {
    description: 'Group by price'
  },
  stock: {
    description: 'Group by stock'
  },
}, {
  name: 'ProductGroupByFields',
  description: 'GROUP BY fields for Product queries'
});

/**
 * GroupBy arguments for Product queries with both REST and GraphQL support
 *
 * This class extends FindProductArgs to add groupBy functionality using the
 * ProductGroupByFields generated with createGroupByFields helper.
 *
 * Example usage:
 * - REST API: POST /products/grouped with { groupBy: { fields: { name: true }, aggregates: [...] } }
 * - GraphQL: query { productsGrouped(groupBy: { fields: { name: true }, aggregates: [...] }) { ... } }
 */
@ArgsType()
export class GroupedProductArgs extends GroupByArgsFrom({
  findArgsType: FindProductArgs,
  groupByFieldsType: ProductGroupByFields,
  options: {
    name: 'GroupedProductArgs',
    description: 'Arguments for grouping products with filtering and aggregation support',
    groupByInputTypeName: 'ProductGroupByInput',
  },
}) {}