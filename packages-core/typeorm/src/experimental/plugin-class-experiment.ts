import {
  Context,
  DeepPartial,
  Entity,
  FindArgs,
  IdTypeFrom,
  Prettify,
  UnionToIntersection,
} from '@solid-nestjs/common';
import { CrudService, CrudServiceStructure } from '../interfaces';

interface MyPluginOptions<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  CreateInputType extends DeepPartial<EntityType>,
  UpdateInputType extends DeepPartial<EntityType>,
  FindArgsType extends FindArgs<EntityType> = FindArgs<EntityType>,
  ContextType extends Context = Context,
> {
  lalalala: string;
}

interface MyPluginOptions2<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  CreateInputType extends DeepPartial<EntityType>,
  UpdateInputType extends DeepPartial<EntityType>,
  FindArgsType extends FindArgs<EntityType> = FindArgs<EntityType>,
  ContextType extends Context = Context,
> {
  lolololo: string;
}

interface MyPluginOptions3<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  CreateInputType extends DeepPartial<EntityType>,
  UpdateInputType extends DeepPartial<EntityType>,
  FindArgsType extends FindArgs<EntityType> = FindArgs<EntityType>,
  ContextType extends Context = Context,
> {
  kekekeke: string;
}

interface MyPluginClassAddOns<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  CreateInputType extends DeepPartial<EntityType>,
  UpdateInputType extends DeepPartial<EntityType>,
  FindArgsType extends FindArgs<EntityType> = FindArgs<EntityType>,
  ContextType extends Context = Context,
> {
  jajaja(id: IdType): EntityType;
  nonono(input: CreateInputType, other: string): boolean;
}

interface MyPluginClassAddOns2<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  CreateInputType extends DeepPartial<EntityType>,
  UpdateInputType extends DeepPartial<EntityType>,
  FindArgsType extends FindArgs<EntityType> = FindArgs<EntityType>,
  ContextType extends Context = Context,
> {
  hahaha(id: IdType): EntityType;
  mememe(input: CreateInputType): boolean;
}

interface MyPluginClassAddOns3<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  CreateInputType extends DeepPartial<EntityType>,
  UpdateInputType extends DeepPartial<EntityType>,
  FindArgsType extends FindArgs<EntityType> = FindArgs<EntityType>,
  ContextType extends Context = Context,
> {
  hohoho(id: IdType): EntityType;
  tatata(input: CreateInputType): string;
}

// Generic plugin interface that all plugins must implement
interface CrudPlugin<
  TOptions = any,
  TAddOns extends Record<string, any> = any,
> {
  applyCrudServiceClass<
    IdType extends IdTypeFrom<EntityType>,
    EntityType extends Entity<unknown>,
    CreateInputType extends DeepPartial<EntityType>,
    UpdateInputType extends DeepPartial<EntityType>,
    FindArgsType extends FindArgs<EntityType> = FindArgs<EntityType>,
    ContextType extends Context = Context,
  >(
    serviceClass: CrudService<
      IdType,
      EntityType,
      CreateInputType,
      UpdateInputType,
      FindArgsType,
      ContextType
    >,
    structure: CrudServiceStructure<
      IdType,
      EntityType,
      CreateInputType,
      UpdateInputType,
      FindArgsType,
      ContextType
    >,
    options: TOptions,
  ): TAddOns;
}

class MyPlugin implements CrudPlugin {
  applyCrudServiceClass<
    IdType extends IdTypeFrom<EntityType>,
    EntityType extends Entity<unknown>,
    CreateInputType extends DeepPartial<EntityType>,
    UpdateInputType extends DeepPartial<EntityType>,
    FindArgsType extends FindArgs<EntityType> = FindArgs<EntityType>,
    ContextType extends Context = Context,
  >(
    serviceClass: CrudService<
      IdType,
      EntityType,
      CreateInputType,
      UpdateInputType,
      FindArgsType,
      ContextType
    >,
    structure: CrudServiceStructure<
      IdType,
      EntityType,
      CreateInputType,
      UpdateInputType,
      FindArgsType,
      ContextType
    >,
    options: MyPluginOptions<
      IdType,
      EntityType,
      CreateInputType,
      UpdateInputType,
      FindArgsType,
      ContextType
    >,
  ): MyPluginClassAddOns<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    FindArgsType,
    ContextType
  > {
    throw new Error('Function not implemented.');
  }
}

