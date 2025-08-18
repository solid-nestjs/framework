import { IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ArgsType, Field, InputType } from '@nestjs/graphql';
import {
  FindArgsFrom,
  NumberFilter,
  OrderBy,
  OrderByTypes,
  StringFilter,
  Where,
  DateFilter,
  getWhereClass,
} from '@solid-nestjs/typeorm-hybrid-crud';
import { Invoice } from '../../entities/invoice.entity';
import { FindClientArgs } from '../../../clients/dto';
import { FindInvoiceDetailArgs } from './find-invoice-detail-args.dto';

const ClientWhere = getWhereClass(FindClientArgs);
const InvoiceDetailWhere = getWhereClass(FindInvoiceDetailArgs);

@InputType({ isAbstract: true })
class FindInvoiceWhere implements Where<Invoice> {
  @Field(() => NumberFilter, { nullable: true })
  @ApiProperty({ type: () => NumberFilter, required: false })
  @Type(() => NumberFilter)
  @IsOptional()
  @ValidateNested()
  id?: NumberFilter | undefined;

  @Field(() => String, { nullable: true })
  @ApiProperty({ type: () => String, required: false })
  @IsOptional()
  invoiceNumber?: string | string[] | StringFilter | undefined;

  @Field(() => NumberFilter, { nullable: true })
  @ApiProperty({ type: () => NumberFilter, required: false })
  @Type(() => NumberFilter)
  @IsOptional()
  @ValidateNested()
  totalAmount?: NumberFilter | undefined;

  @Field(() => String, { nullable: true })
  @ApiProperty({ type: () => String, required: false })
  @IsOptional()
  status?: string | string[] | StringFilter | undefined;

  @Field(() => DateFilter, { nullable: true })
  @ApiProperty({ type: () => DateFilter, required: false })
  @Type(() => DateFilter)
  @IsOptional()
  @ValidateNested()
  invoiceDate?: DateFilter | undefined;

  @Field(() => ClientWhere, { nullable: true })
  @ApiProperty({ type: () => ClientWhere, required: false })
  @Type(() => ClientWhere)
  @IsOptional()
  @ValidateNested()
  client?: InstanceType<typeof ClientWhere> | undefined;

  @Field(() => InvoiceDetailWhere, { nullable: true })
  @ApiProperty({ type: () => InvoiceDetailWhere, required: false })
  @Type(() => InvoiceDetailWhere)
  @IsOptional()
  @ValidateNested()
  details?: InstanceType<typeof InvoiceDetailWhere> | undefined;
}

@InputType({ isAbstract: true })
class FindInvoiceOrderBy implements OrderBy<Invoice> {
  @Field(() => OrderByTypes, { nullable: true })
  @ApiProperty({ enum: OrderByTypes, required: false })
  @IsOptional()
  @IsEnum(OrderByTypes)
  id?: OrderByTypes | undefined;

  @Field(() => OrderByTypes, { nullable: true })
  @ApiProperty({ enum: OrderByTypes, required: false })
  @IsOptional()
  @IsEnum(OrderByTypes)
  invoiceNumber?: OrderByTypes | undefined;

  @Field(() => OrderByTypes, { nullable: true })
  @ApiProperty({ enum: OrderByTypes, required: false })
  @IsOptional()
  @IsEnum(OrderByTypes)
  totalAmount?: OrderByTypes | undefined;

  @Field(() => OrderByTypes, { nullable: true })
  @ApiProperty({ enum: OrderByTypes, required: false })
  @IsOptional()
  @IsEnum(OrderByTypes)
  status?: OrderByTypes | undefined;

  @Field(() => OrderByTypes, { nullable: true })
  @ApiProperty({ enum: OrderByTypes, required: false })
  @IsOptional()
  @IsEnum(OrderByTypes)
  invoiceDate?: OrderByTypes | undefined;
}

@ArgsType()
export class FindInvoiceArgs extends FindArgsFrom<Invoice>({
  whereType: FindInvoiceWhere,
  orderByType: FindInvoiceOrderBy,
}) {}
