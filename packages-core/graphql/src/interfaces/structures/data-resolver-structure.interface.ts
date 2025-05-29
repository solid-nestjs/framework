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
  name: string;
  title?: string;
  description?: string;
  decorators?: (() => MethodDecorator)[];
}

export interface ParameterDecorators {
  context: () => ParameterDecorator;
}

export interface DataResolverOperations<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  ServiceType extends DataService<IdType, EntityType, ContextType>,
  FindArgsType extends FindArgs<EntityType>,
  ContextType extends Context,
> {
  findAll?: OperationStructure | boolean;
  pagination?: OperationStructure | boolean;
  findOne?: OperationStructure | boolean;
}

export interface DataResolverStructure<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  ServiceType extends DataService<IdType, EntityType, ContextType>,
  FindArgsType extends FindArgs<EntityType>,
  ContextType extends Context,
> extends EntityProviderStructure<IdType, EntityType> {
  serviceType: Constructable<ServiceType>;
  findArgsType?: Constructable<FindArgsType>;
  contextType?: Constructable<ContextType>;
  operations?: DataResolverOperations<
    IdType,
    EntityType,
    ServiceType,
    FindArgsType,
    ContextType
  >;
  parameterDecorators?: ParameterDecorators;
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
