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
  IsArray,
} from 'class-validator';

export class UpdateInvoiceDetailDto {
  @ApiProperty({
    description: 'detail id for updating existing detail',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  id?: number;

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

export class UpdateInvoiceDto {
  @ApiProperty({ description: 'The invoice number', required: false })
  @IsOptional()
  @IsString()
  invoiceNumber?: string;

  @ApiProperty({
    description: 'The status of the invoice',
    enum: ['pending', 'paid', 'cancelled'],
    required: false,
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({
    description: 'Invoice details/line items',
    type: () => [UpdateInvoiceDetailDto],
    required: false,
  })
  @IsOptional()
  @Type(() => UpdateInvoiceDetailDto)
  @ValidateNested({ each: true })
  @IsArray()
  details?: UpdateInvoiceDetailDto[];
}
