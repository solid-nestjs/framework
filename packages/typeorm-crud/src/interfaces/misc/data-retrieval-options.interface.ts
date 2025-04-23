export interface Relation {
    property:string;
    alias?:string;
}

export interface LockMode
{
    lockMode: "pessimistic_read" | "pessimistic_write" | "dirty_read" | "pessimistic_partial_write" | "pessimistic_write_or_fail" | "for_no_key_update" | "for_key_share", 
    lockVersion?: undefined, 
    lockTables?: string[],
}

export interface LockModeOptimistic
{
    lockMode: "optimistic", 
    lockVersion: number | Date
}

export interface DataRetrievalOptions{
    mainAlias?: string;
    relations?: Relation[];
    lockMode?: LockMode | LockModeOptimistic;
}