class MyPlugin2 implements CrudPlugin {
  applyCrudServiceClass<
    IdType extends IdTypeFrom<EntityType>,
    EntityType extends Entity<unknown>,
    CreateInputType extends DeepPartial<EntityType>,
    UpdateInputType extends DeepPartial<EntityType>,
    FindArgsType extends FindArgs<EntityType> = FindArgs<EntityType>,
    ContextType extends Context = Context,
  >(
    serviceClass: CrudService<
      IdType,
      EntityType,
      CreateInputType,
      UpdateInputType,
      FindArgsType,
      ContextType
    >,
    structure: CrudServiceStructure<
      IdType,
      EntityType,
      CreateInputType,
      UpdateInputType,
      FindArgsType,
      ContextType
    >,
    options: MyPluginOptions2<
      IdType,
      EntityType,
      CreateInputType,
      UpdateInputType,
      FindArgsType,
      ContextType
    >,
  ): MyPluginClassAddOns2<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    FindArgsType,
    ContextType
  > {
    throw new Error('Function not implemented.');
  }
}

class MyPlugin3 implements CrudPlugin {
  applyCrudServiceClass<
    IdType extends IdTypeFrom<EntityType>,
    EntityType extends Entity<unknown>,
    CreateInputType extends DeepPartial<EntityType>,
    UpdateInputType extends DeepPartial<EntityType>,
    FindArgsType extends FindArgs<EntityType> = FindArgs<EntityType>,
    ContextType extends Context = Context,
  >(
    serviceClass: CrudService<
      IdType,
      EntityType,
      CreateInputType,
      UpdateInputType,
      FindArgsType,
      ContextType
    >,
    structure: CrudServiceStructure<
      IdType,
      EntityType,
      CreateInputType,
      UpdateInputType,
      FindArgsType,
      ContextType
    >,
    options: MyPluginOptions3<
      IdType,
      EntityType,
      CreateInputType,
      UpdateInputType,
      FindArgsType,
      ContextType
    >,
  ): MyPluginClassAddOns3<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    FindArgsType,
    ContextType
  > {
    throw new Error('Function not implemented.');
  }
}

const plugin1: MyPlugin = new MyPlugin();
const plugin2: MyPlugin2 = new MyPlugin2();
const plugin3: MyPlugin3 = new MyPlugin3();

class MyEntity {
  id!: string;
  name!: string;
}

class MyEntityCreateDto {
  name!: string;
}

class MyEntityUpdateDto {
  name?: string;
}

const pluginArray = [plugin1, plugin2, plugin3];

type pluginArrayType = typeof pluginArray;

// Generic helper type to extract plugin return types with specific generic parameters
type ExtractPluginReturnType<
  T extends CrudPlugin,
  TIdType extends IdTypeFrom<TEntityType>,
  TEntityType extends Entity<unknown>,
  TCreateInputType extends DeepPartial<TEntityType>,
  TUpdateInputType extends DeepPartial<TEntityType>,
  TFindArgsType extends FindArgs<TEntityType> = FindArgs<TEntityType>,
  TContextType extends Context = Context,
> =
  T extends CrudPlugin<any, infer TAddOns>
    ? TAddOns extends Record<string, any>
      ? {
          [K in keyof TAddOns]: TAddOns[K] extends (...args: any[]) => any
            ? TAddOns[K] extends (id: any) => any
              ? (id: TIdType) => TEntityType
              : TAddOns[K] extends (input: any) => any
                ? (input: TCreateInputType) => ReturnType<TAddOns[K]>
                : TAddOns[K]
            : TAddOns[K];
        }
      : never
    : never;

type PluginArrayReturnTypes<
  TIdType extends IdTypeFrom<TEntityType>,
  TEntityType extends Entity<unknown>,
  TCreateInputType extends DeepPartial<TEntityType>,
  TUpdateInputType extends DeepPartial<TEntityType>,
  TFindArgsType extends FindArgs<TEntityType> = FindArgs<TEntityType>,
  TContextType extends Context = Context,
> = {
  [K in keyof pluginArrayType]: pluginArrayType[K] extends CrudPlugin
    ? ExtractPluginReturnType<
        pluginArrayType[K],
        TIdType,
        TEntityType,
        TCreateInputType,
        TUpdateInputType,
        TFindArgsType,
        TContextType
      >
    : never;
}[number];

type TestPluginArrayWith3Plugins = Prettify<
  UnionToIntersection<
    PluginArrayReturnTypes<
      string,
      MyEntity,
      MyEntityCreateDto,
      MyEntityUpdateDto
    >
  >
>;
