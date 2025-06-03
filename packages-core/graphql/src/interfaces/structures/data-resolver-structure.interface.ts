import {
  Context,
  IdTypeFrom,
  Entity,
  FindArgs,
  DataService,
  EntityProviderStructure,
  Constructable,
} from '@solid-nestjs/common';
import { fillEntityId } from './entity-provider-structure.interface';

/**
 * Interface defining the configuration structure for individual GraphQL resolver operations.
 *
 * Provides metadata and configuration options for GraphQL queries and mutations including
 * naming, descriptions, and decorators.
 */
export interface OperationStructure {
  /** Custom name for the GraphQL operation method */
  name?: string;
  /** Human-readable title for the operation (used in documentation) */
  title?: string;
  /** Detailed description of what the GraphQL operation does */
  description?: string;
  /** Array of method decorator factories to apply to the GraphQL operation */
  decorators?: (() => MethodDecorator)[];
}

/**
 * Interface defining parameter decorators for GraphQL resolver methods.
 *
 * Provides factory functions for creating parameter decorators
 * that can extract values from the GraphQL request context.
 */
export interface ParameterDecorators {
  /** Factory function that returns a parameter decorator for extracting GraphQL context */
  context: () => ParameterDecorator;
}

/**
 * Interface defining the available data operations for a GraphQL resolver.
 *
 * Provides configuration for common data retrieval operations like
 * finding all entities, pagination, and finding specific entities as GraphQL queries.
 *
 * @template IdType - The type of the entity identifier
 * @template EntityType - The entity type that must extend Entity<unknown>
 * @template ServiceType - The data service type that handles the business logic
 * @template FindArgsType - The type for GraphQL query arguments
 * @template ContextType - The context type for GraphQL request handling
 */
export interface DataResolverOperations<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  ServiceType extends DataService<IdType, EntityType, ContextType>,
  FindArgsType extends FindArgs<EntityType>,
  ContextType extends Context,
> {
  /** Configuration for the find all query - retrieves all entities without pagination */
  findAll?: OperationStructure | boolean;
  /** Configuration for the pagination query - returns pagination metadata information */
  pagination?: OperationStructure | boolean;
  /** Configuration for the find one query - retrieves a single entity by ID */
  findOne?: OperationStructure | boolean;
}

/**
 * Interface defining the complete structure configuration for a data GraphQL resolver.
 *
 * This interface extends EntityProviderStructure and provides all necessary
 * configuration for setting up a GraphQL data resolver including service types,
 * decorators, and available operations.
 *
 * @template IdType - The type of the entity identifier
 * @template EntityType - The entity type that must extend Entity<unknown>
 * @template ServiceType - The data service type that handles the business logic
 * @template FindArgsType - The type for GraphQL query arguments
 * @template ContextType - The context type for GraphQL request handling
 */
export interface DataResolverStructure<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  ServiceType extends DataService<IdType, EntityType, ContextType>,
  FindArgsType extends FindArgs<EntityType>,
  ContextType extends Context,
> extends EntityProviderStructure<IdType, EntityType> {
  /** The constructable service type that will handle the business logic for GraphQL data operations */
  serviceType: Constructable<ServiceType>;
  /** Optional constructable type for GraphQL query arguments - defines query parameters and filters */
  findArgsType?: Constructable<FindArgsType>;
  /** Optional constructable type for GraphQL request context - provides additional request metadata */
  contextType?: Constructable<ContextType>;
  /** Configuration for which GraphQL data operations should be available and how they should be configured */
  operations?: DataResolverOperations<
    IdType,
    EntityType,
    ServiceType,
    FindArgsType,
    ContextType
  >;
  /** Configuration for parameter decorators used in GraphQL resolver methods */
  parameterDecorators?: ParameterDecorators;
  /** Array of class decorator factories to apply to the GraphQL resolver class */
  classDecorators?: (() => ClassDecorator)[];
}

/**
 * A utility function to initialize and return a `DataResolverStructure` object.
 *
 * This function ensures that the provided `input` structure has its entity ID field filled
 * by invoking the `fillEntityId` helper. It is generic over several types to provide strong
 * type safety for various data Resolver scenarios.
 *
 * @param input - The data Resolver structure to initialize.
 * @returns The initialized data Resolver structure with the entity ID filled.
 */
export function DataResolverStructure<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  ServiceType extends DataService<IdType, EntityType, ContextType>,
  FindArgsType extends FindArgs<EntityType>,
  ContextType extends Context,
>(
  input: DataResolverStructure<
    IdType,
    EntityType,
    ServiceType,
    FindArgsType,
    ContextType
  >,
): DataResolverStructure<
  IdType,
  EntityType,
  ServiceType,
  FindArgsType,
  ContextType
> {
  fillEntityId(input);

  return input;
}
