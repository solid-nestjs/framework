import { ApiProperty } from "@nestjs/swagger";
import { CountResultInterface } from "../interfaces";

export class CountResult implements CountResultInterface {

  @ApiProperty()
  totalRecords: number;

  @ApiProperty()
  recordsInCurrentPage: number;

  @ApiProperty()
  pageSize?: number;

  @ApiProperty()
  currentPage: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  hasNextPage: boolean;

  @ApiProperty()
  hasPreviousPage: boolean;
}