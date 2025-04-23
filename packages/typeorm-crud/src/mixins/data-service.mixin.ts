import { FindManyOptions, FindOptionsWhere, Repository, SelectQueryBuilder } from 'typeorm';
import { Inject, Injectable, NotFoundException, Optional, Type, mixin } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Constructable, BooleanType, NotNullableIf } from '../types';
import { Context, Entity, IdTypeFrom, DataServiceInterface as DataServiceInterface, AuditService, FindArgsInterface, CountResultInterface, ExtendedRelationInfo, DataRetrievalOptions, DataServiceStructure } from '../interfaces';
import { DefaultArgs } from '../classes';
import { QueryBuilderHelper, hasDeleteDateColumn, getPaginationArgs } from '../helpers';

export function DataServiceFrom<
            IdType extends IdTypeFrom<EntityType>,
            EntityType extends Entity<unknown>,
            FindArgsType extends FindArgsInterface = DefaultArgs,
            ContextType extends Context = Context
            >(
                structure:DataServiceStructure<IdType,EntityType,FindArgsType,ContextType>
            ) : Type<DataServiceInterface<IdType,EntityType,FindArgsType,ContextType>>
    {
        const { entityType,contextType,findArgsType, dataRetrievalOptions } = structure;

        return DataService(entityType,findArgsType,contextType,dataRetrievalOptions);
    }

export function DataService<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  FindArgsType extends FindArgsInterface = DefaultArgs,
  ContextType extends Context = Context
>(
  entityType: Constructable<EntityType>,
  findArgsType?: Constructable<FindArgsType>,
  contextType?: Constructable<ContextType>,
  dataRetrievalOptions?:DataRetrievalOptions
): Type<DataServiceInterface<IdType,EntityType, FindArgsType, ContextType>> {

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

    async find(
      context: ContextType,
      options?: FindManyOptions<EntityType>,
    ): Promise<EntityType[]> {
      const repository = this.getRepository(context);
      return repository.find(options);
    }
    
    async findAll(
      context: ContextType,
      args?: FindArgsType,
      options?: DataRetrievalOptions,
    ): Promise<EntityType[]> {
      const queryBuilder = this.getQueryBuilder(context, args, options);

      return queryBuilder.getMany();
    }

    async Count(
      context: ContextType,
      args?: FindArgsType,
      options?: DataRetrievalOptions,
    ): Promise<CountResultInterface> {
      const queryBuilder = this.getQueryBuilder(context, {
        ...args,
        pagination: undefined,
        orderBy: undefined,
      } as FindArgsType,options);

      const { take, skip } = getPaginationArgs(args?.pagination ?? {});

      const totalRecords = await queryBuilder.getCount();
      const pageSize = take;
      const totalPages = (!pageSize)?1:Math.ceil(totalRecords / pageSize);
      const currentPage = (!pageSize)?1:Math.ceil((skip+ 1) / pageSize);
      const recordsInCurrentPage = (!pageSize)?totalRecords:Math.min(pageSize, totalRecords - skip);
      const hasNextPage = (currentPage < totalPages);
      const hasPreviousPage = (currentPage > 1);

      return { 
              totalRecords,
              recordsInCurrentPage,
              pageSize,
              currentPage,
              totalPages,
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
    
    async Audit(
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
