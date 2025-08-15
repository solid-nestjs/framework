import { Constructable, DeepPartial } from '../../types';
import { Context, Entity, IdTypeFrom } from '../misc';
import { FindArgs } from '../inputs';
import {
  DataServiceFunctions,
  DataServiceStructure,
} from './data-service-structure.interface';

/**
 * Configuration structure for individual CRUD service functions.
 * Provides method decorators.
 *
 * @template EntityType - The entity type this function operates on
 */
export interface CrudServiceFunctionStructure<EntityType> {
  /** Array of method decorators to apply to the function */
  decorators?: (() => MethodDecorator)[];
}

/**
 * Defines the available CRUD and bulk operation functions that can be configured for a service.
 * Extends DataServiceFunctions with create, update, and delete operations.
 *
 * @template EntityType - The entity type this service operates on
 */
export interface CrudServiceFunctions<EntityType>
  extends DataServiceFunctions<EntityType> {
  /** Configuration for the create operation */
  create?: CrudServiceFunctionStructure<EntityType>;
  /** Configuration for the update operation */
  update?: CrudServiceFunctionStructure<EntityType>;
  /** Configuration for the remove operation (soft delete by default) */
  remove?: CrudServiceFunctionStructure<EntityType>;
  /** Configuration for the soft remove operation (explicit soft delete) */
  softRemove?: CrudServiceFunctionStructure<EntityType>;
  /** Configuration for the hard remove operation (permanent delete) */
  hardRemove?: CrudServiceFunctionStructure<EntityType>;
  /** Configuration for the recover operation (restore soft-deleted entities) */
  recover?: CrudServiceFunctionStructure<EntityType>;
}

/**
 * Structure definition for configuring a CRUD service.
 * Extends DataServiceStructure with additional input types and CRUD-specific function configurations.
 *
 * @template IdType - The type of the entity's identifier
 * @template EntityType - The entity type this service operates on
 * @template CreateInputType - The input type for create operations
 * @template UpdateInputType - The input type for update operations
 * @template FindArgsType - The type for find operation arguments
 * @template ContextType - The context type for operations
 */
export interface CrudServiceStructure<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  CreateInputType extends DeepPartial<EntityType>,
  UpdateInputType extends DeepPartial<EntityType>,
  FindArgsType extends FindArgs<EntityType> = FindArgs<EntityType>,
  ContextType extends Context = Context,
> extends DataServiceStructure<IdType, EntityType, FindArgsType, ContextType> {
  /** Constructor for the create input type */
  createInputType: Constructable<CreateInputType>;
  /** Constructor for the update input type */
  updateInputType: Constructable<UpdateInputType>;
  /** Optional configuration for CRUD service functions */
  functions?: CrudServiceFunctions<EntityType>;
}
