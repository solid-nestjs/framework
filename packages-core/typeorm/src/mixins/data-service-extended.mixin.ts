import { mixin, Type } from '@nestjs/common';
import {
  Constructable,
  Context,
  DataService,
  DeepPartial,
  Entity,
  ExtractDataAddOnsFromServicePluginArray,
  ExtractDataOptionsFromServicePluginArray,
  FindArgs,
  IdTypeFrom,
  ServicePlugin,
} from '@solid-nestjs/common';
import { DataServiceStructure } from '../interfaces';
import { DataServiceFrom } from './data-service.mixin';

export function DataServiceExFrom<
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
    ContextType
  >[] = [],
>(
  serviceStructure: DataServiceStructure<
    IdType,
    EntityType,
    FindArgsType,
    ContextType
  > & {
    plugins?: PluginArrayType;
  } & ExtractDataOptionsFromServicePluginArray<PluginArrayType>,
): Type<
  DataService<IdType, EntityType, FindArgsType, ContextType> &
    ExtractDataAddOnsFromServicePluginArray<PluginArrayType>
> {
  if (serviceStructure.plugins && serviceStructure.plugins.length > 0) {
    serviceStructure.plugins.forEach(element => {
      if (element.applyDataServiceStructure)
        element.applyDataServiceStructure(serviceStructure);
    });
  }

  let serviceClass = DataServiceFrom(serviceStructure) as Constructable<any>;

  if (serviceStructure.plugins && serviceStructure.plugins.length > 0) {
    serviceStructure.plugins.forEach(element => {
      if (element.applyDataServiceClass)
        serviceClass = element.applyDataServiceClass(
          serviceClass,
          serviceStructure,
        );
    });
  }

  return mixin(serviceClass);
}
