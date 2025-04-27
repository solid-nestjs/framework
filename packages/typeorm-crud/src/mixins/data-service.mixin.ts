import { EntityManager, FindManyOptions, FindOptionsWhere, Repository, SelectQueryBuilder } from 'typeorm';
import { IsolationLevel } from 'typeorm/driver/types/IsolationLevel';
import { Inject, Injectable, NotFoundException, Optional, Type, mixin } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BooleanType, If, NotNullableIf } from '../types';
import { Context, Entity, IdTypeFrom, DataServiceInterface as DataServiceInterface, AuditService, FindArgsInterface, PaginationResultInterface, ExtendedRelationInfo, DataRetrievalOptions, DataServiceStructure } from '../interfaces';
import { DefaultArgs } from '../classes';
import { QueryBuilderHelper, hasDeleteDateColumn, getPaginationArgs } from '../helpers';
import { runInTransaction } from '../helpers';



export function DataServiceFrom<
    IdType extends IdTypeFrom<EntityType>,
    EntityType extends Entity<unknown>,
    FindArgsType extends FindArgsInterface = DefaultArgs,
    ContextType extends Context = Context
>(
  serviceStructure:DataServiceStructure<IdType,EntityType,FindArgsType,ContextType>,
): Type<DataServiceInterface<IdType,EntityType, FindArgsType, ContextType>> {

  const { entityType, findArgsType, dataRetrievalOptions } = serviceStructure;

  const argsType = findArgsType ?? DefaultArgs;

  class QBHelper extends QueryBuilderHelper(entityType, argsType) {}

  @Injectable()
  class DataService
    implements DataServiceInterface<IdType,EntityType, FindArgsType, ContextType>
  {
    @Inject(AuditService)
    @Optional()
    private readonly _auditService?: AuditService;

    @InjectRepository(entityType)
    private readonly _repository: Repository<EntityType>;

    private readonly _defaultDataRetrievalOptions:DataRetrievalOptions = dataRetrievalOptions ?? {};

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
      
      return QBHelper.getRelationsInfo(repository);
    }

    getQueryBuilder(
      context: ContextType,
      args?: FindArgsType,
      options?: DataRetrievalOptions,
    ): SelectQueryBuilder<EntityType> {
      const repository = this.getRepository(context);

      options = Object.assign({ mainAlias:entityType.name.toLowerCase(), relations:[] }, this._defaultDataRetrievalOptions, options);

      return QBHelper.getQueryBuilder(repository, args, options);
    }

    async find<TBool extends BooleanType = false>(
      context: ContextType,
      options?: FindManyOptions<EntityType>,
    ): Promise<EntityType[]> {
      const repository = this.getRepository(context);
      return repository.find(options);
    }
    
    async findAll<TBool extends BooleanType = false>(
      context: ContextType,
      args?: FindArgsType,
      withPagination?:TBool,
      options?: DataRetrievalOptions,
    ): Promise< If<TBool,{ data:EntityType[], pagination:PaginationResultInterface },EntityType[]> > {
      const queryBuilder = this.getQueryBuilder(context, args, options);

      const data = await queryBuilder.getMany();

      if(withPagination == false)
        return data as any;

      const pagination = await this.getPagination(context,queryBuilder,args);

      return { data, pagination } as any;
    }

    async pagination(
      context: ContextType,
      args?: FindArgsType,
      options?: DataRetrievalOptions,
    ): Promise<PaginationResultInterface> {
      const queryBuilder = this.getQueryBuilder(context, {
        ...args,
        pagination: undefined,
        orderBy: undefined,
      } as FindArgsType,options);

      return this.getPagination(context,queryBuilder,args);
    }

    async getPagination(
      context: ContextType,
      queryBuilder: SelectQueryBuilder<EntityType>,
      args?: FindArgsType,
    ) : Promise<PaginationResultInterface> {

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
      withDeleted?: boolean,
    ): Promise< NotNullableIf<TBool,EntityType> > {
      const repository = this.getRepository(context);

      withDeleted = (hasDeleteDateColumn(repository))? withDeleted : undefined;

      let entity = await this.findOneBy(context, { id:id as any }, false, withDeleted);

      if(entity)
        return entity;

      if (orFail)
        throw new NotFoundException(`${entityType.name} with id: ${JSON.stringify(id)} not found`);

      return null as NotNullableIf<TBool,EntityType>;
    }

    async findOneBy<TBool extends BooleanType = false>(
      context: ContextType,
      options: FindOptionsWhere<EntityType>,
      orFail?: TBool,
      withDeleted?: boolean,
    ): Promise< NotNullableIf<TBool,EntityType> > {
      const repository = this.getRepository(context);

      withDeleted = (hasDeleteDateColumn(repository))? withDeleted : undefined;

      let entity = await repository.findOneBy({ withDeleted, ...options });

      if(entity)
        return entity;

      if (orFail)
        throw new NotFoundException(`${entityType.name} not found with options: ${JSON.stringify(options)}`);

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

  return mixin(DataService);
}
