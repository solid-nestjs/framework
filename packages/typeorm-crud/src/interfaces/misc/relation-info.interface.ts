import { RelationType } from 'typeorm/metadata/types/RelationTypes';

export interface RelationInfo {
  propertyName: string;
  relationType: RelationType;
  target: string;
  isNullable: boolean;
  isCascade: boolean;
  isEager: boolean;
  isLazy: boolean;
}

export interface IExtendedRelationInfo extends RelationInfo {
  aggregatedCardinality: RelationType;
  path: string[];
  isExtended: boolean;
}