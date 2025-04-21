export interface ICountResult{
    totalRecords: number;
    recordsInCurrentPage: number;
    pageSize?: number;
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}