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

//this is not working
/*
export function getEmbeddedColumns(
  entityClass: Constructable<any>,
  embeddedPropertyName: string,
) {
  const metadata = getMetadataArgsStorage();
  const embeddedMetadata = metadata.embeddeds.find(
    embedded =>
      embedded.target === entityClass &&
      embedded.propertyName === embeddedPropertyName,
  );

  if (embeddedMetadata) {
    const embeddedColumns = metadata.columns.filter(
      column => column.target === embeddedMetadata.type,
    );
    return embeddedColumns.map(col => col.propertyName);
  }
  return [];
}
*/
