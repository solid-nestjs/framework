import { DeepPartial } from 'typeorm';
import {
  Entity,
  IdTypeFrom,
  CudService as CommonCudService,
  FindArgs,
} from '@solid-nestjs/common';
import { TypeOrmRepository as Repository } from '../../types';
import { Context } from '../misc';
import {
  CreateEventsHandler,
  HardRemoveEventsHandler,
  RemoveEventsHandler,
  UpdateEventsHandler,
} from '../event-handlers';
import { DataService } from './data-service.interface';

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

  afterUpdate(
    context: ContextType,
    repository: Repository<EntityType>,
    entity: EntityType,
    updateInput: UpdateInputType,
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
