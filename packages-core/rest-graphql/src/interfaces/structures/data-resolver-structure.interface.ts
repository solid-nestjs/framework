import {
  Context,
  IdTypeFrom,
  Entity,
  FindArgs,
  DataService,
  EntityProviderStructure,
  Constructable,
} from '@solid-nestjs/common';
import {
  fillEntityId,
  DataResolverStructure as gDataResolverStructure,
} from '@solid-nestjs/graphql';

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
  ServiceType extends DataService<
    IdType,
    EntityType,
    FindArgsType,
    ContextType
  >,
  FindArgsType extends FindArgs<EntityType>,
  ContextType extends Context,
>(
  input: gDataResolverStructure<
    IdType,
    EntityType,
    ServiceType,
    FindArgsType,
    ContextType
  >,
): gDataResolverStructure<
  IdType,
  EntityType,
  ServiceType,
  FindArgsType,
  ContextType
> {
  fillEntityId(input);

  return input;
}
