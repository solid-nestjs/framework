import { DeepPartial } from '../../types';
import { Context, IdTypeFrom, Entity, FindArgs } from '../misc';
import { DataService } from './data-service.interface';

/**
 * Interface for Create, Update, and Delete operations without soft deletion support.
 *
 * @typeParam IdType - The type of the entity's identifier, derived from the entity type.
 * @typeParam EntityType - The type of the entity managed by the service, extending `Entity<unknown>`.
 * @typeParam CreateInputType - The type used for creating new entities, typically a partial of `EntityType`.
 * @typeParam UpdateInputType - The type used for updating entities, typically a partial of `EntityType`.
 * @typeParam ContextType - The context type for the service, defaults to `Context`.
 */
export interface CudService<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  CreateInputType extends DeepPartial<EntityType>,
  UpdateInputType extends DeepPartial<EntityType>,
  FindArgsType extends FindArgs<EntityType> = FindArgs<EntityType>,
  ContextType extends Context = Context,
> {
  /**
   * Creates a new entity.
   *
   * @param context - The execution context for the operation.
   * @param createInput - The data for creating the new entity.
   * @returns A promise that resolves to the created entity.
   */
  create(
    context: ContextType,
    createInput: CreateInputType,
  ): Promise<EntityType>;

  /**
   * Updates an existing entity.
   *
   * @param context - The execution context for the operation.
   * @param id - The identifier of the entity to update.
   * @param updateInput - The data for updating the entity.
   * @returns A promise that resolves to the updated entity.
   */
  update(
    context: ContextType,
    id: IdType,
    updateInput: UpdateInputType,
  ): Promise<EntityType>;

  /**
   * Removes an entity. The removal behavior depends on the implementation
   * (could be soft or hard delete).
   *
   * @param context - The execution context for the operation.
   * @param id - The identifier of the entity to remove.
   * @returns A promise that resolves to the removed entity.
   */
  remove(context: ContextType, id: IdType): Promise<EntityType>;
}

/**
 * Interface for services that support soft deletion and recovery operations.
 * Extends the basic CUD operations with soft deletion capabilities.
 *
 * @typeParam IdType - The type of the entity's identifier, derived from the entity type.
 * @typeParam EntityType - The type of the entity managed by the service, extending `Entity<unknown>`.
 * @typeParam CreateInputType - The type used for creating new entities, typically a partial of `EntityType`.
 * @typeParam UpdateInputType - The type used for updating entities, typically a partial of `EntityType`.
 * @typeParam ContextType - The context type for the service, defaults to `Context`.
 */
export interface SoftDeletableCudService<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  CreateInputType extends DeepPartial<EntityType>,
  UpdateInputType extends DeepPartial<EntityType>,
  FindArgsType extends FindArgs<EntityType> = FindArgs<EntityType>,
  ContextType extends Context = Context,
> extends CudService<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    FindArgsType,
    ContextType
  > {
  /**
   * Soft removes an entity by marking it as deleted without permanently removing it.
   * The entity can be recovered later using the recover method.
   *
   * @param context - The execution context for the operation.
   * @param id - The identifier of the entity to soft remove.
   * @returns A promise that resolves to the soft-removed entity.
   */
  softRemove(context: ContextType, id: IdType): Promise<EntityType>;

  /**
   * Permanently removes an entity from the data store.
   * This operation cannot be undone.
   *
   * @param context - The execution context for the operation.
   * @param id - The identifier of the entity to permanently remove.
   * @returns A promise that resolves to the permanently removed entity.
   */
  hardRemove(context: ContextType, id: IdType): Promise<EntityType>;

  /**
   * Recovers a previously soft-removed entity, making it active again.
   *
   * @param context - The execution context for the operation.
   * @param id - The identifier of the entity to recover.
   * @returns A promise that resolves to the recovered entity.
   */
  recover(context: ContextType, id: IdType): Promise<EntityType>;
}

/**
 * Generic interface for a full CRUD (Create, Read, Update, Delete) service.
 * Combines read operations from DataService with write operations from CudService.
 *
 * @typeParam IdType - The type of the entity's identifier, derived from the entity type.
 * @typeParam EntityType - The type of the entity managed by the service, extending `Entity<unknown>`.
 * @typeParam CreateInputType - The type used for creating new entities, typically a partial of `EntityType`.
 * @typeParam UpdateInputType - The type used for updating entities, typically a partial of `EntityType`.
 * @typeParam ContextType - The context type for the service, defaults to `Context`.
 *
 * @remarks
 * This interface extends both `DataService` and `CudService`, combining read and write operations
 * for entities. It is intended to be implemented by services that provide basic CRUD functionality
 * without soft deletion support.
 */
export interface CrudService<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  CreateInputType extends DeepPartial<EntityType>,
  UpdateInputType extends DeepPartial<EntityType>,
  FindArgsType extends FindArgs<EntityType> = FindArgs<EntityType>,
  ContextType extends Context = Context,
> extends DataService<IdType, EntityType, FindArgsType, ContextType>,
    CudService<
      IdType,
      EntityType,
      CreateInputType,
      UpdateInputType,
      FindArgsType,
      ContextType
    > {}

/**
 * Full CRUD service interface with soft deletion and recovery capabilities.
 * Combines read operations from DataService with soft deletion operations from SoftDeletableService.
 *
 * @typeParam IdType - The type of the entity's identifier, derived from the entity type.
 * @typeParam EntityType - The type of the entity managed by the service, extending `Entity<unknown>`.
 * @typeParam CreateInputType - The type used for creating new entities, typically a partial of `EntityType`.
 * @typeParam UpdateInputType - The type used for updating entities, typically a partial of `EntityType`.
 * @typeParam ContextType - The context type for the service, defaults to `Context`.
 */
export interface SoftDeletableCrudService<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  CreateInputType extends DeepPartial<EntityType>,
  UpdateInputType extends DeepPartial<EntityType>,
  FindArgsType extends FindArgs<EntityType> = FindArgs<EntityType>,
  ContextType extends Context = Context,
> extends DataService<IdType, EntityType, FindArgsType, ContextType>,
    SoftDeletableCudService<
      IdType,
      EntityType,
      CreateInputType,
      UpdateInputType,
      FindArgsType,
      ContextType
    > {}

// Add this helper function before the CrudControllerFrom function
export function isSoftDeletableCrudService<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  CreateInputType extends DeepPartial<EntityType>,
  UpdateInputType extends DeepPartial<EntityType>,
  FindArgsType extends FindArgs<EntityType> = FindArgs<EntityType>,
  ContextType extends Context = Context,
>(
  service: CrudService<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    FindArgsType,
    ContextType
  >,
): service is SoftDeletableCrudService<
  IdType,
  EntityType,
  CreateInputType,
  UpdateInputType,
  FindArgsType,
  ContextType
> {
  return service && typeof (service as any).hardRemove === 'function';
}
