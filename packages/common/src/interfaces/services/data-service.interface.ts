import { 
  BooleanType, NotNullableIf, 
  If
} from '../../types';
import { Context, IdTypeFrom, Entity,  FindArgs, PaginationResult } from '../misc';
import { Where } from '../../types/find-args.type';

export interface DataService<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  ContextType extends Context = Context
> {
  
  findAll<TBool extends BooleanType = false>(
    context: ContextType, 
    args?: FindArgs<EntityType>,
    withPagination?:TBool,
  ): Promise< If<TBool,{ data:EntityType[], pagination:PaginationResult },EntityType[]> >;

  pagination(
    context: ContextType, 
    args?: FindArgs<EntityType>
  ): Promise<PaginationResult>;

  findOne<TBool extends BooleanType = false>(
    context: ContextType,
    id: IdType,
    orFail?: TBool
  ): Promise<NotNullableIf<TBool,EntityType>>;

  findOneBy<TBool extends BooleanType = false>(
    context: ContextType,
    where: Where<EntityType>,
    orFail?: TBool
  ): Promise<NotNullableIf<TBool,EntityType>>;
   
  runInTransaction<ReturnType>(
    context: ContextType,
    fn:(context:ContextType) => Promise<ReturnType>
  ):Promise<ReturnType>;

  audit(
    context: ContextType,
    action: string,
    objectId?: IdType,
    valueBefore?: object,
    valueAfter?: object,
  ): Promise<void>;
}