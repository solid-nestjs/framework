import { DeepPartial } from "typeorm";
import { TypeOrmRepository as Repository } from '../../types'
import { Context, IdTypeFrom, Entity } from "../misc";
import { CreateEventsHandler, HardRemoveEventsHandler, RemoveEventsHandler, UpdateEventsHandler } from "../event-handlers";
import { DataServiceInterface } from "./data-service.interface";

export interface CreateOptions<
        IdType extends IdTypeFrom<EntityType>,
        EntityType extends Entity<unknown>,
        CreateInputType extends DeepPartial<EntityType>,
        ContextType extends Context>
{
    eventHandler?:CreateEventsHandler<IdType,EntityType,CreateInputType,ContextType>
}

export interface UpdateOptions<
        IdType extends IdTypeFrom<EntityType>,
        EntityType extends Entity<unknown>,
        UpdateInputType extends DeepPartial<EntityType>,
        ContextType extends Context>
{
    eventHandler?:UpdateEventsHandler<IdType,EntityType,UpdateInputType,ContextType>
}

export interface RemoveOptions<
        IdType extends IdTypeFrom<EntityType>,
        EntityType extends Entity<unknown>,
        ContextType extends Context>
{
    eventHandler?:RemoveEventsHandler<IdType,EntityType,ContextType>
}

export interface HardRemoveOptions<
        IdType extends IdTypeFrom<EntityType>,
        EntityType extends Entity<unknown>,
        ContextType extends Context>
{
    eventHandler?:HardRemoveEventsHandler<IdType,EntityType,ContextType>
}

export interface CrudServiceInterface<
        IdType extends IdTypeFrom<EntityType>,
        EntityType extends Entity<unknown>,
        CreateInputType extends DeepPartial<EntityType>,
        UpdateInputType extends DeepPartial<EntityType>,
        ContextType extends Context = Context
        > extends DataServiceInterface<IdType,EntityType,ContextType>{
           
            create(
                context:ContextType,
                createInput: CreateInputType,
                options?:CreateOptions<IdType,EntityType,CreateInputType,ContextType>
                ): Promise<EntityType>;

            update(
                context:ContextType,
                id: IdType, 
                updateInput: UpdateInputType,
                options?:UpdateOptions<IdType,EntityType,UpdateInputType,ContextType>
                ): Promise<EntityType>;

            remove(
                context:ContextType,
                id: IdType,
                options?:RemoveOptions<IdType,EntityType,ContextType>
                ): Promise<EntityType>;
            
            hardRemove(
                context:ContextType,
                id: IdType,
                options?:HardRemoveOptions<IdType,EntityType,ContextType>
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