import { Type } from '@nestjs/common';
import {
  Constructable,
  Context,
  DeepPartial,
  Entity,
  FindArgs,
  IdTypeFrom,
  UnionToIntersection,
} from '@solid-nestjs/common';
import { DataService, CrudService } from '../services';
import { CrudServiceStructure } from './crud-service-structure.interface';
import { DataServiceStructure } from './data-service-structure.interface';

export interface ServicePlugin<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  CreateInputType extends DeepPartial<EntityType> = DeepPartial<EntityType>,
  UpdateInputType extends DeepPartial<EntityType> = DeepPartial<EntityType>,
  FindArgsType extends FindArgs<EntityType> = FindArgs<EntityType>,
  ContextType extends Context = Context,
  TDataOptions extends Record<string, any> = {},
  TCrudOptions extends Record<string, any> = {},
  TDataAddOns extends Record<string, any> = {},
  TCrudAddOns extends Record<string, any> = {},
> {
  applyDataServiceStructure?(
    structure: DataServiceStructure<
      IdType,
      EntityType,
      FindArgsType,
      ContextType
    > &
      TDataOptions,
  ): void;

  applyCrudServiceStructure?(
    structure: CrudServiceStructure<
      IdType,
      EntityType,
      CreateInputType,
      UpdateInputType,
      FindArgsType,
      ContextType
    > &
      TDataOptions &
      TCrudOptions,
  ): void;

  applyDataServiceClass?(
    serviceClass: Constructable<
      DataService<IdType, EntityType, FindArgsType, ContextType>
    >,
    structure: DataServiceStructure<
      IdType,
      EntityType,
      FindArgsType,
      ContextType
    > &
      TDataOptions,
  ): Type<
    DataService<IdType, EntityType, FindArgsType, ContextType> & TDataAddOns
  >;

  applyCrudServiceClass?(
    serviceClass: Constructable<
      CrudService<
        IdType,
        EntityType,
        CreateInputType,
        UpdateInputType,
        FindArgsType,
        ContextType
      >
    >,
    structure: CrudServiceStructure<
      IdType,
      EntityType,
      CreateInputType,
      UpdateInputType,
      FindArgsType,
      ContextType
    > &
      TDataOptions &
      TCrudOptions,
  ): Type<
    CrudService<
      IdType,
      EntityType,
      CreateInputType,
      UpdateInputType,
      FindArgsType,
      ContextType
    > &
      TDataAddOns &
      TCrudAddOns
  >;
}

export type ExtractDataAddOnsFromServicePluginArray<
  ServicePluginArrayType extends readonly ServicePlugin<
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
  ServicePluginArrayType[number] extends ServicePlugin<
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

export type ExtractCrudAddOnsFromServicePluginArray<
  ServicePluginArrayType extends readonly ServicePlugin<
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
  ServicePluginArrayType[number] extends ServicePlugin<
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

export type ExtractAddOnsFromServicePluginArray<
  ServicePluginArrayType extends readonly ServicePlugin<
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
> = ExtractDataAddOnsFromServicePluginArray<ServicePluginArrayType> &
  ExtractCrudAddOnsFromServicePluginArray<ServicePluginArrayType>;

export type ExtractDataOptionsFromServicePluginArray<
  ServicePluginArrayType extends readonly ServicePlugin<
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
  ServicePluginArrayType[number] extends ServicePlugin<
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

export type ExtractCrudOptionsFromServicePluginArray<
  ServicePluginArrayType extends readonly ServicePlugin<
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
  ServicePluginArrayType[number] extends ServicePlugin<
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

export type ExtractOptionsFromServicePluginArray<
  ServicePluginArrayType extends readonly ServicePlugin<
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
> = ExtractDataOptionsFromServicePluginArray<ServicePluginArrayType> &
  ExtractCrudOptionsFromServicePluginArray<ServicePluginArrayType>;
