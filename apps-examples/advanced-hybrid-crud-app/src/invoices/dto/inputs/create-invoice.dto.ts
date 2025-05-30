import { InputType, Field, Float, Int, ID } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
  IsOptional,
  IsIn,
  IsArray,
} from 'class-validator';

@InputType()
export class CreateInvoiceDetailDto {
  @ApiProperty({ description: 'product id' })
  @Field(() => ID, { description: 'product id' })
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  productId: string;

  @ApiProperty({ description: 'The quantity of the product' })
  @Field(() => Int, { description: 'The quantity of the product' })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'The unit price of the product' })
  @Field(() => Float, { description: 'The unit price of the product' })
  @IsNumber()
  @Min(0)
  unitPrice: number;
}

@InputType()
export class CreateInvoiceDto {
  @ApiProperty({ description: 'The invoice number' })
  @Field({ description: 'The invoice number' })
  @IsNotEmpty()
  @IsString()
  invoiceNumber: string;

  @ApiProperty({
    description: 'The status of the invoice',
    enum: ['pending', 'paid', 'cancelled'],
    default: 'pending',
  })
  @Field({
    description: 'The status of the invoice',
    nullable: true,
    defaultValue: 'pending',
  })
  @IsOptional()
  @IsString()
  @IsIn(['pending', 'paid', 'cancelled'])
  status?: string;

  @ApiProperty({
    description: 'Invoice details/line items',
    type: () => [CreateInvoiceDetailDto],
  })
  @Field(() => [CreateInvoiceDetailDto], {
    description: 'Invoice details/line items',
  })
  @Type(() => CreateInvoiceDetailDto)
  @ValidateNested({ each: true })
  @IsArray()
  details: CreateInvoiceDetailDto[];
}
