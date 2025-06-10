import {
  Context,
  DataService,
  Entity,
  FindArgs,
  IdTypeFrom,
  PaginationResult,
} from '@solid-nestjs/common';

export interface DataResolver<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  ServiceType extends DataService<
    IdType,
    EntityType,
    FindArgsType,
    ContextType
  >,
  FindArgsType extends FindArgs<EntityType> = FindArgs<EntityType>,
  ContextType extends Context = Context,
> {
  readonly service: ServiceType;

  findAll?(context: ContextType, args: FindArgsType): Promise<EntityType[]>;

  pagination?(
    context: ContextType,
    args: FindArgsType,
  ): Promise<PaginationResult>;

  findOne?(context: ContextType, id: IdType): Promise<EntityType>;
}
