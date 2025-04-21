import { FindManyOptions, FindOptionsWhere, Repository, SelectQueryBuilder } from 'typeorm';
import { BooleanType, NotNullableIf } from '../../types';
import { IContext, IdTypeFrom, IEntity,  IFindArgs, ICountResult, IDataRetrievalOptions, IExtendedRelationInfo } from '../misc';

export interface IDataService<
  PrimaryKeyType extends IdTypeFrom<EntityType>,
  EntityType extends IEntity<unknown>,
  FindArgsType extends IFindArgs,
  ContextType extends IContext = IContext
> {
  getRepository(context: ContextType): Repository<EntityType>;

  getRelationsInfo(context: ContextType): IExtendedRelationInfo[]

  getQueryBuilder(
    context: ContextType,
    args?: FindArgsType,
    options?: IDataRetrievalOptions,
  ): SelectQueryBuilder<EntityType>;

  find(
    context: ContextType,
    options?: FindManyOptions<EntityType>,
  ): Promise<EntityType[]>;

  findAll(
    context: ContextType, 
    args?: FindArgsType,
    options?: IDataRetrievalOptions,
  ): Promise<EntityType[]>;

  Count(
    context: ContextType, 
    args?: FindArgsType,
    options?: IDataRetrievalOptions,
  ): Promise<ICountResult>;

  findOne<TBool extends BooleanType = false>(
    context: ContextType,
    id: PrimaryKeyType,
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
    objectId?: PrimaryKeyType,
    valueBefore?: object,
    valueAfter?: object,
  ): Promise<void>;
}