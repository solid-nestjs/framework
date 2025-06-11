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

export interface HW2ServicePluginOptions {
  hwMessage2?: string;
}
export interface HW2DataServicePluginAddOn {
  saySimpleHello2(): string;
  saySimpleBye2(): string;
}

export interface HW2CrudServicePluginAddOn<
  IdType,
  CreateInputType,
  UpdateInputType,
> {
  sayHelloToCreate2(input: CreateInputType): string;
  sayByeToUpdate2(id: IdType, input: UpdateInputType): string;
}

export function helloWorld2ServicePlugin<
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
    HW2ServicePluginOptions,
    {},
    HW2DataServicePluginAddOn,
    HW2CrudServicePluginAddOn<IdType, CreateInputType, UpdateInputType>
  > = {
    applyCrudServiceClass(serviceClass, structure) {
      const msg = structure.hwMessage2 ?? 'world';

      class ServiceClassWithAddOn
        extends serviceClass
        implements
          HW2CrudServicePluginAddOn<IdType, CreateInputType, UpdateInputType>
      {
        saySimpleHello2(): string {
          return `hello ${msg}`;
        }
        saySimpleBye2(): string {
          return `bye ${msg}`;
        }
        sayHelloToCreate2(input: CreateInputType): string {
          return `hello ${msg}, ${JSON.stringify(input)}`;
        }
        sayByeToUpdate2(id: IdType, input: UpdateInputType): string {
          return `bye ${msg}, id:${id},${JSON.stringify(input)}`;
        }
      }

      return ServiceClassWithAddOn;
    },
  };

  return plugin;
}
