export interface CountResultInterface{
    totalRecords: number;
    recordsInCurrentPage: number;
    pageSize?: number;
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}