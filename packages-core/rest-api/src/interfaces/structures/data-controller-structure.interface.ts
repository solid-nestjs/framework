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
} from '@solid-nestjs/common';

export interface OperationStructure {
  name?: string;
  title?: string;
  description?: string;
  route?: string;
  operationId?: string;

  successCode?: HttpStatus;
  successCodes?: HttpStatus[];
  errorCodes?: HttpStatus[];
  decorators?: (() => MethodDecorator)[];
}

export interface ParameterDecorators {
  context: () => ParameterDecorator;
}

export interface DataControllerOperations<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  ServiceType extends DataService<IdType, EntityType, ContextType>,
  FindArgsType extends FindArgs<EntityType>,
  ContextType extends Context,
> {
  findAll?: OperationStructure | boolean;
  findAllPaginated?: OperationStructure | boolean;
  pagination?: OperationStructure | boolean;
  findOne?: OperationStructure | boolean;
}

export interface DataControllerStructure<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  ServiceType extends DataService<IdType, EntityType, ContextType>,
  FindArgsType extends FindArgs<EntityType>,
  ContextType extends Context,
> extends EntityProviderStructure<IdType, EntityType> {
  serviceType: Constructable<ServiceType>;
  findArgsType?: Constructable<FindArgsType>;
  contextType?: Constructable<ContextType>;
  operations?: DataControllerOperations<
    IdType,
    EntityType,
    ServiceType,
    FindArgsType,
    ContextType
  >;
  route?: string;
  parameterDecorators?: ParameterDecorators;
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
  ServiceType extends DataService<IdType, EntityType, ContextType>,
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
