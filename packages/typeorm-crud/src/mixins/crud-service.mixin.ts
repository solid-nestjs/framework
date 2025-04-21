import { DeepPartial, Repository } from "typeorm";
import { Injectable, Type, mixin } from "@nestjs/common";
import { Constructable } from "../types";
import { IContext, IdTypeFrom, IEntity, IDataRetrievalOptions, ICrudService, IFindArgs, ICrudServiceStructure, ICreateEventsHandler, IHardRemoveEventsHandler, IRemoveEventsHandler, IUpdateEventsHandler } from "../interfaces";
import { StandardActions } from "../enums";
import { DefaultArgs } from "../classes";
import { hasDeleteDateColumn } from "../helpers";
import { DataService } from "./data-service.mixin";

export function CrudServiceFrom<
            PrimaryKeyType extends IdTypeFrom<EntityType>,
            EntityType extends IEntity<unknown>,
            CreateInputType extends DeepPartial<EntityType>,
            UpdateInputType extends DeepPartial<EntityType>,
            FindArgsType extends IFindArgs = DefaultArgs,
            ContextType extends IContext = IContext
            >(
                structure:ICrudServiceStructure<PrimaryKeyType,EntityType,CreateInputType,UpdateInputType,FindArgsType,ContextType>
            ) : Type<ICrudService<PrimaryKeyType,EntityType,CreateInputType,UpdateInputType,FindArgsType,ContextType>>
    {
        const { entityType,createInputType,updateInputType,contextType,findArgsType,dataRetrievalOptions } = structure;

        return CrudService(entityType,createInputType,updateInputType,findArgsType,contextType,dataRetrievalOptions);
    }

export function 
    CrudService<
        PrimaryKeyType extends IdTypeFrom<EntityType>,
        EntityType extends IEntity<unknown>,
        CreateInputType extends DeepPartial<EntityType>,
        UpdateInputType extends DeepPartial<EntityType>,
        FindArgsType extends IFindArgs = DefaultArgs,
        ContextType extends IContext = IContext
    >(
        entityType: Constructable<EntityType>,
        createInputType:Constructable<CreateInputType>,
        updateInputType:Constructable<UpdateInputType>,
        findArgsType?: Constructable<FindArgsType>,
        contextType?: Constructable<ContextType>,
        dataRetrievalOptions?:IDataRetrievalOptions
    ): Type<ICrudService<PrimaryKeyType,EntityType,CreateInputType,UpdateInputType,FindArgsType,ContextType>> {

    @Injectable()
    class CrudService 
        extends DataService(entityType,findArgsType,contextType,dataRetrievalOptions)
        implements ICrudService<PrimaryKeyType,EntityType,CreateInputType,UpdateInputType,FindArgsType,ContextType>{
    
        async create(
            context:ContextType,
            createInput: CreateInputType,
            eventHandler:ICreateEventsHandler<PrimaryKeyType,EntityType,CreateInputType,ContextType> = this
            ): Promise<EntityType> {
    
            const repository = this.getRepository(context);
    
            const entity = repository.create(createInput);
    
            await eventHandler.beforeCreate(context,repository,entity,createInput);
            
            const responseEntity = await repository.save(entity);

            this.Audit(context,StandardActions.Create,entity.id as PrimaryKeyType,undefined,responseEntity);
    
            await eventHandler.afterCreate(context,repository,responseEntity,createInput);
    
            return responseEntity;
        }
    
        async update(
            context:ContextType,
            id: PrimaryKeyType, 
            updateInput: UpdateInputType,
            eventHandler:IUpdateEventsHandler<PrimaryKeyType,EntityType,UpdateInputType,ContextType> = this
            ): Promise<EntityType> {
            const repository = this.getRepository(context);
    
            const entity = await this.findOne(context,id,true) as EntityType;

            const entityBefore = { ...entity };
    
            Object.assign(entity,updateInput);
    
            await eventHandler.beforeUpdate(context,repository,entity,updateInput);
    
            const responseEntity = await repository.save(entity);

            this.Audit(context,StandardActions.Update,entity.id as PrimaryKeyType,entityBefore,responseEntity);            
    
            await eventHandler.afterUpdate(context,repository,responseEntity,updateInput);
    
            return responseEntity;
        } 
    
        async remove(
            context:ContextType,
            id: PrimaryKeyType,
            eventHandler:IRemoveEventsHandler<PrimaryKeyType,EntityType,ContextType> = this
            ): Promise<EntityType> {
            const repository = this.getRepository(context);
    
            const entity = await this.findOne(context,id,true);
    
            await eventHandler.beforeRemove(context,repository,entity);
    
            let responseEntity:EntityType;

            // check if the repository has a deleteDateColumn, if not, call remove instead
            // this is to avoid the error: MissingDeleteDateColumnError: Entity "EntityName" does not have a delete date column.
            if (hasDeleteDateColumn(repository)) {
                responseEntity = await repository.softRemove(entity);
            } else {
                responseEntity = await repository.remove(entity);
                responseEntity.id = id;
            }
    
            await this.Audit(context,StandardActions.Remove,entity.id as PrimaryKeyType,responseEntity);   

            await eventHandler.afterRemove(context,repository,responseEntity);
    
            return responseEntity;
        }

        async hardRemove(
            context:ContextType,
            id: PrimaryKeyType,
            eventHandler:IHardRemoveEventsHandler<PrimaryKeyType,EntityType,ContextType> = this
            ): Promise<EntityType> {
            const repository = this.getRepository(context);

            // check if the repository has a deleteDateColumn, if not, call remove instead
            // this is to avoid the error: MissingDeleteDateColumnError: Entity "EntityName" does not have a delete date column.
            if (!hasDeleteDateColumn(repository))
                return this.remove(context,id);
    
            const entity = await this.findOne(context,id,true,true);
    
            await eventHandler.beforeHardRemove(context,repository,entity);
    
            let responseEntity:EntityType;
            
            responseEntity = await repository.remove(entity);

            responseEntity.id = id;
       
            await this.Audit(context,StandardActions.Remove,entity.id as PrimaryKeyType,responseEntity);   

            await eventHandler.afterHardRemove(context,repository,responseEntity);
    
            return responseEntity;
        }
        
    
        //these methos exists to be overriden 
        async beforeCreate(context:ContextType,repository: Repository<EntityType>,entity: EntityType,createInput: CreateInputType) : Promise<void>
        { }
        async beforeUpdate(context:ContextType,repository: Repository<EntityType>,entity: EntityType,updateInput: UpdateInputType) : Promise<void>
        { }
        async beforeRemove(context:ContextType,repository: Repository<EntityType>,entity: EntityType) : Promise<void>
        { }
        async beforeHardRemove(context:ContextType,repository: Repository<EntityType>,entity: EntityType) : Promise<void>
        { }
    
        async afterCreate(context:ContextType,repository: Repository<EntityType>,entity: EntityType,createInput: CreateInputType) : Promise<void>
        { }
        async afterUpdate(context:ContextType,repository: Repository<EntityType>,entity: EntityType,updateInput: UpdateInputType) : Promise<void>
        { }
        async afterRemove(context:ContextType,repository: Repository<EntityType>,entity: EntityType) : Promise<void>
        { }
        async afterHardRemove(context:ContextType,repository: Repository<EntityType>,entity: EntityType) : Promise<void>
        { }
        
    }

    return mixin(CrudService);
}