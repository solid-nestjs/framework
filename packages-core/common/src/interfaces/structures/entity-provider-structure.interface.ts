import { PipeTransform, Type } from '@nestjs/common';
import { getPipeTransformForType, getPropertyType } from '../../helpers';
import { Constructable } from '../../types';
import { Entity, IdTypeFrom } from '../misc';

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
