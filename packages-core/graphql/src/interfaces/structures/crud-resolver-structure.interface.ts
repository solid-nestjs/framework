import { Context, IdTypeFrom, Entity, FindArgs, CrudService, fillEntityId, DeepPartial, Constructable } from "@solid-nestjs/common";
import { DataResolverOperations, DataResolverStructure, OperationStructure } from "./data-resolver-structure.interface";


export interface CrudResolverOperations<
                                        IdType extends IdTypeFrom<EntityType>,
                                        EntityType extends Entity<unknown>,
                                        CreateInputType extends DeepPartial<EntityType>,
                                        UpdateInputType extends DeepPartial<EntityType>,
                                        ServiceType extends CrudService<IdType,EntityType,CreateInputType,UpdateInputType,ContextType>,
                                        FindArgsType extends FindArgs<EntityType>,
                                        ContextType extends Context = Context,
                                    > extends
                                    DataResolverOperations<IdType,EntityType,ServiceType,FindArgsType,ContextType>
{
    create?:OperationStructure|boolean,
    update?:OperationStructure|boolean,
    remove?:OperationStructure|boolean,
    hardRemove?:OperationStructure|boolean,
}

export interface CrudResolverStructure<
    IdType extends IdTypeFrom<EntityType>,
    EntityType extends Entity<unknown>,
    CreateInputType extends DeepPartial<EntityType>,
    UpdateInputType extends DeepPartial<EntityType>,
    ServiceType extends CrudService<IdType,EntityType,CreateInputType,UpdateInputType,ContextType>,
    FindArgsType extends FindArgs<EntityType>,
    ContextType extends Context = Context,
    > extends 
        DataResolverStructure<IdType,EntityType,ServiceType,FindArgsType,ContextType>
    {
        createInputType:Constructable<CreateInputType>, 
        updateInputType:Constructable<UpdateInputType>,
        operations?:CrudResolverOperations<IdType,EntityType,CreateInputType,UpdateInputType,ServiceType,FindArgsType,ContextType>,
    }

/**
 * Initializes and returns a `CrudResolverStructure` object with the provided input.
 *
 * This generic function ensures that the entity ID is filled in the input structure before returning it.
 * It is intended to be used as a utility for setting up CRUD Resolver structures with strong typing.
 *
 * @param input - The CRUD Resolver structure to initialize.
 * @returns The initialized CRUD Resolver structure with entity ID filled.
 */
export function CrudResolverStructure<
    IdType extends IdTypeFrom<EntityType>,
    EntityType extends Entity<unknown>,
    CreateInputType extends DeepPartial<EntityType>,
    UpdateInputType extends DeepPartial<EntityType>,
    ServiceType extends CrudService<IdType,EntityType,CreateInputType,UpdateInputType,ContextType>,
    FindArgsType extends FindArgs<EntityType>,
    ContextType extends Context,
    >(input:CrudResolverStructure<IdType,EntityType,CreateInputType,UpdateInputType,ServiceType,FindArgsType,ContextType>):CrudResolverStructure<IdType,EntityType,CreateInputType,UpdateInputType,ServiceType,FindArgsType,ContextType>
    {
        fillEntityId(input);

        return input;
    }