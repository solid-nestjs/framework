import { IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  FindArgsFrom,
  NumberFilter,
  OrderBy,
  OrderByTypes,
  StringFilter,
  Where,
  DateFilter,
} from '@solid-nestjs/typeorm-crud';
import { Invoice } from '../../entities/invoice.entity';

class FindInvoiceWhere implements Where<Invoice> {
  @ApiProperty({ type: () => NumberFilter, required: false })
  @Type(() => NumberFilter)
  @IsOptional()
  @ValidateNested()
  id?: NumberFilter | undefined;

  @ApiProperty({ type: () => StringFilter, required: false })
  @Type(() => StringFilter)
  @IsOptional()
  @ValidateNested()
  invoiceNumber?: StringFilter | undefined;

  @ApiProperty({ type: () => NumberFilter, required: false })
  @Type(() => NumberFilter)
  @IsOptional()
  @ValidateNested()
  totalAmount?: NumberFilter | undefined;

  @ApiProperty({ type: () => StringFilter, required: false })
  @Type(() => StringFilter)
  @IsOptional()
  @ValidateNested()
  status?: StringFilter | undefined;

  @ApiProperty({ type: () => DateFilter, required: false })
  @Type(() => DateFilter)
  @IsOptional()
  @ValidateNested()
  invoiceDate?: DateFilter | undefined;
}

class FindInvoiceOrderBy implements OrderBy<Invoice> {
  @ApiProperty({ enum: OrderByTypes, required: false })
  @IsOptional()
  @IsEnum(OrderByTypes)
  id?: OrderByTypes | undefined;

  @ApiProperty({ enum: OrderByTypes, required: false })
  @IsOptional()
  @IsEnum(OrderByTypes)
  invoiceNumber?: OrderByTypes | undefined;

  @ApiProperty({ enum: OrderByTypes, required: false })
  @IsOptional()
  @IsEnum(OrderByTypes)
  totalAmount?: OrderByTypes | undefined;

  @ApiProperty({ enum: OrderByTypes, required: false })
  @IsOptional()
  @IsEnum(OrderByTypes)
  status?: OrderByTypes | undefined;

  @ApiProperty({ enum: OrderByTypes, required: false })
  @IsOptional()
  @IsEnum(OrderByTypes)
  invoiceDate?: OrderByTypes | undefined;
}

export class FindInvoiceArgs extends FindArgsFrom({
  whereType: FindInvoiceWhere,
  orderByType: FindInvoiceOrderBy,
}) {}
