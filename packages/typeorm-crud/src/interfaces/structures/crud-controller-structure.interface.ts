import { DeepPartial } from "typeorm";
import { Constructable } from "../../types";
import { CrudServiceInterface } from "../services";
import { Context, IdTypeFrom, Entity, FindArgsInterface } from "../misc";
import { CrudServiceStructure } from "./crud-service-structure.interface";
import { DataControllerClassStructure, DataControllerStructure, MethodStructure } from "./data-controller-structure.interface";


export interface CrudControllerClassStructure<IdType> extends DataControllerClassStructure<IdType> {
    create?:MethodStructure|boolean,
    update?:MethodStructure|boolean,
    remove?:MethodStructure|boolean,
    hardRemove?:MethodStructure|boolean,
}

export interface CrudControllerStructure<
    IdType extends IdTypeFrom<EntityType>,
    EntityType extends Entity<unknown>,
    CreateInputType extends DeepPartial<EntityType>,
    UpdateInputType extends DeepPartial<EntityType>,
    ServiceType extends CrudServiceInterface<IdType,EntityType,CreateInputType,UpdateInputType,FindArgsType,ContextType>,
    FindArgsType extends FindArgsInterface,
    ContextType extends Context = Context,
    > extends 
        CrudServiceStructure<IdType,EntityType,CreateInputType,UpdateInputType,FindArgsType,ContextType>, 
        CrudControllerClassStructure<IdType>,
        DataControllerStructure<IdType,EntityType,ServiceType,FindArgsType,ContextType>
    {
        serviceType:Constructable<ServiceType>
    }

export function CrudControllerStructure<
    IdType extends IdTypeFrom<EntityType>,
    EntityType extends Entity<unknown>,
    CreateInputType extends DeepPartial<EntityType>,
    UpdateInputType extends DeepPartial<EntityType>,
    ServiceType extends CrudServiceInterface<IdType,EntityType,CreateInputType,UpdateInputType,FindArgsType,ContextType>,
    FindArgsType extends FindArgsInterface,
    ContextType extends Context,
    >(input:CrudControllerStructure<IdType,EntityType,CreateInputType,UpdateInputType,ServiceType,FindArgsType,ContextType>):CrudControllerStructure<IdType,EntityType,CreateInputType,UpdateInputType,ServiceType,FindArgsType,ContextType>
    {
        return input;
    }