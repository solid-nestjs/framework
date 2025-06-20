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
  CrudController,
  CrudControllerStructure,
  CrudControllerFrom as RestCrudControllerFrom,
} from '@solid-nestjs/rest-api';
import { DefaultArgs } from '../classes';

/**
 * Generates a CRUD controller class based on the provided structure and configuration.
 *
 * This mixin function dynamically creates a controller class with standard CRUD endpoints
 * (`create`, `update`, `remove`, and optionally `hardRemove`) for a given entity type.
 * The generated controller methods are decorated with NestJS and Swagger decorators for
 * routing, validation, and API documentation. Methods can be selectively enabled or disabled
 * via the `controllerStructure.operations` configuration.
 *
 * @param controllerStructure - The configuration object describing the entity, input types,
 *   service, decorators, and operation settings for the controller.
 *
 * @returns A NestJS controller class with CRUD endpoints for the specified entity.
 *
 * @remarks
 * - The `hardRemove` method is disabled by default unless explicitly enabled.
 * - Supports custom parameter decorators and pipe transforms for the entity ID.
 * - Integrates with Swagger for API documentation.
 */
export function CrudControllerFrom<
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
  controllerStructure: CrudControllerStructure<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    ServiceType,
    FindArgsType,
    ContextType
  >,
): Type<
  CrudController<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    ServiceType,
    FindArgsType,
    ContextType
  >
> {
  const { findArgsType } = controllerStructure;

  const argsType =
    findArgsType ?? (DefaultArgs<EntityType> as Constructable<FindArgsType>);

  return RestCrudControllerFrom<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    ServiceType,
    FindArgsType,
    ContextType
  >({ ...controllerStructure, findArgsType: argsType });
}
