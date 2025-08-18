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
  getWhereClass,
} from '@solid-nestjs/typeorm-hybrid-crud';
import { InvoiceDetail } from '../../entities/invoice-detail.entity';
import { FindProductArgs } from '../../../products/dto';

const ProductWhere = getWhereClass(FindProductArgs);

@InputType({ isAbstract: true })
class FindInvoiceDetailWhere implements Where<InvoiceDetail> {
  @Field(() => NumberFilter, { nullable: true })
  @ApiProperty({ type: () => NumberFilter, required: false })
  @Type(() => NumberFilter)
  @IsOptional()
  @ValidateNested()
  id?: NumberFilter | undefined;

  @Field(() => NumberFilter, { nullable: true })
  @ApiProperty({ type: () => NumberFilter, required: false })
  @Type(() => NumberFilter)
  @IsOptional()
  @ValidateNested()
  quantity?: NumberFilter | undefined;

  @Field(() => NumberFilter, { nullable: true })
  @ApiProperty({ type: () => NumberFilter, required: false })
  @Type(() => NumberFilter)
  @IsOptional()
  @ValidateNested()
  unitPrice?: NumberFilter | undefined;

  @Field(() => NumberFilter, { nullable: true })
  @ApiProperty({ type: () => NumberFilter, required: false })
  @Type(() => NumberFilter)
  @IsOptional()
  @ValidateNested()
  totalAmount?: NumberFilter | undefined;

  @Field(() => String, { nullable: true })
  @ApiProperty({ type: () => String, required: false })
  @IsOptional()
  productId?: string | string[] | StringFilter | undefined;

  @Field(() => ProductWhere, { nullable: true })
  @ApiProperty({ type: () => ProductWhere, required: false })
  @Type(() => ProductWhere)
  @IsOptional()
  @ValidateNested()
  product?: InstanceType<typeof ProductWhere> | undefined;
}

@InputType({ isAbstract: true })
class FindInvoiceDetailOrderBy implements OrderBy<InvoiceDetail> {
  @Field(() => OrderByTypes, { nullable: true })
  @ApiProperty({ enum: OrderByTypes, required: false })
  @IsOptional()
  @IsEnum(OrderByTypes)
  id?: OrderByTypes | undefined;

  @Field(() => OrderByTypes, { nullable: true })
  @ApiProperty({ enum: OrderByTypes, required: false })
  @IsOptional()
  @IsEnum(OrderByTypes)
  quantity?: OrderByTypes | undefined;

  @Field(() => OrderByTypes, { nullable: true })
  @ApiProperty({ enum: OrderByTypes, required: false })
  @IsOptional()
  @IsEnum(OrderByTypes)
  unitPrice?: OrderByTypes | undefined;

  @Field(() => OrderByTypes, { nullable: true })
  @ApiProperty({ enum: OrderByTypes, required: false })
  @IsOptional()
  @IsEnum(OrderByTypes)
  totalAmount?: OrderByTypes | undefined;

  @Field(() => OrderByTypes, { nullable: true })
  @ApiProperty({ enum: OrderByTypes, required: false })
  @IsOptional()
  @IsEnum(OrderByTypes)
  productId?: OrderByTypes | undefined;
}

@ArgsType()
export class FindInvoiceDetailArgs extends FindArgsFrom<InvoiceDetail>({
  whereType: FindInvoiceDetailWhere,
  orderByType: FindInvoiceDetailOrderBy,
}) {}