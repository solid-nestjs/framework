import { Context, IdTypeFrom, Entity, FindArgs, CrudService, fillEntityId, DeepPartial, Constructable } from "@solid-nestjs/common";
import { DataControllerOperations, DataControllerStructure, OperationStructure } from "./data-controller-structure.interface";


export interface CrudControllerOperations<
                                        IdType extends IdTypeFrom<EntityType>,
                                        EntityType extends Entity<unknown>,
                                        CreateInputType extends DeepPartial<EntityType>,
                                        UpdateInputType extends DeepPartial<EntityType>,
                                        ServiceType extends CrudService<IdType,EntityType,CreateInputType,UpdateInputType,ContextType>,
                                        FindArgsType extends FindArgs<EntityType>,
                                        ContextType extends Context = Context,
                                    > extends
                                    DataControllerOperations<IdType,EntityType,ServiceType,FindArgsType,ContextType>
{
    create?:OperationStructure|boolean,
    update?:OperationStructure|boolean,
    remove?:OperationStructure|boolean,
    hardRemove?:OperationStructure|boolean,
}

export interface CrudControllerStructure<
    IdType extends IdTypeFrom<EntityType>,
    EntityType extends Entity<unknown>,
    CreateInputType extends DeepPartial<EntityType>,
    UpdateInputType extends DeepPartial<EntityType>,
    ServiceType extends CrudService<IdType,EntityType,CreateInputType,UpdateInputType,ContextType>,
    FindArgsType extends FindArgs<EntityType>,
    ContextType extends Context = Context,
    > extends 
        DataControllerStructure<IdType,EntityType,ServiceType,FindArgsType,ContextType>
    {
        createInputType:Constructable<CreateInputType>, 
        updateInputType:Constructable<UpdateInputType>,
        operations?:CrudControllerOperations<IdType,EntityType,CreateInputType,UpdateInputType,ServiceType,FindArgsType,ContextType>,
    }

export function CrudControllerStructure<
    IdType extends IdTypeFrom<EntityType>,
    EntityType extends Entity<unknown>,
    CreateInputType extends DeepPartial<EntityType>,
    UpdateInputType extends DeepPartial<EntityType>,
    ServiceType extends CrudService<IdType,EntityType,CreateInputType,UpdateInputType,ContextType>,
    FindArgsType extends FindArgs<EntityType>,
    ContextType extends Context,
    >(input:CrudControllerStructure<IdType,EntityType,CreateInputType,UpdateInputType,ServiceType,FindArgsType,ContextType>):CrudControllerStructure<IdType,EntityType,CreateInputType,UpdateInputType,ServiceType,FindArgsType,ContextType>
    {
        fillEntityId(input);

        return input;
    }