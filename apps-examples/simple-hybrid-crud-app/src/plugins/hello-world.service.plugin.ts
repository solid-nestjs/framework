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

export interface HelloWorldPluginOptions {
  hwMessage?: string;
}
export interface SimpleHelloWorldPluginAddOn {
  saySimpleHello(): string;
  saySimpleBye(): string;
}

export interface HelloWorldPluginAddOn<CreateInputType, UpdateInputType> {
  sayHelloToCreate(input: CreateInputType): string;
  sayByeToUpdate(input: UpdateInputType): string;
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
    HelloWorldPluginOptions,
    {},
    SimpleHelloWorldPluginAddOn,
    HelloWorldPluginAddOn<CreateInputType, UpdateInputType>
  > = {
    applyCrudServiceClass(serviceClass, structure) {
      const msg = structure.hwMessage ?? 'world';

      class ServiceClassWithAddOn
        extends serviceClass
        implements HelloWorldPluginAddOn<CreateInputType, UpdateInputType>
      {
        saySimpleHello(): string {
          return `hello ${msg}`;
        }
        saySimpleBye(): string {
          return `hello ${msg}`;
        }
        sayHelloToCreate(input: CreateInputType): string {
          return `hello ${msg}, ${JSON.stringify(input)}`;
        }
        sayByeToUpdate(input: UpdateInputType): string {
          return `bye ${msg}, ${JSON.stringify(input)}`;
        }
      }

      return ServiceClassWithAddOn;
    },
  };

  return plugin;
}
