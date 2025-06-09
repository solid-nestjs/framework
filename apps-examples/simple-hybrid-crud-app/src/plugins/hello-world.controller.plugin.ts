import { Get } from '@nestjs/common';
import {
  Context,
  ControllerPlugin,
  CrudProviderStructure,
  DataProviderStructure,
  DeepPartial,
  Entity,
  FindArgs,
  IdTypeFrom,
} from '@solid-nestjs/typeorm-hybrid-crud';

export interface HelloWorldServicePluginAddOn {
  saySimpleHello(): string;
  saySimpleBye(): string;
}

export interface HelloWorldControllerPluginAddOn {
  saySimpleHello(): Promise<string>;
  saySimpleBye(): Promise<string>;
}

export function helloWorldControllerPlugin<
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
  const plugin: ControllerPlugin<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    FindArgsType,
    ContextType,
    HelloWorldServicePluginAddOn,
    {},
    {},
    {},
    HelloWorldControllerPluginAddOn,
    {}
  > = {
    applyDataControllerClass(controllerClass, structure) {
      class ControllerClassWithAddOn
        extends controllerClass
        implements HelloWorldControllerPluginAddOn
      {
        @Get('say/bye')
        async saySimpleBye(): Promise<string> {
          return this.service.saySimpleBye();
        }

        @Get('say/hello')
        async saySimpleHello(): Promise<string> {
          return this.service.saySimpleHello();
        }
      }

      return ControllerClassWithAddOn;
    },
  };

  return plugin;
}
