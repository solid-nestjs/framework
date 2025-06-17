import { Constructable } from '@solid-nestjs/common';
import { getMetadataArgsStorage } from 'typeorm';

export function isColumnEmbedded(
  entityClass: Constructable<any>,
  propertyName: string,
): boolean {
  const metadataArgsStorage = getMetadataArgsStorage();

  // Get embedded metadata for the entity
  const embeddedArgs = metadataArgsStorage.embeddeds.filter(
    embedded => embedded.target === entityClass,
  );

  return embeddedArgs.some(embedded => embedded.propertyName === propertyName);
}
