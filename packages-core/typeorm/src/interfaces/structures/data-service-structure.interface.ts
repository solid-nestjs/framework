import { FindOptionsRelations } from 'typeorm';
import {
  CommonDataServiceFunctions,
  CommonDataServiceFunctionStructure,
  CommonDataServiceStructure,
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

/**
 * Base configuration interface for defining entity relations with optional main alias.
 *
 * @template EntityType - The entity type for which relations are configured
 */
export interface RelationsConfigBase<EntityType> {
  /** Optional main alias for the entity in query builder operations */
  mainAlias?: string;
  /** Relations configuration using either custom Relation array or TypeORM's FindOptionsRelations */
  relations?: Relation[] | FindOptionsRelations<EntityType>;
}

/**
 * Union type for relations configuration that accepts either a base configuration object
 * or directly TypeORM's FindOptionsRelations.
 *
 * @template EntityType - The entity type for which relations are configured
 */
export type RelationsConfig<EntityType> =
  | RelationsConfigBase<EntityType>
  | FindOptionsRelations<EntityType>;

/**
 * Extracts the main alias from a relations configuration object.
 *
 * @template EntityType - The entity type
 * @param relationsConfig - The relations configuration to extract alias from
 * @returns The main alias if present, undefined otherwise
 */
export function getMainAliasFromConfig<EntityType>(
  relationsConfig?: RelationsConfig<EntityType>,
): string | undefined {
  const conf = relationsConfig as any;

  if (conf?.mainAlias === undefined && conf?.relations === undefined)
    return undefined;
  else return conf?.mainAlias;
}

/**
 * Extracts the relations configuration from a relations config object.
 *
 * @template EntityType - The entity type
 * @param relationsConfig - The relations configuration to extract relations from
 * @returns The relations configuration or the entire config if it's a direct FindOptionsRelations
 */
export function getRelationsFromConfig<EntityType>(
  relationsConfig?: RelationsConfig<EntityType>,
): Relation[] | FindOptionsRelations<EntityType> | undefined {
  const conf = relationsConfig as any;

  if (conf?.mainAlias === undefined && conf?.relations === undefined)
    return conf;
  else return conf?.relations;
}

/**
 * Configuration interface for query builder operations including relations and locking.
 *
 * @template EntityType - The entity type for the query builder
 */
export interface QueryBuilderConfig<EntityType> {
  /** Configuration for entity relations to be loaded */
  relationsConfig?: RelationsConfig<EntityType>;
  /** Database lock mode for the query operation */
  lockMode?: LockModeOptimistic | LockModeNotOptimistic;
}

/**
 * Configuration structure for individual data service functions.
 * Extends QueryBuilderConfig with additional method decorator support.
 *
 * @template EntityType - The entity type this function operates on
 */
export interface DataServiceFunctionStructure<EntityType>
  extends QueryBuilderConfig<EntityType>,
    CommonDataServiceFunctionStructure<EntityType> {}

/**
 * Defines the available data service functions that can be configured.
 * Includes basic read operations like findAll, findOne, and pagination.
 *
 * @template EntityType - The entity type this service operates on
 */
export interface DataServiceFunctions<EntityType>
  extends CommonDataServiceFunctions<EntityType> {
  /** Configuration for the findAll operation */
  findAll?: DataServiceFunctionStructure<EntityType>;
  /** Configuration for the findOne operation */
  findOne?: DataServiceFunctionStructure<EntityType>;
  /** Configuration for the pagination operation */
  pagination?: DataServiceFunctionStructure<EntityType>;
}

/**
 * Structure definition for configuring a data service.
 * Extends EntityProviderStructure and QueryBuilderConfig with additional service configuration.
 *
 * @template IdType - The type of the entity's identifier
 * @template EntityType - The entity type this service operates on
 * @template FindArgsType - The type for find operation arguments
 * @template ContextType - The context type for operations
 */
export interface DataServiceStructure<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  FindArgsType extends FindArgs<EntityType> = FindArgs<EntityType>,
  ContextType extends Context = Context,
> extends EntityProviderStructure<IdType, EntityType>,
    QueryBuilderConfig<EntityType>,
    CommonDataServiceStructure<IdType, EntityType, FindArgsType, ContextType> {
  /** Optional configuration for data service functions */
  functions?: DataServiceFunctions<EntityType>;
}

/**
 * Factory function that initializes and returns a `DataServiceStructure` object.
 *
 * This function ensures that the entity ID is properly filled in the input structure
 * and provides strong typing for all data service configuration parameters.
 *
 * @template IdType - The type of the entity's identifier
 * @template EntityType - The entity type this service operates on
 * @template FindArgsType - The type for find operation arguments
 * @template ContextType - The context type for operations
 *
 * @param input - The data service structure configuration to initialize
 * @returns The initialized data service structure with entity ID filled
 *
 * @example
 * ```typescript
 * const userServiceStructure = DataServiceStructure({
 *   entityType: User,
 *   findArgsType: UserFindArgs,
 *   relationsConfig: {
 *     mainAlias: 'user',
 *     relations: ['profile', 'roles']
 *   },
 *   functions: {
 *     findAll: { lockMode: 'pessimistic_read' },
 *     pagination: { decorators: [() => UseGuards(AuthGuard)] }
 *   }
 * });
 * ```
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
