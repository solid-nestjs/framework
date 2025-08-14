import { Where, OrderBy } from '../../types/find-args.type';
import { PaginationRequest } from './pagination-request.interface';
import { GroupByRequest } from './group-by.interface';

export interface FindArgs<T> {
  pagination?: PaginationRequest;

  where?: Where<T>;

  orderBy?: OrderBy<T> | OrderBy<T>[];

  groupBy?: GroupByRequest<T>;
}
