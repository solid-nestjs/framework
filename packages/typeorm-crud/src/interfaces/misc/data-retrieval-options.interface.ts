import { FindOptionsRelations } from "typeorm";

export interface Relation {
    property:string;
    alias?:string;
}

export interface LockModeNotOptimistic
{
    lockMode: "pessimistic_read" | "pessimistic_write" | "dirty_read" | "pessimistic_partial_write" | "pessimistic_write_or_fail" | "for_no_key_update" | "for_key_share"; 
    lockVersion: undefined;
    lockTables?: string[];
    onLocked?: "nowait" | "skip_locked";
}

export interface LockModeOptimistic
{
    lockMode: "optimistic";
    lockVersion: number | Date;
}

export interface DataRetrievalOptions<EntityType>{
    mainAlias?: string;
    relations?: Relation[] | FindOptionsRelations<EntityType>;
    lockMode?: LockModeOptimistic | LockModeNotOptimistic;
    withDeleted?:boolean;
}