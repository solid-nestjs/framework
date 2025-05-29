import { Inject, ParseIntPipe, PipeTransform, Type, mixin } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { Context, IdTypeFrom, Entity, FindArgs, DataService, CurrentContext, applyClassDecorators, applyMethodDecorators, applyMethodDecoratorsIf } from "@solid-nestjs/common";
import { DataResolverStructure,  OperationStructure } from '../interfaces';
import { DefaultArgs, PaginationResult } from '../classes';


/**
 * Generates a NestJS GraphQL resolver class for a given entity, service, and context.
 * 
 * This mixin function dynamically creates a resolver with standard CRUD operations
 * (findAll, findOne, pagination) based on the provided configuration structure.
 * It supports custom decorators, argument types, and operation settings.
 * 
 * @typeParam IdType - The type of the entity's identifier.
 * @typeParam EntityType - The entity type managed by the resolver.
 * @typeParam ServiceType - The data service type used for data access.
 * @typeParam FindArgsType - The type of arguments accepted for find operations (defaults to `DefaultArgs<EntityType>`).
 * @typeParam ContextType - The context type injected into resolver methods (defaults to `Context`).
 * 
 * @param resolverStructure - The configuration object specifying entity, service, argument types,
 * decorators, and enabled operations for the resolver.
 * 
 * @returns A NestJS mixin class implementing the configured resolver.
 * 
 * @example
 * ```typescript
 * const UserResolver = DataResolverFrom({
 *   entityType: User,
 *   serviceType: UserService,
 *   findArgsType: UserFindArgs,
 *   classDecorators: [SomeDecorator()],
 *   operations: { findAll: true, findOne: true, pagination: false }
 * });
 * ```
 */
export function DataResolverFrom<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  ServiceType extends DataService<
    IdType,
    EntityType,
    ContextType
  >,
  FindArgsType extends FindArgs<EntityType> = DefaultArgs<EntityType>,
  ContextType extends Context = Context,
>(
  resolverStructure: DataResolverStructure<
                          IdType,
                          EntityType,
                          ServiceType,
                          FindArgsType,
                          ContextType
                        >
) {
  const { entityType, serviceType, findArgsType } = resolverStructure;

  const ContextDecorator =
    resolverStructure.parameterDecorators?.context ?? CurrentContext;

  const argsType = findArgsType ?? DefaultArgs;


  let idType:any = Number;
  let pipeTransforms:Type<PipeTransform>[] = [ParseIntPipe];

  if(resolverStructure.entityId)
  {
    idType = resolverStructure.entityId.type;
    pipeTransforms = resolverStructure.entityId.pipeTransforms ?? [];
  }

  const controllerDecorators = resolverStructure.classDecorators ?? [];
  
  const findAllSettings = extractOperationSettings(
    resolverStructure.operations?.findAll,
    {
      disabled: resolverStructure.operations?.findAll === false,
      name: entityType.name.toLowerCase()+'s',
      summary: 'List of ' + entityType.name.toLowerCase() + 's records',
      description: 'list of ' + entityType.name.toLowerCase() + 's records',
    }
  );

  const findOneSettings = extractOperationSettings(
    resolverStructure.operations?.findOne,
    {
      disabled: resolverStructure.operations?.findOne === false,
      name: entityType.name.toLowerCase(),
      summary: 'Retrieve ' + entityType.name.toLowerCase() + ' record by id',
      description: 'retrieval of ' + entityType.name.toLowerCase() + ' record by id',
    }
  );

  const paginationSettings = extractOperationSettings(
    resolverStructure.operations?.pagination,
    {
      disabled: resolverStructure.operations?.pagination === false,
      name: findAllSettings.name+'Pagination',
      summary: 'Pagination of ' + entityType.name.toLowerCase(),
      description: 'pagination of ' + entityType.name.toLowerCase(),
    }
  );

  @Resolver((of) => entityType)
  @applyClassDecorators(controllerDecorators)
  class DataController {
    constructor(@Inject(serviceType) readonly service: ServiceType) {}

    @applyMethodDecoratorsIf(!findAllSettings.disabled,[
      () => Query((returns) => [entityType], { name: findAllSettings.name, description: findAllSettings.description }),
      ...findAllSettings.decorators
    ])
    async findAll?(
      @ContextDecorator() context: ContextType,
      @Args(undefined as any, { type: () => argsType }) args,
    ) :Promise<EntityType[]>
    {
      return this.service.findAll(context, args);
    }
    
    @applyMethodDecoratorsIf(!paginationSettings.disabled,[
      () => Query((returns) => PaginationResult, { name: paginationSettings.name, description: paginationSettings.description }),
      ...paginationSettings.decorators
    ])
    async pagination?(
      @ContextDecorator() context: ContextType,
      @Args(undefined as any, { type: () => argsType }) args
    ) :Promise<PaginationResult> 
    {
      return this.service.pagination(context, args);
    }
    
    @applyMethodDecoratorsIf(!findOneSettings.disabled,[
      () => Query((returns) => entityType, { name: findOneSettings.name, description: findOneSettings.description }),
      ...findOneSettings.decorators
    ])
    async findOne?(
      @ContextDecorator() context: ContextType,
      @Args('id', { type: () => idType }, ...pipeTransforms) id: IdType
    ) :Promise<EntityType> 
    {
      return await this.service.findOne(context, id, true);
    }
  }

  //remove resolver methods if they are disabled in the structure
  if (findAllSettings.disabled) {
    delete DataController.prototype.findAll;
  }
  if (findOneSettings.disabled) {
    delete DataController.prototype.findOne;
  }
  if (paginationSettings.disabled) {
    delete DataController.prototype.pagination;
  }

  return mixin(DataController);
}

export function extractOperationSettings(
  operation:OperationStructure|boolean|undefined, 
  defaults:{
    disabled:boolean;
    name:string,
    summary:string, 
    description:string
  }
) {
  if(typeof(operation) !== 'object')
    operation = {} as OperationStructure;
  
  return {
    disabled: defaults.disabled,
    name: operation.name ?? defaults.name,
    decorators: operation.decorators ?? [],
    summary: operation.title ?? defaults.summary,
    description: operation.description ?? defaults.description
  };
}