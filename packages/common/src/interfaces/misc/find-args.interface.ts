import { Where, OrderBy } from "../../types/find-args.type";
import { PaginationRequest } from "./pagination-request.interface";

export interface FindArgs<T> {
  pagination?: PaginationRequest;

  where?: Where<T>;

  orderBy?: OrderBy<T> | OrderBy<T>[];
}
