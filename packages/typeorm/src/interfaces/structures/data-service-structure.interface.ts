import { FindOptionsRelations } from "typeorm";
import { Constructable, Entity, EntityProviderStructure, fillEntityId, IdTypeFrom } from "@nestjz/common";
import { Context, Relation, LockModeOptimistic, LockModeNotOptimistic } from "../misc";

export interface RelationsConfig<EntityType> {
    mainAlias?: string;
    relations?: Relation[] | FindOptionsRelations<EntityType>;
}

export interface QueryLocksConfig<EntityType> {
    findAll?: LockModeOptimistic | LockModeNotOptimistic;
    findOne?: LockModeOptimistic | LockModeNotOptimistic;
}

export interface QueryBuilderConfig<EntityType> {
    relationsConfig?:RelationsConfig<EntityType>,
    queryLocksConfig?:QueryLocksConfig<EntityType>,
}

export interface DataServiceStructure<
    IdType extends IdTypeFrom<EntityType>,
    EntityType extends Entity<unknown>,
    ContextType extends Context = Context
    > extends EntityProviderStructure<IdType,EntityType> {
        contextType?: Constructable<ContextType>,
        relationsConfig?:RelationsConfig<EntityType>,
        queryLocksConfig?:QueryLocksConfig<EntityType>,
    }

export function DataServiceStructure<
                        IdType extends IdTypeFrom<EntityType>,
                        EntityType extends Entity<unknown>,
                        ContextType extends Context = Context,
                        >(input:DataServiceStructure<IdType,EntityType,ContextType>):DataServiceStructure<IdType,EntityType,ContextType>
                        {
                            fillEntityId(input);
                            
                            return input;
                        }