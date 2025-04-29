import { DeepPartial } from "typeorm";
import { IsolationLevel } from "typeorm/driver/types/IsolationLevel";
import { Constructable } from "../../types";
import { Context, IdTypeFrom, Entity, FindArgsInterface } from "../misc";
import { DataServiceStructure } from "./data-service-structure.interface";
import { fillEntityId } from "./entity-provider-structure.interface";

export interface TransactionConfig {
    transactional:boolean,
    isolationLevel?:IsolationLevel
}

export interface TransactionsConfig {
    create?:TransactionConfig,
    update?:TransactionConfig,
    remove?:TransactionConfig,
    hardRemove?:TransactionConfig,
}

export interface CrudServiceStructure<
    IdType extends IdTypeFrom<EntityType>,
    EntityType extends Entity<unknown>,
    CreateInputType extends DeepPartial<EntityType>,
    UpdateInputType extends DeepPartial<EntityType>,
    FindArgsType extends FindArgsInterface,
    ContextType extends Context
    > extends DataServiceStructure<IdType,EntityType,FindArgsType,ContextType> {

        createInputType:Constructable<CreateInputType>,
        updateInputType:Constructable<UpdateInputType>,
        transactionsConfig?:TransactionsConfig,
    }


export function CrudServiceStructure<
                        IdType extends IdTypeFrom<EntityType>,
                        EntityType extends Entity<unknown>,
                        CreateInputType extends DeepPartial<EntityType>,
                        UpdateInputType extends DeepPartial<EntityType>,
                        FindArgsType extends FindArgsInterface,
                        ContextType extends Context,
                        >(input:CrudServiceStructure<IdType,EntityType,CreateInputType,UpdateInputType,FindArgsType,ContextType>):CrudServiceStructure<IdType,EntityType,CreateInputType,UpdateInputType,FindArgsType,ContextType>
                        {
                            fillEntityId(input);

                            return input;
                        }