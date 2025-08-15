import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { GroupByRequestInput } from '@solid-nestjs/rest-api';

/**
 * GroupBy fields for Supplier (simplified to avoid circular references)
 */
export class SupplierGroupByFields {
  @ApiProperty({ required: false, description: 'Group by supplier name' })
  @IsOptional()
  name?: boolean;

  @ApiProperty({ required: false, description: 'Group by supplier contact email' })
  @IsOptional()
  contactEmail?: boolean;
}

/**
 * GroupBy fields for Product
 */
export class ProductGroupByFields {
  @ApiProperty({ required: false, description: 'Group by product name' })
  @IsOptional()
  name?: boolean;

  @ApiProperty({ required: false, description: 'Group by product description' })
  @IsOptional()
  description?: boolean;

  @ApiProperty({ required: false, description: 'Group by product price' })
  @IsOptional()
  price?: boolean;

  @ApiProperty({ required: false, description: 'Group by product stock' })
  @IsOptional()
  stock?: boolean;

  @ApiProperty({ 
    type: SupplierGroupByFields, 
    required: false, 
    description: 'Group by supplier fields' 
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SupplierGroupByFields)
  supplier?: SupplierGroupByFields;
}

/**
 * Product-specific GroupBy request extending the base GroupByRequestInput
 */
export class ProductGroupByRequest extends GroupByRequestInput {
  @ApiProperty({ 
    type: ProductGroupByFields, 
    required: false, 
    description: 'Fields to group by' 
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductGroupByFields)
  fields?: ProductGroupByFields;
}