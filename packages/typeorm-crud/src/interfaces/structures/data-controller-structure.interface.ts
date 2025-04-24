import { HttpStatus } from "@nestjs/common";
import { Constructable } from "../../types";
import { Context, IdTypeFrom, Entity, FindArgsInterface } from "../misc";
import { DataServiceInterface } from "../services";
import { DataServiceStructure } from "./data-service-structure.interface";
import { EntityManagerStructure, fillEntityId, IdStructure } from "./entity-manager-structure.interface";


export interface MethodStructure {
    name:string;
    title?:string;
    description?:string;
    route?:string;
    operationId?:string;
    successCode?:HttpStatus;
    successCodes?:HttpStatus[];
    errorCodes?:HttpStatus[];
    decorators?:(() => MethodDecorator)[];
}

export interface ParameterDecorators
{
    currentContext:() => ParameterDecorator;
}

export interface DataControllerClassStructure<
                            IdType extends IdTypeFrom<EntityType>,
                            EntityType extends Entity<unknown>,
                        > extends EntityManagerStructure<IdType,EntityType>{    
    findAll?:MethodStructure|boolean,
    findOne?:MethodStructure|boolean,
    count?:MethodStructure|boolean,
    route?:string;
    parameterDecorators?:ParameterDecorators,
    classDecorators?:(() => ClassDecorator)[],
}

export interface DataControllerStructure<
    IdType extends IdTypeFrom<EntityType>,
    EntityType extends Entity<unknown>,
    ServiceType extends DataServiceInterface<IdType,EntityType,FindArgsType,ContextType>,
    FindArgsType extends FindArgsInterface,
    ContextType extends Context,
    > extends 
        DataServiceStructure<IdType,EntityType,FindArgsType,ContextType>, 
        DataControllerClassStructure<IdType,EntityType>
    {
        serviceType:Constructable<ServiceType>
    }

export function DataControllerStructure<
    IdType extends IdTypeFrom<EntityType>,
    EntityType extends Entity<unknown>,
    ServiceType extends DataServiceInterface<IdType,EntityType,FindArgsType,ContextType>,
    FindArgsType extends FindArgsInterface,
    ContextType extends Context,
    >(input:DataControllerStructure<IdType,EntityType,ServiceType,FindArgsType,ContextType>):DataControllerStructure<IdType,EntityType,ServiceType,FindArgsType,ContextType>
    {
        fillEntityId(input);

        return input;
    }