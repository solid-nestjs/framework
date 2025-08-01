import { Type } from '@nestjs/common';
import {
  Context,
  IdTypeFrom,
  Entity,
  FindArgs,
  DataService,
  Constructable,
} from '@solid-nestjs/common';
import {
  DataResolverStructure,
  DataResolver,
  DataResolverFrom as GraphDataResolverFrom,
} from '@solid-nestjs/graphql';
import { DefaultArgs } from '../classes';

/**
 * Generates a NestJS GraphQL resolver class for a given entity, service, and context.
 *
 * This mixin function dynamically creates a resolver with standard CRUD operations
 * (findAll, findOne, pagination) based on the provided configuration structure.
 * It supports custom decorators, argument types, and operation settings.
 *
 * @typeParam IdType - The type of the entity's identifier.
 * @typeParam EntityType - The entity type managed by the resolver.
 * @typeParam ServiceType - The data service type used for data access.
 * @typeParam FindArgsType - The type of arguments accepted for find operations (defaults to `DefaultArgs<EntityType>`).
 * @typeParam ContextType - The context type injected into resolver methods (defaults to `Context`).
 *
 * @param resolverStructure - The configuration object specifying entity, service, argument types,
 * decorators, and enabled operations for the resolver.
 *
 * @returns A NestJS mixin class implementing the configured resolver.
 *
 * @example
 * ```typescript
 * const UserResolver = DataResolverFrom({
 *   entityType: User,
 *   serviceType: UserService,
 *   findArgsType: UserFindArgs,
 *   classDecorators: [SomeDecorator()],
 *   operations: { findAll: true, findOne: true, pagination: false }
 * });
 * ```
 */
export function DataResolverFrom<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  ServiceType extends DataService<
    IdType,
    EntityType,
    FindArgsType,
    ContextType
  >,
  FindArgsType extends FindArgs<EntityType> = DefaultArgs<EntityType>,
  ContextType extends Context = Context,
>(
  resolverStructure: DataResolverStructure<
    IdType,
    EntityType,
    ServiceType,
    FindArgsType,
    ContextType
  >,
): Type<
  DataResolver<IdType, EntityType, ServiceType, FindArgsType, ContextType>
> {
  const { findArgsType } = resolverStructure;

  const argsType =
    findArgsType ?? (DefaultArgs<EntityType> as Constructable<FindArgsType>);

  return GraphDataResolverFrom<
    IdType,
    EntityType,
    ServiceType,
    FindArgsType,
    ContextType
  >({ ...resolverStructure, findArgsType: argsType });
}
