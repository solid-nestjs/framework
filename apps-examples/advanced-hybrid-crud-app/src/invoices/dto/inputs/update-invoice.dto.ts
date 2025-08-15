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
  IsArray,
} from 'class-validator';
import { IsFlexibleUUID } from '../../../common/validators/is-flexible-uuid.validator';

@InputType()
export class UpdateInvoiceClientDto {
  @ApiProperty({ description: 'client id' })
  @Field(() => ID)
  @IsString()
  @IsFlexibleUUID()
  id: string;
}

@InputType()
export class UpdateInvoiceDetailDto {
  @ApiProperty({
    description: 'detail id for updating existing detail',
    required: false,
  })
  @Field(() => ID, {
    description: 'detail id for updating existing detail',
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiProperty({ description: 'product id' })
  @Field(() => ID, { description: 'product id' })
  @IsNotEmpty()
  @IsString()
  @IsFlexibleUUID()
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
export class UpdateInvoiceDto {
  @ApiProperty({ description: 'The invoice number', required: false })
  @Field({ description: 'The invoice number', nullable: true })
  @IsOptional()
  @IsString()
  invoiceNumber?: string;

  @ApiProperty({
    description: 'The status of the invoice',
    enum: ['pending', 'paid', 'cancelled'],
    required: false,
  })
  @Field({
    description: 'The status of the invoice',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({
    description: 'Invoice details/line items',
    type: () => [UpdateInvoiceDetailDto],
    required: false,
  })
  @Field(() => [UpdateInvoiceDetailDto], {
    description: 'Invoice details/line items',
    nullable: true,
  })
  @IsOptional()
  @Type(() => UpdateInvoiceDetailDto)
  @ValidateNested({ each: true })
  @IsArray()
  details?: UpdateInvoiceDetailDto[];

  @ApiProperty({
    description: 'Invoice client',
    type: () => UpdateInvoiceClientDto,
    required: false,
  })
  @Field(() => UpdateInvoiceClientDto, {
    description: 'Invoice client',
    nullable: true,
  })
  @IsOptional()
  @Type(() => UpdateInvoiceClientDto)
  @ValidateNested()
  client?: UpdateInvoiceClientDto;
}
