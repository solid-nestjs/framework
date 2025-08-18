import { ArgsType } from '@nestjs/graphql';
import {
  GroupByArgsFrom,
  createGroupByFields,
} from '@solid-nestjs/typeorm-graphql-crud';
import { FindProductArgs } from './find-product-args.dto';
import { Product } from '../../entities/product.entity';
import { Supplier } from '../../../suppliers/entities/supplier.entity';

// Generated GroupBy fields for Supplier (simplified to avoid circular references)
const SupplierGroupByFields = createGroupByFields(
  Supplier,
  {
    name: true, // Enable grouping + applies all decorators
    contactEmail: true, // Enable grouping + applies all decorators
    // Explicitly NOT including products field to avoid circular reference
  },
  {
    name: 'SupplierGroupByFields',
    description: 'Supplier grouping options for Product queries (avoiding circular reference)',
  },
);

// Generated GroupBy fields for Product using helper
const ProductGroupByFields = createGroupByFields(
  Product,
  {
    name: true, // Enable grouping + applies all decorators
    description: true, // Enable grouping + applies all decorators
    price: true, // Enable grouping + applies all decorators
    stock: true, // Enable grouping + applies all decorators
    supplier: SupplierGroupByFields, // Use the simplified Supplier GroupBy class
  },
  {
    name: 'ProductGroupByFields',
    description: 'Product grouping options for queries',
  },
);

// Use GroupByArgsFrom mixin with the generated ProductGroupByFields
@ArgsType()
export class GroupedProductArgs extends GroupByArgsFrom<Product>({
  findArgsType: FindProductArgs,
  groupByFieldsType: ProductGroupByFields,
  options: {
    name: 'GroupedProductArgs',
    description: 'GroupBy configuration for products',
  },
}) {}
