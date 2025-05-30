import { EntityMetadata, ObjectLiteral } from 'typeorm';
import { RelationType } from 'typeorm/metadata/types/RelationTypes';
import { Repository } from 'typeorm';
import { getTypeName } from '@solid-nestjs/common';
import { ExtendedRelationInfo, RelationInfo } from '../interfaces';

function getAggregatedCardinality(
  fromCardinality: RelationType,
  toCardinality: RelationType,
): RelationType {
  if (fromCardinality === 'one-to-many' && toCardinality === 'many-to-one')
    return 'many-to-many';
  if (fromCardinality === 'one-to-many' && toCardinality === 'one-to-many')
    return 'one-to-many';
  if (fromCardinality === 'many-to-one' && toCardinality === 'many-to-one')
    return 'many-to-one';
  if (fromCardinality === 'many-to-one' && toCardinality === 'one-to-many')
    return 'many-to-many';
  if (fromCardinality === 'many-to-many' || toCardinality === 'many-to-many')
    return 'many-to-many';
  if (fromCardinality === 'one-to-one') return toCardinality;
  if (toCardinality === 'one-to-one') return fromCardinality;
  return fromCardinality;
}

/**
 * Retrieves extended relation information for a given TypeORM entity repository, including both direct and nested (extended) relations up to a specified depth.
 *
 * This function analyzes the entity metadata to extract all direct relations and recursively explores nested relations (relations of related entities) up to `maxDepth` levels deep.
 * It avoids cycles by tracking visited paths and entities, and aggregates relation cardinality across relation chains.
 *
 * @template T - The entity type extending `ObjectLiteral`.
 * @param repository - The TypeORM repository instance for the target entity.
 * @param maxDepth - The maximum depth for traversing nested relations (default is 2).
 * @returns An array of `ExtendedRelationInfo` objects, each describing a direct or extended relation, including its path, cardinality, and other metadata.
 */
export function getEntityRelationsExtended<T extends ObjectLiteral>(
  repository: Repository<T>,
  maxDepth = 2,
): ExtendedRelationInfo[] {
  const metadata: EntityMetadata = repository.metadata;
  const relations: ExtendedRelationInfo[] = [];
  const visitedPaths = new Set<string>();

  // Add direct relations
  metadata.relations.forEach(relation => {
    // Changed pathKey to include property name
    const pathKey = `${metadata.name}.${relation.propertyName}->${getTypeName(relation.type)}`;
    if (!visitedPaths.has(pathKey)) {
      visitedPaths.add(pathKey);
      relations.push({
        propertyName: relation.propertyName,
        relationType: relation.relationType,
        aggregatedCardinality: relation.relationType,
        target: getTypeName(relation.type),
        isNullable: relation.isNullable,
        isCascade:
          relation.isCascadeInsert ||
          relation.isCascadeUpdate ||
          relation.isCascadeRemove,
        isEager: relation.isEager,
        isLazy: relation.isLazy,
        path: [metadata.name, relation.propertyName],
        isExtended: false,
      });
    }
  });

  // Add extended relations
  function addExtendedRelations(
    currentMetadata: EntityMetadata,
    currentPath: string[],
    depth: number,
    visitedEntities: Set<string>,
    aggregatedCardinality?: RelationType,
  ) {
    if (depth >= maxDepth) return;

    currentMetadata.relations.forEach(relation => {
      const targetMetadata = relation.inverseEntityMetadata;

      const currentCardinality = aggregatedCardinality ?? relation.relationType;

      // Changed to include property names in path
      const entityPath = currentPath
        .map((p, i) => (i % 2 === 0 ? p : `.${p}`))
        .join('');

      // Skip if we've already visited this entity in this path
      if (visitedEntities.has(targetMetadata.name)) return;

      const newVisitedEntities = new Set(visitedEntities).add(
        targetMetadata.name,
      );
      const newPath = [...currentPath, relation.propertyName];

      targetMetadata.relations.forEach(extendedRelation => {
        // Skip inverse relations that point back to already visited entities
        if (newVisitedEntities.has(getTypeName(extendedRelation.type))) return;

        const fullPath = [...newPath, extendedRelation.propertyName];
        const pathKey = fullPath
          .map((p, i) => (i % 2 === 0 ? p : `.${p}`))
          .join('->');

        const newCardinality = getAggregatedCardinality(
          currentCardinality,
          extendedRelation.relationType,
        );

        if (!visitedPaths.has(pathKey)) {
          visitedPaths.add(pathKey);
          relations.push({
            propertyName: `${relation.propertyName}.${extendedRelation.propertyName}`,
            relationType: extendedRelation.relationType,
            aggregatedCardinality: newCardinality,
            target: getTypeName(extendedRelation.type),
            isNullable: relation.isNullable || extendedRelation.isNullable,
            isCascade:
              relation.isCascadeInsert ||
              relation.isCascadeUpdate ||
              relation.isCascadeRemove,
            isEager: relation.isEager && extendedRelation.isEager,
            isLazy: relation.isLazy,
            path: fullPath,
            isExtended: true,
          });
        }

        // Recursively add deeper relations
        addExtendedRelations(
          targetMetadata,
          newPath,
          depth + 1,
          newVisitedEntities,
          newCardinality,
        );
      });
    });
  }

  addExtendedRelations(metadata, [metadata.name], 0, new Set([metadata.name]));

  return relations;
}

/**
 * Retrieves metadata information about the relations defined in the given TypeORM repository's entity.
 *
 * @typeParam T - The entity type extending `ObjectLiteral`.
 * @param repository - The TypeORM repository instance for the target entity.
 * @returns An array of `RelationInfo` objects, each describing a relation of the entity, including property name, relation type, target entity name, nullability, cascade options, and loading strategy (eager or lazy).
 */
export function getEntityRelations<T extends ObjectLiteral>(
  repository: Repository<T>,
): RelationInfo[] {
  const metadata: EntityMetadata = repository.metadata;

  return metadata.relations.map(relation => ({
    propertyName: relation.propertyName,
    relationType: relation.relationType,
    target: getTypeName(relation.type),
    isNullable: relation.isNullable,
    isCascade:
      relation.isCascadeInsert ||
      relation.isCascadeUpdate ||
      relation.isCascadeRemove,
    isEager: relation.isEager,
    isLazy: relation.isLazy,
  }));
}
