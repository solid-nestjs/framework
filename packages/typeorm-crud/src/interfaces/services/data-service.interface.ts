import { EntityManager } from 'typeorm';
import { IsolationLevel } from 'typeorm/driver/types/IsolationLevel';
import { 
  TypeOrmFindManyOptions as FindManyOptions, 
  TypeOrmFindOptionsWhere as FindOptionsWhere, 
  TypeOrmRepository as Repository, 
  TypeOrmSelectQueryBuilder as SelectQueryBuilder,
  BooleanType, NotNullableIf, 
  If
} from '../../types';
import { Context, IdTypeFrom, Entity,  FindArgsInterface, PaginationResultInterface, DataRetrievalOptions, ExtendedRelationInfo } from '../misc';
import { QueryBuilderHelper } from '../../helpers';
import { Where } from '../../types/find-args.type';

export interface DataServiceInterface<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  ContextType extends Context = Context
> {
  getRepository(context: ContextType): Repository<EntityType>;

  getEntityManager(context: ContextType): EntityManager;

  getRelationsInfo(context: ContextType): ExtendedRelationInfo[]

  getQueryBuilder(
    context: ContextType,
    args?: FindArgsInterface<EntityType>,
    options?: DataRetrievalOptions<EntityType>,
  ): SelectQueryBuilder<EntityType>;

  find(
    context: ContextType,
    options?: FindManyOptions<EntityType>,
  ): Promise<EntityType[]>;

  findAll<TBool extends BooleanType = false>(
    context: ContextType, 
    args?: FindArgsInterface<EntityType>,
    withPagination?:TBool,
    options?: DataRetrievalOptions<EntityType>,
  ): Promise< If<TBool,{ data:EntityType[], pagination:PaginationResultInterface },EntityType[]> >;

  pagination(
    context: ContextType, 
    args?: FindArgsInterface<EntityType>,
    options?: DataRetrievalOptions<EntityType>,
  ): Promise<PaginationResultInterface>;

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


  get queryBuilderHelper():QueryBuilderHelper<IdType,EntityType>;

  audit(
    context: ContextType,
    action: string,
    objectId?: IdType,
    valueBefore?: object,
    valueAfter?: object,
  ): Promise<void>;
}