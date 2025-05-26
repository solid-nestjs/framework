import { ApiProperty } from "@nestjs/swagger";
import { PaginationResult as CommonPaginationResult } from "@nestjz/common";

export class PaginationResult implements CommonPaginationResult {

  @ApiProperty()
  total!: number;

  @ApiProperty()
  count!: number;

  @ApiProperty()
  limit?: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  pageCount!: number;

  @ApiProperty()
  hasNextPage!: boolean;

  @ApiProperty()
  hasPreviousPage!: boolean;
}