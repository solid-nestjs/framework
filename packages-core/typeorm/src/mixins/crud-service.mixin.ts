import { DeepPartial, Repository, In } from 'typeorm';
import { Injectable, Type, mixin } from '@nestjs/common';
import {
  applyMethodDecorators,
  Entity,
  FindArgs,
  IdTypeFrom,
  StandardActions,
  Where,
} from '@solid-nestjs/common';
import {
  Context,
  CrudService as CrudService,
  CrudServiceStructure,
  CreateOptions,
  BulkInsertOptions,
  BulkUpdateOptions,
  BulkDeleteOptions,
  BulkRemoveOptions,
  BulkRecoverOptions,
  BulkInsertResult,
  BulkUpdateResult,
  BulkDeleteResult,
  BulkRemoveResult,
  BulkRecoverResult,
  UpdateOptions,
  RemoveOptions,
  SoftRemoveOptions,
  HardRemoveOptions,
  RecoverOptions,
} from '../interfaces';
import { hasDeleteDateColumn } from '../helpers';
import { DataServiceFrom } from './data-service.mixin';
import { Transactional } from '../decorators';
import { TypeOrmRepository } from '../types';

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
  const entityType = serviceStructure.entityType;

  const createStruct = serviceStructure.functions?.create;
  const updateStruct = serviceStructure.functions?.update;
  const removeStruct = serviceStructure.functions?.remove;
  const softRemoveStruct = serviceStructure.functions?.softRemove;
  const hardRemoveStruct = serviceStructure.functions?.hardRemove;
  const recoverStruct = serviceStructure.functions?.recover;

  //bulk operations
  const bulkInsertStruct = serviceStructure.functions?.bulkInsert;
  const bulkUpdateStruct = serviceStructure.functions?.bulkUpdate;
  const bulkDeleteStruct = serviceStructure.functions?.bulkDelete;
  const bulkRemoveStruct = serviceStructure.functions?.bulkRemove;
  const bulkRecoverStruct = serviceStructure.functions?.bulkRecover;

  const createDecorators = createStruct?.transactional
    ? [() => Transactional({ isolationLevel: createStruct?.isolationLevel })]
    : [];
  const bulkInsertDecorators = bulkInsertStruct?.transactional
    ? [
        () =>
          Transactional({ isolationLevel: bulkInsertStruct?.isolationLevel }),
      ]
    : [];
  const bulkUpdateDecorators = bulkUpdateStruct?.transactional
    ? [
        () =>
          Transactional({ isolationLevel: bulkUpdateStruct?.isolationLevel }),
      ]
    : [];
  const bulkDeleteDecorators = bulkDeleteStruct?.transactional
    ? [
        () =>
          Transactional({ isolationLevel: bulkDeleteStruct?.isolationLevel }),
      ]
    : [];
  const bulkRemoveDecorators = bulkRemoveStruct?.transactional
    ? [
        () =>
          Transactional({ isolationLevel: bulkRemoveStruct?.isolationLevel }),
      ]
    : [];
  const bulkRecoverDecorators = bulkRecoverStruct?.transactional
    ? [
        () =>
          Transactional({ isolationLevel: bulkRecoverStruct?.isolationLevel }),
      ]
    : [];
  const updateDecorators = updateStruct?.transactional
    ? [() => Transactional({ isolationLevel: updateStruct?.isolationLevel })]
    : [];
  const removeDecorators = removeStruct?.transactional
    ? [() => Transactional({ isolationLevel: removeStruct?.isolationLevel })]
    : [];
  const softRemoveDecorators = softRemoveStruct?.transactional
    ? [
        () =>
          Transactional({ isolationLevel: softRemoveStruct?.isolationLevel }),
      ]
    : [];
  const hardRemoveDecorators = hardRemoveStruct?.transactional
    ? [
        () =>
          Transactional({ isolationLevel: hardRemoveStruct?.isolationLevel }),
      ]
    : [];
  const recoverDecorators = recoverStruct?.transactional
    ? [() => Transactional({ isolationLevel: recoverStruct?.isolationLevel })]
    : [];

  if (createStruct?.decorators)
    createDecorators.push(...createStruct.decorators);

  if (updateStruct?.decorators)
    updateDecorators.push(...updateStruct.decorators);

  if (removeStruct?.decorators)
    removeDecorators.push(...removeStruct.decorators);

  if (softRemoveStruct?.decorators)
    softRemoveDecorators.push(...softRemoveStruct.decorators);

  if (hardRemoveStruct?.decorators)
    hardRemoveDecorators.push(...hardRemoveStruct.decorators);

  if (recoverStruct?.decorators)
    recoverDecorators.push(...recoverStruct.decorators);

  //bulk operations
  if (bulkInsertStruct?.decorators)
    bulkInsertDecorators.push(...bulkInsertStruct.decorators);

  if (bulkUpdateStruct?.decorators)
    bulkUpdateDecorators.push(...bulkUpdateStruct.decorators);

  if (bulkDeleteStruct?.decorators)
    bulkDeleteDecorators.push(...bulkDeleteStruct.decorators);

  if (bulkRemoveStruct?.decorators)
    bulkRemoveDecorators.push(...bulkRemoveStruct.decorators);

  if (bulkRecoverStruct?.decorators)
    bulkRecoverDecorators.push(...bulkRecoverStruct.decorators);

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

      if (!options?.noAudits) {
        this.audit(
          context,
          StandardActions.Create,
          entity.id as IdType,
          undefined,
          responseEntity,
        );
      }

      await eventHandler.afterCreate(
        context,
        repository,
        responseEntity,
        createInput,
      );

      return responseEntity;
    }

    @applyMethodDecorators(bulkInsertDecorators)
    async bulkInsert(
      context: ContextType,
      createInputs: DeepPartial<EntityType>[],
      options?: BulkInsertOptions<IdType, EntityType, ContextType>,
    ): Promise<BulkInsertResult<IdType>> {
      const eventHandler = options?.eventHandler ?? this;

      const repository = this.getRepository(context);

      // Create entities for validation and event handlers
      const entities = createInputs.map(createInput =>
        repository.create(createInput),
      );

      await eventHandler.beforeBulkInsert(
        context,
        repository,
        entities,
        createInputs,
      );

      // Perform true bulk insert using query builder - single DB operation
      const insertResult = await repository
        .createQueryBuilder()
        .insert()
        .into(repository.target)
        .values(createInputs as any[])
        .execute();

      // Retrieve the created entities with their generated IDs
      const createdIds = insertResult.identifiers.map(
        identifier => identifier.id,
      );

      await eventHandler.afterBulkInsert(
        context,
        repository,
        createdIds,
        createInputs,
      );

      return { ids: createdIds };
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

      if (!options?.noAudits) {
        this.audit(
          context,
          StandardActions.Update,
          entity.id as IdType,
          entityBefore,
          responseEntity,
        );
      }

      await eventHandler.afterUpdate(
        context,
        repository,
        responseEntity,
        updateInput,
      );

      return responseEntity;
    }

    @applyMethodDecorators(bulkUpdateDecorators)
    async bulkUpdate(
      context: ContextType,
      updateInput: DeepPartial<EntityType>,
      where: Where<EntityType>,
      options?: BulkUpdateOptions<IdType, EntityType, ContextType>,
    ): Promise<BulkUpdateResult> {
      const eventHandler = options?.eventHandler ?? this;

      const repository = this.getRepository(context);

      await eventHandler.beforeBulkUpdate(
        context,
        repository,
        updateInput,
        where,
      );

      const result = await this.getQueryBuilder(
        context,
        { where } as FindArgsType,
        {
          ignoreMultiplyingJoins: true,
          ignoreSelects: true,
        },
      )
        .update(entityType)
        .set(updateInput as any)
        .execute();

      await eventHandler.afterBulkUpdate(
        context,
        repository,
        result.affected || 0,
        updateInput,
        where,
      );

      return { affected: result.affected };
    }

    @applyMethodDecorators(bulkDeleteDecorators)
    async bulkDelete(
      context: ContextType,
      where: Where<EntityType>,
      options?: BulkDeleteOptions<IdType, EntityType, ContextType>,
    ): Promise<BulkDeleteResult> {
      const eventHandler = options?.eventHandler ?? this;

      const repository = this.getRepository(context);

      await eventHandler.beforeBulkDelete(context, repository, where);

      const result = await this.getQueryBuilder(
        context,
        { where } as FindArgsType,
        {
          ignoreMultiplyingJoins: true,
          ignoreSelects: true,
        },
      )
        .delete()
        .execute();

      await eventHandler.afterBulkDelete(
        context,
        repository,
        result.affected || 0,
        where,
      );

      return { affected: result.affected };
    }

    @applyMethodDecorators(bulkRemoveDecorators)
    async bulkRemove(
      context: ContextType,
      where: Where<EntityType>,
      options?: BulkRemoveOptions<IdType, EntityType, ContextType>,
    ): Promise<BulkRemoveResult> {
      const eventHandler = options?.eventHandler ?? this;

      const repository = this.getRepository(context);

      await eventHandler.beforeBulkRemove(context, repository, where);

      let result: BulkRemoveResult;

      // Check if the repository has a deleteDateColumn, if so use soft remove
      if (hasDeleteDateColumn(repository)) {
        // For soft remove, we need to perform an update operation to set the delete date
        const qbResult = await this.getQueryBuilder(
          context,
          { where } as FindArgsType,
          {
            ignoreMultiplyingJoins: true,
            ignoreSelects: true,
          },
        )
          .update(entityType)
          .softDelete()
          .execute();

        result = { affected: qbResult.affected };
      } else {
        result = await this.bulkDelete(context, where);
      }

      await eventHandler.afterBulkRemove(
        context,
        repository,
        result.affected || 0,
        where,
      );

      return result;
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

      if (hasDeleteDateColumn(repository)) {
        responseEntity = await this._softRemove(repository, entity, id);
      } else {
        responseEntity = await this._hardRemove(repository, entity, id);
      }

      if (!options?.noAudits) {
        await this.audit(
          context,
          StandardActions.Remove,
          entity.id as IdType,
          responseEntity,
        );
      }

      await eventHandler.afterRemove(context, repository, responseEntity);

      return responseEntity;
    }

    @applyMethodDecorators(softRemoveDecorators)
    async softRemove(
      context: ContextType,
      id: IdType,
      options?: SoftRemoveOptions<IdType, EntityType, ContextType>,
    ): Promise<EntityType> {
      const eventHandler = options?.eventHandler ?? this;

      const repository = this.getRepository(context);

      const entity = await this.findOne(context, id, true);

      await eventHandler.beforeSoftRemove(context, repository, entity);

      // Directly call repository.softRemove without checking hasDeleteDateColumn
      const responseEntity: EntityType = await this._softRemove(
        repository,
        entity,
        id,
      );

      if (!options?.noAudits) {
        await this.audit(
          context,
          StandardActions.Remove,
          entity.id as IdType,
          responseEntity,
        );
      }

      await eventHandler.afterSoftRemove(context, repository, responseEntity);

      return responseEntity;
    }

    private async _softRemove(
      repository: TypeOrmRepository<EntityType>,
      entity: EntityType,
      id: IdType,
    ) {
      const responseEntity: EntityType = await repository.softRemove(entity);

      // Restore ID if repository removed it
      if (!responseEntity.id) {
        responseEntity.id = id;
      }
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

      const entity = await this.findOne(context, id, true, {
        withDeleted: true,
      });

      await eventHandler.beforeHardRemove(context, repository, entity);

      const responseEntity = await this._hardRemove(repository, entity, id);

      if (!options?.noAudits) {
        await this.audit(
          context,
          StandardActions.Remove,
          entity.id as IdType,
          responseEntity,
        );
      }

      await eventHandler.afterHardRemove(context, repository, responseEntity);

      return responseEntity;
    }

    private async _hardRemove(
      repository: TypeOrmRepository<EntityType>,
      entity: EntityType,
      id: IdType,
    ) {
      const responseEntity = await repository.remove(entity);

      responseEntity.id = id;
      return responseEntity;
    }

    @applyMethodDecorators(recoverDecorators)
    async recover(
      context: ContextType,
      id: IdType,
      options?: RecoverOptions<IdType, EntityType, ContextType>,
    ): Promise<EntityType> {
      const eventHandler = options?.eventHandler ?? this;

      const repository = this.getRepository(context);

      const entity = await this.findOne(context, id, true, {
        withDeleted: true,
      });

      await eventHandler.beforeRecover(context, repository, entity);

      const responseEntity = await repository.recover(entity);

      if (!options?.noAudits) {
        this.audit(
          context,
          StandardActions.Update,
          entity.id as IdType,
          entity,
          responseEntity,
        );
      }

      await eventHandler.afterRecover(context, repository, responseEntity);

      return responseEntity;
    }

    @applyMethodDecorators(bulkRecoverDecorators)
    async bulkRecover(
      context: ContextType,
      where: Where<EntityType>,
      options?: BulkRecoverOptions<IdType, EntityType, ContextType>,
    ): Promise<BulkRecoverResult> {
      const eventHandler = options?.eventHandler ?? this;

      const repository = this.getRepository(context);

      await eventHandler.beforeBulkRecover(context, repository, where);

      // Check if the repository has a deleteDateColumn
      if (!hasDeleteDateColumn(repository)) {
        throw new Error(
          `Entity ${entityType.name} does not support soft deletes and cannot be bulk recovered`,
        );
      }

      const result = await this.getQueryBuilder(
        context,
        { where } as FindArgsType,
        {
          ignoreMultiplyingJoins: true,
          ignoreSelects: true,
        },
      )
        .restore()
        .execute();

      await eventHandler.afterBulkRecover(
        context,
        repository,
        result.affected || 0,
        where,
      );

      return { affected: result.affected };
    }

    //these methos exists to be overriden
    async beforeCreate(
      context: ContextType,
      repository: Repository<EntityType>,
      entity: EntityType,
      createInput: CreateInputType,
    ): Promise<void> {}
    async beforeBulkInsert(
      context: ContextType,
      repository: Repository<EntityType>,
      entities: EntityType[],
      createInputs: DeepPartial<EntityType>[],
    ): Promise<void> {}
    async beforeBulkUpdate(
      context: ContextType,
      repository: Repository<EntityType>,
      updateInput: DeepPartial<EntityType>,
      where: Where<EntityType>,
    ): Promise<void> {}
    async beforeBulkDelete(
      context: ContextType,
      repository: Repository<EntityType>,
      where: Where<EntityType>,
    ): Promise<void> {}
    async beforeBulkRemove(
      context: ContextType,
      repository: Repository<EntityType>,
      where: Where<EntityType>,
    ): Promise<void> {}
    async beforeBulkRecover(
      context: ContextType,
      repository: Repository<EntityType>,
      where: Where<EntityType>,
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
    async beforeRecover(
      context: ContextType,
      repository: Repository<EntityType>,
      entity: EntityType,
    ): Promise<void> {}
    async beforeSoftRemove(
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
    async afterBulkInsert(
      context: ContextType,
      repository: Repository<EntityType>,
      ids: IdType[],
      createInputs: DeepPartial<EntityType>[],
    ): Promise<void> {}
    async afterBulkUpdate(
      context: ContextType,
      repository: Repository<EntityType>,
      affectedCount: number,
      updateInput: DeepPartial<EntityType>,
      where: Where<EntityType>,
    ): Promise<void> {}
    async afterBulkDelete(
      context: ContextType,
      repository: Repository<EntityType>,
      affectedCount: number | undefined,
      where: Where<EntityType>,
    ): Promise<void> {}
    async afterBulkRemove(
      context: ContextType,
      repository: Repository<EntityType>,
      affectedCount: number | undefined,
      where: Where<EntityType>,
    ): Promise<void> {}
    async afterBulkRecover(
      context: ContextType,
      repository: Repository<EntityType>,
      affectedCount: number,
      where: Where<EntityType>,
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
    async afterRecover(
      context: ContextType,
      repository: Repository<EntityType>,
      entity: EntityType,
    ): Promise<void> {}
    async afterSoftRemove(
      context: ContextType,
      repository: Repository<EntityType>,
      entity: EntityType,
    ): Promise<void> {}
  }

  return mixin(CrudServiceClass);
}
