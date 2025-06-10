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
import { DataResolverStructure } from './data-resolver-structure.interface';
import { CrudResolverStructure } from './crud-resolver-structure.interface';
import { CrudResolver, DataResolver } from '../resolvers';

export interface ResolverPlugin<
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
  applyDataResolverStructure?(
    structure: DataResolverStructure<
      IdType,
      EntityType,
      DataService<IdType, EntityType, FindArgsType, ContextType> &
        TDataServiceAddOns,
      FindArgsType,
      ContextType
    > &
      TDataOptions,
  ): void;

  applyCrudResolverStructure?(
    structure: CrudResolverStructure<
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

  applyDataResolverClass?(
    resolverClass: Constructable<
      DataResolver<
        IdType,
        EntityType,
        DataService<IdType, EntityType, FindArgsType, ContextType> &
          TDataServiceAddOns,
        FindArgsType,
        ContextType
      >
    >,
    structure: DataResolverStructure<
      IdType,
      EntityType,
      DataService<IdType, EntityType, FindArgsType, ContextType> &
        TDataServiceAddOns,
      FindArgsType,
      ContextType
    > &
      TDataOptions,
  ): Type<
    DataResolver<
      IdType,
      EntityType,
      DataService<IdType, EntityType, FindArgsType, ContextType> &
        TDataServiceAddOns,
      FindArgsType,
      ContextType
    > &
      TDataAddOns
  >;

  applyCrudResolverClass?(
    resolverClass: Constructable<
      CrudResolver<
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
    structure: CrudResolverStructure<
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
    CrudResolver<
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

export type ExtractDataAddOnsFromResolverPluginArray<
  ResolverPluginArrayType extends readonly ResolverPlugin<
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
  ResolverPluginArrayType[number] extends ResolverPlugin<
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

export type ExtractCrudAddOnsFromResolverPluginArray<
  ResolverPluginArrayType extends readonly ResolverPlugin<
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
  ResolverPluginArrayType[number] extends ResolverPlugin<
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

export type ExtractAddOnsFromResolverPluginArray<
  ResolverPluginArrayType extends readonly ResolverPlugin<
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
> = ExtractDataAddOnsFromResolverPluginArray<ResolverPluginArrayType> &
  ExtractCrudAddOnsFromResolverPluginArray<ResolverPluginArrayType>;

export type ExtractDataOptionsFromResolverPluginArray<
  ResolverPluginArrayType extends readonly ResolverPlugin<
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
  ResolverPluginArrayType[number] extends ResolverPlugin<
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

export type ExtractCrudOptionsFromResolverPluginArray<
  ResolverPluginArrayType extends readonly ResolverPlugin<
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
  ResolverPluginArrayType[number] extends ResolverPlugin<
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

export type ExtractOptionsFromResolverPluginArray<
  ResolverPluginArrayType extends readonly ResolverPlugin<
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
> = ExtractDataOptionsFromResolverPluginArray<ResolverPluginArrayType> &
  ExtractCrudOptionsFromResolverPluginArray<ResolverPluginArrayType>;

export type ExtractDataServiceAddOnsFromResolverPluginArray<
  ResolverPluginArrayType extends readonly ResolverPlugin<
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
  ResolverPluginArrayType[number] extends ResolverPlugin<
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

export type ExtractCrudServiceAddOnsFromResolverPluginArray<
  ResolverPluginArrayType extends readonly ResolverPlugin<
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
  ResolverPluginArrayType[number] extends ResolverPlugin<
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

export type ExtractServiceAddOnsFromResolverPluginArray<
  ResolverPluginArrayType extends readonly ResolverPlugin<
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
> = ExtractDataServiceAddOnsFromResolverPluginArray<ResolverPluginArrayType> &
  ExtractCrudServiceAddOnsFromResolverPluginArray<ResolverPluginArrayType>;
