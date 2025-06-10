import {
  Context,
  CrudService,
  DeepPartial,
  Entity,
  FindArgs,
  IdTypeFrom,
} from '@solid-nestjs/common';
import { DataController } from './data-controller.interface';

export interface CrudController<
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
  FindArgsType extends FindArgs<EntityType> = FindArgs<EntityType>,
  ContextType extends Context = Context,
> extends DataController<
    IdType,
    EntityType,
    ServiceType,
    FindArgsType,
    ContextType
  > {
  create?(
    context: ContextType,
    createInput: CreateInputType,
  ): Promise<EntityType>;

  update?(
    context: ContextType,
    id: IdType,
    updateInput: UpdateInputType,
  ): Promise<EntityType>;

  remove?(context: ContextType, id: IdType): Promise<EntityType>;

  hardRemove?(context: ContextType, id: IdType): Promise<EntityType>;

  softRemove?(context: ContextType, id: IdType): Promise<EntityType>;

  recover?(context: ContextType, id: IdType): Promise<EntityType>;
}
