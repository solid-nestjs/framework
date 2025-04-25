import { 
  TypeOrmFindManyOptions as FindManyOptions, 
  TypeOrmFindOptionsWhere as FindOptionsWhere, 
  TypeOrmRepository as Repository, 
  TypeOrmSelectQueryBuilder as SelectQueryBuilder,
  BooleanType, NotNullableIf 
} from '../../types';
import { Context, IdTypeFrom, Entity,  FindArgsInterface, CountResultInterface, DataRetrievalOptions, ExtendedRelationInfo } from '../misc';

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

  findAll(
    context: ContextType, 
    args?: FindArgsType,
    options?: DataRetrievalOptions,
  ): Promise<EntityType[]>;

  Count(
    context: ContextType, 
    args?: FindArgsType,
    options?: DataRetrievalOptions,
  ): Promise<CountResultInterface>;

  findAllAndCount(
    context: ContextType, 
    args?: FindArgsType,
    options?: DataRetrievalOptions,
  ): Promise<{ data:EntityType[], pagination:CountResultInterface }>;

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
   
  Audit(
    context: ContextType,
    action: string,
    objectId?: IdType,
    valueBefore?: object,
    valueAfter?: object,
  ): Promise<void>;
}