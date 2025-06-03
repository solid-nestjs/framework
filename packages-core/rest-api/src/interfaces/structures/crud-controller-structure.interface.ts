import {
  Context,
  IdTypeFrom,
  Entity,
  FindArgs,
  CrudService,
  fillEntityId,
  DeepPartial,
  Constructable,
  SoftDeletableCrudService,
  If,
} from '@solid-nestjs/common';
import {
  DataControllerOperations,
  DataControllerStructure,
  OperationStructure,
} from './data-controller-structure.interface';

/**
 * Interface defining the available CRUD operations for a controller.
 *
 * Extends the base data controller operations to include create, update, and delete operations.
 * For services that implement soft deletion, additional operations like softRemove, recover,
 * and hardRemove are conditionally available.
 *
 * @template IdType - The type of the entity identifier, must extend the ID type from EntityType
 * @template EntityType - The entity type that must extend Entity<unknown>
 * @template CreateInputType - The type for creating new entities, must be a partial of EntityType
 * @template UpdateInputType - The type for updating entities, must be a partial of EntityType
 * @template ServiceType - The CRUD service type that handles the business logic
 * @template FindArgsType - The type for find query arguments
 * @template ContextType - The context type for request handling, defaults to Context
 */
export interface CrudControllerOperations<
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
> extends DataControllerOperations<
    IdType,
    EntityType,
    ServiceType,
    FindArgsType,
    ContextType
  > {
  /** Configuration for the create operation - can be disabled by setting to false or configured with OperationStructure */
  create?: OperationStructure | boolean;
  /** Configuration for the update operation - can be disabled by setting to false or configured with OperationStructure */
  update?: OperationStructure | boolean;
  /** Configuration for the remove (hard delete) operation - can be disabled by setting to false or configured with OperationStructure */
  remove?: OperationStructure | boolean;
  /**
   * Configuration for the soft remove operation - only available for services that implement SoftDeletableCrudService
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
   * Configuration for the recover operation (restore soft-deleted entities) - only available for services that implement SoftDeletableCrudService
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
   * Configuration for the hard remove operation (permanent deletion) - only available for services that implement SoftDeletableCrudService
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
 * Interface defining the complete structure configuration for a CRUD controller.
 *
 * This interface extends the base DataControllerStructure and adds CRUD-specific
 * configurations including input types for create and update operations, and
 * the operations that should be available on the controller.
 *
 * @template IdType - The type of the entity identifier, must extend the ID type from EntityType
 * @template EntityType - The entity type that must extend Entity<unknown>
 * @template CreateInputType - The type for creating new entities, must be a partial of EntityType
 * @template UpdateInputType - The type for updating entities, must be a partial of EntityType
 * @template ServiceType - The CRUD service type that handles the business logic
 * @template FindArgsType - The type for find query arguments
 * @template ContextType - The context type for request handling, defaults to Context
 */
export interface CrudControllerStructure<
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
> extends DataControllerStructure<
    IdType,
    EntityType,
    ServiceType,
    FindArgsType,
    ContextType
  > {
  /** The constructable type for creating new entities - defines the shape of data required for creation */
  createInputType: Constructable<CreateInputType>;
  /** The constructable type for updating existing entities - defines the shape of data required for updates */
  updateInputType: Constructable<UpdateInputType>;
  /** Configuration for which CRUD operations should be available and how they should be configured */
  operations?: CrudControllerOperations<
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
 * Initializes and returns a `CrudControllerStructure` object with the provided input.
 *
 * This generic function ensures that the entity ID is filled in the input structure before returning it.
 * It is intended to be used as a utility for setting up CRUD controller structures with strong typing.
 *
 * @param input - The CRUD controller structure to initialize.
 * @returns The initialized CRUD controller structure with entity ID filled.
 */
export function CrudControllerStructure<
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
  input: CrudControllerStructure<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    ServiceType,
    FindArgsType,
    ContextType
  >,
): CrudControllerStructure<
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
