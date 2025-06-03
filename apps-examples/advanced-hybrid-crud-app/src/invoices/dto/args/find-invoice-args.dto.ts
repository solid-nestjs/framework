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

const ClientWhere = getWhereClass(FindClientArgs);

@InputType({ isAbstract: true })
class FindInvoiceWhere implements Where<Invoice> {
  @Field(() => NumberFilter, { nullable: true })
  @ApiProperty({ type: () => NumberFilter, required: false })
  @Type(() => NumberFilter)
  @IsOptional()
  @ValidateNested()
  id?: NumberFilter | undefined;

  @Field(() => StringFilter, { nullable: true })
  @ApiProperty({ type: () => StringFilter, required: false })
  @Type(() => StringFilter)
  @IsOptional()
  @ValidateNested()
  invoiceNumber?: StringFilter | undefined;

  @Field(() => NumberFilter, { nullable: true })
  @ApiProperty({ type: () => NumberFilter, required: false })
  @Type(() => NumberFilter)
  @IsOptional()
  @ValidateNested()
  totalAmount?: NumberFilter | undefined;

  @Field(() => StringFilter, { nullable: true })
  @ApiProperty({ type: () => StringFilter, required: false })
  @Type(() => StringFilter)
  @IsOptional()
  @ValidateNested()
  status?: StringFilter | undefined;

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
