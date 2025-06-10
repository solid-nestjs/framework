import { mixin, Type } from '@nestjs/common';
import {
  Constructable,
  Context,
  DataService,
  DeepPartial,
  Entity,
  FindArgs,
  IdTypeFrom,
} from '@solid-nestjs/common';
import {
  ResolverPlugin,
  DataResolver,
  DataResolverStructure,
  ExtractDataAddOnsFromResolverPluginArray,
  ExtractDataOptionsFromResolverPluginArray,
  ExtractDataServiceAddOnsFromResolverPluginArray,
} from '../interfaces';
import { DefaultArgs } from '../classes';
import { DataResolverFrom } from './data-resolver.mixin';

export function DataResolverExFrom<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  ServiceType extends DataService<
    IdType,
    EntityType,
    FindArgsType,
    ContextType
  >,
  FindArgsType extends FindArgs<EntityType> = DefaultArgs<EntityType>,
  ContextType extends Context = Context,
  PluginArrayType extends ResolverPlugin<
    IdType,
    EntityType,
    DeepPartial<EntityType>,
    DeepPartial<EntityType>,
    FindArgsType,
    ContextType
  >[] = [],
>(
  resolverStructure: DataResolverStructure<
    IdType,
    EntityType,
    ServiceType &
      ExtractDataServiceAddOnsFromResolverPluginArray<PluginArrayType>,
    FindArgsType,
    ContextType
  > & {
    plugins?: PluginArrayType;
  } & ExtractDataOptionsFromResolverPluginArray<PluginArrayType>,
): Type<
  DataResolver<
    IdType,
    EntityType,
    ServiceType &
      ExtractDataServiceAddOnsFromResolverPluginArray<PluginArrayType>,
    FindArgsType,
    ContextType
  > &
    ExtractDataAddOnsFromResolverPluginArray<PluginArrayType>
> {
  if (resolverStructure.plugins && resolverStructure.plugins.length > 0) {
    resolverStructure.plugins.forEach(element => {
      if (element.applyDataResolverStructure)
        element.applyDataResolverStructure(resolverStructure);
    });
  }

  let resolverClass = DataResolverFrom(resolverStructure) as Constructable<any>;

  if (resolverStructure.plugins && resolverStructure.plugins.length > 0) {
    resolverStructure.plugins.forEach(element => {
      if (element.applyDataResolverClass)
        resolverClass = element.applyDataResolverClass(
          resolverClass,
          resolverStructure,
        );
    });
  }

  return mixin(resolverClass);
}
