import { FindOptionsRelations } from "typeorm";
import { Constructable } from "../../types";
import { Context, IdTypeFrom, Entity, FindArgsInterface, Relation, LockModeOptimistic, LockModeNotOptimistic } from "../misc";
import { EntityProviderStructure, fillEntityId } from "./entity-provider-structure.interface";

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
    FindArgsType extends FindArgsInterface<EntityType>,
    ContextType extends Context = Context
    > extends EntityProviderStructure<IdType,EntityType> {
        findArgsType?: Constructable<FindArgsType>,
        contextType?: Constructable<ContextType>,
        relationsConfig?:RelationsConfig<EntityType>,
        queryLocksConfig?:QueryLocksConfig<EntityType>,
    }

export function DataServiceStructure<
                        IdType extends IdTypeFrom<EntityType>,
                        EntityType extends Entity<unknown>,
                        FindArgsType extends FindArgsInterface<EntityType>,
                        ContextType extends Context = Context,
                        >(input:DataServiceStructure<IdType,EntityType,FindArgsType,ContextType>):DataServiceStructure<IdType,EntityType,FindArgsType,ContextType>
                        {
                            fillEntityId(input);
                            
                            return input;
                        }