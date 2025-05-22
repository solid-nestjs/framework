import { DeepPartial } from "typeorm";
import { Constructable } from "../../types";
import { CrudServiceInterface } from "../services";
import { Context, IdTypeFrom, Entity, FindArgsInterface } from "../misc";
import { CrudServiceStructure } from "./crud-service-structure.interface";
import { DataControllerOperations, DataControllerStructure, OperationStructure } from "./data-controller-structure.interface";
import { fillEntityId } from "./entity-provider-structure.interface";


export interface CrudControllerOperations<
                                        IdType extends IdTypeFrom<EntityType>,
                                        EntityType extends Entity<unknown>,
                                        CreateInputType extends DeepPartial<EntityType>,
                                        UpdateInputType extends DeepPartial<EntityType>,
                                        ServiceType extends CrudServiceInterface<IdType,EntityType,CreateInputType,UpdateInputType,FindArgsType,ContextType>,
                                        FindArgsType extends FindArgsInterface<EntityType>,
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
    ServiceType extends CrudServiceInterface<IdType,EntityType,CreateInputType,UpdateInputType,FindArgsType,ContextType>,
    FindArgsType extends FindArgsInterface<EntityType>,
    ContextType extends Context = Context,
    > extends 
        CrudServiceStructure<IdType,EntityType,CreateInputType,UpdateInputType,FindArgsType,ContextType>, 
        DataControllerStructure<IdType,EntityType,ServiceType,FindArgsType,ContextType>
    {
        serviceType:Constructable<ServiceType>,
        operations?:CrudControllerOperations<IdType,EntityType,CreateInputType,UpdateInputType,ServiceType,FindArgsType,ContextType>,
    }

export function CrudControllerStructure<
    IdType extends IdTypeFrom<EntityType>,
    EntityType extends Entity<unknown>,
    CreateInputType extends DeepPartial<EntityType>,
    UpdateInputType extends DeepPartial<EntityType>,
    ServiceType extends CrudServiceInterface<IdType,EntityType,CreateInputType,UpdateInputType,FindArgsType,ContextType>,
    FindArgsType extends FindArgsInterface<EntityType>,
    ContextType extends Context,
    >(input:CrudControllerStructure<IdType,EntityType,CreateInputType,UpdateInputType,ServiceType,FindArgsType,ContextType>):CrudControllerStructure<IdType,EntityType,CreateInputType,UpdateInputType,ServiceType,FindArgsType,ContextType>
    {
        fillEntityId(input);

        return input;
    }