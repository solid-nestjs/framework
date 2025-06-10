import { mixin, Type } from '@nestjs/common';
import {
  Context,
  IdTypeFrom,
  Entity,
  FindArgs,
  CrudService,
  DeepPartial,
  Constructable,
} from '@solid-nestjs/common';
import {
  ResolverPlugin,
  CrudResolver,
  CrudResolverStructure,
  ExtractAddOnsFromResolverPluginArray,
  ExtractOptionsFromResolverPluginArray,
  ExtractServiceAddOnsFromResolverPluginArray,
} from '../interfaces';
import { DefaultArgs } from '../classes';
import { CrudResolverFrom } from './crud-resolver.mixin';

export function CrudResolverExFrom<
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
  FindArgsType extends FindArgs<EntityType> = DefaultArgs<EntityType>,
  ContextType extends Context = Context,
  PluginArrayType extends ResolverPlugin<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    FindArgsType,
    ContextType
  >[] = [],
>(
  resolverStructure: CrudResolverStructure<
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
): Type<
  CrudResolver<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    ServiceType & ExtractServiceAddOnsFromResolverPluginArray<PluginArrayType>,
    FindArgsType,
    ContextType
  > &
    ExtractAddOnsFromResolverPluginArray<PluginArrayType>
> {
  if (resolverStructure.plugins && resolverStructure.plugins.length > 0) {
    resolverStructure.plugins.forEach(element => {
      if (element.applyDataResolverStructure)
        element.applyDataResolverStructure(resolverStructure);
      if (element.applyCrudResolverStructure)
        element.applyCrudResolverStructure(resolverStructure);
    });
  }

  let resolverClass = CrudResolverFrom(resolverStructure) as Constructable<any>;

  if (resolverStructure.plugins && resolverStructure.plugins.length > 0) {
    resolverStructure.plugins.forEach(element => {
      if (element.applyDataResolverClass)
        resolverClass = element.applyDataResolverClass(
          resolverClass,
          resolverStructure,
        );
      if (element.applyCrudResolverClass)
        resolverClass = element.applyCrudResolverClass(
          resolverClass,
          resolverStructure,
        );
    });
  }

  return mixin(resolverClass);
}
