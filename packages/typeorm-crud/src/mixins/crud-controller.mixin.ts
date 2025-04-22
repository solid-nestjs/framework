import { DeepPartial } from 'typeorm';
import { Body, Delete, HttpCode, HttpStatus, Param, ParseIntPipe, PipeTransform, Post, Put, Type, mixin } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam  } from '@nestjs/swagger';
import { Constructable } from '../types';
import { IContext, IdTypeFrom, IEntity, IFindArgs, ICrudService, ICrudControllerStructure, ICrudControllerClassStructure } from '../interfaces';
import { ApiResponses, CurrentContext } from '../decorators';
import { applyMethodDecorators } from '../utils';
import { CountResult, DefaultArgs } from '../classes';
import { DataController } from './data-controller.mixin';

export function CrudControllerFrom<
  PrimaryKeyType extends IdTypeFrom<EntityType>,
  EntityType extends IEntity<unknown>,
  CreateInputType extends DeepPartial<EntityType>,
  UpdateInputType extends DeepPartial<EntityType>,
  ServiceType extends ICrudService<
    PrimaryKeyType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    FindArgsType,
    ContextType
  >,
  FindArgsType extends IFindArgs = DefaultArgs,
  ContextType extends IContext = IContext,
>(
  structure: ICrudControllerStructure<
    PrimaryKeyType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    ServiceType,
    FindArgsType,
    ContextType
  >,
) {
  const {
    entityType,
    createInputType,
    updateInputType,
    serviceType,
    contextType,
    findArgsType,
  } = structure;

  return CrudController(
    entityType,
    createInputType,
    updateInputType,
    serviceType,
    structure,
    findArgsType,
    contextType,
  );
}

export function CrudController<
  PrimaryKeyType extends IdTypeFrom<EntityType>,
  EntityType extends IEntity<unknown>,
  CreateInputType extends DeepPartial<EntityType>,
  UpdateInputType extends DeepPartial<EntityType>,
  ServiceType extends ICrudService<
    PrimaryKeyType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    FindArgsType,
    ContextType
  >,
  FindArgsType extends IFindArgs = DefaultArgs,
  ContextType extends IContext = IContext,
