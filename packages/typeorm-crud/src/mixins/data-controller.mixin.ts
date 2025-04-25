import { Controller, Get, HttpCode, HttpStatus, Inject, Param, ParseIntPipe, PipeTransform, Query, Type, ValidationPipe, mixin } from '@nestjs/common';
import { ApiExtraModels, ApiOperation, ApiParam, ApiQuery, ApiTags, getSchemaPath  } from '@nestjs/swagger';
import { Context, IdTypeFrom, Entity, FindArgsInterface, DataControllerStructure, DataServiceInterface } from '../interfaces';
import { DefaultArgs, CountResult } from '../classes';
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

  const count_Structure =  (typeof(controllerStructure.operations?.count) == 'object')?controllerStructure.operations?.count:null;
  const countRoute = count_Structure?.route ?? 'count';
  const countDecorators = count_Structure?.decorators ?? [];
  const countSummary = count_Structure?.title ?? ('Count of ' + entityType.name.toLowerCase() + ' records');
  const countDescription = count_Structure?.description ?? ('count of ' + entityType.name.toLowerCase() + ' records');
  const countOperationId = count_Structure?.operationId;
  const countSuccessCode = count_Structure?.successCode ?? (count_Structure?.successCodes ?? [])[0]?? findAllSuccessCode ?? HttpStatus.OK;
  const countSuccessCodes = count_Structure?.successCodes ?? [countSuccessCode] ?? findAllSuccessCodes;
  const countErrorCodes = count_Structure?.errorCodes ?? [HttpStatus.BAD_REQUEST] ?? findAllErrorCodes;

  const findAllAndCount_Structure =  (typeof(controllerStructure.operations?.findAllAndCount) == 'object')?controllerStructure.operations?.findAllAndCount:null;
  const findAllAndCountRoute = findAllAndCount_Structure?.route ?? 'paginated';
  const findAllAndCountDecorators = findAllAndCount_Structure?.decorators ?? findAllDecorators ??[];
  const findAllAndCountSummary = findAllAndCount_Structure?.title ?? ('Paginated List of ' + entityType.name.toLowerCase() + 's records');
  const findAllAndCountDescription = findAllAndCount_Structure?.description ?? ('paginated list of ' + entityType.name.toLowerCase() + 's records');
  const findAllAndCountOperationId = findAllAndCount_Structure?.operationId;
  const findAllAndCountSuccessCode = findAllAndCount_Structure?.successCode ?? (findAllAndCount_Structure?.successCodes ?? [])[0] ?? findAllSuccessCode ?? HttpStatus.OK;
  const findAllAndCountSuccessCodes = findAllAndCount_Structure?.successCodes ?? [findAllSuccessCode] ?? findAllSuccessCodes;
  const findAllAndCountErrorCodes = findAllAndCount_Structure?.errorCodes ?? [HttpStatus.BAD_REQUEST] ?? findAllErrorCodes;

  const paramApiConfig = { name: 'id', description: 'ID of the ' + entityType.name + ' entity', required: true };

  @ApiTags(controllerApiTags)
  @Controller(controllerRoute)
  @applyClassDecorators(controllerDecorators)
  @ApiExtraModels(argsType)
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
    
    @Get(countRoute)
    @applyMethodDecorators(countDecorators)
    @ApiOperation({ summary: countSummary, description: countDescription, operationId: countOperationId })
    @ApiQuery({
        name: 'args',
        required: false,
        schema: {
          $ref: getSchemaPath(argsType)
        }
      })
    @HttpCode(countSuccessCode)
    @ApiResponses( { type: CountResult, successCodes:countSuccessCodes, errorCodes: countErrorCodes })
    async count?(
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
    ) :Promise<CountResult> 
    {
      return this.service.Count(context, args);
    }

    @Get(findAllAndCountRoute)
    @applyMethodDecorators(findAllAndCountDecorators)
    @ApiOperation({ summary: findAllAndCountSummary, description: findAllAndCountDescription, operationId: findAllAndCountOperationId })
    @ApiQuery({
        name: 'args',
        required: false,
        schema: {
          $ref: getSchemaPath(argsType)
        }
      })
    @HttpCode(findAllAndCountSuccessCode)
    @ApiResponses( { schema: {
      type:'object',
      properties:{
        data:{  
          type:'array',
          items:{
            $ref: getSchemaPath(entityType)
          }
        },
        pagination:{ $ref: getSchemaPath(CountResult) },
      }
    }, isArray:true, successCodes:findAllAndCountSuccessCodes, errorCodes: findAllAndCountErrorCodes })
    async findAllAndCount?(
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
    ) :Promise<{ data:EntityType[], pagination:CountResult}>
    {
      return this.service.findAllAndCount(context,args);
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
  if (controllerStructure.operations?.count === false) {
    delete DataController.prototype.count;
  }
  if (controllerStructure.operations?.findAllAndCount === false) {
    delete DataController.prototype.findAllAndCount;
  }

  return mixin(DataController);
}