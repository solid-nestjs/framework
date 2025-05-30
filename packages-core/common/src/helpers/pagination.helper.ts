import { PaginationRequest } from '../interfaces';

export function getPaginationArgs(pagination: PaginationRequest): {
  skip: number;
  take: number;
} {
  const { skip, take, page, limit: pageSize } = pagination;

  return {
    skip: skip || ((page ?? 1) - 1) * (pageSize ?? 0),
    take: take || (pageSize ?? 0),
  };
}
