import {
  Context,
  DataService,
  DeepPartial,
  Entity,
  fillEntityId,
  FindArgs,
  IdTypeFrom,
} from '@solid-nestjs/common';
import { DataControllerStructure } from './data-controller-structure.interface';
import {
  ControllerPlugin,
  ExtractDataOptionsFromControllerPluginArray,
  ExtractDataServiceAddOnsFromControllerPluginArray,
} from './service-plugins.interface';

export function DataControllerStructureEx<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  ServiceType extends DataService<
    IdType,
    EntityType,
    FindArgsType,
    ContextType
  >,
  FindArgsType extends FindArgs<EntityType>,
  ContextType extends Context,
  PluginArrayType extends ControllerPlugin<
    IdType,
    EntityType,
    DeepPartial<EntityType>,
    DeepPartial<EntityType>,
    FindArgsType,
    ContextType
  >[] = [],
>(
  input: DataControllerStructure<
    IdType,
    EntityType,
    ServiceType &
      ExtractDataServiceAddOnsFromControllerPluginArray<PluginArrayType>,
    FindArgsType,
    ContextType
  > & {
    plugins?: PluginArrayType;
  } & ExtractDataOptionsFromControllerPluginArray<PluginArrayType>,
): DataControllerStructure<
  IdType,
  EntityType,
  ServiceType &
    ExtractDataServiceAddOnsFromControllerPluginArray<PluginArrayType>,
  FindArgsType,
  ContextType
> & {
  plugins?: PluginArrayType;
} & ExtractDataOptionsFromControllerPluginArray<PluginArrayType> {
  fillEntityId(input);

  return input;
}
