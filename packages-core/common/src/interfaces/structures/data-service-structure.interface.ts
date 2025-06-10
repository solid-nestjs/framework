import { Constructable } from '../../types';
import { Context, Entity, FindArgs, IdTypeFrom } from '../misc';
import { EntityProviderStructure } from './entity-provider-structure.interface';

/**
 * Configuration structure for individual data service functions.
 *
 * @template EntityType - The entity type this function operates on
 */
export interface DataServiceFunctionStructure<EntityType> {
  /** Array of method decorators to apply to the function */
  decorators?: (() => MethodDecorator)[];
}

/**
 * Defines the available data service functions that can be configured.
 * Includes basic read operations like findAll, findOne, and pagination.
 *
 * @template EntityType - The entity type this service operates on
 */
export interface DataServiceFunctions<EntityType> {
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
> extends EntityProviderStructure<IdType, EntityType> {
  /** Optional constructor for the find arguments type */
  findArgsType?: Constructable<FindArgsType>;
  /** Optional constructor for the context type */
  contextType?: Constructable<ContextType>;
  /** Optional configuration for data service functions */
  functions?: DataServiceFunctions<EntityType>;
}
