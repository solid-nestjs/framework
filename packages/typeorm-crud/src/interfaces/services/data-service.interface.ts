import { 
  TypeOrmFindManyOptions as FindManyOptions, 
  TypeOrmFindOptionsWhere as FindOptionsWhere, 
  TypeOrmRepository as Repository, 
  TypeOrmSelectQueryBuilder as SelectQueryBuilder,
  BooleanType, NotNullableIf, 
  If
} from '../../types';
import { Context, IdTypeFrom, Entity,  FindArgsInterface, PaginationResultInterface, DataRetrievalOptions, ExtendedRelationInfo } from '../misc';

export interface DataServiceInterface<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  FindArgsType extends FindArgsInterface,
  ContextType extends Context = Context
> {
  getRepository(context: ContextType): Repository<EntityType>;

  getRelationsInfo(context: ContextType): ExtendedRelationInfo[]

  getQueryBuilder(
    context: ContextType,
    args?: FindArgsType,
    options?: DataRetrievalOptions,
  ): SelectQueryBuilder<EntityType>;

  find(
    context: ContextType,
    options?: FindManyOptions<EntityType>,
  ): Promise<EntityType[]>;

  findAll<TBool extends BooleanType = false>(
    context: ContextType, 
    args?: FindArgsType,
    withPagination?:TBool,
    options?: DataRetrievalOptions,
  ): Promise< If<TBool,{ data:EntityType[], pagination:PaginationResultInterface },EntityType[]> >;

  pagination(
    context: ContextType, 
    args?: FindArgsType,
    options?: DataRetrievalOptions,
  ): Promise<PaginationResultInterface>;

  findOne<TBool extends BooleanType = false>(
    context: ContextType,
    id: IdType,
    orFail?: TBool,
    withDeleted?: boolean,
  ): Promise<NotNullableIf<TBool,EntityType>>;

  findOneBy<TBool extends BooleanType = false>(
    context: ContextType,
    options: FindOptionsWhere<EntityType>,
    orFail?: TBool,
    withDeleted?: boolean,
  ): Promise<NotNullableIf<TBool,EntityType>>;
   
  audit(
    context: ContextType,
    action: string,
    objectId?: IdType,
    valueBefore?: object,
    valueAfter?: object,
  ): Promise<void>;
}