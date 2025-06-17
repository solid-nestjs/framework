import { Constructor } from '@solid-nestjs/common';
import { RelationType } from 'typeorm/metadata/types/RelationTypes';

export interface RelationInfo {
  propertyName: string;
  relationType: RelationType;
  target: string;
  targetClass?: Constructor | undefined;
  isNullable: boolean;
  isCascade: boolean;
  isEager: boolean;
  isLazy: boolean;
}

export interface ExtendedRelationInfo extends RelationInfo {
  aggregatedCardinality: RelationType;
  path: string[];
  isExtended: boolean;
}
