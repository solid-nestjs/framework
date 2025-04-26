import { HttpStatus } from "@nestjs/common";
import { Constructable } from "../../types";
import { Context, IdTypeFrom, Entity, FindArgsInterface } from "../misc";
import { DataServiceInterface } from "../services";
import { DataServiceStructure } from "./data-service-structure.interface";
import { fillEntityId } from "./entity-manager-structure.interface";


export interface OperationStructure {
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
    context:() => ParameterDecorator;
}

export interface DataControllerOperations<
                                        IdType extends IdTypeFrom<EntityType>,
                                        EntityType extends Entity<unknown>,
                                        ServiceType extends DataServiceInterface<IdType,EntityType,FindArgsType,ContextType>,
                                        FindArgsType extends FindArgsInterface,
                                        ContextType extends Context,
                                    >
{
    findAll?:OperationStructure|boolean,
    findAllPaginated?:OperationStructure|boolean,
    pagination?:OperationStructure|boolean,
    findOne?:OperationStructure|boolean,
}

export interface DataControllerStructure<
    IdType extends IdTypeFrom<EntityType>,
    EntityType extends Entity<unknown>,
    ServiceType extends DataServiceInterface<IdType,EntityType,FindArgsType,ContextType>,
    FindArgsType extends FindArgsInterface,
    ContextType extends Context,
    > extends 
        DataServiceStructure<IdType,EntityType,FindArgsType,ContextType>
    {
        serviceType:Constructable<ServiceType>,
        operations?:DataControllerOperations<IdType,EntityType,ServiceType,FindArgsType,ContextType>,
        route?:string;
        parameterDecorators?:ParameterDecorators,
        classDecorators?:(() => ClassDecorator)[],
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