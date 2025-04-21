import { HttpStatus, PipeTransform, Type } from "@nestjs/common";
import { Constructable } from "../../types";
import { IContext, IdTypeFrom, IEntity, IFindArgs } from "../misc";
import { IDataService } from "../services";
import { IDataServiceStructure } from "./data-service-structure.interface";


export interface IMethodStructure {
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

export interface IParameterDecorators
{
    currentContext:() => ParameterDecorator;
}

export interface PrimaryKeyStructure<PrimaryKeyType>
{
    type:Constructable<PrimaryKeyType>,
    pipeTransforms?:Type<PipeTransform>[]
}

export interface IDataControllerClassStructure<PrimaryKeyType> {
    findAll?:IMethodStructure,
    findOne?:IMethodStructure,
    count?:IMethodStructure,
    route?:string;
    parameterDecorators?:IParameterDecorators,
    classDecorators?:(() => ClassDecorator)[],
    primaryKey?:PrimaryKeyStructure<PrimaryKeyType>,
}

export interface IDataControllerStructure<
    PrimaryKeyType extends IdTypeFrom<EntityType>,
    EntityType extends IEntity<unknown>,
    ServiceType extends IDataService<PrimaryKeyType,EntityType,FindArgsType,ContextType>,
    FindArgsType extends IFindArgs,
    ContextType extends IContext,
    > extends 
        IDataServiceStructure<PrimaryKeyType,EntityType,FindArgsType,ContextType>, 
        IDataControllerClassStructure<PrimaryKeyType>
    {
        serviceType:Constructable<ServiceType>
    }

export function DataControllerStructure<
    PrimaryKeyType extends IdTypeFrom<EntityType>,
    EntityType extends IEntity<unknown>,
    ServiceType extends IDataService<PrimaryKeyType,EntityType,FindArgsType,ContextType>,
    FindArgsType extends IFindArgs,
    ContextType extends IContext,
    >(input:IDataControllerStructure<PrimaryKeyType,EntityType,ServiceType,FindArgsType,ContextType>):IDataControllerStructure<PrimaryKeyType,EntityType,ServiceType,FindArgsType,ContextType>
    {
        return input;
    }