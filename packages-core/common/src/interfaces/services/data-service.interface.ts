import { BooleanType, NotNullableIf, If } from '../../types';
import { Context, IdTypeFrom, Entity } from '../misc';
import { FindArgs } from '../inputs';
import { PaginationResult } from '../outputs';
import { Where } from '../../types/find-args.type';

/**
 * Generic interface for a data service that provides CRUD-like operations and transactional support.
 *
 * @typeParam IdType - The type of the entity's identifier.
 * @typeParam EntityType - The type of the entity managed by the service.
 * @typeParam ContextType - The type of the context object, defaults to `Context`.
 *
 * @remarks
 * This interface abstracts common data access patterns, including retrieval, pagination,
 * transactional execution, and auditing. It is designed to be implemented by concrete data
 * service classes that interact with a data source.
 *
 * @method findAll - Retrieves all entities matching the given arguments, optionally with pagination.
 * @method pagination - Retrieves pagination metadata for entities matching the given arguments.
 * @method findOne - Retrieves a single entity by its identifier, optionally throwing if not found.
 * @method findOneBy - Retrieves a single entity by a custom condition, optionally throwing if not found.
 * @method runInTransaction - Executes a function within a transactional context.
 * @method audit - Records an audit log entry for a specified action.
 */
export interface DataService<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  FindArgsType extends FindArgs<EntityType> = FindArgs<EntityType>,
  ContextType extends Context = Context,
> {
  findAll<TBool extends BooleanType = false>(
    context: ContextType,
    args?: FindArgsType,
    withPagination?: TBool,
  ): Promise<
    If<
      TBool,
      { data: EntityType[]; pagination: PaginationResult },
      EntityType[]
    >
  >;

  pagination(
    context: ContextType,
    args?: FindArgsType,
  ): Promise<PaginationResult>;

  findOne<TBool extends BooleanType = false>(
    context: ContextType,
    id: IdType,
    orFail?: TBool,
  ): Promise<NotNullableIf<TBool, EntityType>>;

  findOneBy<TBool extends BooleanType = false>(
    context: ContextType,
    where: Where<EntityType>,
    orFail?: TBool,
  ): Promise<NotNullableIf<TBool, EntityType>>;

  runInTransaction<ReturnType>(
    context: ContextType,
    fn: (context: ContextType) => Promise<ReturnType>,
  ): Promise<ReturnType>;

  audit(
    context: ContextType,
    action: string,
    objectId?: IdType,
    valueBefore?: object,
    valueAfter?: object,
  ): Promise<void>;
}
