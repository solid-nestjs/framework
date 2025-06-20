import { Type } from '@nestjs/common';
import {
  Context,
  IdTypeFrom,
  Entity,
  FindArgs,
  CrudService,
  DeepPartial,
  Constructable,
} from '@solid-nestjs/common';
import {
  CrudResolver,
  CrudResolverStructure,
  CrudResolverFrom as GraphCrudResolverFrom,
} from '@solid-nestjs/graphql';
import { DefaultArgs } from '../classes';

/**
 * Generates a CRUD GraphQL resolver class based on the provided resolver structure.
 *
 * This mixin function dynamically creates a resolver class with standard CRUD operations
 * (create, update, remove, hardRemove) for a given entity type, using the provided service
 * and input types. The generated resolver methods are decorated with appropriate GraphQL
 * decorators and can be customized or disabled via the `resolverStructure` parameter.
 *
 * @template IdType - The type of the entity's identifier.
 * @template EntityType - The entity type managed by the resolver.
 * @template CreateInputType - The input type for creating a new entity.
 * @template UpdateInputType - The input type for updating an existing entity.
 * @template ServiceType - The service type providing CRUD operations.
 * @template FindArgsType - The type for find/query arguments (defaults to `DefaultArgs<EntityType>`).
 * @template ContextType - The context type for the resolver (defaults to `Context`).
 *
 * @param resolverStructure - An object describing the entity, input types, service, and operation settings.
 *   - `entityType`: The GraphQL object type for the entity.
 *   - `createInputType`: The GraphQL input type for creation.
 *   - `updateInputType`: The GraphQL input type for updates.
 *   - `service`: The service instance providing CRUD methods.
 *   - `operations`: Optional configuration to enable/disable or customize CRUD operations.
 *   - `entityId`: Optional configuration for the entity's ID type and transformation pipes.
 *   - `parameterDecorators`: Optional custom parameter decorators.
 *
 * @returns A mixin class extending a base data resolver, with CRUD GraphQL mutations as methods.
 *
 * @example
 * ```typescript
 * const UserCrudResolver = CrudResolverFrom({
 *   entityType: UserType,
 *   createInputType: CreateUserInput,
 *   updateInputType: UpdateUserInput,
 *   service: userService,
 *   operations: { create: true, update: true, remove: true }
 * });
 * ```
 */
export function CrudResolverFrom<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  CreateInputType extends DeepPartial<EntityType>,
  UpdateInputType extends DeepPartial<EntityType>,
  ServiceType extends CrudService<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    FindArgsType,
    ContextType
  >,
  FindArgsType extends FindArgs<EntityType> = DefaultArgs<EntityType>,
  ContextType extends Context = Context,
>(
  resolverStructure: CrudResolverStructure<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    ServiceType,
    FindArgsType,
    ContextType
  >,
): Type<
  CrudResolver<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    ServiceType,
    FindArgsType,
    ContextType
  >
> {
  const { findArgsType } = resolverStructure;

  const argsType =
    findArgsType ?? (DefaultArgs<EntityType> as Constructable<FindArgsType>);

  return GraphCrudResolverFrom<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    ServiceType,
    FindArgsType,
    ContextType
  >({ ...resolverStructure, findArgsType: argsType });
}
