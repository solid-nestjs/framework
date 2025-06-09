import {
  Context,
  CrudService,
  DeepPartial,
  Entity,
  fillEntityId,
  FindArgs,
  IdTypeFrom,
} from '@solid-nestjs/common';
import { CrudControllerStructure } from './crud-controller-structure.interface';
import {
  ControllerPlugin,
  ExtractOptionsFromControllerPluginArray,
  ExtractServiceAddOnsFromControllerPluginArray,
} from './service-plugins.interface';

export function CrudControllerStructureEx<
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
  FindArgsType extends FindArgs<EntityType>,
  ContextType extends Context,
  PluginArrayType extends ControllerPlugin<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    FindArgsType,
    ContextType
  >[] = [],
>(
  input: CrudControllerStructure<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    ServiceType &
      ExtractServiceAddOnsFromControllerPluginArray<PluginArrayType>,
    FindArgsType,
    ContextType
  > & {
    plugins?: PluginArrayType;
  } & ExtractOptionsFromControllerPluginArray<PluginArrayType>,
): CrudControllerStructure<
  IdType,
  EntityType,
  CreateInputType,
  UpdateInputType,
  ServiceType & ExtractServiceAddOnsFromControllerPluginArray<PluginArrayType>,
  FindArgsType,
  ContextType
> & {
  plugins?: PluginArrayType;
} & ExtractOptionsFromControllerPluginArray<PluginArrayType> {
  fillEntityId(input);

  return input;
}
