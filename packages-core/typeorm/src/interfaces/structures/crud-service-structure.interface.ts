import { DeepPartial } from 'typeorm';
import { IsolationLevel } from 'typeorm/driver/types/IsolationLevel';
import {
  Constructable,
  Entity,
  fillEntityId,
  FindArgs,
  IdTypeFrom,
} from '@solid-nestjs/common';
import { Context } from '../misc';
import {
  DataServiceFunctions,
  DataServiceStructure,
} from './data-service-structure.interface';

export interface CrudServiceFunctionStructure<EntityType> {
  transactional?: boolean;
  isolationLevel?: IsolationLevel;
  decorators?: (() => MethodDecorator)[];
}

export interface CrudServiceFunctions<EntityType>
  extends DataServiceFunctions<EntityType> {
  create?: CrudServiceFunctionStructure<EntityType>;
  update?: CrudServiceFunctionStructure<EntityType>;
  remove?: CrudServiceFunctionStructure<EntityType>;
  hardRemove?: CrudServiceFunctionStructure<EntityType>;
  recover?: CrudServiceFunctionStructure<EntityType>;
  //Bulk Operations
  bulkInsert?: CrudServiceFunctionStructure<EntityType>;
  bulkUpdate?: CrudServiceFunctionStructure<EntityType>;
  bulkDelete?: CrudServiceFunctionStructure<EntityType>;
  bulkRemove?: CrudServiceFunctionStructure<EntityType>;
}

export interface CrudServiceStructure<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  CreateInputType extends DeepPartial<EntityType>,
  UpdateInputType extends DeepPartial<EntityType>,
  FindArgsType extends FindArgs<EntityType> = FindArgs<EntityType>,
  ContextType extends Context = Context,
> extends DataServiceStructure<IdType, EntityType, FindArgsType, ContextType> {
  createInputType: Constructable<CreateInputType>;
  updateInputType: Constructable<UpdateInputType>;
  functions?: CrudServiceFunctions<EntityType>;
}

/**
 * Initializes and returns a CRUD service structure for a given entity type.
 *
 * This generic function is used to set up a CRUD (Create, Read, Update, Delete) service structure,
 * ensuring that the entity ID is properly filled. It accepts a structure conforming to the
 * `CrudServiceStructure` interface and returns it after performing necessary initialization.
 *
 * @param input - The CRUD service structure to initialize.
 * @returns The initialized CRUD service structure.
 */
export function CrudServiceStructure<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  CreateInputType extends DeepPartial<EntityType>,
  UpdateInputType extends DeepPartial<EntityType>,
  FindArgsType extends FindArgs<EntityType> = FindArgs<EntityType>,
  ContextType extends Context = Context,
>(
  input: CrudServiceStructure<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    FindArgsType,
    ContextType
  >,
): CrudServiceStructure<
  IdType,
  EntityType,
  CreateInputType,
  UpdateInputType,
  FindArgsType,
  ContextType
> {
  fillEntityId(input);

  return input;
}
