import { IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ArgsType, Field, InputType } from '@nestjs/graphql';
import {
  FindArgsFrom,
  getOrderByClass,
  getWhereClass,
  OrderBy,
  OrderByTypes,
  StringFilter,
  Where,
} from '@solid-nestjs/typeorm-hybrid-crud';
import { Client } from '../../entities/client.entity';

@InputType({ isAbstract: true })
class FindClientWhere implements Where<Client> {
  @ApiProperty({ description: 'Filter by client ID', required: false })
  @Field(() => StringFilter, {
    nullable: true,
    description: 'Filter by client ID',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => StringFilter)
  id?: StringFilter;

  @ApiProperty({ description: 'Filter by first name', required: false })
  @Field(() => StringFilter, {
    nullable: true,
    description: 'Filter by first name',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => StringFilter)
  firstName?: StringFilter;

  @ApiProperty({ description: 'Filter by last name', required: false })
  @Field(() => StringFilter, {
    nullable: true,
    description: 'Filter by last name',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => StringFilter)
  lastName?: StringFilter;

  @ApiProperty({ description: 'Filter by email', required: false })
  @Field(() => StringFilter, { nullable: true, description: 'Filter by email' })
  @IsOptional()
  @ValidateNested()
  @Type(() => StringFilter)
  email?: StringFilter;

  @ApiProperty({ description: 'Filter by phone', required: false })
  @Field(() => StringFilter, { nullable: true, description: 'Filter by phone' })
  @IsOptional()
  @ValidateNested()
  @Type(() => StringFilter)
  phone?: StringFilter;

  @ApiProperty({ description: 'Filter by city', required: false })
  @Field(() => StringFilter, { nullable: true, description: 'Filter by city' })
  @IsOptional()
  @ValidateNested()
  @Type(() => StringFilter)
  city?: StringFilter;

  @ApiProperty({ description: 'Filter by country', required: false })
  @Field(() => StringFilter, {
    nullable: true,
    description: 'Filter by country',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => StringFilter)
  country?: StringFilter;
}

enum ClientOrderByField {
  id = 'id',
  firstName = 'firstName',
  lastName = 'lastName',
  email = 'email',
  phone = 'phone',
  city = 'city',
  country = 'country',
}

@InputType({ isAbstract: true })
class FindClientOrderBy implements OrderBy<Client> {
  @ApiProperty({
    description: 'Order by client ID',
    required: false,
    enum: OrderByTypes,
  })
  @Field(() => OrderByTypes, {
    nullable: true,
    description: 'Order by client ID',
  })
  @IsOptional()
  @IsEnum(OrderByTypes)
  id?: OrderByTypes;

  @ApiProperty({
    description: 'Order by first name',
    required: false,
    enum: OrderByTypes,
  })
  @Field(() => OrderByTypes, {
    nullable: true,
    description: 'Order by first name',
  })
  @IsOptional()
  @IsEnum(OrderByTypes)
  firstName?: OrderByTypes;

  @ApiProperty({
    description: 'Order by last name',
    required: false,
    enum: OrderByTypes,
  })
  @Field(() => OrderByTypes, {
    nullable: true,
    description: 'Order by last name',
  })
  @IsOptional()
  @IsEnum(OrderByTypes)
  lastName?: OrderByTypes;

  @ApiProperty({
    description: 'Order by email',
    required: false,
    enum: OrderByTypes,
  })
  @Field(() => OrderByTypes, { nullable: true, description: 'Order by email' })
  @IsOptional()
  @IsEnum(OrderByTypes)
  email?: OrderByTypes;

  @ApiProperty({
    description: 'Order by phone',
    required: false,
    enum: OrderByTypes,
  })
  @Field(() => OrderByTypes, { nullable: true, description: 'Order by phone' })
  @IsOptional()
  @IsEnum(OrderByTypes)
  phone?: OrderByTypes;

  @ApiProperty({
    description: 'Order by city',
    required: false,
    enum: OrderByTypes,
  })
  @Field(() => OrderByTypes, { nullable: true, description: 'Order by city' })
  @IsOptional()
  @IsEnum(OrderByTypes)
  city?: OrderByTypes;

  @ApiProperty({
    description: 'Order by country',
    required: false,
    enum: OrderByTypes,
  })
  @Field(() => OrderByTypes, {
    nullable: true,
    description: 'Order by country',
  })
  @IsOptional()
  @IsEnum(OrderByTypes)
  country?: OrderByTypes;
}

@ArgsType()
export class FindClientArgs extends FindArgsFrom({
  whereType: FindClientWhere,
  orderByType: FindClientOrderBy,
}) {}
