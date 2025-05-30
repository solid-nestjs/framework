import { EntityManager } from 'typeorm';
import { IsolationLevel } from 'typeorm/driver/types/IsolationLevel';
import {
  BooleanType,
  Entity,
  FindArgs,
  IdTypeFrom,
  If,
  NotNullableIf,
  PaginationResult,
  Where,
  DataService as CommonDataService,
} from '@solid-nestjs/common';
import {
  TypeOrmFindManyOptions as FindManyOptions,
  TypeOrmRepository as Repository,
  TypeOrmSelectQueryBuilder as SelectQueryBuilder,
} from '../../types';
import { Context, DataRetrievalOptions, ExtendedRelationInfo } from '../misc';
import { QueryBuilderHelper } from '../../helpers';

/**
 * Generic interface for a data service that provides CRUD operations and advanced querying capabilities
 * for entities using TypeORM. Extends {@link CommonDataService} and adds methods for repository access,
 * query building, pagination, transactional execution, and auditing.
 *
 * @remarks
 * This interface is designed to abstract data access logic and provide a consistent API for
 * working with entities, including support for advanced features such as relation info,
 * custom query builders, and transactional execution.
 *
 * @see CommonDataService
 * @see Repository
 * @see EntityManager
 * @see SelectQueryBuilder
 * @see PaginationResult
 */
export interface DataService<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  FindArgsType extends FindArgs<EntityType> = FindArgs<EntityType>,
  ContextType extends Context = Context,
> extends CommonDataService<IdType, EntityType, ContextType> {
  getRepository(context: ContextType): Repository<EntityType>;

  getEntityManager(context: ContextType): EntityManager;

  getRelationsInfo(context: ContextType): ExtendedRelationInfo[];

  get queryBuilderHelper(): QueryBuilderHelper<IdType, EntityType>;

  getQueryBuilder(
    context: ContextType,
    args?: FindArgsType,
    options?: DataRetrievalOptions<EntityType>,
  ): SelectQueryBuilder<EntityType>;

  getNonMultiplyingPaginatedQueryBuilder(
    context: ContextType,
    args?: FindArgsType,
    options?: DataRetrievalOptions<EntityType>,
  ): SelectQueryBuilder<EntityType> | false;

  find(
    context: ContextType,
    options?: FindManyOptions<EntityType>,
  ): Promise<EntityType[]>;

  findAll<TBool extends BooleanType = false>(
    context: ContextType,
    args?: FindArgsType,
    withPagination?: TBool,
    options?: DataRetrievalOptions<EntityType>,
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
    options?: DataRetrievalOptions<EntityType>,
  ): Promise<PaginationResult>;

  findOne<TBool extends BooleanType = false>(
    context: ContextType,
    id: IdType,
    orFail?: TBool,
    options?: DataRetrievalOptions<EntityType>,
  ): Promise<NotNullableIf<TBool, EntityType>>;

  findOneBy<TBool extends BooleanType = false>(
    context: ContextType,
    where: Where<EntityType>,
    orFail?: TBool,
    options?: DataRetrievalOptions<EntityType>,
  ): Promise<NotNullableIf<TBool, EntityType>>;

  runInTransaction<ReturnType>(
    context: ContextType,
    fn: (context: ContextType) => Promise<ReturnType>,
    isolationLevel?: IsolationLevel,
  ): Promise<ReturnType>;

  audit(
    context: ContextType,
    action: string,
    objectId?: IdType,
    valueBefore?: object,
    valueAfter?: object,
  ): Promise<void>;
}
