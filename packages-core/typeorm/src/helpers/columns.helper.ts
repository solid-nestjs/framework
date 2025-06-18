import { Constructable } from '@solid-nestjs/common';
import { getMetadataArgsStorage } from 'typeorm';

export function getEntityColumns(entityClass: Constructable<any>) {
  const metadata = getMetadataArgsStorage();

  if (entityClass) {
    const embeddedColumns = metadata.columns.filter(
      column => column.target === entityClass,
    );
    return embeddedColumns.map(col => col.propertyName);
  }
  return [];
}

export function getEntityPrimaryColumns(entityClass: Constructable<any>) {
  const metadata = getMetadataArgsStorage();

  if (entityClass) {
    const embeddedColumns = metadata.columns.filter(
      column => column.target === entityClass && column.options.primary,
    );
    return embeddedColumns.map(col => col.propertyName);
  }
  return [];
}
