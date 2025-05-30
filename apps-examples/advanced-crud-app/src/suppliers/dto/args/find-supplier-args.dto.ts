import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  FindArgsFrom,
  OrderBy,
  OrderByTypes,
  StringFilter,
  Where,
} from '@solid-nestjs/typeorm-crud';
import { Supplier } from '../../entities/supplier.entity';

class FindSupplierWhere implements Where<Supplier> {
  @ApiProperty({ type: () => StringFilter, required: false })
  @Type(() => StringFilter)
  @IsOptional()
  @ValidateNested()
  name?: StringFilter | undefined;

  @ApiProperty({ type: () => StringFilter, required: false })
  @Type(() => StringFilter)
  @IsOptional()
  @ValidateNested()
  contactEmail?: StringFilter | undefined;
}

class FindSupplierOrderBy implements OrderBy<Supplier> {
  @ApiProperty({ enum: OrderByTypes, required: false })
  @IsEnum(OrderByTypes)
  @IsOptional()
  name?: OrderByTypes | undefined;

  @ApiProperty({ enum: OrderByTypes, required: false })
  @IsEnum(OrderByTypes)
  @IsOptional()
  contactEmail?: OrderByTypes | undefined;
}

export class FindSupplierArgs extends FindArgsFrom<Supplier>({
  whereType: FindSupplierWhere,
  orderByType: FindSupplierOrderBy,
}) {}
