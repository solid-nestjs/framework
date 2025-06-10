import {
  Context,
  CrudService,
  DeepPartial,
  Entity,
  fillEntityId,
  FindArgs,
  IdTypeFrom,
} from '@solid-nestjs/common';
import { CrudResolverStructure } from './crud-resolver-structure.interface';
import {
  ResolverPlugin,
  ExtractOptionsFromResolverPluginArray,
  ExtractServiceAddOnsFromResolverPluginArray,
} from './plugins.interface';

export function CrudResolverStructureEx<
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
  PluginArrayType extends ResolverPlugin<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    FindArgsType,
    ContextType
  >[] = [],
>(
  input: CrudResolverStructure<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    ServiceType & ExtractServiceAddOnsFromResolverPluginArray<PluginArrayType>,
    FindArgsType,
    ContextType
  > & {
    plugins?: PluginArrayType;
  } & ExtractOptionsFromResolverPluginArray<PluginArrayType>,
): CrudResolverStructure<
  IdType,
  EntityType,
  CreateInputType,
  UpdateInputType,
  ServiceType & ExtractServiceAddOnsFromResolverPluginArray<PluginArrayType>,
  FindArgsType,
  ContextType
> & {
  plugins?: PluginArrayType;
} & ExtractOptionsFromResolverPluginArray<PluginArrayType> {
  fillEntityId(input);

  return input;
}
