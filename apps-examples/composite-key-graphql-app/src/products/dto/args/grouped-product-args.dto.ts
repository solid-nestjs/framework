import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { GroupByArgs } from '@solid-nestjs/common';
import { GroupByRequestInput } from '@solid-nestjs/graphql';
import { FindProductArgs } from './find-product-args.dto';
import { Product } from '../../entities/product.entity';

/**
 * GroupBy fields for Supplier (simplified to avoid circular references)
 */
@InputType('SupplierGroupByFields')
class SupplierGroupByFields {
  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  name?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  contactEmail?: boolean;
}

/**
 * GroupBy fields for Product
 */
@InputType('ProductGroupByFields')
class ProductGroupByFields {
  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  name?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  description?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  price?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  stock?: boolean;

  @Field(() => SupplierGroupByFields, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => SupplierGroupByFields)
  supplier?: SupplierGroupByFields;
}

/**
 * Product-specific GroupBy request extending the base GroupByRequestInput
 */
@InputType('ProductGroupByInput')
export class ProductGroupByRequest extends GroupByRequestInput {
  @Field(() => ProductGroupByFields, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductGroupByFields)
  fields?: ProductGroupByFields;
}

@ArgsType()
export class GroupedProductArgs
  extends FindProductArgs
  implements GroupByArgs<Product>
{
  @Field(() => ProductGroupByRequest, {
    description: 'GroupBy configuration for products',
  })
  @ValidateNested()
  @Type(() => ProductGroupByRequest)
  groupBy!: ProductGroupByRequest;
}
