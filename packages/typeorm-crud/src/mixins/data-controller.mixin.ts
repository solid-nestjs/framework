import { Controller, Get, HttpCode, HttpStatus, Inject, Param, ParseIntPipe, PipeTransform, Query, Type, ValidationPipe, mixin } from '@nestjs/common';
import { ApiExtraModels, ApiOperation, ApiParam, ApiQuery, ApiTags, getSchemaPath  } from '@nestjs/swagger';
import { Constructable } from '../types';
import { IContext, IdTypeFrom, IEntity, IFindArgs, IDataControllerClassStructure, IDataControllerStructure, IDataService } from '../interfaces';
import { DefaultArgs, CountResult } from '../classes';
import { ApiResponses, CurrentContext } from '../decorators';
import { QueryTransformPipe } from '../pipes';
import { applyClassDecorators, applyMethodDecorators } from '../utils';


export function DataControllerFrom<
  PrimaryKeyType extends IdTypeFrom<EntityType>,
  EntityType extends IEntity<unknown>,
  ServiceType extends IDataService<
    PrimaryKeyType,
    EntityType,
    FindArgsType,
    ContextType
  >,
  FindArgsType extends IFindArgs = DefaultArgs,
  ContextType extends IContext = IContext,
>(
  structure: IDataControllerStructure<
    PrimaryKeyType,
    EntityType,
    ServiceType,
    FindArgsType,
    ContextType
  >,
) {
  const {
    entityType,
    serviceType,
    contextType,
    findArgsType,
  } = structure;

  return DataController(
    entityType,
    serviceType,
    structure,
    findArgsType,
    contextType,
  );
}

export function DataController<
  PrimaryKeyType extends IdTypeFrom<EntityType>,
  EntityType extends IEntity<unknown>,
  ServiceType extends IDataService<
    PrimaryKeyType,
    EntityType,
    FindArgsType,
    ContextType
  >,
  FindArgsType extends IFindArgs = DefaultArgs,
  ContextType extends IContext = IContext,
>(
  entityType: Constructable<EntityType>,
  serviceType: Constructable<ServiceType>,
  controllerStructure: IDataControllerClassStructure<PrimaryKeyType>,
  findArgsType?: Constructable<FindArgsType>,
  contextType?: Constructable<ContextType>,
) {
  const ContextDecorator =
    controllerStructure.parameterDecorators?.currentContext ?? CurrentContext;

  const argsType = findArgsType ?? DefaultArgs;


  let primaryKeyType:any = Number;
  let pipeTransforms:Type<PipeTransform>[] = [ParseIntPipe];

  if(controllerStructure.primaryKey)
  {
    primaryKeyType = controllerStructure.primaryKey.type;
    pipeTransforms = controllerStructure.primaryKey.pipeTransforms ?? [];
  }

  const controllerApiTags = controllerStructure.route ?? entityType.name.toLowerCase()+'s';
  const controllerRoute = controllerStructure.route ?? entityType.name.toLowerCase()+'s';
  const controllerDecorators = controllerStructure.classDecorators ?? [];

  
  const findAll_Structure =  (typeof(controllerStructure.findAll) == 'object')?controllerStructure.findAll:null;
  const findAllRoute = findAll_Structure?.route ?? '';
  const findAllDecorators = findAll_Structure?.decorators ?? [];
  const findAllSummary = findAll_Structure?.title ?? ('List of ' + entityType.name.toLowerCase() + 's records');
  const findAllDescription = findAll_Structure?.description ?? ('list of ' + entityType.name.toLowerCase() + 's records');
  const findAllOperationId = findAll_Structure?.operationId;
  const findAllSuccessCode = findAll_Structure?.successCode ?? (findAll_Structure?.successCodes ?? [])[0] ?? HttpStatus.OK;
  const findAllSuccessCodes = findAll_Structure?.successCodes ?? [findAllSuccessCode];
  const findAllErrorCodes = findAll_Structure?.errorCodes ?? [HttpStatus.BAD_REQUEST];

  const findOne_Structure =  (typeof(controllerStructure.findOne) == 'object')?controllerStructure.findOne:null;
  const findOneRoute = findOne_Structure?.route ?? ':id';
  const findOneDecorators = findOne_Structure?.decorators ?? [];
  const findOneSummary = findOne_Structure?.title ?? ('Retrieve ' + entityType.name.toLowerCase() + ' record by id');
  const findOneDescription = findOne_Structure?.description ?? ('retrieval of ' + entityType.name.toLowerCase() + ' record by id');
  const findOneOperationId = findOne_Structure?.operationId;
  const findOneSuccessCode = findOne_Structure?.successCode ?? (findOne_Structure?.successCodes ?? [])[0] ?? HttpStatus.OK;
  const findOneSuccessCodes = findOne_Structure?.successCodes ?? [findOneSuccessCode];
  const findOneErrorCodes = findOne_Structure?.errorCodes ?? [HttpStatus.BAD_REQUEST,HttpStatus.NOT_FOUND];

  const count_Structure =  (typeof(controllerStructure.count) == 'object')?controllerStructure.count:null;
  const countRoute = count_Structure?.route ?? 'count';
  const countDecorators = count_Structure?.decorators ?? [];
  const countSummary = count_Structure?.title ?? ('Count of ' + entityType.name.toLowerCase() + ' records');
  const countDescription = count_Structure?.description ?? ('count of ' + entityType.name.toLowerCase() + ' records');
  const countOperationId = count_Structure?.operationId;
  const countSuccessCode = count_Structure?.successCode ?? (count_Structure?.successCodes ?? [])[0] ?? HttpStatus.OK;
  const countSuccessCodes = count_Structure?.successCodes ?? [countSuccessCode];
  const countErrorCodes = count_Structure?.errorCodes ?? [HttpStatus.BAD_REQUEST];

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
    
    @Get(findOneRoute)
    @applyMethodDecorators(findOneDecorators)
    @ApiOperation({ summary: findOneSummary, description: findOneDescription, operationId: findOneOperationId })
    @ApiParam(paramApiConfig)
    @HttpCode(findOneSuccessCode)
    @ApiResponses( { type: entityType, successCodes:findOneSuccessCodes, errorCodes: findOneErrorCodes })
    async findOne?(
      @ContextDecorator() context: ContextType,
      @Param('id', ...pipeTransforms) id: PrimaryKeyType
    ) :Promise<EntityType> 
    {
      return await this.service.findOne(context, id, true);
    }
  }

  //remove controller methods if they are disabled in the structure
  if (controllerStructure.findAll === false) {
    delete DataController.prototype.findAll;
  }
  if (controllerStructure.findOne === false) {
    delete DataController.prototype.findOne;
  }
  if (controllerStructure.count === false) {
    delete DataController.prototype.count;
  }

  return mixin(DataController);
}