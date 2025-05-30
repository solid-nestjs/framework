import { DeepPartial } from '../../types';
import { Context, IdTypeFrom, Entity } from '../misc';
import { DataService } from './data-service.interface';

/**
 * Interface defining Create, Update, and Delete (CUD) operations for a service.
 *
 * @typeParam IdType - The type of the entity's identifier.
 * @typeParam EntityType - The type of the entity managed by the service.
 * @typeParam CreateInputType - The type of the input used for creating an entity.
 * @typeParam UpdateInputType - The type of the input used for updating an entity.
 * @typeParam ContextType - The type of the context passed to each operation (defaults to `Context`).
 *
 * @remarks
 * This interface abstracts the basic CUD operations for entities, allowing implementations to define
 * how entities are created, updated, and removed (both soft and hard deletes).
 *
 * @method create - Creates a new entity using the provided input and context.
 * @param context - The operation context.
 * @param createInput - The data required to create the entity.
 * @returns A promise resolving to the created entity.
 *
 * @method update - Updates an existing entity identified by `id` with the provided input and context.
 * @param context - The operation context.
 * @param id - The identifier of the entity to update.
 * @param updateInput - The data to update the entity with.
 * @returns A promise resolving to the updated entity.
 *
 * @method remove - Performs a soft delete of the entity identified by `id` in the given context.
 * @param context - The operation context.
 * @param id - The identifier of the entity to remove.
 * @returns A promise resolving to the removed entity.
 *
 * @method hardRemove - Permanently deletes the entity identified by `id` in the given context.
 * @param context - The operation context.
 * @param id - The identifier of the entity to hard remove.
 * @returns A promise resolving to the hard-removed entity.
 */
export interface CudService<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  CreateInputType extends DeepPartial<EntityType>,
  UpdateInputType extends DeepPartial<EntityType>,
  ContextType extends Context = Context,
> {
  create(
    context: ContextType,
    createInput: CreateInputType,
  ): Promise<EntityType>;

  update(
    context: ContextType,
    id: IdType,
    updateInput: UpdateInputType,
  ): Promise<EntityType>;

  remove(context: ContextType, id: IdType): Promise<EntityType>;

  hardRemove(context: ContextType, id: IdType): Promise<EntityType>;
}

/**
 * Generic interface for a CRUD (Create, Read, Update, Delete) service.
 *
 * @typeParam IdType - The type of the entity's identifier, derived from the entity type.
 * @typeParam EntityType - The type of the entity managed by the service, extending `Entity<unknown>`.
 * @typeParam CreateInputType - The type used for creating new entities, typically a partial of `EntityType`.
 * @typeParam UpdateInputType - The type used for updating entities, typically a partial of `EntityType`.
 * @typeParam ContextType - The context type for the service, defaults to `Context`.
 *
 * @remarks
 * This interface extends both `DataService` and `CudService`, combining read and write operations
 * for entities. It is intended to be implemented by services that provide full CRUD functionality.
 */
export interface CrudService<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  CreateInputType extends DeepPartial<EntityType>,
  UpdateInputType extends DeepPartial<EntityType>,
  ContextType extends Context = Context,
> extends DataService<IdType, EntityType, ContextType>,
    CudService<
      IdType,
      EntityType,
      CreateInputType,
      UpdateInputType,
      ContextType
    > {}
