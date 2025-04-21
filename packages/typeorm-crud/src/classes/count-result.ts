import { ApiProperty } from "@nestjs/swagger";
import { ICountResult } from "../interfaces";

export class CountResult implements ICountResult {

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