import { ApiProperty } from '@nestjs/swagger';
import {
  GroupedPaginationResult as CommonGroupedPaginationResult,
  GroupResult,
} from '@solid-nestjs/common';
import { PaginationResult } from './pagination-result';

/**
 * Represents a group result for REST API responses.
 * Contains the grouped key and aggregated values as JSON strings for easy REST consumption.
 */
export class GroupResultRest {
  @ApiProperty({
    description: 'The group key as a JSON string',
    example: '{"category": "Electronics"}',
  })
  key!: string;

  @ApiProperty({
    description: 'The aggregated values as a JSON string',
    example: '{"count": 5, "avgPrice": 299.99}',
  })
  aggregates!: string;
}

/**
 * Represents the result of a grouped query with pagination for REST API.
 *
 * @implements {CommonGroupedPaginationResult}
 *
 * @property {GroupResultRest[]} groups - Array of grouped results with keys and aggregates as JSON strings.
 * @property {PaginationResult} pagination - Pagination metadata for the grouped results.
 */
export class GroupedPaginationResult
  implements CommonGroupedPaginationResult<any>
{
  @ApiProperty({
    type: [GroupResultRest],
    description: 'Array of grouped results',
  })
  groups!: GroupResultRest[];

  @ApiProperty({
    type: PaginationResult,
    description: 'Pagination metadata',
  })
  pagination!: PaginationResult;
}
