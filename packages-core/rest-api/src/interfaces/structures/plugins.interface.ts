import { Type } from '@nestjs/common';
import {
  Constructable,
  Context,
  CrudService,
  DataService,
  DeepPartial,
  Entity,
  FindArgs,
  IdTypeFrom,
  UnionToIntersection,
} from '@solid-nestjs/common';
import { DataControllerStructure } from './data-controller-structure.interface';
import { CrudControllerStructure } from './crud-controller-structure.interface';
import { CrudController, DataController } from '../controllers';

export interface ControllerPlugin<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  CreateInputType extends DeepPartial<EntityType> = DeepPartial<EntityType>,
  UpdateInputType extends DeepPartial<EntityType> = DeepPartial<EntityType>,
  FindArgsType extends FindArgs<EntityType> = FindArgs<EntityType>,
  ContextType extends Context = Context,
  TDataServiceAddOns extends Record<string, any> = {},
  TCrudServiceAddOns extends Record<string, any> = {},
  TDataOptions extends Record<string, any> = {},
  TCrudOptions extends Record<string, any> = {},
  TDataAddOns extends Record<string, any> = {},
  TCrudAddOns extends Record<string, any> = {},
> {
  applyDataControllerStructure?(
    structure: DataControllerStructure<
      IdType,
      EntityType,
      DataService<IdType, EntityType, FindArgsType, ContextType> &
        TDataServiceAddOns,
      FindArgsType,
      ContextType
    > &
      TDataOptions,
  ): void;

  applyCrudControllerStructure?(
    structure: CrudControllerStructure<
      IdType,
      EntityType,
      CreateInputType,
      UpdateInputType,
      CrudService<
        IdType,
        EntityType,
        CreateInputType,
        UpdateInputType,
        FindArgsType,
        ContextType
      > &
        TDataServiceAddOns &
        TCrudServiceAddOns,
      FindArgsType,
      ContextType
    > &
      TDataOptions &
      TCrudOptions,
  ): void;

  applyDataControllerClass?(
    controllerClass: Constructable<
      DataController<
        IdType,
        EntityType,
        DataService<IdType, EntityType, FindArgsType, ContextType> &
          TDataServiceAddOns,
        FindArgsType,
        ContextType
      >
    >,
    structure: DataControllerStructure<
      IdType,
      EntityType,
      DataService<IdType, EntityType, FindArgsType, ContextType> &
        TDataServiceAddOns,
      FindArgsType,
      ContextType
    > &
      TDataOptions,
  ): Type<
    DataController<
      IdType,
      EntityType,
      DataService<IdType, EntityType, FindArgsType, ContextType> &
        TDataServiceAddOns,
      FindArgsType,
      ContextType
    > &
      TDataAddOns
  >;

  applyCrudControllerClass?(
    controllerClass: Constructable<
      CrudController<
        IdType,
        EntityType,
        CreateInputType,
        UpdateInputType,
        CrudService<
          IdType,
          EntityType,
          CreateInputType,
          UpdateInputType,
          FindArgsType,
          ContextType
        > &
          TDataServiceAddOns &
          TCrudServiceAddOns,
        FindArgsType,
        ContextType
      >
    >,
    structure: CrudControllerStructure<
      IdType,
      EntityType,
      CreateInputType,
      UpdateInputType,
      CrudService<
        IdType,
        EntityType,
        CreateInputType,
        UpdateInputType,
        FindArgsType,
        ContextType
      > &
        TDataServiceAddOns &
        TCrudServiceAddOns,
      FindArgsType,
      ContextType
    > &
      TDataOptions &
      TCrudOptions,
  ): Type<
    CrudController<
      IdType,
      EntityType,
      CreateInputType,
      UpdateInputType,
      CrudService<
        IdType,
        EntityType,
        CreateInputType,
        UpdateInputType,
        FindArgsType,
        ContextType
      > &
        TDataServiceAddOns &
        TCrudServiceAddOns,
      FindArgsType,
      ContextType
    > &
      TDataAddOns &
      TCrudAddOns
  >;
}

export type ExtractDataAddOnsFromControllerPluginArray<
  ControllerPluginArrayType extends readonly ControllerPlugin<
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
  >[],
> = UnionToIntersection<
  ControllerPluginArrayType[number] extends ControllerPlugin<
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    infer TAddOns,
    any
  >
    ? TAddOns
    : never
>;

export type ExtractCrudAddOnsFromControllerPluginArray<
  ControllerPluginArrayType extends readonly ControllerPlugin<
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
  >[],
> = UnionToIntersection<
  ControllerPluginArrayType[number] extends ControllerPlugin<
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    infer TAddOns
  >
    ? TAddOns
    : never
>;

export type ExtractAddOnsFromControllerPluginArray<
  ControllerPluginArrayType extends readonly ControllerPlugin<
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
  >[],
> = ExtractDataAddOnsFromControllerPluginArray<ControllerPluginArrayType> &
  ExtractCrudAddOnsFromControllerPluginArray<ControllerPluginArrayType>;

export type ExtractDataOptionsFromControllerPluginArray<
  ControllerPluginArrayType extends readonly ControllerPlugin<
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
  >[],
> = UnionToIntersection<
  ControllerPluginArrayType[number] extends ControllerPlugin<
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    infer TOptions,
    any,
    any,
    any
  >
    ? TOptions
    : never
>;

export type ExtractCrudOptionsFromControllerPluginArray<
  ControllerPluginArrayType extends readonly ControllerPlugin<
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
  >[],
> = UnionToIntersection<
  ControllerPluginArrayType[number] extends ControllerPlugin<
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    infer TOptions,
    any,
    any
  >
    ? TOptions
    : never
>;

export type ExtractOptionsFromControllerPluginArray<
  ControllerPluginArrayType extends readonly ControllerPlugin<
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
  >[],
> = ExtractDataOptionsFromControllerPluginArray<ControllerPluginArrayType> &
  ExtractCrudOptionsFromControllerPluginArray<ControllerPluginArrayType>;

export type ExtractDataServiceAddOnsFromControllerPluginArray<
  ControllerPluginArrayType extends readonly ControllerPlugin<
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
  >[],
> = UnionToIntersection<
  ControllerPluginArrayType[number] extends ControllerPlugin<
    any,
    any,
    any,
    any,
    any,
    any,
    infer TServiceAddOns,
    any,
    any,
    any,
    any,
    any
  >
    ? TServiceAddOns
    : never
>;

export type ExtractCrudServiceAddOnsFromControllerPluginArray<
  ControllerPluginArrayType extends readonly ControllerPlugin<
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
  >[],
> = UnionToIntersection<
  ControllerPluginArrayType[number] extends ControllerPlugin<
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    infer TServiceAddOns,
    any,
    any,
    any,
    any
  >
    ? TServiceAddOns
    : never
>;

export type ExtractServiceAddOnsFromControllerPluginArray<
  ControllerPluginArrayType extends readonly ControllerPlugin<
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
  >[],
> =
  ExtractDataServiceAddOnsFromControllerPluginArray<ControllerPluginArrayType> &
    ExtractCrudServiceAddOnsFromControllerPluginArray<ControllerPluginArrayType>;
