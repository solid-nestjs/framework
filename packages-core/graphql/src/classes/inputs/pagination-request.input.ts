import { IsNumber, IsOptional, Min } from 'class-validator';
import { Field, InputType, Int } from '@nestjs/graphql';
import { PaginationRequest as CommonPaginationRequest } from '@solid-nestjs/common';

@InputType()
export class PaginationRequest implements CommonPaginationRequest {
  @Field(() => Int, { nullable: true })
  @IsNumber()
  @Min(0)
  @IsOptional()
  skip?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @Min(0)
  @IsOptional()
  take?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @Min(0)
  @IsOptional()
  limit?: number;
}
