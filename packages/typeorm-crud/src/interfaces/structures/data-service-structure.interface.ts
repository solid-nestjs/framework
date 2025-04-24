import { Constructable } from "../../types";
import { Context, DataRetrievalOptions, IdTypeFrom, Entity, FindArgsInterface } from "../misc";
import { EntityManagerStructure, fillEntityId } from "./entity-manager-structure.interface";

export interface DataServiceStructure<
    IdType extends IdTypeFrom<EntityType>,
    EntityType extends Entity<unknown>,
    FindArgsType extends FindArgsInterface,
    ContextType extends Context = Context
    > extends EntityManagerStructure<IdType,EntityType> {
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
                            fillEntityId(input);
                            
                            return input;
                        }