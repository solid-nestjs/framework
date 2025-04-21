import { DeepPartial, Repository } from "typeorm"
import { IContext, IdTypeFrom, IEntity } from "../misc"

export interface ICreateEventsHandler<
            PrimaryKeyType extends IdTypeFrom<EntityType>,
            EntityType extends IEntity<unknown>,
            CreateInputType extends DeepPartial<EntityType>,
            ContextType extends IContext> {

    beforeCreate(context:ContextType,repository: Repository<EntityType>,entity: EntityType,createInput: CreateInputType) : Promise<void>

    afterCreate(context:ContextType,repository: Repository<EntityType>,entity: EntityType,createInput: CreateInputType) : Promise<void>
}

export interface IUpdateEventsHandler<
            PrimaryKeyType extends IdTypeFrom<EntityType>,
            EntityType extends IEntity<unknown>,
            UpdateInputType extends DeepPartial<EntityType>,
            ContextType extends IContext> {

    beforeUpdate(context:ContextType,repository: Repository<EntityType>,entity: EntityType,updateInput: UpdateInputType) : Promise<void>

    afterUpdate(context:ContextType,repository: Repository<EntityType>,entity: EntityType,updateInput: UpdateInputType) : Promise<void>
}

export interface IRemoveEventsHandler<
            PrimaryKeyType extends IdTypeFrom<EntityType>,
            EntityType extends IEntity<unknown>,
            ContextType extends IContext> {

    beforeRemove(context:ContextType,repository: Repository<EntityType>,entity: EntityType) : Promise<void>

    afterRemove(context:ContextType,repository: Repository<EntityType>,entity: EntityType) : Promise<void>  
}

export interface IHardRemoveEventsHandler<
            PrimaryKeyType extends IdTypeFrom<EntityType>,
            EntityType extends IEntity<unknown>,
            ContextType extends IContext> {

    beforeHardRemove(context:ContextType,repository: Repository<EntityType>,entity: EntityType) : Promise<void>

    afterHardRemove(context:ContextType,repository: Repository<EntityType>,entity: EntityType) : Promise<void>  
}