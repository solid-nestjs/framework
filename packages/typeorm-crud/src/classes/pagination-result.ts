import { ApiProperty } from "@nestjs/swagger";
import { PaginationResultInterface } from "../interfaces";

export class PaginationResult implements PaginationResultInterface {

  @ApiProperty()
  total: number;

  @ApiProperty()
  count: number;

  @ApiProperty()
  limit?: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  pageCount: number;

  @ApiProperty()
  hasNextPage: boolean;

  @ApiProperty()
  hasPreviousPage: boolean;
}