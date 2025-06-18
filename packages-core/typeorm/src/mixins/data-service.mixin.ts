import {
  EntityManager,
  FindManyOptions,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { IsolationLevel } from 'typeorm/driver/types/IsolationLevel';
import {
  Inject,
  Injectable,
  NotFoundException,
  Optional,
  Type,
  mixin,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  applyMethodDecorators,
  AuditService,
  BooleanType,
  Entity,
  FindArgs,
  getPaginationArgs,
  getPropertyType,
  IdTypeFrom,
  If,
  NotNullableIf,
  PaginationResult,
  removeNullish,
  Where,
} from '@solid-nestjs/common';
import {
  Context,
  DataService as DataService,
  ExtendedRelationInfo,
  DataRetrievalOptions,
  DataServiceStructure,
  getMainAliasFromConfig,
  getRelationsFromConfig,
} from '../interfaces';
import { QueryBuilderHelper, runInTransaction } from '../helpers';

/**
 * Generates a dynamic NestJS data service class for a given entity type, repository, and configuration.
 *
 * This factory function creates a data service class implementing the `DataService` interface, providing
 * common data access methods such as `findAll`, `findOne`, `pagination`, and transaction support.
 * The generated class is decorated with `@Injectable()` and can be customized via the `serviceStructure` parameter,
 * which allows for configuration of entity type, lock mode, relation settings, and method decorators.
 *
 * @param serviceStructure - The configuration object describing the entity, repository, relation settings,
 *                          lock mode, and optional method decorators for the generated service.
 *
 * @returns A NestJS `Type` representing the dynamically generated data service class, ready for dependency injection.
 *
 * @example
 * ```typescript
 * const UserService = DataServiceFrom({
 *   entityType: UserEntity,
 *   lockMode: 'optimistic',
 *   relationsConfig: { ... },
 *   functions: {
 *     findAll: { decorators: [SomeDecorator()] },
 *     // ...
 *   }
 * });
 * ```
 */
export function DataServiceFrom<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  FindArgsType extends FindArgs<EntityType> = FindArgs<EntityType>,
  ContextType extends Context = Context,
>(
  serviceStructure: DataServiceStructure<
    IdType,
    EntityType,
    FindArgsType,
    ContextType
  >,
): Type<DataService<IdType, EntityType, FindArgsType, ContextType>> {
  const { entityType, lockMode, relationsConfig } = serviceStructure;

  const idType =
    serviceStructure.entityId?.type ?? getPropertyType(entityType, 'id');

  const findAllStruct = serviceStructure.functions?.findAll;
  const findOneStruct = serviceStructure.functions?.findOne;
  const paginationStruct = serviceStructure.functions?.pagination;

  const findAllDecorators = [...(findAllStruct?.decorators ?? [])];
  const findOneDecorators = [...(findOneStruct?.decorators ?? [])];
  const paginationDecorators = [...(paginationStruct?.decorators ?? [])];

  @Injectable()
  class DataServiceClass
    implements DataService<IdType, EntityType, FindArgsType, ContextType>
  {
    @Inject(AuditService)
    @Optional()
    private readonly _auditService?: AuditService;

    @InjectRepository(entityType)
    private readonly _repository!: Repository<EntityType>;

    @Inject(QueryBuilderHelper<IdType, EntityType>)
    @Optional()
    private readonly _queryBuilderHelper: QueryBuilderHelper<
      IdType,
      EntityType
    > = new QueryBuilderHelper<IdType, EntityType>(entityType, idType, {
      lockMode,
      relationsConfig,
    });

    constructor() {}

    get queryBuilderHelper(): QueryBuilderHelper<IdType, EntityType> {
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
      args?: FindArgsType,
      options?: DataRetrievalOptions<EntityType>,
    ): SelectQueryBuilder<EntityType> {
      const repository = this.getRepository(context);

      return this.queryBuilderHelper.getQueryBuilder(repository, args, options);
    }

    getNonMultiplyingPaginatedQueryBuilder(
      context: ContextType,
      args?: FindArgsType,
      options?: DataRetrievalOptions<EntityType>,
    ): SelectQueryBuilder<EntityType> | false {
      const repository = this.getRepository(context);

      return this.queryBuilderHelper.getNonMultiplyingPaginatedQueryBuilder(
        repository,
        args,
        options,
      );
    }

    async find(
      context: ContextType,
      options?: FindManyOptions<EntityType>,
    ): Promise<EntityType[]> {
      const repository = this.getRepository(context);
      return repository.find(options);
    }

    @applyMethodDecorators(findAllDecorators)
    async findAll<TBool extends BooleanType = false>(
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
    > {
      options = {
        ...options,
        lockMode: options?.lockMode ?? findAllStruct?.lockMode,
        mainAlias:
          options?.mainAlias ??
          getMainAliasFromConfig(findAllStruct?.relationsConfig),
        relations:
          options?.relations ??
          getRelationsFromConfig(findAllStruct?.relationsConfig),
      };

      const paginatedQueryBuilder = this.getNonMultiplyingPaginatedQueryBuilder(
        context,
        args,
        options,
      );

      let data: EntityType[];

      if (paginatedQueryBuilder) {
        const ids = await paginatedQueryBuilder.getMany();

        if (ids.length > 0) {
          const _ids = removeNullish(ids);

          const queryBuilder = this.getQueryBuilder(
            context,
            { ...args, pagination: undefined } as FindArgsType,
            options,
          ).andWhereInIds(_ids);
          data = await queryBuilder.getMany();
        } else data = [];
      } else {
        const queryBuilder = this.getQueryBuilder(context, args, options);
        data = await queryBuilder.getMany();
      }

      if (!withPagination) return data as any;

      const pagination = await this.pagination(context, args, options);

      return { data, pagination } as any;
    }

    @applyMethodDecorators(paginationDecorators)
    async pagination(
      context: ContextType,
      args?: FindArgsType,
      options?: DataRetrievalOptions<EntityType>,
    ): Promise<PaginationResult> {
      options = {
        ...options,
        lockMode: options?.lockMode ?? paginationStruct?.lockMode,
        mainAlias:
          options?.mainAlias ??
          getMainAliasFromConfig(paginationStruct?.relationsConfig),
        relations:
          options?.relations ??
          getRelationsFromConfig(paginationStruct?.relationsConfig),
        ignoreMultiplyingJoins: true,
        ignoreSelects: true,
      };

      const queryBuilder = this.getQueryBuilder(
        context,
        {
          ...args,
          pagination: undefined,
          orderBy: undefined,
        } as FindArgsType,
        options,
      );

      return this.getPagination(context, await queryBuilder.getCount(), args);
    }

    async getPagination(
      context: ContextType,
      total: number,
      args?: FindArgsType,
    ): Promise<PaginationResult> {
      const { take, skip } = getPaginationArgs(args?.pagination ?? {});

      let limit = take;
      const pageCount = !limit ? 1 : Math.ceil(total / limit);
      const page = !limit ? 1 : Math.ceil((skip + 1) / limit);
      const count = !limit ? total : Math.min(limit, total - skip);

      if (!limit) limit = count;

      const hasNextPage = page < pageCount;
      const hasPreviousPage = page > 1;

      return {
        total,
        count,
        limit,
        page,
        pageCount,
        hasNextPage,
        hasPreviousPage,
      };
    }

    @applyMethodDecorators(findOneDecorators)
    async findOne<TBool extends BooleanType = false>(
      context: ContextType,
      id: IdType,
      orFail?: TBool,
      options?: DataRetrievalOptions<EntityType>,
    ): Promise<NotNullableIf<TBool, EntityType>> {
      const _id = typeof id === 'object' ? id : { id: id as any };

      let entity = await this.findOneBy(context, _id as any, false, options);

      if (entity) return entity;

      if (orFail)
        throw new NotFoundException(
          `${entityType.name} with id: ${JSON.stringify(id)} not found`,
        );

      return null as NotNullableIf<TBool, EntityType>;
    }

    async findOneBy<TBool extends BooleanType = false>(
      context: ContextType,
      where: Where<EntityType>,
      orFail?: TBool,
      options?: DataRetrievalOptions<EntityType>,
    ): Promise<NotNullableIf<TBool, EntityType>> {
      const args = { where } as FindArgsType;

      options = {
        ...options,
        lockMode: options?.lockMode ?? findOneStruct?.lockMode,
        mainAlias:
          options?.mainAlias ??
          getMainAliasFromConfig(findOneStruct?.relationsConfig),
        relations:
          options?.relations ??
          getRelationsFromConfig(findOneStruct?.relationsConfig),
      };

      const queryBuilder = this.getQueryBuilder(context, args, options);

      let entity = await queryBuilder.getOne();

      if (entity) return entity;

      if (orFail)
        throw new NotFoundException(
          `${entityType.name} not found with options: ${JSON.stringify(where)}`,
        );

      return entity as NotNullableIf<TBool, EntityType>;
    }

    async runInTransaction<ReturnType>(
      context: ContextType,
      fn: (context: ContextType) => Promise<ReturnType>,
      isolationLevel?: IsolationLevel,
    ): Promise<ReturnType> {
      const manager = this.getEntityManager(context);

      return runInTransaction(context, manager.connection, fn, isolationLevel);
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
