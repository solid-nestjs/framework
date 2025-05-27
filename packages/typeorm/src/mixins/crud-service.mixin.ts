import { DeepPartial, Repository } from "typeorm";
import { Injectable, Type, mixin } from "@nestjs/common";
import { applyMethodDecorators, Entity, FindArgs, IdTypeFrom, StandardActions } from "@solid-nestjs/common";
import {
    Context, CrudService as CrudService, CrudServiceStructure,
    CreateOptions, UpdateOptions, RemoveOptions, HardRemoveOptions
} from "../interfaces";
import { hasDeleteDateColumn } from "../helpers";
import { DataServiceFrom } from "./data-service.mixin";
import { Transactional } from "../decorators";

/**
 * Generates a CRUD service class based on the provided service structure, supporting customizable
 * transactional behavior and method decorators for create, update, remove, and hardRemove operations.
 *
 * @param serviceStructure - The structure defining repository access, event hooks, and method options/decorators.
 * @returns A class constructor implementing the `CrudService` interface for the specified entity and context types.
 *
 * @remarks
 * - The generated service class extends a data service and implements standard CRUD operations.
 * - Each CRUD method supports optional transactional execution and custom decorators, as specified in the structure.
 * - Event hooks (`beforeCreate`, `afterCreate`, etc.) are provided as overridable methods for custom logic.
 * - The service handles both soft and hard removal, depending on the entity's delete date column.
 * - Method decorators are applied dynamically based on the configuration in `serviceStructure`.
 */
