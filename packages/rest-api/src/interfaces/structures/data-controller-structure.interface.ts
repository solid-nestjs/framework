import { HttpStatus } from "@nestjs/common";
import { Constructable } from "../../types";
import { Context, IdTypeFrom, Entity, FindArgsInterface } from "../misc";
import { DataServiceInterface } from "../services";
import { DataServiceStructure } from "./data-service-structure.interface";
import { fillEntityId } from "./entity-provider-structure.interface";


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
                                        ServiceType extends DataServiceInterface<IdType,EntityType,ContextType>,
                                        FindArgsType extends FindArgsInterface<EntityType>,
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
    ServiceType extends DataServiceInterface<IdType,EntityType,ContextType>,
    FindArgsType extends FindArgsInterface<EntityType>,
    ContextType extends Context,
    > extends 
        DataServiceStructure<IdType,EntityType,ContextType>
    {
        serviceType:Constructable<ServiceType>,
        findArgsType?:Constructable<FindArgsType>
        operations?:DataControllerOperations<IdType,EntityType,ServiceType,FindArgsType,ContextType>,
        route?:string;
        parameterDecorators?:ParameterDecorators,
        classDecorators?:(() => ClassDecorator)[],
    }

export function DataControllerStructure<
    IdType extends IdTypeFrom<EntityType>,
    EntityType extends Entity<unknown>,
    ServiceType extends DataServiceInterface<IdType,EntityType,ContextType>,
    FindArgsType extends FindArgsInterface<EntityType>,
    ContextType extends Context,
    >(input:DataControllerStructure<IdType,EntityType,ServiceType,FindArgsType,ContextType>):DataControllerStructure<IdType,EntityType,ServiceType,FindArgsType,ContextType>
    {
        fillEntityId(input);

        return input;
    }