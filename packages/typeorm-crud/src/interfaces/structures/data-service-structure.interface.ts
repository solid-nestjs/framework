import { Context } from "../misc/context.interface";
import { Constructable } from "../../types";
import { IdTypeFrom, Entity, FindArgsInterface } from "../misc";
import { DataRetrievalOptions } from "../misc/data-retrieval-options.interface";

export interface DataServiceStructure<
    IdType extends IdTypeFrom<EntityType>,
    EntityType extends Entity<unknown>,
    FindArgsType extends FindArgsInterface,
    ContextType extends Context = Context
    >{
        entityType: Constructable<EntityType>
        findArgsType?: Constructable<FindArgsType>,
        contextType?: Constructable<ContextType>,
        dataRetrievalOptions?:DataRetrievalOptions
    }

export function DataServiceStructure<
                        IdType extends IdTypeFrom<EntityType>,
                        EntityType extends Entity<unknown>,
                        FindArgsType extends FindArgsInterface,
                        ContextType extends Context = Context,
                        >(input:DataServiceStructure<IdType,EntityType,FindArgsType,ContextType>):DataServiceStructure<IdType,EntityType,FindArgsType,ContextType>
                        {
                            return input;
                        }