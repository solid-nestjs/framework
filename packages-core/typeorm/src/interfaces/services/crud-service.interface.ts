import { DeepPartial } from 'typeorm';
import {
  Entity,
  IdTypeFrom,
  CudService as CommonCudService,
  FindArgs,
  Where,
  Context,
} from '@solid-nestjs/common';
import { TypeOrmRepository as Repository } from '../../types';
import {
  CreateEventsHandler,
  UpdateEventsHandler,
  RemoveEventsHandler,
  HardRemoveEventsHandler,
  BulkInsertEventsHandler,
  BulkUpdateEventsHandler,
  BulkDeleteEventsHandler,
} from '../event-handlers';
import { DataService } from './data-service.interface';

/**
 * Result interface for bulk insert operations.
 *
 * @typeParam IdType - The type of the entity's identifier.
 */
export interface BulkInsertResult<IdType> {
  /**
   * Array of IDs of the created entities.
   */
  ids: IdType[];
}

/**
 * Result interface for bulk update operations.
 */
export interface BulkUpdateResult {
  /**
   * Number of entities affected by the update operation.
   * Can be undefined if the database doesn't provide this information.
   */
  affected: number | undefined;
}

/**
 * Result interface for bulk delete operations.
 */
export interface BulkDeleteResult {
  /**
   * Number of entities affected by the delete operation.
   * Can be undefined if the database doesn't provide this information.
   */
  affected: number | undefined | null;
}

/**
 * Interface representing a generic CRUD (Create, Read, Update, Delete) service for entities.
 *
 * @extends DataService
 * @extends CommonCudService
 *
 * @remarks
 * This interface defines the contract for CRUD operations, including hooks for actions before and after
 * create, update, remove, and hard remove operations. It is intended to be implemented by services that
 * interact with a data repository, such as TypeORM repositories.
 *
 * @method create - Creates a new entity.
 * @method update - Updates an existing entity by its identifier.
 * @method remove - Soft-removes (marks as deleted) an entity by its identifier.
 * @method hardRemove - Permanently removes an entity by its identifier.
 *
 * @method beforeCreate - Hook executed before creating an entity.
 * @method beforeUpdate - Hook executed before updating an entity.
 * @method beforeRemove - Hook executed before soft-removing an entity.
 * @method beforeHardRemove - Hook executed before hard-removing an entity.
 *
 * @method afterCreate - Hook executed after creating an entity.
 * @method afterUpdate - Hook executed after updating an entity.
 * @method afterRemove - Hook executed after soft-removing an entity.
 * @method afterHardRemove - Hook executed after hard-removing an entity.
 */
export interface CrudService<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  CreateInputType extends DeepPartial<EntityType>,
  UpdateInputType extends DeepPartial<EntityType>,
  FindArgsType extends FindArgs<EntityType> = FindArgs<EntityType>,
  ContextType extends Context = Context,
