import { IContext } from "../misc/context.interface";
import { Constructable } from "../../types";
import { IdTypeFrom, IEntity, IFindArgs } from "../misc";
import { IDataRetrievalOptions } from "../misc/data-retrieval-options.interface";

export interface IDataServiceStructure<
    PrimaryKeyType extends IdTypeFrom<EntityType>,
    EntityType extends IEntity<unknown>,
    FindArgsType extends IFindArgs,
    ContextType extends IContext = IContext
    >{
        entityType: Constructable<EntityType>
        findArgsType?: Constructable<FindArgsType>,
        contextType?: Constructable<ContextType>,
        dataRetrievalOptions?:IDataRetrievalOptions
    }

export function DataServiceStructure<
                        PrimaryKeyType extends IdTypeFrom<EntityType>,
                        EntityType extends IEntity<unknown>,
                        FindArgsType extends IFindArgs,
                        ContextType extends IContext = IContext,
                        >(input:IDataServiceStructure<PrimaryKeyType,EntityType,FindArgsType,ContextType>):IDataServiceStructure<PrimaryKeyType,EntityType,FindArgsType,ContextType>
                        {
                            return input;
                        }