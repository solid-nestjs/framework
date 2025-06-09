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
  ControllerPlugin,
  DataController,
  DataControllerStructure,
  ExtractDataAddOnsFromControllerPluginArray,
  ExtractDataOptionsFromControllerPluginArray,
  ExtractDataServiceAddOnsFromControllerPluginArray,
} from '../interfaces';
import { DefaultArgs } from '../classes';
import { DataControllerFrom } from './data-controller.mixin';

export function DataControllerExFrom<
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
  PluginArrayType extends ControllerPlugin<
    IdType,
    EntityType,
    DeepPartial<EntityType>,
    DeepPartial<EntityType>,
    FindArgsType,
    ContextType
  >[] = [],
>(
  controllerStructure: DataControllerStructure<
    IdType,
    EntityType,
    ServiceType &
      ExtractDataServiceAddOnsFromControllerPluginArray<PluginArrayType>,
    FindArgsType,
    ContextType
  > & {
    plugins?: PluginArrayType;
  } & ExtractDataOptionsFromControllerPluginArray<PluginArrayType>,
): Type<
  DataController<
    IdType,
    EntityType,
    ServiceType &
      ExtractDataServiceAddOnsFromControllerPluginArray<PluginArrayType>,
    FindArgsType,
    ContextType
  > &
    ExtractDataAddOnsFromControllerPluginArray<PluginArrayType>
> {
  if (controllerStructure.plugins && controllerStructure.plugins.length > 0) {
    controllerStructure.plugins.forEach(element => {
      if (element.applyDataControllerStructure)
        element.applyDataControllerStructure(controllerStructure);
    });
  }

  let controllerClass = DataControllerFrom(
    controllerStructure,
  ) as Constructable<any>;

  if (controllerStructure.plugins && controllerStructure.plugins.length > 0) {
    controllerStructure.plugins.forEach(element => {
      if (element.applyDataControllerClass)
        controllerClass = element.applyDataControllerClass(
          controllerClass,
          controllerStructure,
        );
    });
  }

  return mixin(controllerClass);
}
