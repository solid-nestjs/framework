import {
  Context,
  DataService,
  DeepPartial,
  Entity,
  fillEntityId,
  FindArgs,
  IdTypeFrom,
} from '@solid-nestjs/common';
import { DataResolverStructure } from './data-resolver-structure.interface';
import {
  ResolverPlugin,
  ExtractDataOptionsFromResolverPluginArray,
  ExtractDataServiceAddOnsFromResolverPluginArray,
} from './plugins.interface';

export function DataResolverStructureEx<
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
  PluginArrayType extends ResolverPlugin<
    IdType,
    EntityType,
    DeepPartial<EntityType>,
    DeepPartial<EntityType>,
    FindArgsType,
    ContextType
  >[] = [],
>(
  input: DataResolverStructure<
    IdType,
    EntityType,
    ServiceType &
      ExtractDataServiceAddOnsFromResolverPluginArray<PluginArrayType>,
    FindArgsType,
    ContextType
  > & {
    plugins?: PluginArrayType;
  } & ExtractDataOptionsFromResolverPluginArray<PluginArrayType>,
): DataResolverStructure<
  IdType,
  EntityType,
  ServiceType &
    ExtractDataServiceAddOnsFromResolverPluginArray<PluginArrayType>,
  FindArgsType,
  ContextType
> & {
  plugins?: PluginArrayType;
} & ExtractDataOptionsFromResolverPluginArray<PluginArrayType> {
  fillEntityId(input);

  return input;
}
