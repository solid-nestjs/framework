import { DeepPartial, Repository } from 'typeorm';
import { Injectable, Type, mixin } from '@nestjs/common';
import {
  applyMethodDecorators,
  Entity,
  FindArgs,
  IdTypeFrom,
  StandardActions,
} from '@solid-nestjs/common';
import {
  Context,
  CrudService as CrudService,
  CrudServiceStructure,
  CreateOptions,
  UpdateOptions,
  RemoveOptions,
  HardRemoveOptions,
} from '../interfaces';
import { hasDeleteDateColumn } from '../helpers';
import { DataServiceFrom } from './data-service.mixin';
import { Transactional } from '../decorators';

/**
 * Generates a CRUD service class based on the provided service structure.
 *
 * This mixin function dynamically creates a service class that implements standard CRUD operations
 * (`create`, `update`, `remove`, `hardRemove`) for a given entity type, using TypeORM repositories.
 * It supports transactional operations and allows for custom decorators and event hooks before and after
 * each operation. The generated class extends a base data service and can be further customized by overriding
 * event handler methods.
 *
 * @template IdType - The type of the entity's identifier.
 * @template EntityType - The entity type managed by the service.
 * @template CreateInputType - The type used for creating new entities.
 * @template UpdateInputType - The type used for updating existing entities.
 * @template FindArgsType - The type used for find/query arguments.
 * @template ContextType - The context type passed to service methods.
 *
 * @param serviceStructure - An object describing the structure and behavior of the CRUD service,
 * including custom functions, decorators, and transactional options for each operation.
 *
 * @returns A class constructor implementing the `CrudService` interface for the specified types.
 *
 * @remarks
 * - The generated service methods (`create`, `update`, `remove`, `hardRemove`) are decorated as specified
 *   in the `serviceStructure`, and support transactional execution if configured.
 * - Event handler methods (`beforeCreate`, `afterCreate`, etc.) are provided as extension points and can be
 *   overridden in subclasses or passed via options.
 * - The service automatically handles soft deletes if the entity has a delete date column.
 */
export function CrudServiceFrom<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  CreateInputType extends DeepPartial<EntityType>,
  UpdateInputType extends DeepPartial<EntityType>,
  FindArgsType extends FindArgs<EntityType> = FindArgs<EntityType>,
  ContextType extends Context = Context,
>(
  serviceStructure: CrudServiceStructure<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    FindArgsType,
    ContextType
  >,
): Type<
  CrudService<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    FindArgsType,
    ContextType
  >
