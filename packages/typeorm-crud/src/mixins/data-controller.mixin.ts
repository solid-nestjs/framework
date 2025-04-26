import { Controller, Get, HttpCode, HttpStatus, Inject, Param, ParseIntPipe, PipeTransform, Query, Type, ValidationPipe, mixin } from '@nestjs/common';
import { ApiExtraModels, ApiOperation, ApiParam, ApiQuery, ApiTags, getSchemaPath  } from '@nestjs/swagger';
import { Context, IdTypeFrom, Entity, FindArgsInterface, DataControllerStructure, DataServiceInterface } from '../interfaces';
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
    FindArgsType,
    ContextType
  >,
  FindArgsType extends FindArgsInterface = DefaultArgs,
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
  
  const findAll_Structure =  (typeof(controllerStructure.operations?.findAll) == 'object')?controllerStructure.operations?.findAll:null;
  const findAllRoute = findAll_Structure?.route ?? '';
  const findAllDecorators = findAll_Structure?.decorators ?? [];
  const findAllSummary = findAll_Structure?.title ?? ('List of ' + entityType.name.toLowerCase() + 's records');
  const findAllDescription = findAll_Structure?.description ?? ('list of ' + entityType.name.toLowerCase() + 's records');
  const findAllOperationId = findAll_Structure?.operationId;
  const findAllSuccessCode = findAll_Structure?.successCode ?? (findAll_Structure?.successCodes ?? [])[0] ?? HttpStatus.OK;
  const findAllSuccessCodes = findAll_Structure?.successCodes ?? [findAllSuccessCode];
  const findAllErrorCodes = findAll_Structure?.errorCodes ?? [HttpStatus.BAD_REQUEST];

  const findOne_Structure =  (typeof(controllerStructure.operations?.findOne) == 'object')?controllerStructure.operations?.findOne:null;
  const findOneRoute = findOne_Structure?.route ?? ':id';
  const findOneDecorators = findOne_Structure?.decorators ?? [];
  const findOneSummary = findOne_Structure?.title ?? ('Retrieve ' + entityType.name.toLowerCase() + ' record by id');
  const findOneDescription = findOne_Structure?.description ?? ('retrieval of ' + entityType.name.toLowerCase() + ' record by id');
  const findOneOperationId = findOne_Structure?.operationId;
  const findOneSuccessCode = findOne_Structure?.successCode ?? (findOne_Structure?.successCodes ?? [])[0] ?? HttpStatus.OK;
  const findOneSuccessCodes = findOne_Structure?.successCodes ?? [findOneSuccessCode];
  const findOneErrorCodes = findOne_Structure?.errorCodes ?? [HttpStatus.BAD_REQUEST,HttpStatus.NOT_FOUND];

  const pagination_Structure =  (typeof(controllerStructure.operations?.pagination) == 'object')?controllerStructure.operations?.pagination:null;
  const paginationRoute = pagination_Structure?.route ?? 'pagination';
  const paginationDecorators = pagination_Structure?.decorators ?? [];
  const paginationSummary = pagination_Structure?.title ?? ('Pagination of ' + entityType.name.toLowerCase());
  const paginationDescription = pagination_Structure?.description ?? ('pagination of ' + entityType.name.toLowerCase());
  const paginationOperationId = pagination_Structure?.operationId;
  const paginationSuccessCode = pagination_Structure?.successCode ?? (pagination_Structure?.successCodes ?? [])[0]?? findAllSuccessCode ?? HttpStatus.OK;
  const paginationSuccessCodes = pagination_Structure?.successCodes ?? [paginationSuccessCode] ?? findAllSuccessCodes;
  const paginationErrorCodes = pagination_Structure?.errorCodes ?? [HttpStatus.BAD_REQUEST] ?? findAllErrorCodes;

  const findAllPaginated_Structure =  (typeof(controllerStructure.operations?.findAllPaginated) == 'object')?controllerStructure.operations?.findAllPaginated:null;
  const findAllPaginatedRoute = findAllPaginated_Structure?.route ?? 'paginated';
  const findAllPaginatedDecorators = findAllPaginated_Structure?.decorators ?? findAllDecorators ??[];
  const findAllPaginatedSummary = findAllPaginated_Structure?.title ?? ('Paginated List of ' + entityType.name.toLowerCase() + 's records');
  const findAllPaginatedDescription = findAllPaginated_Structure?.description ?? ('paginated list of ' + entityType.name.toLowerCase() + 's records');
  const findAllPaginatedOperationId = findAllPaginated_Structure?.operationId;
  const findAllPaginatedSuccessCode = findAllPaginated_Structure?.successCode ?? (findAllPaginated_Structure?.successCodes ?? [])[0] ?? findAllSuccessCode ?? HttpStatus.OK;
  const findAllPaginatedSuccessCodes = findAllPaginated_Structure?.successCodes ?? [findAllSuccessCode] ?? findAllSuccessCodes;
  const findAllPaginatedErrorCodes = findAllPaginated_Structure?.errorCodes ?? [HttpStatus.BAD_REQUEST] ?? findAllErrorCodes;

  const paramApiConfig = { name: 'id', description: 'ID of the ' + entityType.name + ' entity', required: true };

  @ApiTags(controllerApiTags)
  @Controller(controllerRoute)
  @applyClassDecorators(controllerDecorators)
  @ApiExtraModels(argsType,PaginationResult)
  class DataController {
    constructor(@Inject(serviceType) readonly service: ServiceType) {}

    @Get(findAllRoute)
    @applyMethodDecorators(findAllDecorators)
    @ApiOperation({ summary: findAllSummary, description: findAllDescription, operationId: findAllOperationId })
    @ApiQuery({
        name: 'args',
        required: false,
        schema: {
          $ref: getSchemaPath(argsType)
        }
      })
    @HttpCode(findAllSuccessCode)
    @ApiResponses( { type: entityType, isArray:true, successCodes:findAllSuccessCodes, errorCodes: findAllErrorCodes })
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
    
    @Get(paginationRoute)
    @applyMethodDecorators(paginationDecorators)
    @ApiOperation({ summary: paginationSummary, description: paginationDescription, operationId: paginationOperationId })
    @ApiQuery({
        name: 'args',
        required: false,
        schema: {
          $ref: getSchemaPath(argsType)
        }
      })
    @HttpCode(paginationSuccessCode)
    @ApiResponses( { type: PaginationResult, successCodes:paginationSuccessCodes, errorCodes: paginationErrorCodes })
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

    @Get(findAllPaginatedRoute)
    @applyMethodDecorators(findAllPaginatedDecorators)
    @ApiOperation({ summary: findAllPaginatedSummary, description: findAllPaginatedDescription, operationId: findAllPaginatedOperationId })
    @ApiQuery({
        name: 'args',
        required: false,
        schema: {
          $ref: getSchemaPath(argsType)
        }
      })
    @HttpCode(findAllPaginatedSuccessCode)
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
    }, isArray:true, successCodes:findAllPaginatedSuccessCodes, errorCodes: findAllPaginatedErrorCodes })
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
    
    @Get(findOneRoute)
    @applyMethodDecorators(findOneDecorators)
    @ApiOperation({ summary: findOneSummary, description: findOneDescription, operationId: findOneOperationId })
    @ApiParam(paramApiConfig)
    @HttpCode(findOneSuccessCode)
    @ApiResponses( { type: entityType, successCodes:findOneSuccessCodes, errorCodes: findOneErrorCodes })
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