export function
    CrudServiceFrom<
        IdType extends IdTypeFrom<EntityType>,
        EntityType extends Entity<unknown>,
        CreateInputType extends DeepPartial<EntityType>,
        UpdateInputType extends DeepPartial<EntityType>,
        FindArgsType extends FindArgs<EntityType> = FindArgs<EntityType>,
        ContextType extends Context = Context
    >(
        serviceStructure: CrudServiceStructure<IdType, EntityType, CreateInputType, UpdateInputType, FindArgsType, ContextType>,

    ): Type<CrudService<IdType, EntityType, CreateInputType, UpdateInputType, FindArgsType, ContextType>> {
    const createStruct = serviceStructure.functions?.create;
    const updateStruct = serviceStructure.functions?.update;
    const removeStruct = serviceStructure.functions?.remove;
    const hardRemoveStruct = serviceStructure.functions?.hardRemove;

    const createDecorators = (createStruct?.transactional) ? [() => Transactional({ isolationLevel: createStruct?.isolationLevel })] : [];
    const updateDecorators = (updateStruct?.transactional) ? [() => Transactional({ isolationLevel: updateStruct?.isolationLevel })] : [];
    const removeDecorators = (removeStruct?.transactional) ? [() => Transactional({ isolationLevel: removeStruct?.isolationLevel })] : [];
    const hardRemoveDecorators = (hardRemoveStruct?.transactional) ? [() => Transactional({ isolationLevel: hardRemoveStruct?.isolationLevel })] : [];

    if (createStruct?.decorators)
        createDecorators.push(...createStruct.decorators);

    if (updateStruct?.decorators)
        updateDecorators.push(...updateStruct.decorators);

    if (removeStruct?.decorators)
        removeDecorators.push(...removeStruct.decorators);

    if (hardRemoveStruct?.decorators)
        hardRemoveDecorators.push(...hardRemoveStruct.decorators);

    @Injectable()
    class CrudServiceClass
        extends DataServiceFrom(serviceStructure)
        implements CrudService<IdType, EntityType, CreateInputType, UpdateInputType, FindArgsType, ContextType> {

        @applyMethodDecorators(createDecorators)
        async create(
            context: ContextType,
            createInput: CreateInputType,
            options?: CreateOptions<IdType, EntityType, CreateInputType, ContextType>
        ): Promise<EntityType> {
            const eventHandler = options?.eventHandler ?? this;

            const repository = this.getRepository(context);

            const entity = repository.create(createInput);

            await eventHandler.beforeCreate(context, repository, entity, createInput);

            const responseEntity = await repository.save(entity);

            this.audit(context, StandardActions.Create, entity.id as IdType, undefined, responseEntity);

            await eventHandler.afterCreate(context, repository, responseEntity, createInput);

            return responseEntity;
        }

        @applyMethodDecorators(updateDecorators)
        async update(
            context: ContextType,
            id: IdType,
            updateInput: UpdateInputType,
            options?: UpdateOptions<IdType, EntityType, UpdateInputType, ContextType>
        ): Promise<EntityType> {
            const eventHandler = options?.eventHandler ?? this;

            const repository = this.getRepository(context);

            const entity = await this.findOne(context, id, true) as EntityType;

            const entityBefore = { ...entity };

            Object.assign(entity, updateInput);

            await eventHandler.beforeUpdate(context, repository, entity, updateInput);

            const responseEntity = await repository.save(entity);

            this.audit(context, StandardActions.Update, entity.id as IdType, entityBefore, responseEntity);

            await eventHandler.afterUpdate(context, repository, responseEntity, updateInput);

            return responseEntity;
        }

        @applyMethodDecorators(removeDecorators)
        async remove(
            context: ContextType,
            id: IdType,
            options?: RemoveOptions<IdType, EntityType, ContextType>
        ): Promise<EntityType> {
            const eventHandler = options?.eventHandler ?? this;

            const repository = this.getRepository(context);

            const entity = await this.findOne(context, id, true);

            await eventHandler.beforeRemove(context, repository, entity);

            let responseEntity: EntityType;

            // check if the repository has a deleteDateColumn, if not, call remove instead
            // this is to avoid the error: MissingDeleteDateColumnError: Entity "EntityName" does not have a delete date column.
            if (hasDeleteDateColumn(repository)) {
                responseEntity = await repository.softRemove(entity);
            } else {
                responseEntity = await repository.remove(entity);
                responseEntity.id = id;
            }

            await this.audit(context, StandardActions.Remove, entity.id as IdType, responseEntity);

            await eventHandler.afterRemove(context, repository, responseEntity);

            return responseEntity;
        }

        @applyMethodDecorators(hardRemoveDecorators)
        async hardRemove(
            context: ContextType,
            id: IdType,
            options?: HardRemoveOptions<IdType, EntityType, ContextType>
        ): Promise<EntityType> {
            const eventHandler = options?.eventHandler ?? this;

            const repository = this.getRepository(context);

            // check if the repository has a deleteDateColumn, if not, call remove instead
            // this is to avoid the error: MissingDeleteDateColumnError: Entity "EntityName" does not have a delete date column.
            if (!hasDeleteDateColumn(repository))
                return this.remove(context, id);

            const entity = await this.findOne(context, id, true, { withDeleted: true });

            await eventHandler.beforeHardRemove(context, repository, entity);

            let responseEntity: EntityType;

            responseEntity = await repository.remove(entity);

            responseEntity.id = id;

            await this.audit(context, StandardActions.Remove, entity.id as IdType, responseEntity);

            await eventHandler.afterHardRemove(context, repository, responseEntity);

            return responseEntity;
        }


        //these methos exists to be overriden 
        async beforeCreate(context: ContextType, repository: Repository<EntityType>, entity: EntityType, createInput: CreateInputType): Promise<void> { }
        async beforeUpdate(context: ContextType, repository: Repository<EntityType>, entity: EntityType, updateInput: UpdateInputType): Promise<void> { }
        async beforeRemove(context: ContextType, repository: Repository<EntityType>, entity: EntityType): Promise<void> { }
        async beforeHardRemove(context: ContextType, repository: Repository<EntityType>, entity: EntityType): Promise<void> { }

        async afterCreate(context: ContextType, repository: Repository<EntityType>, entity: EntityType, createInput: CreateInputType): Promise<void> { }
        async afterUpdate(context: ContextType, repository: Repository<EntityType>, entity: EntityType, updateInput: UpdateInputType): Promise<void> { }
        async afterRemove(context: ContextType, repository: Repository<EntityType>, entity: EntityType): Promise<void> { }
        async afterHardRemove(context: ContextType, repository: Repository<EntityType>, entity: EntityType): Promise<void> { }

    }

    return mixin(CrudServiceClass);
}