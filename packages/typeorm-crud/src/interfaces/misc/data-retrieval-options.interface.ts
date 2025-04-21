export interface IRelation {
    property:string;
    alias?:string;
}

export interface ILockMode
{
    lockMode: "pessimistic_read" | "pessimistic_write" | "dirty_read" | "pessimistic_partial_write" | "pessimistic_write_or_fail" | "for_no_key_update" | "for_key_share", 
    lockVersion?: undefined, 
    lockTables?: string[],
}

export interface ILockModeOptimistic
{
    lockMode: "optimistic", 
    lockVersion: number | Date
}

export interface IDataRetrievalOptions{
    mainAlias?: string;
    relations?: IRelation[];
    lockMode?: ILockMode | ILockModeOptimistic;
}