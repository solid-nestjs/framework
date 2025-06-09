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
  ControllerPlugin,
  CrudController,
  CrudControllerStructure,
  ExtractAddOnsFromControllerPluginArray,
  ExtractOptionsFromControllerPluginArray,
  ExtractServiceAddOnsFromControllerPluginArray,
} from '../interfaces';
import { DefaultArgs } from '../classes';
import { CrudControllerFrom } from './crud-controller.mixin';

export function CrudControllerExFrom<
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
  PluginArrayType extends ControllerPlugin<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    FindArgsType,
    ContextType
  >[] = [],
>(
  controllerStructure: CrudControllerStructure<
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
): Type<
  CrudController<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    ServiceType &
      ExtractServiceAddOnsFromControllerPluginArray<PluginArrayType>,
    FindArgsType,
    ContextType
  > &
    ExtractAddOnsFromControllerPluginArray<PluginArrayType>
> {
  if (controllerStructure.plugins && controllerStructure.plugins.length > 0) {
    controllerStructure.plugins.forEach(element => {
      if (element.applyDataControllerStructure)
        element.applyDataControllerStructure(controllerStructure);
      if (element.applyCrudControllerStructure)
        element.applyCrudControllerStructure(controllerStructure);
    });
  }

  let controllerClass = CrudControllerFrom(
    controllerStructure,
  ) as Constructable<any>;

  if (controllerStructure.plugins && controllerStructure.plugins.length > 0) {
    controllerStructure.plugins.forEach(element => {
      if (element.applyDataControllerClass)
        controllerClass = element.applyDataControllerClass(
          controllerClass,
          controllerStructure,
        );
      if (element.applyCrudControllerClass)
        controllerClass = element.applyCrudControllerClass(
          controllerClass,
          controllerStructure,
        );
    });
  }

  return mixin(controllerClass);
}
