import { Where, OrderBy } from "../../types/find-args.type";
import { PaginationInterface } from "./pagination.interface";

export interface FindArgsInterface<T> {
  pagination?: PaginationInterface;

  where?: Where<T>;

  orderBy?: OrderBy<T> | OrderBy<T>[];
}
