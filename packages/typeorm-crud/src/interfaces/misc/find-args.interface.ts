import { PaginationInterface } from "./pagination.interface";

export interface FindArgsInterface {
  pagination?: PaginationInterface;

  where?: any;

  orderBy?: any[];
}
