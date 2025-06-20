import { IsOptional, ValidateNested } from 'class-validator';
import { ArgsType, Field } from '@nestjs/graphql';
import { FindArgs } from '@solid-nestjs/common';
import { PaginationRequest } from '../inputs';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

@ArgsType()
export class DefaultArgs<EntityType> implements FindArgs<EntityType> {
  @ApiProperty({ type: () => PaginationRequest, required: false })
  @Field(() => PaginationRequest, { nullable: true })
  @Type(() => PaginationRequest)
  @IsOptional()
  @ValidateNested()
  pagination?: PaginationRequest;
}
