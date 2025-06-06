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

interface MyPluginOptions4<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  CreateInputType extends DeepPartial<EntityType>,
  UpdateInputType extends DeepPartial<EntityType>,
  FindArgsType extends FindArgs<EntityType> = FindArgs<EntityType>,
  ContextType extends Context = Context,
> {
  rararara: string;
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

interface MyPluginClassAddOns4<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  CreateInputType extends DeepPartial<EntityType>,
  UpdateInputType extends DeepPartial<EntityType>,
  FindArgsType extends FindArgs<EntityType> = FindArgs<EntityType>,
  ContextType extends Context = Context,
> {
  zozozo(
    id: IdType,
    // input: CreateInputType,
    // input2: UpdateInputType,
  ): { entity: EntityType; count: number };
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

class MyPlugin4 implements CrudPlugin {
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
    options: MyPluginOptions4<
      IdType,
      EntityType,
      CreateInputType,
      UpdateInputType,
      FindArgsType,
      ContextType
    >,
  ): MyPluginClassAddOns4<
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
const plugin4: MyPlugin4 = new MyPlugin4();

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

const pluginArray = [plugin1, plugin2, plugin3, plugin4];

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
> = T extends {
  applyCrudServiceClass<
    IdType extends IdTypeFrom<EntityType>,
    EntityType extends Entity<unknown>,
    CreateInputType extends DeepPartial<EntityType>,
    UpdateInputType extends DeepPartial<EntityType>,
    FindArgsType extends FindArgs<EntityType>,
    ContextType extends Context,
  >(
    serviceClass: any,
    structure: any,
    options: any,
  ): infer R;
}
  ? R extends Record<string, any>
    ? {
        [K in keyof R]: R[K] extends (...args: any[]) => any
          ? R[K] extends (id: IdTypeFrom<Entity<unknown>>) => Entity<unknown>
            ? (id: TIdType) => TEntityType
            : R[K] extends (input: DeepPartial<Entity<unknown>>) => any
              ? (input: TCreateInputType) => ReturnType<R[K]>
              : R[K] extends (
                    input: DeepPartial<Entity<unknown>>,
                    ...rest: infer Rest
                  ) => any
                ? (input: TCreateInputType, ...rest: Rest) => ReturnType<R[K]>
                : R[K]
          : R[K];
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

// Alternative approach: Create a more maintainable solution
// For true genericity, you would need to register plugin types in a central registry
// Here's how you could extend this for new plugins:

/*
To add a new plugin (MyPlugin4), you would:
1. Create MyPluginClassAddOns4 interface
2. Create MyPlugin4 class implementing CrudPlugin
3. Add the case to ExtractPluginReturnType:
   : T extends MyPlugin4
   ? MyPluginClassAddOns4<TIdType, TEntityType, TCreateInputType, TUpdateInputType, TFindArgsType, TContextType>
*/

type PluginReturnType = ExtractPluginReturnType<
  typeof plugin1,
  string,
  MyEntity,
  MyEntityCreateDto,
  MyEntityUpdateDto
>;

// Test that shows the types are working correctly
type TestPlugin1Methods = ExtractPluginReturnType<
  MyPlugin3,
  string,
  MyEntity,
  MyEntityCreateDto,
  MyEntityUpdateDto
>;

// This should resolve to:
// {
//   jajaja(id: string): MyEntity;
//   nonono(input: MyEntityCreateDto, other: string): boolean;
// }

type TestPluginArray = Prettify<
  UnionToIntersection<
    PluginArrayReturnTypes<
      string,
      MyEntity,
      MyEntityCreateDto,
      MyEntityUpdateDto
    >
  >
>;
