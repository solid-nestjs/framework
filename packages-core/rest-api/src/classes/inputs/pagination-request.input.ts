import { IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationRequest as CommonPaginationRequest } from '@solid-nestjs/common';

export class PaginationRequest implements CommonPaginationRequest {
  @ApiProperty({ required: false, type: Number, example: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  skip?: number;

  @ApiProperty({ required: false, type: Number, example: 10 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  take?: number;

  @ApiProperty({ required: false, type: Number, example: 1 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiProperty({ required: false, type: Number, example: 10 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  limit?: number;
}
