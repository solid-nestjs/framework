import {
  Context,
  IdTypeFrom,
  Entity,
  FindArgs,
  CrudService,
  DeepPartial,
  Constructable,
  SoftDeletableCrudService,
} from '@solid-nestjs/common';
import {
  DataResolverOperations,
  DataResolverStructure,
  OperationStructure,
} from './data-resolver-structure.interface';
import { fillEntityId } from './entity-provider-structure.interface';

/**
 * Interface defining the available CRUD operations for a GraphQL resolver.
 *
 * Extends the base data resolver operations to include create, update, and delete mutations.
 * For services that implement soft deletion, additional operations like softRemove, recover,
 * and hardRemove are conditionally available as GraphQL mutations.
 *
 * @template IdType - The type of the entity identifier, must extend the ID type from EntityType
 * @template EntityType - The entity type that must extend Entity<unknown>
 * @template CreateInputType - The GraphQL input type for creating new entities, must be a partial of EntityType
 * @template UpdateInputType - The GraphQL input type for updating entities, must be a partial of EntityType
 * @template ServiceType - The CRUD service type that handles the business logic
 * @template FindArgsType - The type for GraphQL query arguments
 * @template ContextType - The context type for GraphQL request handling, defaults to Context
 */
export interface CrudResolverOperations<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  CreateInputType extends DeepPartial<EntityType>,
  UpdateInputType extends DeepPartial<EntityType>,
  ServiceType extends CrudService<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    ContextType
  >,
  FindArgsType extends FindArgs<EntityType>,
  ContextType extends Context = Context,
> extends DataResolverOperations<
    IdType,
    EntityType,
    ServiceType,
    FindArgsType,
    ContextType
  > {
  /** Configuration for the create mutation - can be disabled by setting to false or configured with OperationStructure */
  create?: OperationStructure | boolean;
  /** Configuration for the update mutation - can be disabled by setting to false or configured with OperationStructure */
  update?: OperationStructure | boolean;
  /** Configuration for the remove (hard delete) mutation - can be disabled by setting to false or configured with OperationStructure */
  remove?: OperationStructure | boolean;
  /**
   * Configuration for the soft remove mutation - only available for services that implement SoftDeletableCrudService
   * Can be disabled by setting to false or configured with OperationStructure
   */
  softRemove?: ServiceType extends SoftDeletableCrudService<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    ContextType
  >
    ? OperationStructure | boolean
    : never;
  /**
   * Configuration for the recover mutation (restore soft-deleted entities) - only available for services that implement SoftDeletableCrudService
   * Can be disabled by setting to false or configured with OperationStructure
   */
  recover?: ServiceType extends SoftDeletableCrudService<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    ContextType
  >
    ? OperationStructure | boolean
    : never;
  /**
   * Configuration for the hard remove mutation (permanent deletion) - only available for services that implement SoftDeletableCrudService
   * Can be disabled by setting to false or configured with OperationStructure
   */
  hardRemove?: ServiceType extends SoftDeletableCrudService<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    ContextType
  >
    ? OperationStructure | boolean
    : never;
}

/**
 * Interface defining the complete structure configuration for a CRUD GraphQL resolver.
 *
 * This interface extends the base DataResolverStructure and adds CRUD-specific
 * configurations including GraphQL input types for create and update mutations, and
 * the operations that should be available on the resolver.
 *
 * @template IdType - The type of the entity identifier, must extend the ID type from EntityType
 * @template EntityType - The entity type that must extend Entity<unknown>
 * @template CreateInputType - The GraphQL input type for creating new entities, must be a partial of EntityType
 * @template UpdateInputType - The GraphQL input type for updating entities, must be a partial of EntityType
 * @template ServiceType - The CRUD service type that handles the business logic
 * @template FindArgsType - The type for GraphQL query arguments
 * @template ContextType - The context type for GraphQL request handling, defaults to Context
 */
export interface CrudResolverStructure<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  CreateInputType extends DeepPartial<EntityType>,
  UpdateInputType extends DeepPartial<EntityType>,
  ServiceType extends CrudService<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    ContextType
  >,
  FindArgsType extends FindArgs<EntityType>,
  ContextType extends Context = Context,
> extends DataResolverStructure<
    IdType,
    EntityType,
    ServiceType,
    FindArgsType,
    ContextType
  > {
  /** The constructable GraphQL input type for creating new entities - defines the shape of data required for creation mutations */
  createInputType: Constructable<CreateInputType>;
  /** The constructable GraphQL input type for updating existing entities - defines the shape of data required for update mutations */
  updateInputType: Constructable<UpdateInputType>;
  /** Configuration for which CRUD mutations should be available and how they should be configured */
  operations?: CrudResolverOperations<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    ServiceType,
    FindArgsType,
    ContextType
  >;
}

/**
 * Initializes and returns a `CrudResolverStructure` object with the provided input.
 *
 * This generic function ensures that the entity ID is filled in the input structure before returning it.
 * It is intended to be used as a utility for setting up CRUD Resolver structures with strong typing.
 *
 * @param input - The CRUD Resolver structure to initialize.
 * @returns The initialized CRUD Resolver structure with entity ID filled.
 */
export function CrudResolverStructure<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  CreateInputType extends DeepPartial<EntityType>,
  UpdateInputType extends DeepPartial<EntityType>,
  ServiceType extends CrudService<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    ContextType
  >,
  FindArgsType extends FindArgs<EntityType>,
  ContextType extends Context,
>(
  input: CrudResolverStructure<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    ServiceType,
    FindArgsType,
    ContextType
  >,
): CrudResolverStructure<
  IdType,
  EntityType,
  CreateInputType,
  UpdateInputType,
  ServiceType,
  FindArgsType,
  ContextType
> {
  fillEntityId(input);

  return input;
}
