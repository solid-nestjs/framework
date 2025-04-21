import { IPagination } from "./pagination.interface";

export interface IFindArgs {
  pagination?: IPagination;

  where?: any;

  orderBy?: any[];
}
