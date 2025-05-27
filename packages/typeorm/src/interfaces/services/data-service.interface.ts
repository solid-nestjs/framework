import { EntityManager } from 'typeorm';
import { IsolationLevel } from 'typeorm/driver/types/IsolationLevel';
import { BooleanType, Entity, FindArgs, IdTypeFrom, If, NotNullableIf, PaginationResult, Where, DataService as CommonDataService } from '@nestjz/common';
import { 
  TypeOrmFindManyOptions as FindManyOptions, 
  TypeOrmRepository as Repository, 
  TypeOrmSelectQueryBuilder as SelectQueryBuilder,
} from '../../types';
import { Context, DataRetrievalOptions, ExtendedRelationInfo } from '../misc';
import { QueryBuilderHelper } from '../../helpers';

export interface DataService<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  FindArgsType extends FindArgs<EntityType> = FindArgs<EntityType>,
  ContextType extends Context = Context
> extends CommonDataService<IdType,EntityType,ContextType>
{
  getRepository(context: ContextType): Repository<EntityType>;

  getEntityManager(context: ContextType): EntityManager;

  getRelationsInfo(context: ContextType): ExtendedRelationInfo[]

  get queryBuilderHelper():QueryBuilderHelper<IdType,EntityType>;

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
    withPagination?:TBool,
    options?: DataRetrievalOptions<EntityType>,
  ): Promise< If<TBool,{ data:EntityType[], pagination:PaginationResult },EntityType[]> >;

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
  ): Promise<NotNullableIf<TBool,EntityType>>;

  findOneBy<TBool extends BooleanType = false>(
    context: ContextType,
    where: Where<EntityType>,
    orFail?: TBool,
    options?: DataRetrievalOptions<EntityType>,
  ): Promise<NotNullableIf<TBool,EntityType>>;
   
  runInTransaction<ReturnType>(
    context: ContextType,
    fn:(context:ContextType) => Promise<ReturnType>,
    isolationLevel?: IsolationLevel,
  ):Promise<ReturnType>;

  audit(
    context: ContextType,
    action: string,
    objectId?: IdType,
    valueBefore?: object,
    valueAfter?: object,
  ): Promise<void>;
}