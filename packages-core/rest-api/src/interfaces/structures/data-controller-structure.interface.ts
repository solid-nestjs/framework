import { HttpStatus } from '@nestjs/common';
import {
  Context,
  IdTypeFrom,
  Entity,
  FindArgs,
  DataService,
  fillEntityId,
  EntityProviderStructure,
  Constructable,
  GroupByArgs,
} from '@solid-nestjs/common';

/**
 * Interface defining the configuration structure for individual controller operations.
 *
 * Provides metadata and configuration options for API endpoints including
 * naming, routing, HTTP status codes, and decorators.
 */
export interface OperationStructure {
  /** Custom name for the operation method */
  name?: string;
  /** Human-readable title for the operation (used in documentation) */
  title?: string;
  /** Detailed description of what the operation does */
  description?: string;
  /** Custom route path for the operation */
  route?: string;
  /** Unique identifier for the operation in OpenAPI specification */
  operationId?: string;

  /** HTTP status code to return on successful operation */
  successCode?: HttpStatus;
  /** Array of HTTP status codes that indicate successful operation */
  successCodes?: HttpStatus[];
  /** Array of HTTP status codes that indicate error conditions */
  errorCodes?: HttpStatus[];
  /** Array of method decorator factories to apply to the operation */
  decorators?: (() => MethodDecorator)[];
}

/**
 * Interface defining parameter decorators for controller methods.
 *
 * Provides factory functions for creating parameter decorators
 * that can extract values from the request context.
 */
export interface ParameterDecorators {
  /** Factory function that returns a parameter decorator for extracting context */
  context: () => ParameterDecorator;
}

/**
 * Interface defining the available data operations for a controller.
 *
 * Provides configuration for common data retrieval operations like
 * finding all entities, paginated results, grouped queries, and finding specific entities.
 *
 * @template IdType - The type of the entity identifier
 * @template EntityType - The entity type that must extend Entity<unknown>
 * @template ServiceType - The data service type that handles the business logic
 * @template FindArgsType - The type for find query arguments
 * @template ContextType - The context type for request handling
 */
export interface DataControllerOperations<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  ServiceType extends DataService<
    IdType,
    EntityType,
    FindArgsType,
    ContextType
  >,
  FindArgsType extends FindArgs<EntityType>,
  ContextType extends Context,
> {
  /** Configuration for the find all operation - retrieves all entities without pagination */
  findAll?: OperationStructure | boolean;
  /** Configuration for the find all paginated operation - retrieves entities with pagination support */
  findAllPaginated?: OperationStructure | boolean;
  /** Configuration for the pagination metadata operation - returns pagination information */
  pagination?: OperationStructure | boolean;
  /** Configuration for the find one operation - retrieves a single entity by ID */
  findOne?: OperationStructure | boolean;
  /** Configuration for the find all grouped operation - retrieves entities grouped by specified fields with aggregations */
  findAllGrouped?: OperationStructure | boolean;
}

/**
 * Interface defining the complete structure configuration for a data controller.
 *
 * This interface extends EntityProviderStructure and provides all necessary
 * configuration for setting up a data controller including service types,
 * routing, decorators, and available operations.
 *
 * @template IdType - The type of the entity identifier
 * @template EntityType - The entity type that must extend Entity<unknown>
 * @template ServiceType - The data service type that handles the business logic
 * @template FindArgsType - The type for find query arguments
 * @template ContextType - The context type for request handling
 */
export interface DataControllerStructure<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  ServiceType extends DataService<
    IdType,
    EntityType,
    FindArgsType,
    ContextType
  >,
  FindArgsType extends FindArgs<EntityType>,
  ContextType extends Context,
> extends EntityProviderStructure<IdType, EntityType> {
  /** The constructable service type that will handle the business logic for data operations */
  serviceType: Constructable<ServiceType>;
  /** Optional constructable type for find arguments - defines query parameters and filters */
  findArgsType?: Constructable<FindArgsType>;
  /** Optional constructable type for group by arguments - defines group by parameters and aggregations */
  groupByArgsType?: Constructable<GroupByArgs<EntityType>>;
  /** Optional constructable type for request context - provides additional request metadata */
  contextType?: Constructable<ContextType>;
  /** Configuration for which data operations should be available and how they should be configured */
  operations?: DataControllerOperations<
    IdType,
    EntityType,
    ServiceType,
    FindArgsType,
    ContextType
  >;
  /** Base route path for the controller - all operations will be relative to this path */
  route?: string;
  /** Configuration for parameter decorators used in controller methods */
  parameterDecorators?: ParameterDecorators;
  /** Array of class decorator factories to apply to the controller class */
  classDecorators?: (() => ClassDecorator)[];
}

/**
 * A utility function to initialize and return a `DataControllerStructure` object.
 *
 * This function ensures that the provided `input` structure has its entity ID field filled
 * by invoking the `fillEntityId` helper. It is generic over several types to provide strong
 * type safety for various data controller scenarios.
 *
 * @param input - The data controller structure to initialize.
 * @returns The initialized data controller structure with the entity ID filled.
 */
export function DataControllerStructure<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  ServiceType extends DataService<
    IdType,
    EntityType,
    FindArgsType,
    ContextType
  >,
  FindArgsType extends FindArgs<EntityType>,
  ContextType extends Context,
>(
  input: DataControllerStructure<
    IdType,
    EntityType,
    ServiceType,
    FindArgsType,
    ContextType
  >,
): DataControllerStructure<
  IdType,
  EntityType,
  ServiceType,
  FindArgsType,
  ContextType
> {
  fillEntityId(input);

  return input;
}
