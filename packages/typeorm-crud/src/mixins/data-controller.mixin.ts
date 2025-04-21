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

  const findAllRoute = controllerStructure.findAll?.route ?? '';
  const findAllDecorators = controllerStructure.findAll?.decorators ?? [];
  const findAllSummary = controllerStructure.findAll?.title ?? ('List of ' + entityType.name.toLowerCase() + 's records');
  const findAllDescription = controllerStructure.findAll?.description ?? ('list of ' + entityType.name.toLowerCase() + 's records');
  const findAllOperationId = controllerStructure.findAll?.operationId;
  const findAllSuccessCode = controllerStructure.findAll?.successCode ?? (controllerStructure.findAll?.successCodes ?? [])[0] ?? HttpStatus.OK;
  const findAllSuccessCodes = controllerStructure.findAll?.successCodes ?? [findAllSuccessCode];
  const findAllErrorCodes = controllerStructure.findAll?.errorCodes ?? [HttpStatus.BAD_REQUEST];

  const findOneRoute = controllerStructure.findOne?.route ?? ':id';
  const findOneDecorators = controllerStructure.findOne?.decorators ?? [];
  const findOneSummary = controllerStructure.findOne?.title ?? ('Retrieve ' + entityType.name.toLowerCase() + ' record by id');
  const findOneDescription = controllerStructure.findOne?.description ?? ('retrieval of ' + entityType.name.toLowerCase() + ' record by id');
  const findOneOperationId = controllerStructure.findAll?.operationId;
  const findOneSuccessCode = controllerStructure.findOne?.successCode ?? (controllerStructure.findOne?.successCodes ?? [])[0] ?? HttpStatus.OK;
  const findOneSuccessCodes = controllerStructure.findOne?.successCodes ?? [findOneSuccessCode];
  const findOneErrorCodes = controllerStructure.findOne?.errorCodes ?? [HttpStatus.BAD_REQUEST,HttpStatus.NOT_FOUND];

  const countRoute = controllerStructure.count?.route ?? 'count';
  const countDecorators = controllerStructure.count?.decorators ?? [];
  const countSummary = controllerStructure.count?.title ?? ('Count of ' + entityType.name.toLowerCase() + ' records');
  const countDescription = controllerStructure.count?.description ?? ('count of ' + entityType.name.toLowerCase() + ' records');
  const countOperationId = controllerStructure.findAll?.operationId;
  const countSuccessCode = controllerStructure.count?.successCode ?? (controllerStructure.count?.successCodes ?? [])[0] ?? HttpStatus.OK;
  const countSuccessCodes = controllerStructure.count?.successCodes ?? [countSuccessCode];
  const countErrorCodes = controllerStructure.count?.errorCodes ?? [HttpStatus.BAD_REQUEST];

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

  if (!controllerStructure.findAll) {
    // If findAll method is not defined in the structure, remove it from the class
    delete DataController.prototype.findAll;
  }
  if (!controllerStructure.findOne) {
    // If findOne method is not defined in the structure, remove it from the class
    delete DataController.prototype.findOne;
  }
  if (!controllerStructure.count && !controllerStructure.findAll) {
    // If count method is not defined in the structure, remove it from the class
    delete DataController.prototype.count;
  }

  return mixin(DataController);
}