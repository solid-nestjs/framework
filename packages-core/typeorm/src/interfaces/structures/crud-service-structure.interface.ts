import { DeepPartial } from 'typeorm';
import { IsolationLevel } from 'typeorm/driver/types/IsolationLevel';
import {
  CommonCrudServiceFunctionStructure,
  Constructable,
  Entity,
  fillEntityId,
  FindArgs,
  IdTypeFrom,
} from '@solid-nestjs/common';
import { Context } from '../misc';
import {
  DataServiceFunctions,
  DataServiceStructure,
} from './data-service-structure.interface';

/**
 * Configuration structure for individual CRUD service functions.
 * Provides transaction support, isolation levels, and method decorators.
 *
 * @template EntityType - The entity type this function operates on
 */
export interface CrudServiceFunctionStructure<EntityType>
  extends CommonCrudServiceFunctionStructure<EntityType> {
  /** Whether the function should run within a database transaction */
  transactional?: boolean;
  /** Database isolation level for the transaction */
  isolationLevel?: IsolationLevel;
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

  // Bulk Operations
  /** Configuration for bulk insert operations */
  bulkInsert?: CrudServiceFunctionStructure<EntityType>;
  /** Configuration for bulk update operations */
  bulkUpdate?: CrudServiceFunctionStructure<EntityType>;
  /** Configuration for bulk delete operations */
  bulkDelete?: CrudServiceFunctionStructure<EntityType>;
  /** Configuration for bulk remove operations */
  bulkRemove?: CrudServiceFunctionStructure<EntityType>;
  /** Configuration for bulk recover operations */
  bulkRecover?: CrudServiceFunctionStructure<EntityType>;
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

/**
 * Factory function that initializes and returns a `CrudServiceStructure` object.
 *
 * This function ensures that the entity ID is properly filled in the input structure
 * and provides strong typing for all CRUD service configuration parameters.
 *
 * @template IdType - The type of the entity's identifier
 * @template EntityType - The entity type this service operates on
 * @template CreateInputType - The input type for create operations
 * @template UpdateInputType - The input type for update operations
 * @template FindArgsType - The type for find operation arguments
 * @template ContextType - The context type for operations
 *
 * @param input - The CRUD service structure configuration to initialize
 * @returns The initialized CRUD service structure with entity ID filled
 *
 * @example
 * ```typescript
 * const userServiceStructure = CrudServiceStructure({
 *   entityType: User,
 *   createInputType: CreateUserDto,
 *   updateInputType: UpdateUserDto,
 *   functions: {
 *     create: { transactional: true, isolationLevel: 'READ_COMMITTED' },
 *     update: { transactional: true },
 *     remove: { transactional: true },
 *     bulkInsert: { transactional: true, decorators: [() => UseGuards(AdminGuard)] }
 *   }
 * });
 * ```
 */
export function CrudServiceStructure<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  CreateInputType extends DeepPartial<EntityType>,
  UpdateInputType extends DeepPartial<EntityType>,
  FindArgsType extends FindArgs<EntityType> = FindArgs<EntityType>,
  ContextType extends Context = Context,
>(
  input: CrudServiceStructure<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    FindArgsType,
    ContextType
  >,
): CrudServiceStructure<
  IdType,
  EntityType,
  CreateInputType,
  UpdateInputType,
  FindArgsType,
  ContextType
> {
  fillEntityId(input);

  return input;
}
