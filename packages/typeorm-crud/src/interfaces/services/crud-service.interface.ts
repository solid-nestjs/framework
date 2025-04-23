import { DeepPartial, Repository } from "typeorm";
import { Context, IdTypeFrom, Entity, FindArgsInterface } from "../misc";
import { CreateEventsHandler, HardRemoveEventsHandler, RemoveEventsHandler, UpdateEventsHandler } from "../event-handlers";
import { DataServiceInterface } from "./data-service.interface";

export interface CrudServiceInterface<
        IdType extends IdTypeFrom<EntityType>,
        EntityType extends Entity<unknown>,
        CreateInputType extends DeepPartial<EntityType>,
        UpdateInputType extends DeepPartial<EntityType>,
        FindArgsType extends FindArgsInterface,
        ContextType extends Context = Context
        > extends DataServiceInterface<IdType,EntityType,FindArgsType,ContextType>{
           
            create(
                context:ContextType,
                createInput: CreateInputType,
                eventHandler?:CreateEventsHandler<IdType,EntityType,CreateInputType,ContextType>
                ): Promise<EntityType>;

            update(
                context:ContextType,
                id: IdType, 
                updateInput: UpdateInputType,
                eventHandler?:UpdateEventsHandler<IdType,EntityType,UpdateInputType,ContextType>
                ): Promise<EntityType>;

            remove(
                context:ContextType,
                id: IdType,
                eventHandler?:RemoveEventsHandler<IdType,EntityType,ContextType>
                ): Promise<EntityType>;

            
            hardRemove(
                context:ContextType,
                id: IdType,
                eventHandler?:HardRemoveEventsHandler<IdType,EntityType,ContextType>
                ): Promise<EntityType>; 

            beforeCreate(context:ContextType,repository: Repository<EntityType>,entity: EntityType,createInput: CreateInputType) : Promise<void>

            beforeUpdate(context:ContextType,repository: Repository<EntityType>,entity: EntityType,updateInput: UpdateInputType) : Promise<void>

            beforeRemove(context:ContextType,repository: Repository<EntityType>,entity: EntityType) : Promise<void>
            
            beforeHardRemove(context:ContextType,repository: Repository<EntityType>,entity: EntityType) : Promise<void>

        
            afterCreate(context:ContextType,repository: Repository<EntityType>,entity: EntityType,createInput: CreateInputType) : Promise<void>

            afterUpdate(context:ContextType,repository: Repository<EntityType>,entity: EntityType,updateInput: UpdateInputType) : Promise<void>

            afterRemove(context:ContextType,repository: Repository<EntityType>,entity: EntityType) : Promise<void>
            
            afterHardRemove(context:ContextType,repository: Repository<EntityType>,entity: EntityType) : Promise<void>
        }