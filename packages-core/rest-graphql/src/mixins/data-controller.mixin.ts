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
  DataController,
  DataControllerStructure,
  DataControllerFrom as RestDataControllerFrom,
} from '@solid-nestjs/rest-api';
import { DefaultArgs } from '../classes';

/**
 * Generates a NestJS controller class for a given entity, service, and context,
 * providing standard RESTful endpoints for data access and manipulation.
 *
 * This mixin function dynamically creates a controller with endpoints for:
 * - Listing all entities (`findAll`)
 * - Paginated listing (`pagination`)
 * - Paginated list with data and pagination info (`findAllPaginated`)
 * - Retrieving a single entity by ID (`findOne`)
 *
 * The generated controller is decorated with OpenAPI/Swagger decorators for API documentation,
 * and supports custom decorators, pipes, and operation settings via the `controllerStructure` parameter.
 *
 * Disabled operations (set to `false` in `controllerStructure.operations`) are omitted from the controller.
 *
 * @param controllerStructure - Configuration object specifying entity, service, decorators,
 *   operation settings, and other controller customizations.
 *
 * @returns A NestJS controller class (as a mixin) with the specified endpoints and configuration.
 */
export function DataControllerFrom<
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
  controllerStructure: DataControllerStructure<
    IdType,
    EntityType,
    ServiceType,
    FindArgsType,
    ContextType
  >,
): Type<
  DataController<IdType, EntityType, ServiceType, FindArgsType, ContextType>
> {
  const { findArgsType } = controllerStructure;

  const argsType =
    findArgsType ?? (DefaultArgs<EntityType> as Constructable<FindArgsType>);

  return RestDataControllerFrom<
    IdType,
    EntityType,
    ServiceType,
    FindArgsType,
    ContextType
  >({ ...controllerStructure, findArgsType: argsType });
}
