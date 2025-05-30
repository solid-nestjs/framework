import { ParseIntPipe, PipeTransform, Type, mixin } from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';
import {
  Context,
  IdTypeFrom,
  Entity,
  FindArgs,
  CrudService,
  CurrentContext,
  applyMethodDecorators,
  DeepPartial,
  applyMethodDecoratorsIf,
} from '@solid-nestjs/common';
import { CrudResolverStructure } from '../interfaces';
import { DefaultArgs } from '../classes';
import {
  DataResolverFrom,
  extractOperationSettings,
} from './data-resolver.mixin';

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
) {
  const { entityType, createInputType, updateInputType } = resolverStructure;

  const ContextDecorator =
    resolverStructure.parameterDecorators?.context ?? CurrentContext;

  let idType: any = Number;
  let pipeTransforms: Type<PipeTransform>[] = [ParseIntPipe];

  if (resolverStructure.entityId) {
    idType = resolverStructure.entityId.type;
    pipeTransforms = resolverStructure.entityId.pipeTransforms ?? [];
  }

  const createSettings = extractOperationSettings(
    resolverStructure.operations?.create,
    {
      disabled: resolverStructure.operations?.create === false,
      name: 'create' + entityType.name,
      summary: 'Create ' + entityType.name.toLowerCase() + ' record',
      description: 'creation of ' + entityType.name.toLowerCase() + ' record',
    },
  );

  const updateSettings = extractOperationSettings(
    resolverStructure.operations?.update,
    {
      disabled: resolverStructure.operations?.update === false,
      name: 'update' + entityType.name,
      summary: 'Update ' + entityType.name.toLowerCase() + ' record',
      description: 'update of ' + entityType.name.toLowerCase() + ' record',
    },
  );

  const removeSettings = extractOperationSettings(
    resolverStructure.operations?.remove,
    {
      disabled: resolverStructure.operations?.remove === false,
      name: 'remove' + entityType.name,
      summary: 'Remove ' + entityType.name.toLowerCase() + ' record',
      description: 'removal of ' + entityType.name.toLowerCase() + ' record',
    },
  );

  const hardRemoveSettings = extractOperationSettings(
    resolverStructure.operations?.hardRemove,
    {
      disabled: !resolverStructure.operations?.hardRemove,
      name: 'hardRemove' + entityType.name,
      summary: 'Remove (HARD) ' + entityType.name.toLowerCase() + ' record',
      description:
        'removal (HARD) of ' + entityType.name.toLowerCase() + ' record',
    },
  );

  class CrudController extends DataResolverFrom(resolverStructure) {
    @applyMethodDecoratorsIf(!createSettings.disabled, [
      () =>
        Mutation(returns => entityType, {
          name: createSettings.name,
          description: createSettings.description,
        }),
      ...createSettings.decorators,
    ])
    async create?(
      @ContextDecorator() context: ContextType,
      @Args({ type: () => createInputType, name: 'createInput' })
      createInput: CreateInputType,
    ): Promise<EntityType> {
      return this.service.create(context, createInput);
    }

    @applyMethodDecoratorsIf(!updateSettings.disabled, [
      () =>
        Mutation(returns => entityType, {
          name: updateSettings.name,
          description: updateSettings.description,
        }),
      ...updateSettings.decorators,
    ])
    async update?(
      @ContextDecorator() context: ContextType,
      @Args({ type: () => updateInputType, name: 'updateInput' }) updateInput,
    ): Promise<EntityType> {
      return this.service.update(context, updateInput.id, updateInput);
    }

    @applyMethodDecoratorsIf(!removeSettings.disabled, [
      () =>
        Mutation(returns => entityType, {
          name: removeSettings.name,
          description: removeSettings.description,
        }),
      ...removeSettings.decorators,
    ])
    async remove?(
      @ContextDecorator() context: ContextType,
      @Args('id', { type: () => idType }, ...pipeTransforms) id: IdType,
    ): Promise<EntityType> {
      return this.service.remove(context, id);
    }

    @applyMethodDecoratorsIf(!hardRemoveSettings.disabled, [
      () =>
        Mutation(returns => entityType, {
          name: hardRemoveSettings.name,
          description: hardRemoveSettings.description,
        }),
      ...hardRemoveSettings.decorators,
    ])
    async hardRemove?(
      @ContextDecorator() context: ContextType,
      @Args('id', { type: () => idType }, ...pipeTransforms) id: IdType,
    ): Promise<EntityType> {
      return this.service.hardRemove(context, id);
    }
  }

  //remove controller methods if they are disabled in the structure
  if (createSettings.disabled) {
    delete CrudController.prototype.create;
  }
  if (updateSettings.disabled) {
    delete CrudController.prototype.update;
  }
  if (removeSettings.disabled) {
    delete CrudController.prototype.remove;
  }
  if (hardRemoveSettings.disabled) {
    delete CrudController.prototype.hardRemove;
  }

  return mixin(CrudController);
}
