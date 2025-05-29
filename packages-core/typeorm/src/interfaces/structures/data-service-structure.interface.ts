import { FindOptionsRelations } from 'typeorm';
import {
  Constructable,
  Entity,
  EntityProviderStructure,
  fillEntityId,
  FindArgs,
  IdTypeFrom,
} from '@solid-nestjs/common';
import {
  Context,
  Relation,
  LockModeOptimistic,
  LockModeNotOptimistic,
} from '../misc';

export interface RelationsConfigBase<EntityType> {
  mainAlias?: string;
  relations?: Relation[] | FindOptionsRelations<EntityType>;
}

export type RelationsConfig<EntityType> =
  | RelationsConfigBase<EntityType>
  | FindOptionsRelations<EntityType>;

export function getMainAliasFromConfig<EntityType>(
  relationsConfig?: RelationsConfig<EntityType>,
): string | undefined {
  const conf = relationsConfig as any;

  if (conf?.mainAlias === undefined && conf?.relations === undefined)
    return undefined;
  else return conf?.mainAlias;
}

export function getRelationsFromConfig<EntityType>(
  relationsConfig?: RelationsConfig<EntityType>,
): Relation[] | FindOptionsRelations<EntityType> | undefined {
  const conf = relationsConfig as any;

  if (conf?.mainAlias === undefined && conf?.relations === undefined)
    return conf;
  else return conf?.relations;
}

export interface QueryBuilderConfig<EntityType> {
  relationsConfig?: RelationsConfig<EntityType>;
  lockMode?: LockModeOptimistic | LockModeNotOptimistic;
}

export interface DataServiceFunctionStructure<EntityType>
  extends QueryBuilderConfig<EntityType> {
  decorators?: (() => MethodDecorator)[];
}

export interface DataServiceFunctions<EntityType> {
  findAll?: DataServiceFunctionStructure<EntityType>;
  findOne?: DataServiceFunctionStructure<EntityType>;
  pagination?: DataServiceFunctionStructure<EntityType>;
}

export interface DataServiceStructure<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  FindArgsType extends FindArgs<EntityType> = FindArgs<EntityType>,
  ContextType extends Context = Context,
> extends EntityProviderStructure<IdType, EntityType>,
    QueryBuilderConfig<EntityType> {
  findArgsType?: Constructable<FindArgsType>;
  contextType?: Constructable<ContextType>;
  functions?: DataServiceFunctions<EntityType>;
}

/**
 * A utility function that processes and returns a `DataServiceStructure` object.
 *
 * @param input - The `DataServiceStructure` object to be processed.
 * @returns The processed `DataServiceStructure` object with entity ID filled.
 */
export function DataServiceStructure<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  FindArgsType extends FindArgs<EntityType> = FindArgs<EntityType>,
  ContextType extends Context = Context,
>(
  input: DataServiceStructure<IdType, EntityType, FindArgsType, ContextType>,
): DataServiceStructure<IdType, EntityType, FindArgsType, ContextType> {
  fillEntityId(input);

  return input;
}