> extends DataService<IdType, EntityType, FindArgsType, ContextType>,
    CommonCudService<
      IdType,
      EntityType,
      CreateInputType,
      UpdateInputType,
      ContextType
    > {
  create(
    context: ContextType,
    createInput: CreateInputType,
    options?: CreateOptions<IdType, EntityType, CreateInputType, ContextType>,
  ): Promise<EntityType>;

  bulkInsert(
    context: ContextType,
    createInputs: DeepPartial<EntityType>[],
    options?: BulkInsertOptions<IdType, EntityType, ContextType>,
  ): Promise<BulkInsertResult<IdType>>;

  update(
    context: ContextType,
    id: IdType,
    updateInput: UpdateInputType,
    options?: UpdateOptions<IdType, EntityType, UpdateInputType, ContextType>,
  ): Promise<EntityType>;

  remove(
    context: ContextType,
    id: IdType,
    options?: RemoveOptions<IdType, EntityType, ContextType>,
  ): Promise<EntityType>;

  hardRemove(
    context: ContextType,
    id: IdType,
    options?: HardRemoveOptions<IdType, EntityType, ContextType>,
  ): Promise<EntityType>;

  beforeCreate(
    context: ContextType,
    repository: Repository<EntityType>,
    entity: EntityType,
    createInput: CreateInputType,
  ): Promise<void>;

  beforeBulkInsert(
    context: ContextType,
    repository: Repository<EntityType>,
    entities: EntityType[],
    createInputs: DeepPartial<EntityType>[],
  ): Promise<void>;

  beforeUpdate(
    context: ContextType,
    repository: Repository<EntityType>,
    entity: EntityType,
    updateInput: UpdateInputType,
  ): Promise<void>;

  beforeRemove(
    context: ContextType,
    repository: Repository<EntityType>,
    entity: EntityType,
  ): Promise<void>;

  beforeHardRemove(
    context: ContextType,
    repository: Repository<EntityType>,
    entity: EntityType,
  ): Promise<void>;

  afterCreate(
    context: ContextType,
    repository: Repository<EntityType>,
    entity: EntityType,
    createInput: CreateInputType,
  ): Promise<void>;

  afterBulkInsert(
    context: ContextType,
    repository: Repository<EntityType>,
    ids: IdType[],
    createInputs: DeepPartial<EntityType>[],
  ): Promise<void>;

  afterUpdate(
    context: ContextType,
    repository: Repository<EntityType>,
    entity: EntityType,
    updateInput: UpdateInputType,
  ): Promise<void>;

  bulkUpdate(
    context: ContextType,
    updateInput: DeepPartial<EntityType>,
    where: Where<EntityType>,
    options?: BulkUpdateOptions<IdType, EntityType, ContextType>,
  ): Promise<BulkUpdateResult>;

  bulkDelete(
    context: ContextType,
    where: Where<EntityType>,
    options?: BulkDeleteOptions<IdType, EntityType, ContextType>,
  ): Promise<BulkDeleteResult>;

  beforeBulkUpdate(
    context: ContextType,
    repository: Repository<EntityType>,
    updateInput: DeepPartial<EntityType>,
    where: Where<EntityType>,
  ): Promise<void>;

  afterBulkUpdate(
    context: ContextType,
    repository: Repository<EntityType>,
    affectedCount: number | undefined,
    updateInput: DeepPartial<EntityType>,
    where: Where<EntityType>,
  ): Promise<void>;

  beforeBulkDelete(
    context: ContextType,
    repository: Repository<EntityType>,
    where: Where<EntityType>,
  ): Promise<void>;

  afterBulkDelete(
    context: ContextType,
    repository: Repository<EntityType>,
    affectedCount: number | undefined,
    where: Where<EntityType>,
  ): Promise<void>;

  afterRemove(
    context: ContextType,
    repository: Repository<EntityType>,
    entity: EntityType,
  ): Promise<void>;

  afterHardRemove(
    context: ContextType,
    repository: Repository<EntityType>,
    entity: EntityType,
  ): Promise<void>;
}

export interface CreateOptions<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  CreateInputType extends DeepPartial<EntityType>,
  ContextType extends Context,
> {
  eventHandler?: CreateEventsHandler<
    IdType,
    EntityType,
    CreateInputType,
    ContextType
  >;
}

export interface UpdateOptions<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  UpdateInputType extends DeepPartial<EntityType>,
  ContextType extends Context,
> {
  eventHandler?: UpdateEventsHandler<
    IdType,
    EntityType,
    UpdateInputType,
    ContextType
  >;
}

export interface RemoveOptions<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  ContextType extends Context,
> {
  eventHandler?: RemoveEventsHandler<IdType, EntityType, ContextType>;
}

export interface HardRemoveOptions<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  ContextType extends Context,
> {
  eventHandler?: HardRemoveEventsHandler<IdType, EntityType, ContextType>;
}

export interface BulkInsertOptions<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  ContextType extends Context,
> {
  eventHandler?: BulkInsertEventsHandler<IdType, EntityType, ContextType>;
}

export interface BulkUpdateOptions<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  ContextType extends Context,
> {
  eventHandler?: BulkUpdateEventsHandler<IdType, EntityType, ContextType>;
}

export interface BulkDeleteOptions<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  ContextType extends Context,
> {
  eventHandler?: BulkDeleteEventsHandler<IdType, EntityType, ContextType>;
}
