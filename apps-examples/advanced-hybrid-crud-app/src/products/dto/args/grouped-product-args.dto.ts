import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { IsOptional, ValidateNested } from 'class-validator';
import { GroupByArgs } from '@solid-nestjs/common';
import { GroupByRequestInput } from '@solid-nestjs/rest-api';
import { GroupByRequestInput as GraphQLGroupByRequestInput } from '@solid-nestjs/graphql';
import { FindProductArgs } from './find-product-args.dto';
import { Product } from '../../entities/product.entity';

/**
 * Unified GroupBy fields for Supplier (works with both REST and GraphQL)
 */
@InputType('SupplierGroupByFields')
export class SupplierGroupByFields {
  @ApiProperty({ required: false, description: 'Group by supplier name' })
  @Field(() => Boolean, {
    nullable: true,
    description: 'Group by supplier name',
  })
  @IsOptional()
  name?: boolean;

  @ApiProperty({
    required: false,
    description: 'Group by supplier contact email',
  })
  @Field(() => Boolean, {
    nullable: true,
    description: 'Group by supplier contact email',
  })
  @IsOptional()
  contactEmail?: boolean;
}

/**
 * Unified GroupBy fields for Product (works with both REST and GraphQL)
 */
@InputType('ProductGroupByFields')
export class ProductGroupByFields {
  @ApiProperty({ required: false, description: 'Group by product name' })
  @Field(() => Boolean, {
    nullable: true,
    description: 'Group by product name',
  })
  @IsOptional()
  name?: boolean;

  @ApiProperty({ required: false, description: 'Group by product description' })
  @Field(() => Boolean, {
    nullable: true,
    description: 'Group by product description',
  })
  @IsOptional()
  description?: boolean;

  @ApiProperty({ required: false, description: 'Group by product price' })
  @Field(() => Boolean, {
    nullable: true,
    description: 'Group by product price',
  })
  @IsOptional()
  price?: boolean;

  @ApiProperty({ required: false, description: 'Group by product stock' })
  @Field(() => Boolean, {
    nullable: true,
    description: 'Group by product stock',
  })
  @IsOptional()
  stock?: boolean;

  @ApiProperty({
    type: SupplierGroupByFields,
    required: false,
    description: 'Group by supplier fields',
  })
  @Field(() => SupplierGroupByFields, {
    nullable: true,
    description: 'Group by supplier fields',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SupplierGroupByFields)
  supplier?: SupplierGroupByFields;
}

/**
 * Unified Product-specific GroupBy request for REST API
 */
export class ProductGroupByRequest extends GroupByRequestInput {
  @ApiProperty({
    type: ProductGroupByFields,
    required: false,
    description: 'Fields to group by',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductGroupByFields)
  fields?: ProductGroupByFields;
}

/**
 * Unified Product-specific GroupBy request for GraphQL
 */
@InputType('ProductGroupByInput')
export class ProductGroupByRequestGraphQL extends GraphQLGroupByRequestInput {
  @Field(() => ProductGroupByFields, {
    nullable: true,
    description: 'Fields to group by',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductGroupByFields)
  fields?: ProductGroupByFields;
}

/**
 * REST API GroupBy arguments for products
 */
export class GroupedProductArgsRest
  extends FindProductArgs
  implements GroupByArgs<Product>
{
  @ApiProperty({
    type: ProductGroupByRequest,
    description: 'GroupBy configuration for products',
  })
  @ValidateNested()
  @Type(() => ProductGroupByRequest)
  groupBy!: ProductGroupByRequest;
}

/**
 * GraphQL GroupBy arguments for products
 */
@ArgsType()
export class GroupedProductArgsGraphQL
  extends FindProductArgs
  implements GroupByArgs<Product>
{
  @Field(() => ProductGroupByRequestGraphQL, {
    description: 'GroupBy configuration for products',
  })
  @ValidateNested()
  @Type(() => ProductGroupByRequestGraphQL)
  groupBy!: ProductGroupByRequestGraphQL;
}
