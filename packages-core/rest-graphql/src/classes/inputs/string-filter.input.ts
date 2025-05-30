import { IsArray, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Field, InputType } from '@nestjs/graphql';
import { StringFilter as CommonStringFilter } from '@solid-nestjs/common';

@InputType()
export class StringFilter implements CommonStringFilter {
  @ApiProperty({ required: false, type: String })
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  _eq?: string;

  @ApiProperty({ required: false, type: String })
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  _neq?: string;

  @ApiProperty({ required: false, type: [String] })
  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  _in?: string[];

  @ApiProperty({ required: false, type: String })
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  _startswith?: string;

  @ApiProperty({ required: false, type: String })
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  _notstartswith?: string;

  @ApiProperty({ required: false, type: String })
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  _endswith?: string;

  @ApiProperty({ required: false, type: String })
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  _notendswith?: string;

  @ApiProperty({ required: false, type: String })
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  _contains?: string;

  @ApiProperty({ required: false, type: String })
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  _notcontains?: string;

  @ApiProperty({ required: false, type: String })
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  _like?: string;

  @ApiProperty({ required: false, type: String })
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  _notlike?: string;
}
