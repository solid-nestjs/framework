import { DeepPartial } from "typeorm";
import { Constructable } from "../../types";
import { ICrudService } from "../services";
import { IContext, IdTypeFrom, IEntity, IFindArgs } from "../misc";
import { ICrudServiceStructure } from "./crud-service-structure.interface";
import { IDataControllerClassStructure, IDataControllerStructure, IMethodStructure } from "./data-controller-structure.interface";


export interface ICrudControllerClassStructure<PrimaryKeyType> extends IDataControllerClassStructure<PrimaryKeyType> {
    create?:IMethodStructure,
    update?:IMethodStructure,
    remove?:IMethodStructure,
    hardRemove?:IMethodStructure,
}

export interface ICrudControllerStructure<
    PrimaryKeyType extends IdTypeFrom<EntityType>,
    EntityType extends IEntity<unknown>,
    CreateInputType extends DeepPartial<EntityType>,
    UpdateInputType extends DeepPartial<EntityType>,
    ServiceType extends ICrudService<PrimaryKeyType,EntityType,CreateInputType,UpdateInputType,FindArgsType,ContextType>,
    FindArgsType extends IFindArgs,
    ContextType extends IContext = IContext,
    > extends 
        ICrudServiceStructure<PrimaryKeyType,EntityType,CreateInputType,UpdateInputType,FindArgsType,ContextType>, 
        ICrudControllerClassStructure<PrimaryKeyType>,
        IDataControllerStructure<PrimaryKeyType,EntityType,ServiceType,FindArgsType,ContextType>
    {
        serviceType:Constructable<ServiceType>
    }

export function CrudControllerStructure<
    PrimaryKeyType extends IdTypeFrom<EntityType>,
    EntityType extends IEntity<unknown>,
    CreateInputType extends DeepPartial<EntityType>,
    UpdateInputType extends DeepPartial<EntityType>,
    ServiceType extends ICrudService<PrimaryKeyType,EntityType,CreateInputType,UpdateInputType,FindArgsType,ContextType>,
    FindArgsType extends IFindArgs,
    ContextType extends IContext,
    >(input:ICrudControllerStructure<PrimaryKeyType,EntityType,CreateInputType,UpdateInputType,ServiceType,FindArgsType,ContextType>):ICrudControllerStructure<PrimaryKeyType,EntityType,CreateInputType,UpdateInputType,ServiceType,FindArgsType,ContextType>
    {
        return input;
    }