>(
  entityType: Constructable<EntityType>,
  createInputType: Constructable<CreateInputType>,
  updateInputType: Constructable<UpdateInputType>,
  serviceType: Constructable<ServiceType>,
  controllerStructure: ICrudControllerClassStructure<PrimaryKeyType>,
  findArgsType?: Constructable<FindArgsType>,
  contextType?: Constructable<ContextType>,
) {
  const ContextDecorator =
    controllerStructure.parameterDecorators?.currentContext ?? CurrentContext;

  let primaryKeyType:any = Number;
  let pipeTransforms:Type<PipeTransform>[] = [ParseIntPipe];

  if(controllerStructure.primaryKey)
  {
    primaryKeyType = controllerStructure.primaryKey.type;
    pipeTransforms = controllerStructure.primaryKey.pipeTransforms ?? [];
  }

  const createStructure = (typeof(controllerStructure.create) == 'object')?controllerStructure.create:null;
  const createRoute = createStructure?.route;
  const createDecorators = createStructure?.decorators ?? [];
  const createSummary = createStructure?.title ?? ('Create ' + entityType.name.toLowerCase() + ' record');
  const createDescription = createStructure?.description ?? ('creation of ' + entityType.name.toLowerCase() + ' record');
  const createOperationId = createStructure?.operationId;
  const createSuccessCode = createStructure?.successCode ?? (createStructure?.successCodes ?? [])[0] ?? HttpStatus.CREATED;
  const createSuccessCodes = createStructure?.successCodes ?? [createSuccessCode];
  const findAllErrorCodes = createStructure?.errorCodes ?? [HttpStatus.BAD_REQUEST];

  const updateStructure = (typeof(controllerStructure.update) == 'object')?controllerStructure.update:null;
  const updateRoute = updateStructure?.route ?? ':id';
  const updateDecorators = updateStructure?.decorators ?? [];
  const updateSummary = updateStructure?.title ?? ('Update ' + entityType.name.toLowerCase() + ' record');
  const updateDescription = updateStructure?.description ?? ('update of ' + entityType.name.toLowerCase() + ' record');
  const updateOperationId = updateStructure?.operationId;
  const updateSuccessCode = updateStructure?.successCode ?? (updateStructure?.successCodes ?? [])[0] ?? HttpStatus.ACCEPTED;
  const updateSuccessCodes = updateStructure?.successCodes ?? [updateSuccessCode];
  const findOneErrorCodes = updateStructure?.errorCodes ?? [HttpStatus.BAD_REQUEST,HttpStatus.NOT_FOUND];
  
  const removeStructure = (typeof(controllerStructure.remove) == 'object')?controllerStructure.remove:null;
  const removeRoute = removeStructure?.route ?? ':id';
  const removeDecorators = removeStructure?.decorators ?? [];
  const removeSummary = removeStructure?.title ?? ('Remove ' + entityType.name.toLowerCase() + ' record');
  const removeDescription = removeStructure?.description ?? ('removal of ' + entityType.name.toLowerCase() + ' record');
  const removeOperationId = removeStructure?.operationId;
  const removeSuccessCode = removeStructure?.successCode ?? (removeStructure?.successCodes ?? [])[0] ?? HttpStatus.ACCEPTED;
  const removeSuccessCodes = removeStructure?.successCodes ?? [removeSuccessCode];
  const removeErrorCodes = removeStructure?.errorCodes ?? [HttpStatus.BAD_REQUEST,HttpStatus.NOT_FOUND];

  const hardRemoveStructure = (typeof(controllerStructure.hardRemove) == 'object')?controllerStructure.hardRemove:null;
  const hardRemoveRoute = hardRemoveStructure?.route ?? 'hard/:id';
  const hardRemoveDecorators = hardRemoveStructure?.decorators ?? [];
  const hardRemoveSummary = hardRemoveStructure?.title ?? ('Remove (HARD) ' + entityType.name.toLowerCase() + ' record');
  const hardRemoveDescription = hardRemoveStructure?.description ?? ('removal (HARD) of ' + entityType.name.toLowerCase() + ' record');
  const hardRemoveOperationId = hardRemoveStructure?.operationId;
  const hardRemoveSuccessCode = hardRemoveStructure?.successCode ?? (hardRemoveStructure?.successCodes ?? [])[0] ?? HttpStatus.ACCEPTED;
  const hardRemoveSuccessCodes = hardRemoveStructure?.successCodes ?? [hardRemoveSuccessCode];
  const hardRemoveErrorCodes = hardRemoveStructure?.errorCodes ?? [HttpStatus.BAD_REQUEST,HttpStatus.NOT_FOUND];

  const paramApiConfig = { name: 'id', description: 'ID of the ' + entityType.name + ' entity', required: true };

  class CrudController extends DataController(
                                          entityType,
                                          serviceType,
                                          controllerStructure,
                                          findArgsType,
                                          contextType,
                                        ) {
   

    @Post(createRoute)
    @applyMethodDecorators(createDecorators)
    @ApiOperation({ summary: createSummary, description: createDescription, operationId: createOperationId })
    @ApiBody({ type: createInputType, description: createDescription, required: true, isArray: false })
    @HttpCode(createSuccessCode)
    @ApiResponses({ type:entityType, successCodes:createSuccessCodes, errorCodes: findAllErrorCodes })
    async create?(
      @ContextDecorator() context: ContextType,
      @Body() createInput: CreateInputType
    ): Promise<EntityType> 
    {
      return this.service.create(context, createInput);
    }
    
    @Put(updateRoute)
    @applyMethodDecorators(updateDecorators)
    @ApiOperation({ summary: updateSummary, description: updateDescription, operationId: updateOperationId })
    @ApiBody({ type: updateInputType, description: updateDescription, required: true, isArray: false })
    @ApiParam(paramApiConfig)
    @HttpCode(updateSuccessCode)
    @ApiResponses({ type:entityType, successCodes:updateSuccessCodes, errorCodes: findOneErrorCodes })
    async update?(
      @ContextDecorator() context: ContextType,
      @Param('id', ...pipeTransforms)  id: PrimaryKeyType,
      @Body() updateInput: UpdateInputType
    ) : Promise<EntityType>
    {
      return this.service.update(context, updateInput.id as PrimaryKeyType, { ...updateInput, id });
    }

    @Delete(removeRoute)
    @applyMethodDecorators(removeDecorators)
    @ApiOperation({ summary: removeSummary, description: removeDescription, operationId: removeOperationId })
    @ApiParam(paramApiConfig)
    @HttpCode(removeSuccessCode)
    @ApiResponses({ type:entityType, successCodes:removeSuccessCodes, errorCodes: removeErrorCodes })
    async remove?(
      @ContextDecorator() context: ContextType,
      @Param('id', ...pipeTransforms) id: PrimaryKeyType
    ) : Promise<EntityType> 
    {
      return this.service.remove(context, id);
    }

    @Delete(hardRemoveRoute)
    @applyMethodDecorators(hardRemoveDecorators)
    @ApiOperation({ summary: hardRemoveSummary, description: hardRemoveDescription, operationId: hardRemoveOperationId })
    @ApiParam(paramApiConfig)
    @HttpCode(hardRemoveSuccessCode)
    @ApiResponses({ type:entityType, successCodes:hardRemoveSuccessCodes, errorCodes: hardRemoveErrorCodes })
    async hardRemove?(
      @ContextDecorator() context: ContextType,
      @Param('id', ...pipeTransforms) id: PrimaryKeyType
    ) : Promise<EntityType>
    {
      return this.service.hardRemove(context, id);
    } 
  }

  //remove controller methods if they are disabled in the structure
  if (controllerStructure.create === false) {
    delete CrudController.prototype.create;
  }
  if (controllerStructure.update === false) {
    delete CrudController.prototype.update;
  }
  if (controllerStructure.remove === false) {
    delete CrudController.prototype.remove;
  }
  //this method is disabled by default
  if (!controllerStructure.hardRemove) {
    delete CrudController.prototype.hardRemove;
  }

  return mixin(CrudController);
}