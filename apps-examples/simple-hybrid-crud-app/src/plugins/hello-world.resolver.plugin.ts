import {
  ParseIntPipe,
  PipeTransform,
  Type,
  ValidationPipe,
} from '@nestjs/common';
import {
  extractOperationSettings,
  OperationStructure,
} from '@solid-nestjs/graphql';
import {
  Context,
  ResolverPlugin,
  CrudProviderStructure,
  DataProviderStructure,
  DeepPartial,
  Entity,
  FindArgs,
  IdTypeFrom,
  applyMethodDecoratorsIf,
} from '@solid-nestjs/typeorm-hybrid-crud';
import {
  HWCrudServicePluginAddOn,
  HWDataServicePluginAddOn,
} from './hello-world.service.plugin';
import { Args, Query } from '@nestjs/graphql';

export interface HWDataResolverPluginAddOn {
  saySimpleHello?(): Promise<string>;
  saySimpleBye?(): Promise<string>;
}

export interface HWCrudResolverPluginAddOn<
  IdType,
  CreateInputType,
  UpdateInputType,
> {
  sayHelloToCreate?(input: CreateInputType): Promise<string>;
  sayByeToUpdate?(id: IdType, input: UpdateInputType): Promise<string>;
}

export interface HWDataResolverOptions {
  operations?: {
    saySimpleHello?: OperationStructure | boolean;
    saySimpleBye?: OperationStructure | boolean;
  };
}

export interface HWCrudResolverOptions {
  operations?: {
    sayHelloToCreate?: OperationStructure | boolean;
    sayByeToUpdate?: OperationStructure | boolean;
  };
}

export function helloWorldResolverPlugin<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  CreateInputType extends DeepPartial<EntityType> = DeepPartial<EntityType>,
  UpdateInputType extends DeepPartial<EntityType> = DeepPartial<EntityType>,
  FindArgsType extends FindArgs<EntityType> = FindArgs<EntityType>,
  ContextType extends Context = Context,
>(
  structure:
    | DataProviderStructure<IdType, EntityType, FindArgsType, ContextType>
    | CrudProviderStructure<
        IdType,
        EntityType,
        CreateInputType,
        UpdateInputType,
        FindArgsType,
        ContextType
      >,
) {
  const plugin: ResolverPlugin<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    FindArgsType,
    ContextType,
    HWDataServicePluginAddOn,
    HWCrudServicePluginAddOn<IdType, CreateInputType, UpdateInputType>,
    HWDataResolverOptions,
    HWCrudResolverOptions,
    HWDataResolverPluginAddOn,
    HWCrudResolverPluginAddOn<IdType, CreateInputType, UpdateInputType>
  > = {
    applyDataResolverClass(resolverClass, structure) {
      const { entityType } = structure;

      const sayHelloSettings = extractOperationSettings(
        structure.operations?.saySimpleHello,
        {
          disabled: structure.operations?.saySimpleHello === false,
          name: 'sayHelloTo' + entityType.name,
          summary: 'Say Hello to ' + entityType.name,
          description: 'Say Hello',
        },
      );

      const sayByeSettings = extractOperationSettings(
        structure.operations?.saySimpleBye,
        {
          disabled: structure.operations?.saySimpleBye === false,
          name: 'sayByeTo' + entityType.name,
          summary: 'Say Bye',
          description: 'Say Bye',
        },
      );

      class ResolverClassWithAddOn
        extends resolverClass
        implements HWDataResolverPluginAddOn
      {
        @applyMethodDecoratorsIf(!sayHelloSettings.disabled, [
          () =>
            Query(returns => String, {
              name: sayHelloSettings.name,
              description: sayHelloSettings.description,
            }),
          ...sayHelloSettings.decorators,
        ])
        async saySimpleHello?(): Promise<string> {
          return this.service.saySimpleHello();
        }

        @applyMethodDecoratorsIf(!sayByeSettings.disabled, [
          () =>
            Query(returns => String, {
              name: sayByeSettings.name,
              description: sayByeSettings.description,
            }),
          ...sayByeSettings.decorators,
        ])
        async saySimpleBye?(): Promise<string> {
          return this.service.saySimpleBye();
        }
      }

      if (sayHelloSettings.disabled) {
        delete ResolverClassWithAddOn.prototype.saySimpleHello;
      }
      if (sayByeSettings.disabled) {
        delete ResolverClassWithAddOn.prototype.saySimpleBye;
      }

      return ResolverClassWithAddOn;
    },

    applyCrudResolverClass(resolverClass, structure) {
      const { entityType, createInputType, updateInputType } = structure;

      let idType: any = Number;
      let pipeTransforms: Type<PipeTransform>[] = [ParseIntPipe];

      if (structure.entityId) {
        idType = structure.entityId.type;
        pipeTransforms = structure.entityId.pipeTransforms ?? [];
      }

      const sayHelloSettings = extractOperationSettings(
        structure.operations?.sayHelloToCreate,
        {
          disabled: structure.operations?.sayHelloToCreate === false,
          name: 'sayHelloToCreate' + entityType.name,
          summary: 'say Hello to create ' + entityType.name.toLowerCase(),
          description: 'say Hello to create ' + entityType.name.toLowerCase(),
        },
      );

      const sayByeSettings = extractOperationSettings(
        structure.operations?.sayByeToUpdate,
        {
          disabled: structure.operations?.sayByeToUpdate === false,
          name: 'sayByeToUpdate' + entityType.name,
          summary: 'say Bye to update ' + entityType.name.toLowerCase(),
          description: 'say Bye to update ' + entityType.name.toLowerCase(),
        },
      );

      class ResolverClassWithAddOn
        extends resolverClass
        implements
          HWCrudResolverPluginAddOn<IdType, CreateInputType, UpdateInputType>
      {
        @applyMethodDecoratorsIf(!sayHelloSettings.disabled, [
          () =>
            Query(returns => String, {
              name: sayHelloSettings.name,
              description: sayHelloSettings.description,
            }),
          ...sayHelloSettings.decorators,
        ])
        async sayHelloToCreate?(
          @Args(
            {
              type: () => createInputType,
              name: 'createInput',
            },
            new ValidationPipe({
              transform: true,
              expectedType: createInputType,
              whitelist: true,
              forbidNonWhitelisted: true,
              forbidUnknownValues: true,
            }),
          )
          input: CreateInputType,
        ): Promise<string> {
          return this.service.sayHelloToCreate(input);
        }

        @applyMethodDecoratorsIf(!sayByeSettings.disabled, [
          () =>
            Query(returns => String, {
              name: sayByeSettings.name,
              description: sayByeSettings.description,
            }),
          ...sayByeSettings.decorators,
        ])
        async sayByeToUpdate?(
          @Args('id', { type: () => idType }, ...pipeTransforms) id: IdType,
          @Args(
            {
              type: () => updateInputType,
              name: 'updateInput',
            },
            new ValidationPipe({
              transform: true,
              expectedType: updateInputType,
              whitelist: true,
              forbidNonWhitelisted: true,
              forbidUnknownValues: true,
            }),
          )
          input: UpdateInputType,
        ): Promise<string> {
          return this.service.sayByeToUpdate(id, input);
        }
      }

      if (sayHelloSettings.disabled) {
        delete ResolverClassWithAddOn.prototype.sayHelloToCreate;
      }
      if (sayByeSettings.disabled) {
        delete ResolverClassWithAddOn.prototype.sayByeToUpdate;
      }

      return ResolverClassWithAddOn;
    },
  };

  return plugin;
}
