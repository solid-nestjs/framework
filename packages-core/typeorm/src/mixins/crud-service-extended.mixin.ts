import { mixin, Type } from '@nestjs/common';
import {
  Constructable,
  Context,
  CrudService,
  DeepPartial,
  Entity,
  ExtractAddOnsFromServicePluginArray,
  ExtractOptionsFromServicePluginArray,
  FindArgs,
  IdTypeFrom,
  ServicePlugin,
} from '@solid-nestjs/common';
import { CrudServiceStructure } from '../interfaces';
import { CrudServiceFrom } from './crud-service.mixin';

export function CrudServiceExFrom<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  CreateInputType extends DeepPartial<EntityType>,
  UpdateInputType extends DeepPartial<EntityType>,
  FindArgsType extends FindArgs<EntityType> = FindArgs<EntityType>,
  ContextType extends Context = Context,
  PluginArrayType extends ServicePlugin<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    FindArgsType,
    ContextType
  >[] = [],
>(
  serviceStructure: CrudServiceStructure<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    FindArgsType,
    ContextType
  > & {
    plugins?: PluginArrayType;
  } & ExtractOptionsFromServicePluginArray<PluginArrayType>,
): Type<
  CrudService<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    FindArgsType,
    ContextType
  > &
    ExtractAddOnsFromServicePluginArray<PluginArrayType>
> {
  if (serviceStructure.plugins && serviceStructure.plugins.length > 0) {
    serviceStructure.plugins.forEach(element => {
      if (element.applyDataServiceStructure)
        element.applyDataServiceStructure(serviceStructure);
      if (element.applyCrudServiceStructure)
        element.applyCrudServiceStructure(serviceStructure);
    });
  }

  let serviceClass = CrudServiceFrom(serviceStructure) as Constructable<any>;

  if (serviceStructure.plugins && serviceStructure.plugins.length > 0) {
    serviceStructure.plugins.forEach(element => {
      if (element.applyDataServiceClass)
        serviceClass = element.applyDataServiceClass(
          serviceClass,
          serviceStructure,
        );
      if (element.applyCrudServiceClass)
        serviceClass = element.applyCrudServiceClass(
          serviceClass,
          serviceStructure,
        );
    });
  }

  return mixin(serviceClass);
}
