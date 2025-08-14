import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { GroupByRequestInput } from '@solid-nestjs/graphql';
import { Product } from '../../entities/product.entity';
import { Supplier } from '../../../suppliers/entities/supplier.entity';

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