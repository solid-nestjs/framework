import { Controller, Get, HttpCode, HttpStatus, Inject, Param, ParseIntPipe, PipeTransform, Query, Type, ValidationPipe, mixin } from '@nestjs/common';
import { ApiExtraModels, ApiOperation, ApiParam, ApiQuery, ApiTags, getSchemaPath  } from '@nestjs/swagger';
import { Context, IdTypeFrom, Entity, FindArgsInterface, DataControllerStructure, DataServiceInterface, OperationStructure } from '../interfaces';
import { DefaultArgs, PaginationResult } from '../classes';
import { ApiResponses, CurrentContext } from '../decorators';
import { QueryTransformPipe } from '../pipes';
import { applyClassDecorators, applyMethodDecorators } from '../utils';

export function DataControllerFrom<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  ServiceType extends DataServiceInterface<
    IdType,
    EntityType,
    ContextType
  >,
  FindArgsType extends FindArgsInterface<EntityType> = DefaultArgs,
  ContextType extends Context = Context,
>(
  controllerStructure: DataControllerStructure<
                          IdType,
                          EntityType,
                          ServiceType,
                          FindArgsType,
                          ContextType
                        >
) {
  const { entityType, serviceType, findArgsType } = controllerStructure;

  const ContextDecorator =
    controllerStructure.parameterDecorators?.context ?? CurrentContext;

  const argsType = findArgsType ?? DefaultArgs;


  let idType:any = Number;
  let pipeTransforms:Type<PipeTransform>[] = [ParseIntPipe];

  if(controllerStructure.entityId)
  {
    idType = controllerStructure.entityId.type;
    pipeTransforms = controllerStructure.entityId.pipeTransforms ?? [];
  }

  const controllerApiTags = controllerStructure.route ?? entityType.name.toLowerCase()+'s';
  const controllerRoute = controllerStructure.route ?? entityType.name.toLowerCase()+'s';
  const controllerDecorators = controllerStructure.classDecorators ?? [];
  
  const findAllSettings = extractOperationSettings(
    controllerStructure.operations?.findAll,
    {
      route: '',
      summary: 'List of ' + entityType.name.toLowerCase() + 's records',
      description: 'list of ' + entityType.name.toLowerCase() + 's records',
      successCode: HttpStatus.OK,
      errorCodes: [HttpStatus.BAD_REQUEST],
    }
  );

  const findOneSettings = extractOperationSettings(
    controllerStructure.operations?.findOne,
    {
      route: ':id',
      summary: 'Retrieve ' + entityType.name.toLowerCase() + ' record by id',
      description: 'retrieval of ' + entityType.name.toLowerCase() + ' record by id',
      successCode: HttpStatus.OK,
      errorCodes: [HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND],
    }
  );

  const paginationSettings = extractOperationSettings(
    controllerStructure.operations?.pagination,
    {
      route: 'pagination',
      summary: 'Pagination of ' + entityType.name.toLowerCase(),
      description: 'pagination of ' + entityType.name.toLowerCase(),
      successCode: HttpStatus.OK,
      errorCodes: [HttpStatus.BAD_REQUEST],
    }
  );

  const findAllPaginatedSettings = extractOperationSettings(
    controllerStructure.operations?.findAllPaginated,
    {
      route: 'paginated',
      summary: 'Paginated List of ' + entityType.name.toLowerCase() + 's records',
      description: 'paginated list of ' + entityType.name.toLowerCase() + 's records',
      successCode: HttpStatus.OK,
      errorCodes: [HttpStatus.BAD_REQUEST],
    }
  );

  const paramApiConfig = { name: 'id', description: 'ID of the ' + entityType.name + ' entity', required: true };

  @ApiTags(controllerApiTags)
  @Controller(controllerRoute)
  @applyClassDecorators(controllerDecorators)
  @ApiExtraModels(argsType,PaginationResult)
  class DataController {
    constructor(@Inject(serviceType) readonly service: ServiceType) {}

    @Get(findAllSettings?.route ?? '')
    @applyMethodDecorators(findAllSettings?.decorators ?? [])
    @ApiOperation({ summary: findAllSettings?.summary, description: findAllSettings?.description, operationId: findAllSettings?.operationId })
    @ApiQuery({
        name: 'args',
        required: false,
        schema: {
          $ref: getSchemaPath(argsType)
        }
      })
    @HttpCode(findAllSettings?.successCode ?? HttpStatus.OK)
    @ApiResponses( { type: entityType, isArray:true, successCodes:findAllSettings?.successCodes ?? [HttpStatus.OK], errorCodes: findAllSettings?.errorCodes ?? [HttpStatus.BAD_REQUEST] })
    async findAll?(
      @ContextDecorator() context: ContextType,
      @Query(
            QueryTransformPipe,  
            new ValidationPipe({ 
                transform: true,
                expectedType:argsType, 
                whitelist: true,
                forbidNonWhitelisted: true,
                forbidUnknownValues: true
            }),
          ) args
    ) :Promise<EntityType[]>
    {
      return this.service.findAll(context, args);
    }
    
    @Get(paginationSettings?.route ?? 'pagination')
    @applyMethodDecorators(paginationSettings?.decorators ?? [])
    @ApiOperation({ summary: paginationSettings?.summary, description: paginationSettings?.description, operationId: paginationSettings?.operationId })
    @ApiQuery({
        name: 'args',
        required: false,
        schema: {
          $ref: getSchemaPath(argsType)
        }
      })
    @HttpCode(paginationSettings?.successCode ?? HttpStatus.OK)
    @ApiResponses( { type: PaginationResult, successCodes:paginationSettings?.successCodes ?? [HttpStatus.OK], errorCodes: paginationSettings?.errorCodes ?? [HttpStatus.BAD_REQUEST] })
    async pagination?(
      @ContextDecorator() context: ContextType,
      @Query(
            QueryTransformPipe,  
            new ValidationPipe({ 
                transform: true,
                expectedType:argsType, 
                whitelist: true,
                forbidNonWhitelisted: true,
                forbidUnknownValues: true
            }),
          ) args
    ) :Promise<PaginationResult> 
    {
      return this.service.pagination(context, args);
    }

    @Get(findAllPaginatedSettings?.route ?? 'paginated')
    @applyMethodDecorators(findAllPaginatedSettings?.decorators ?? [])
    @ApiOperation({ summary: findAllPaginatedSettings?.summary, description: findAllPaginatedSettings?.description, operationId: findAllPaginatedSettings?.operationId })
    @ApiQuery({
        name: 'args',
        required: false,
        schema: {
          $ref: getSchemaPath(argsType)
        }
      })
    @HttpCode(findAllPaginatedSettings?.successCode ?? HttpStatus.OK)
    @ApiResponses( { schema: {
      type:'object',
      properties:{
        data:{  
          type:'array',
          items:{
            $ref: getSchemaPath(entityType)
          }
        },
        pagination:{ $ref: getSchemaPath(PaginationResult) },
      }
    }, isArray:true, successCodes:findAllPaginatedSettings?.successCodes ?? [HttpStatus.OK], errorCodes: findAllPaginatedSettings?.errorCodes ?? [HttpStatus.BAD_REQUEST] })
    async findAllPaginated?(
      @ContextDecorator() context: ContextType,
      @Query(
            QueryTransformPipe,  
            new ValidationPipe({ 
                transform: true,
                expectedType:argsType, 
                whitelist: true,
                forbidNonWhitelisted: true,
                forbidUnknownValues: true
            }),
          ) args
    ) :Promise<{ data:EntityType[], pagination:PaginationResult}>
    {
      return this.service.findAll(context,args,true);
    }
    
    @Get(findOneSettings?.route ?? ':id')
    @applyMethodDecorators(findOneSettings?.decorators ?? [])
    @ApiOperation({ summary: findOneSettings?.summary, description: findOneSettings?.description, operationId: findOneSettings?.operationId })
    @ApiParam(paramApiConfig)
    @HttpCode(findOneSettings?.successCode ?? HttpStatus.OK)
    @ApiResponses( { type: entityType, successCodes:findOneSettings?.successCodes ?? [HttpStatus.OK], errorCodes: findOneSettings?.errorCodes ?? [HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND] })
    async findOne?(
      @ContextDecorator() context: ContextType,
      @Param('id', ...pipeTransforms) id: IdType
    ) :Promise<EntityType> 
    {
      return await this.service.findOne(context, id, true);
    }
  }

  //remove controller methods if they are disabled in the structure
  if (controllerStructure.operations?.findAll === false) {
    delete DataController.prototype.findAll;
  }
  if (controllerStructure.operations?.findOne === false) {
    delete DataController.prototype.findOne;
  }
  if (!controllerStructure.operations?.pagination) { //by default dont show this
    delete DataController.prototype.pagination;
  }
  if (controllerStructure.operations?.findAllPaginated === false) {
    delete DataController.prototype.findAllPaginated;
  }

  return mixin(DataController);
}

export function extractOperationSettings(
  operation:OperationStructure|boolean|undefined, 
  defaults:{
    route:string|undefined, 
    summary:string, 
    description:string,
    successCode:HttpStatus, 
    errorCodes:HttpStatus[]
  }
) {
  if(typeof(operation) !== 'object')
    operation = {} as OperationStructure;
  
  return {
    route: operation.route ?? defaults.route,
    decorators: operation.decorators ?? [],
    summary: operation.title ?? defaults.summary,
    description: operation.description ?? defaults.description,
    operationId: operation.operationId,
    successCode: operation.successCode ?? (operation.successCodes ?? [])[0] ?? defaults.successCode,
    successCodes: operation.successCodes ?? [defaults.successCode],
    errorCodes: operation.errorCodes ?? defaults.errorCodes,
  };
}