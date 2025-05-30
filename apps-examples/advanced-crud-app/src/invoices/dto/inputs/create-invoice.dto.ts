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

export class CreateInvoiceDetailDto {
  @ApiProperty({ description: 'product id' })
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  productId: string;

  @ApiProperty({ description: 'The quantity of the product' })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'The unit price of the product' })
  @IsNumber()
  @Min(0)
  unitPrice: number;
}

export class CreateInvoiceDto {
  @ApiProperty({ description: 'The invoice number' })
  @IsNotEmpty()
  @IsString()
  invoiceNumber: string;

  @ApiProperty({
    description: 'The status of the invoice',
    enum: ['pending', 'paid', 'cancelled'],
    default: 'pending',
  })
  @IsOptional()
  @IsString()
  @IsIn(['pending', 'paid', 'cancelled'])
  status?: string;

  @ApiProperty({
    description: 'Invoice details/line items',
    type: () => [CreateInvoiceDetailDto],
  })
  @Type(() => CreateInvoiceDetailDto)
  @ValidateNested({ each: true })
  @IsArray()
  details: CreateInvoiceDetailDto[];
}
