import {
  DeepPartial,
  Entity,
  IdTypeFrom,
  FindArgs,
  Context,
} from '@solid-nestjs/common';
import { ServicePlugin } from '../../interfaces';

export interface HelloWorldPluginOptions<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  CreateInputType extends DeepPartial<EntityType> = DeepPartial<EntityType>,
  UpdateInputType extends DeepPartial<EntityType> = DeepPartial<EntityType>,
  FindArgsType extends FindArgs<EntityType> = FindArgs<EntityType>,
  ContextType extends Context = Context,
> {
  hwMessage?: string;
}
export interface SimpleHelloWorldPluginAddOn {
  saySimpleHello(): string;
  saySimpleBye(): string;
}

export interface HelloWorldPluginAddOn<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  CreateInputType extends DeepPartial<EntityType>,
  UpdateInputType extends DeepPartial<EntityType>,
  FindArgsType extends FindArgs<EntityType> = FindArgs<EntityType>,
  ContextType extends Context = Context,
> {
  sayHelloToCreate(input: CreateInputType): string;
  sayByeToUpdate(input: UpdateInputType): string;
}

export function helloWorldPlugin<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  CreateInputType extends DeepPartial<EntityType> = DeepPartial<EntityType>,
  UpdateInputType extends DeepPartial<EntityType> = DeepPartial<EntityType>,
  FindArgsType extends FindArgs<EntityType> = FindArgs<EntityType>,
  ContextType extends Context = Context,
>() {
  const plugin: ServicePlugin<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    FindArgsType,
    ContextType,
    HelloWorldPluginOptions<
      IdType,
      EntityType,
      CreateInputType,
      UpdateInputType,
      FindArgsType,
      ContextType
    >,
    {},
    SimpleHelloWorldPluginAddOn,
    HelloWorldPluginAddOn<
      IdType,
      EntityType,
      CreateInputType,
      UpdateInputType,
      FindArgsType,
      ContextType
    >
  > = {
    applyCrudServiceClass(serviceClass, structure) {
      const msg = structure.hwMessage ?? 'world';

      class ServiceClassWithAddOn
        extends serviceClass
        implements
          HelloWorldPluginAddOn<
            IdType,
            EntityType,
            CreateInputType,
            UpdateInputType,
            FindArgsType,
            ContextType
          >
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
