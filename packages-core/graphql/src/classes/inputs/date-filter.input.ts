import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDate,
  IsOptional,
} from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';
import { DateFilter as CommonDateFilter } from '@solid-nestjs/common';

@InputType()
export class DateFilter implements CommonDateFilter {
  @Field(() => Date, { nullable: true })
  @IsDate()
  @IsOptional()
  _eq?: Date;

  @Field(() => Date, { nullable: true })
  @IsDate()
  @IsOptional()
  _neq?: Date;

  @Field(() => Date, { nullable: true })
  @IsDate()
  @IsOptional()
  _gt?: Date;

  @Field(() => Date, { nullable: true })
  @IsDate()
  @IsOptional()
  _gte?: Date;

  @Field(() => Date, { nullable: true })
  @IsDate()
  @IsOptional()
  _lt?: Date;

  @Field(() => Date, { nullable: true })
  @IsDate()
  @IsOptional()
  _lte?: Date;

  @Field(() => [Date], { nullable: true })
  @IsArray()
  @IsOptional()
  _in?: Date[];

  @Field(() => [Date], { nullable: true })
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsOptional()
  _between?: Date[];

  @Field(() => [Date], { nullable: true })
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsOptional()
  _notbetween?: Date[];
}
