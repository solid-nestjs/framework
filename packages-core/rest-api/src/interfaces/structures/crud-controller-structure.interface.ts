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
  create?: OperationStructure | boolean;
  update?: OperationStructure | boolean;
  remove?: OperationStructure | boolean;
  softRemove?: ServiceType extends SoftDeletableCrudService<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    ContextType
  >
    ? OperationStructure | boolean
    : never;
  recover?: ServiceType extends SoftDeletableCrudService<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    ContextType
  >
    ? OperationStructure | boolean
    : never;
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
  createInputType: Constructable<CreateInputType>;
  updateInputType: Constructable<UpdateInputType>;
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
