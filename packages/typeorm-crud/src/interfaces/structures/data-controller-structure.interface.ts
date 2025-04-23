import { HttpStatus, PipeTransform, Type } from "@nestjs/common";
import { Constructable } from "../../types";
import { Context, IdTypeFrom, Entity, FindArgsInterface } from "../misc";
import { DataServiceInterface } from "../services";
import { DataServiceStructure } from "./data-service-structure.interface";


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

export interface IdStructure<IdType>
{
    type:Constructable<IdType>,
    pipeTransforms?:Type<PipeTransform>[]
}

export interface DataControllerClassStructure<IdType> {    
    findAll?:MethodStructure|boolean,
    findOne?:MethodStructure|boolean,
    count?:MethodStructure|boolean,
    route?:string;
    parameterDecorators?:ParameterDecorators,
    classDecorators?:(() => ClassDecorator)[],
    idStructure?:IdStructure<IdType>,
}

export interface DataControllerStructure<
    IdType extends IdTypeFrom<EntityType>,
    EntityType extends Entity<unknown>,
    ServiceType extends DataServiceInterface<IdType,EntityType,FindArgsType,ContextType>,
    FindArgsType extends FindArgsInterface,
    ContextType extends Context,
    > extends 
        DataServiceStructure<IdType,EntityType,FindArgsType,ContextType>, 
        DataControllerClassStructure<IdType>
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
        return input;
    }