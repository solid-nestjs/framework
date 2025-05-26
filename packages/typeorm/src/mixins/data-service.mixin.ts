import { EntityManager, FindManyOptions, Repository, SelectQueryBuilder } from 'typeorm';
import { IsolationLevel } from 'typeorm/driver/types/IsolationLevel';
import { Inject, Injectable, NotFoundException, Optional, Type, mixin } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuditService, BooleanType, Entity, FindArgs, getPaginationArgs, IdTypeFrom, If, NotNullableIf, PaginationResult, Where } from '@nestjz/common';
import { Context, DataService as DataService, ExtendedRelationInfo, DataRetrievalOptions, DataServiceStructure } from '../interfaces';
import { QueryBuilderHelper, runInTransaction } from '../helpers';

export function DataServiceFrom<
    IdType extends IdTypeFrom<EntityType>,
    EntityType extends Entity<unknown>,
    ContextType extends Context = Context
>(
  serviceStructure:DataServiceStructure<IdType,EntityType,ContextType>,
): Type<DataService<IdType,EntityType, ContextType>> {

  const { entityType, queryLocksConfig: lockModesConfig, relationsConfig } = serviceStructure;
  

  @Injectable()
  class DataServiceClass
    implements DataService<IdType,EntityType,ContextType>
  {
    @Inject(AuditService)
    @Optional()
    private readonly _auditService?: AuditService;


    constructor(
      @InjectRepository(entityType)
      private readonly _repository: Repository<EntityType>
    ) {}

    private readonly _queryBuilderHelper:QueryBuilderHelper<IdType,EntityType> = new QueryBuilderHelper<IdType,EntityType>(entityType,{ queryLocksConfig: lockModesConfig, relationsConfig });

    get queryBuilderHelper():QueryBuilderHelper<IdType,EntityType>{
      return this._queryBuilderHelper;
    }

    getRepository(context: ContextType) {
      if (context?.transactionManager)
        return context.transactionManager.getRepository(entityType);
      
      return this._repository;
    }

    getEntityManager(context: ContextType): EntityManager {
      
      return this.getRepository(context).manager;
    }

    getRelationsInfo(context: ContextType): ExtendedRelationInfo[] {
      const repository = this.getRepository(context);
      
      return this.queryBuilderHelper.getRelationsInfo(repository);
    }

    getQueryBuilder(
      context: ContextType,
      args?: FindArgs<EntityType>,
      options?: DataRetrievalOptions<EntityType>,
    ): SelectQueryBuilder<EntityType> {
      const repository = this.getRepository(context);

      return this.queryBuilderHelper.getQueryBuilder(repository, args, options);
    }

    async find(
      context: ContextType,
      options?: FindManyOptions<EntityType>,
    ): Promise<EntityType[]> {
      const repository = this.getRepository(context);
      return repository.find(options);
    }
    
    async findAll<TBool extends BooleanType = false>(
      context: ContextType,
      args?: FindArgs<EntityType>,
      withPagination?:TBool,
      options?: DataRetrievalOptions<EntityType>,
    ): Promise< If<TBool,{ data:EntityType[], pagination:PaginationResult },EntityType[]> > {
      const queryBuilder = this.getQueryBuilder(context, args, options);

      const data = await queryBuilder.getMany();

      if(!withPagination)
        return data as any;

      const pagination = await this.getPagination(context,queryBuilder,args);

      return { data, pagination } as any;
    }

    async pagination(
      context: ContextType,
      args?: FindArgs<EntityType>,
      options?: DataRetrievalOptions<EntityType>,
    ): Promise<PaginationResult> {
      const queryBuilder = this.getQueryBuilder(context, {
        ...args,
        pagination: undefined,
        orderBy: undefined,
      } as FindArgs<EntityType>,options);

      return this.getPagination(context,queryBuilder,args);
    }

    async getPagination(
      context: ContextType,
      queryBuilder: SelectQueryBuilder<EntityType>,
      args?: FindArgs<EntityType>,
    ) : Promise<PaginationResult> {

      const { take, skip } = getPaginationArgs(args?.pagination ?? {});

      const total = await queryBuilder.getCount();
      let limit = take;
      const pageCount = (!limit)?1:Math.ceil(total / limit);
      const page = (!limit)?1:Math.ceil((skip+ 1) / limit);
      const count = (!limit)?total:Math.min(limit, total - skip);
      
      if(!limit)
        limit = count;

      const hasNextPage = (page < pageCount);
      const hasPreviousPage = (page > 1);

      return { 
              total,
              count,
              limit,
              page,
              pageCount,
              hasNextPage,
              hasPreviousPage 
            };
    }
    
    async findOne<TBool extends BooleanType = false>(
      context: ContextType,
      id: IdType,
      orFail?: TBool,
      options?: DataRetrievalOptions<EntityType>,
    ): Promise< NotNullableIf<TBool,EntityType> > {

      let entity = await this.findOneBy(context, { id:id as any }, false, options);

      if(entity)
        return entity;

      if (orFail)
        throw new NotFoundException(`${entityType.name} with id: ${JSON.stringify(id)} not found`);

      return null as NotNullableIf<TBool,EntityType>;
    }

    async findOneBy<TBool extends BooleanType = false>(
      context: ContextType,
      where: Where<EntityType>,
      orFail?: TBool,
      options?: DataRetrievalOptions<EntityType>,
    ): Promise< NotNullableIf<TBool,EntityType> > {

      const args = { where } as FindArgs<EntityType>;

      options = { ...options, lockMode:options?.lockMode ?? lockModesConfig?.findOne };

      const queryBuilder = this.getQueryBuilder(context, args, options);

      let entity = await queryBuilder.getOne();

      if(entity)
        return entity;

      if (orFail)
        throw new NotFoundException(`${entityType.name} not found with options: ${JSON.stringify(where)}`);

      return entity as NotNullableIf<TBool,EntityType>;
    }
    
    async runInTransaction<ReturnType>(
        context: ContextType,
        fn:(context:ContextType) => Promise<ReturnType>,
        isolationLevel?: IsolationLevel,
      ):Promise<ReturnType>
    {
        const manager = this.getEntityManager(context);

        return runInTransaction(context,manager.connection,fn,isolationLevel);
    }

    async audit(
      context: ContextType,
      action: string,
      objectId?: IdType,
      valueBefore?: object,
      valueAfter?: object,
    ): Promise<void> {
      if (!this._auditService) return;

      const serviceName = this.constructor.name;

      this._auditService.Audit(
        context,
        serviceName,
        action,
        objectId,
        valueBefore,
        valueAfter,
      );
    }
  }

  return mixin(DataServiceClass);
}
