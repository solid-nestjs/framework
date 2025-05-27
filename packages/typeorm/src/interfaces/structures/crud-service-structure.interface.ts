import { DeepPartial } from "typeorm";
import { IsolationLevel } from "typeorm/driver/types/IsolationLevel";
import { Constructable, Entity, fillEntityId, FindArgs, IdTypeFrom } from "@nestjz/common";
import { Context } from "../misc";
import { DataServiceFunctions, DataServiceStructure } from "./data-service-structure.interface";


export interface CrudServiceFunctionStructure<EntityType>  {
    transactional?:boolean,
    isolationLevel?:IsolationLevel
    decorators?:(() => MethodDecorator)[];
}

export interface CrudServiceFunctions<EntityType> extends DataServiceFunctions<EntityType> {
    create?:CrudServiceFunctionStructure<EntityType>,
    update?:CrudServiceFunctionStructure<EntityType>,
    remove?:CrudServiceFunctionStructure<EntityType>,
    hardRemove?:CrudServiceFunctionStructure<EntityType>,
}

export interface CrudServiceStructure<
    IdType extends IdTypeFrom<EntityType>,
    EntityType extends Entity<unknown>,
    CreateInputType extends DeepPartial<EntityType>,
    UpdateInputType extends DeepPartial<EntityType>,
    FindArgsType extends FindArgs<EntityType> = FindArgs<EntityType>,
    ContextType extends Context = Context
    > extends DataServiceStructure<IdType,EntityType,FindArgsType,ContextType> {

        createInputType:Constructable<CreateInputType>,
        updateInputType:Constructable<UpdateInputType>,
        functions?:CrudServiceFunctions<EntityType>,
    }


export function CrudServiceStructure<
                        IdType extends IdTypeFrom<EntityType>,
                        EntityType extends Entity<unknown>,
                        CreateInputType extends DeepPartial<EntityType>,
                        UpdateInputType extends DeepPartial<EntityType>,
                        FindArgsType extends FindArgs<EntityType> = FindArgs<EntityType>,
                        ContextType extends Context = Context,
                        >(input:CrudServiceStructure<IdType,EntityType,CreateInputType,UpdateInputType,FindArgsType,ContextType>):CrudServiceStructure<IdType,EntityType,CreateInputType,UpdateInputType,FindArgsType,ContextType>
                        {
                            fillEntityId(input);

                            return input;
                        }