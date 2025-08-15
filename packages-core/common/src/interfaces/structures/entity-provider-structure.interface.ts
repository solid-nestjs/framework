import { PipeTransform, Type } from '@nestjs/common';
import { getPipeTransformForType, getPropertyType } from '../../helpers';
import { Constructable, DeepPartial } from '../../types';
import { Context, Entity, IdTypeFrom } from '../misc';
import { FindArgs } from '../inputs';

export interface IdStructure<IdType> {
  type: Constructable<IdType>;
  pipeTransforms?: Type<PipeTransform>[];
}

export interface EntityProviderStructure<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
> {
  entityType: Constructable<EntityType>;
  entityId?: IdStructure<IdType>;
}

export function fillEntityId<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
>(entityProvider: EntityProviderStructure<IdType, EntityType>) {
  if (entityProvider.entityId) return;

  const idType = getPropertyType(entityProvider.entityType, 'id');
  const idPipeTransform = getPipeTransformForType(idType);

  entityProvider.entityId = {
    type: idType,
    pipeTransforms: idPipeTransform ? [idPipeTransform] : [],
  };
}

export interface DataProviderStructure<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  FindArgsType extends FindArgs<EntityType> = FindArgs<EntityType>,
  ContextType extends Context = Context,
> extends EntityProviderStructure<IdType, EntityType> {
  findArgsType?: Constructable<FindArgsType>;
  contextType?: Constructable<ContextType>;
}

export interface CrudProviderStructure<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  CreateInputType extends DeepPartial<EntityType>,
  UpdateInputType extends DeepPartial<EntityType>,
  FindArgsType extends FindArgs<EntityType> = FindArgs<EntityType>,
  ContextType extends Context = Context,
> extends DataProviderStructure<IdType, EntityType, FindArgsType, ContextType> {
  createInputType: Constructable<CreateInputType>;
  updateInputType: Constructable<UpdateInputType>;
}

export function DataProviderStructure<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  FindArgsType extends FindArgs<EntityType> = FindArgs<EntityType>,
  ContextType extends Context = Context,
>(
  input: DataProviderStructure<IdType, EntityType, FindArgsType, ContextType>,
): DataProviderStructure<IdType, EntityType, FindArgsType, ContextType> {
  return input;
}

export function CrudProviderStructure<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  CreateInputType extends DeepPartial<EntityType>,
  UpdateInputType extends DeepPartial<EntityType>,
  FindArgsType extends FindArgs<EntityType> = FindArgs<EntityType>,
  ContextType extends Context = Context,
>(
  input: CrudProviderStructure<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    FindArgsType,
    ContextType
  >,
): CrudProviderStructure<
  IdType,
  EntityType,
  CreateInputType,
  UpdateInputType,
  FindArgsType,
  ContextType
> {
  return input;
}