> {
  const createStruct = serviceStructure.functions?.create;
  const updateStruct = serviceStructure.functions?.update;
  const removeStruct = serviceStructure.functions?.remove;
  const hardRemoveStruct = serviceStructure.functions?.hardRemove;

  const createDecorators = createStruct?.transactional
    ? [() => Transactional({ isolationLevel: createStruct?.isolationLevel })]
    : [];
  const updateDecorators = updateStruct?.transactional
    ? [() => Transactional({ isolationLevel: updateStruct?.isolationLevel })]
    : [];
  const removeDecorators = removeStruct?.transactional
    ? [() => Transactional({ isolationLevel: removeStruct?.isolationLevel })]
    : [];
  const hardRemoveDecorators = hardRemoveStruct?.transactional
    ? [
        () =>
          Transactional({ isolationLevel: hardRemoveStruct?.isolationLevel }),
      ]
    : [];

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
    implements
      CrudService<
        IdType,
        EntityType,
        CreateInputType,
        UpdateInputType,
        FindArgsType,
        ContextType
      >
  {
    @applyMethodDecorators(createDecorators)
    async create(
      context: ContextType,
      createInput: CreateInputType,
      options?: CreateOptions<IdType, EntityType, CreateInputType, ContextType>,
    ): Promise<EntityType> {
      const eventHandler = options?.eventHandler ?? this;

      const repository = this.getRepository(context);

      const entity = repository.create(createInput);

      await eventHandler.beforeCreate(context, repository, entity, createInput);

      const responseEntity = await repository.save(entity);

      this.audit(
        context,
        StandardActions.Create,
        entity.id as IdType,
        undefined,
        responseEntity,
      );

      await eventHandler.afterCreate(
        context,
        repository,
        responseEntity,
        createInput,
      );

      return responseEntity;
    }

    @applyMethodDecorators(updateDecorators)
    async update(
      context: ContextType,
      id: IdType,
      updateInput: UpdateInputType,
      options?: UpdateOptions<IdType, EntityType, UpdateInputType, ContextType>,
    ): Promise<EntityType> {
      const eventHandler = options?.eventHandler ?? this;

      const repository = this.getRepository(context);

      const entity = (await this.findOne(context, id, true)) as EntityType;

      const entityBefore = { ...entity };

      Object.assign(entity, updateInput);

      await eventHandler.beforeUpdate(context, repository, entity, updateInput);

      const responseEntity = await repository.save(entity);

      this.audit(
        context,
        StandardActions.Update,
        entity.id as IdType,
        entityBefore,
        responseEntity,
      );

      await eventHandler.afterUpdate(
        context,
        repository,
        responseEntity,
        updateInput,
      );

      return responseEntity;
    }

    @applyMethodDecorators(removeDecorators)
    async remove(
      context: ContextType,
      id: IdType,
      options?: RemoveOptions<IdType, EntityType, ContextType>,
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

      await this.audit(
        context,
        StandardActions.Remove,
        entity.id as IdType,
        responseEntity,
      );

      await eventHandler.afterRemove(context, repository, responseEntity);

      return responseEntity;
    }

    @applyMethodDecorators(hardRemoveDecorators)
    async hardRemove(
      context: ContextType,
      id: IdType,
      options?: HardRemoveOptions<IdType, EntityType, ContextType>,
    ): Promise<EntityType> {
      const eventHandler = options?.eventHandler ?? this;

      const repository = this.getRepository(context);

      // check if the repository has a deleteDateColumn, if not, call remove instead
      // this is to avoid the error: MissingDeleteDateColumnError: Entity "EntityName" does not have a delete date column.
      if (!hasDeleteDateColumn(repository)) return this.remove(context, id);

      const entity = await this.findOne(context, id, true, {
        withDeleted: true,
      });

      await eventHandler.beforeHardRemove(context, repository, entity);

      let responseEntity: EntityType;

      responseEntity = await repository.remove(entity);

      responseEntity.id = id;

      await this.audit(
        context,
        StandardActions.Remove,
        entity.id as IdType,
        responseEntity,
      );

      await eventHandler.afterHardRemove(context, repository, responseEntity);

      return responseEntity;
    }

    //these methos exists to be overriden
    async beforeCreate(
      context: ContextType,
      repository: Repository<EntityType>,
      entity: EntityType,
      createInput: CreateInputType,
    ): Promise<void> {}
    async beforeUpdate(
      context: ContextType,
      repository: Repository<EntityType>,
      entity: EntityType,
      updateInput: UpdateInputType,
    ): Promise<void> {}
    async beforeRemove(
      context: ContextType,
      repository: Repository<EntityType>,
      entity: EntityType,
    ): Promise<void> {}
    async beforeHardRemove(
      context: ContextType,
      repository: Repository<EntityType>,
      entity: EntityType,
    ): Promise<void> {}

    async afterCreate(
      context: ContextType,
      repository: Repository<EntityType>,
      entity: EntityType,
      createInput: CreateInputType,
    ): Promise<void> {}
    async afterUpdate(
      context: ContextType,
      repository: Repository<EntityType>,
      entity: EntityType,
      updateInput: UpdateInputType,
    ): Promise<void> {}
    async afterRemove(
      context: ContextType,
      repository: Repository<EntityType>,
      entity: EntityType,
    ): Promise<void> {}
    async afterHardRemove(
      context: ContextType,
      repository: Repository<EntityType>,
      entity: EntityType,
    ): Promise<void> {}
  }

  return mixin(CrudServiceClass);
}
