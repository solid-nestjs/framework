import { DeepPartial } from "typeorm";
import { Constructable } from "../../types";
import { IContext, IdTypeFrom, IEntity, IFindArgs } from "../misc";
import { IDataServiceStructure } from "./data-service-structure.interface";

export interface ICrudServiceStructure<
    PrimaryKeyType extends IdTypeFrom<EntityType>,
    EntityType extends IEntity<unknown>,
    CreateInputType extends DeepPartial<EntityType>,
    UpdateInputType extends DeepPartial<EntityType>,
    FindArgsType extends IFindArgs,
    ContextType extends IContext
    > extends IDataServiceStructure<PrimaryKeyType,EntityType,FindArgsType,ContextType> {

        createInputType:Constructable<CreateInputType>,
        updateInputType:Constructable<UpdateInputType>,
    }


export function CrudServiceStructure<
                        PrimaryKeyType extends IdTypeFrom<EntityType>,
                        EntityType extends IEntity<unknown>,
                        CreateInputType extends DeepPartial<EntityType>,
                        UpdateInputType extends DeepPartial<EntityType>,
                        FindArgsType extends IFindArgs,
                        ContextType extends IContext,
                        >(input:ICrudServiceStructure<PrimaryKeyType,EntityType,CreateInputType,UpdateInputType,FindArgsType,ContextType>):ICrudServiceStructure<PrimaryKeyType,EntityType,CreateInputType,UpdateInputType,FindArgsType,ContextType>
                        {
                            return input;
                        }