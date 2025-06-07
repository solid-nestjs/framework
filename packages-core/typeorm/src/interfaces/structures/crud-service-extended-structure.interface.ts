import {
  Context,
  DeepPartial,
  Entity,
  fillEntityId,
  FindArgs,
  IdTypeFrom,
  ServicePlugin,
  ExtractOptionsFromServicePluginArray,
} from '@solid-nestjs/common';
import { CrudServiceStructure } from './crud-service-structure.interface';
export function CrudServiceStructureEx<
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
    ContextType,
    {},
    {}
  >[] = [],
>(
  input: CrudServiceStructure<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    FindArgsType,
    ContextType
  > & {
    plugins?: PluginArrayType;
  } & ExtractOptionsFromServicePluginArray<PluginArrayType>,
): CrudServiceStructure<
  IdType,
  EntityType,
  CreateInputType,
  UpdateInputType,
  FindArgsType,
  ContextType
> & {
  plugins?: PluginArrayType;
} & ExtractOptionsFromServicePluginArray<PluginArrayType> {
  fillEntityId(input);

  return input;
}
