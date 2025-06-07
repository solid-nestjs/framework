import {
  Context,
  Entity,
  fillEntityId,
  FindArgs,
  IdTypeFrom,
  DeepPartial,
} from '@solid-nestjs/common';
import { DataServiceStructure } from './data-service-structure.interface';
import {
  ExtractDataOptionsFromServicePluginArray,
  ServicePlugin,
} from './service-plugins.interface';

export function DataServiceStructureEx<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  FindArgsType extends FindArgs<EntityType> = FindArgs<EntityType>,
  ContextType extends Context = Context,
  PluginArrayType extends ServicePlugin<
    IdType,
    EntityType,
    DeepPartial<EntityType>,
    DeepPartial<EntityType>,
    FindArgsType,
    ContextType,
    {},
    {}
  >[] = [],
>(
  input: DataServiceStructure<IdType, EntityType, FindArgsType, ContextType> & {
    plugins?: PluginArrayType;
  } & ExtractDataOptionsFromServicePluginArray<PluginArrayType>,
): DataServiceStructure<IdType, EntityType, FindArgsType, ContextType> & {
  plugins?: PluginArrayType;
} & ExtractDataOptionsFromServicePluginArray<PluginArrayType> {
  fillEntityId(input);

  return input;
}
