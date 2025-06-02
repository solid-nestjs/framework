import { DeepPartial, Repository } from 'typeorm';
import { IdTypeFrom, Entity, Where } from '@solid-nestjs/common';
import { Context } from '../misc';

export interface CreateEventsHandler<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  CreateInputType extends DeepPartial<EntityType>,
  ContextType extends Context,
> {
  beforeCreate(
    context: ContextType,
    repository: Repository<EntityType>,
    entity: EntityType,
    createInput: CreateInputType,
  ): Promise<void>;

  afterCreate(
    context: ContextType,
    repository: Repository<EntityType>,
    entity: EntityType,
    createInput: CreateInputType,
  ): Promise<void>;
}

export interface BulkInsertEventsHandler<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  ContextType extends Context,
> {
  beforeBulkInsert(
    context: ContextType,
    repository: Repository<EntityType>,
    entities: EntityType[],
    createInputs: DeepPartial<EntityType>[],
  ): Promise<void>;

  afterBulkInsert(
    context: ContextType,
    repository: Repository<EntityType>,
    ids: IdType[],
    createInputs: DeepPartial<EntityType>[],
  ): Promise<void>;
}

export interface UpdateEventsHandler<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  UpdateInputType extends DeepPartial<EntityType>,
  ContextType extends Context,
> {
  beforeUpdate(
    context: ContextType,
    repository: Repository<EntityType>,
    entity: EntityType,
    updateInput: UpdateInputType,
  ): Promise<void>;

  afterUpdate(
    context: ContextType,
    repository: Repository<EntityType>,
    entity: EntityType,
    updateInput: UpdateInputType,
  ): Promise<void>;
}

export interface RemoveEventsHandler<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  ContextType extends Context,
> {
  beforeRemove(
    context: ContextType,
    repository: Repository<EntityType>,
    entity: EntityType,
  ): Promise<void>;

  afterRemove(
    context: ContextType,
    repository: Repository<EntityType>,
    entity: EntityType,
  ): Promise<void>;
}

export interface HardRemoveEventsHandler<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  ContextType extends Context,
> {
  beforeHardRemove(
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

export interface BulkUpdateEventsHandler<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  ContextType extends Context,
> {
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
}

export interface BulkDeleteEventsHandler<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  ContextType extends Context,
> {
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
}

export interface BulkRemoveEventsHandler<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  ContextType extends Context,
> {
  beforeBulkRemove(
    context: ContextType,
    repository: Repository<EntityType>,
    where: Where<EntityType>,
  ): Promise<void>;

  afterBulkRemove(
    context: ContextType,
    repository: Repository<EntityType>,
    affectedCount: number | undefined,
    where: Where<EntityType>,
  ): Promise<void>;
}

export interface RecoverEventsHandler<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  ContextType extends Context,
> {
  beforeRecover(
    context: ContextType,
    repository: Repository<EntityType>,
    entity: EntityType,
  ): Promise<void>;

  afterRecover(
    context: ContextType,
    repository: Repository<EntityType>,
    entity: EntityType,
  ): Promise<void>;
}
