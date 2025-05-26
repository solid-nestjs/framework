export interface PaginationResultInterface{
    total: number;
    count: number;
    limit?: number;
    page: number;
    pageCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}