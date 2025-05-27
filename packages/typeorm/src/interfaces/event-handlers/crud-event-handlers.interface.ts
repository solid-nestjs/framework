import { DeepPartial, Repository } from "typeorm"
import { IdTypeFrom, Entity } from "@solid-nestjs/common"
import { Context } from "../misc"

export interface CreateEventsHandler<
            IdType extends IdTypeFrom<EntityType>,
            EntityType extends Entity<unknown>,
            CreateInputType extends DeepPartial<EntityType>,
            ContextType extends Context> {

    beforeCreate(context:ContextType,repository: Repository<EntityType>,entity: EntityType,createInput: CreateInputType) : Promise<void>

    afterCreate(context:ContextType,repository: Repository<EntityType>,entity: EntityType,createInput: CreateInputType) : Promise<void>
}

export interface UpdateEventsHandler<
            IdType extends IdTypeFrom<EntityType>,
            EntityType extends Entity<unknown>,
            UpdateInputType extends DeepPartial<EntityType>,
            ContextType extends Context> {

    beforeUpdate(context:ContextType,repository: Repository<EntityType>,entity: EntityType,updateInput: UpdateInputType) : Promise<void>

    afterUpdate(context:ContextType,repository: Repository<EntityType>,entity: EntityType,updateInput: UpdateInputType) : Promise<void>
}

export interface RemoveEventsHandler<
            IdType extends IdTypeFrom<EntityType>,
            EntityType extends Entity<unknown>,
            ContextType extends Context> {

    beforeRemove(context:ContextType,repository: Repository<EntityType>,entity: EntityType) : Promise<void>

    afterRemove(context:ContextType,repository: Repository<EntityType>,entity: EntityType) : Promise<void>  
}

export interface HardRemoveEventsHandler<
            IdType extends IdTypeFrom<EntityType>,
            EntityType extends Entity<unknown>,
            ContextType extends Context> {

    beforeHardRemove(context:ContextType,repository: Repository<EntityType>,entity: EntityType) : Promise<void>

    afterHardRemove(context:ContextType,repository: Repository<EntityType>,entity: EntityType) : Promise<void>  
}