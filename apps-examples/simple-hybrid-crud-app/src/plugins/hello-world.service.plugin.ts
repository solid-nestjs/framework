import {
  DeepPartial,
  Entity,
  IdTypeFrom,
  FindArgs,
  Context,
  ServicePlugin,
  DataProviderStructure,
  CrudProviderStructure,
} from '@solid-nestjs/common';

export interface HWServicePluginOptions {
  hwMessage?: string;
}
export interface HWDataServicePluginAddOn {
  saySimpleHello(): string;
  saySimpleBye(): string;
}

export interface HWCrudServicePluginAddOn<
  IdType,
  CreateInputType,
  UpdateInputType,
> {
  sayHelloToCreate(input: CreateInputType): string;
  sayByeToUpdate(id: IdType, input: UpdateInputType): string;
}

export function helloWorldServicePlugin<
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
  const plugin: ServicePlugin<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    FindArgsType,
    ContextType,
    HWServicePluginOptions,
    {},
    HWDataServicePluginAddOn,
    HWCrudServicePluginAddOn<IdType, CreateInputType, UpdateInputType>
  > = {
    applyDataServiceClass(serviceClass, structure) {
      const msg = structure.hwMessage ?? 'world';

      class ServiceClassWithAddOn
        extends serviceClass
        implements HWDataServicePluginAddOn
      {
        saySimpleHello(): string {
          return `hello ${msg}`;
        }
        saySimpleBye(): string {
          return `bye ${msg}`;
        }
      }

      return ServiceClassWithAddOn;
    },

    applyCrudServiceClass(serviceClass, structure) {
      const msg = structure.hwMessage ?? 'world';

      class ServiceClassWithAddOn
        extends serviceClass
        implements
          HWCrudServicePluginAddOn<IdType, CreateInputType, UpdateInputType>
      {
        sayHelloToCreate(input: CreateInputType): string {
          return `hello ${msg}, ${JSON.stringify(input)}`;
        }
        sayByeToUpdate(id: IdType, input: UpdateInputType): string {
          return `bye ${msg}, id:${id},${JSON.stringify(input)}`;
        }
      }

      return ServiceClassWithAddOn;
    },
  };

  return plugin;
}
