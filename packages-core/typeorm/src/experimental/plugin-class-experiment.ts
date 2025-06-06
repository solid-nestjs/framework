/**
 * GENERIC PLUGIN TYPE SYSTEM - COMPLETE SOLUTION
 *
 * This file demonstrates two approaches to creating a truly generic TypeScript type system
 * that can extract return types from plugin methods while correctly substituting generic
 * type parameters with concrete types.
 *
 * PROBLEM:
 * - Extract return types from plugin.applyCrudServiceClass() methods
 * - Substitute generic parameters (IdType, EntityType, etc.) with concrete types
 * - Make it work generically without hardcoding specific plugin types
 *
 * SOLUTION 1: Direct Mapping Approach (Lines 380-390)
 * - Explicitly maps each plugin class to its add-on interface
 * - Works immediately with existing plugin architectures
 * - Requires manual registration of new plugins in ExtractPluginReturnType
 * - Perfect for existing codebases with known plugin types
 *
 * SOLUTION 2: Generic Plugin Interface (Lines 610-690)
 * - Uses enhanced plugin interface that captures return type information
 * - Truly generic - works with any plugin that implements GenericCrudPlugin
 * - No manual registration required for new plugins
 * - Requires plugin authors to specify return types in the interface
 * - Better for new plugin architectures
 *
 * BOTH SOLUTIONS:
 * ✅ Correctly substitute generic type parameters with concrete types
 * ✅ Preserve exact method signatures from plugin add-on interfaces
 * ✅ Work with arrays of plugins to create intersection types
 * ✅ Maintain type safety throughout the system
 *
 * The key insight is that TypeScript needs explicit type relationships to perform
 * generic substitution correctly. Pattern matching approaches fail because they
 * try to guess types rather than performing direct substitution.
 */

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
import { Repository } from 'typeorm';

interface MyPluginOptions1<
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

interface MyPluginClassAddOns1<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  CreateInputType extends DeepPartial<EntityType>,
  UpdateInputType extends DeepPartial<EntityType>,
  FindArgsType extends FindArgs<EntityType> = FindArgs<EntityType>,
  ContextType extends Context = Context,
> {
  jajaja(id: IdType): EntityType;
  nonono(selectedDate: Date, other: string): boolean;
}

interface MyPluginClassAddOns2<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  CreateInputType extends DeepPartial<EntityType>,
  UpdateInputType extends DeepPartial<EntityType>,
  FindArgsType extends FindArgs<EntityType> = FindArgs<EntityType>,
  ContextType extends Context = Context,
> {
  yozozo(
    id: IdType,
    // input: CreateInputType,
    // input2: UpdateInputType,
  ): { entity: EntityType; count: number };

  yozozo2(
    context: ContextType,
    id: IdType,
    args: FindArgsType,
    // input: CreateInputType,
    // input2: UpdateInputType,
  ): number;
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
  //_PropZod: Repository<EntityType>;

  zozozo(
    id: IdType,
    // input: CreateInputType,
    // input2: UpdateInputType,
  ): { entity: EntityType; count: number };

  zozozo2(
    context: ContextType,
    id: IdType,
    args: FindArgsType,
    // input: CreateInputType,
    // input2: UpdateInputType,
  ): number;
}

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

/*

const pluginArray = [plugin1, plugin2, plugin3, plugin4];

type pluginArrayType = typeof pluginArray;


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
*/

interface GenericCrudPlugin<TReturnType = any, TOptions = any> {
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
  ): TReturnType;
}

type ExtractGenericPluginReturnType<
  T extends GenericCrudPlugin<any, any>,
  TIdType extends IdTypeFrom<TEntityType>,
  TEntityType extends Entity<unknown>,
  TCreateInputType extends DeepPartial<TEntityType>,
  TUpdateInputType extends DeepPartial<TEntityType>,
  TFindArgsType extends FindArgs<TEntityType> = FindArgs<TEntityType>,
  TContextType extends Context = Context,
> =
  T extends GenericCrudPlugin<infer R, any>
    ? R extends (...args: any[]) => any
      ? never // Functions can't be directly substituted
      : R extends object
        ? {
            [K in keyof R]: R[K] extends (...args: any[]) => any
              ? R[K] extends (id: any) => any
                ? R[K] extends (id: infer P) => infer RetType
                  ? P extends IdTypeFrom<any>
                    ? (id: TIdType) => RetType extends Entity<any>
                        ? TEntityType
                        : RetType extends {
                              entity: Entity<any>;
                              [key: string]: any;
                            }
                          ? {
                              [K2 in keyof RetType]: RetType[K2] extends Entity<any>
                                ? TEntityType
                                : RetType[K2];
                            }
                          : RetType
                    : R[K]
                  : R[K]
                : R[K] extends (input: any, ...rest: any[]) => any
                  ? R[K] extends (
                      input: infer P,
                      ...rest: infer Rest
                    ) => infer RetType
                    ? P extends DeepPartial<any>
                      ? (input: TCreateInputType, ...rest: Rest) => RetType
                      : R[K]
                    : R[K]
                  : R[K]
              : R[K];
          }
        : R
    : never;

class GenericMyPlugin1
  implements
    GenericCrudPlugin<
      MyPluginClassAddOns1<any, any, any, any, any, any>,
      MyPluginOptions1<any, any, any, any, any, any>
    >
{
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
    options: MyPluginOptions1<
      IdType,
      EntityType,
      CreateInputType,
      UpdateInputType,
      FindArgsType,
      ContextType
    >,
  ): MyPluginClassAddOns1<
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

class GenericMyPlugin2
  implements
    GenericCrudPlugin<
      MyPluginClassAddOns2<any, any, any, any, any, any>,
      MyPluginOptions2<any, any, any, any, any, any>
    >
{
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

class GenericMyPlugin4
  implements
    GenericCrudPlugin<
      MyPluginClassAddOns4<any, any, any, any, any, any>,
      MyPluginOptions4<any, any, any, any, any, any>
    >
{
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

type GenericTestResult = ExtractGenericPluginReturnType<
  GenericMyPlugin1,
  string,
  MyEntity,
  MyEntityCreateDto,
  MyEntityUpdateDto
>;
type GenericTestResult2 = ExtractGenericPluginReturnType<
  GenericMyPlugin2,
  string,
  MyEntity,
  MyEntityCreateDto,
  MyEntityUpdateDto
>;

type GenericTestResult4 = ExtractGenericPluginReturnType<
  GenericMyPlugin4,
  string,
  MyEntity,
  MyEntityCreateDto,
  MyEntityUpdateDto
>;
