import { ID } from '@nestjs/graphql';
import { ParseUUIDPipe } from '@nestjs/common';
import {
  Entity,
  EntityProviderStructure,
  IdTypeFrom,
  fillEntityId as CommonFillEntityId,
  Constructable,
} from '@solid-nestjs/common';

export function fillEntityId<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
>(entityProvider: EntityProviderStructure<IdType, EntityType>) {
  CommonFillEntityId(entityProvider);

  let pipeTransforms = entityProvider.entityId?.pipeTransforms;

  // by default string ID type is a UUID
  if (
    (entityProvider.entityId?.type as unknown) === String &&
    (entityProvider.entityId?.pipeTransforms?.length ?? 0) === 0
  )
    pipeTransforms = [ParseUUIDPipe];

  //graphql always should take ID if type is basic
  if (
    !entityProvider.entityId ||
    (entityProvider.entityId?.type as unknown) === String ||
    (entityProvider.entityId?.type as unknown) === Number ||
    (entityProvider.entityId?.type as unknown) === BigInt ||
    (entityProvider.entityId?.type as unknown) === Boolean ||
    (entityProvider.entityId?.type as unknown) === Date
  )
    entityProvider.entityId = {
      type: ID as unknown as Constructable<IdType>,
      pipeTransforms,
    };
}
