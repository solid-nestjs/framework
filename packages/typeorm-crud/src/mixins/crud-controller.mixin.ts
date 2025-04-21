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

  const createRoute = controllerStructure.create?.route;
  const createDecorators = controllerStructure.create?.decorators ?? [];
  const createSummary = controllerStructure.create?.title ?? ('Create ' + entityType.name.toLowerCase() + ' record');
  const createDescription = controllerStructure.create?.description ?? ('creation of ' + entityType.name.toLowerCase() + ' record');
  const createOperationId = controllerStructure.create?.operationId;
  const createSuccessCode = controllerStructure.create?.successCode ?? (controllerStructure.create?.successCodes ?? [])[0] ?? HttpStatus.CREATED;
  const createSuccessCodes = controllerStructure.create?.successCodes ?? [createSuccessCode];
  const findAllErrorCodes = controllerStructure.create?.errorCodes ?? [HttpStatus.BAD_REQUEST];

  const updateRoute = controllerStructure.update?.route ?? ':id';
  const updateDecorators = controllerStructure.update?.decorators ?? [];
  const updateSummary = controllerStructure.update?.title ?? ('Update ' + entityType.name.toLowerCase() + ' record');
  const updateDescription = controllerStructure.update?.description ?? ('update of ' + entityType.name.toLowerCase() + ' record');
  const updateOperationId = controllerStructure.update?.operationId;
  const updateSuccessCode = controllerStructure.update?.successCode ?? (controllerStructure.update?.successCodes ?? [])[0] ?? HttpStatus.ACCEPTED;
  const updateSuccessCodes = controllerStructure.update?.successCodes ?? [updateSuccessCode];
  const findOneErrorCodes = controllerStructure.update?.errorCodes ?? [HttpStatus.BAD_REQUEST,HttpStatus.NOT_FOUND];
  
  const removeRoute = controllerStructure.remove?.route ?? ':id';
  const removeDecorators = controllerStructure.remove?.decorators ?? [];
  const removeSummary = controllerStructure.remove?.title ?? ('Remove ' + entityType.name.toLowerCase() + ' record');
  const removeDescription = controllerStructure.remove?.description ?? ('removal of ' + entityType.name.toLowerCase() + ' record');
  const removeOperationId = controllerStructure.remove?.operationId;
  const removeSuccessCode = controllerStructure.remove?.successCode ?? (controllerStructure.remove?.successCodes ?? [])[0] ?? HttpStatus.ACCEPTED;
  const removeSuccessCodes = controllerStructure.remove?.successCodes ?? [removeSuccessCode];
  const removeErrorCodes = controllerStructure.remove?.errorCodes ?? [HttpStatus.BAD_REQUEST,HttpStatus.NOT_FOUND];

  const hardRemoveRoute = controllerStructure.hardRemove?.route ?? 'hard/:id';
  const hardRemoveDecorators = controllerStructure.hardRemove?.decorators ?? [];
  const hardRemoveSummary = controllerStructure.hardRemove?.title ?? ('Remove (HARD) ' + entityType.name.toLowerCase() + ' record');
  const hardRemoveDescription = controllerStructure.hardRemove?.description ?? ('removal (HARD) of ' + entityType.name.toLowerCase() + ' record');
  const hardRemoveOperationId = controllerStructure.hardRemove?.operationId;
  const hardRemoveSuccessCode = controllerStructure.hardRemove?.successCode ?? (controllerStructure.hardRemove?.successCodes ?? [])[0] ?? HttpStatus.ACCEPTED;
  const hardRemoveSuccessCodes = controllerStructure.hardRemove?.successCodes ?? [hardRemoveSuccessCode];
  const hardRemoveErrorCodes = controllerStructure.hardRemove?.errorCodes ?? [HttpStatus.BAD_REQUEST,HttpStatus.NOT_FOUND];

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

  if (!controllerStructure.create) {
    // If create method is not defined in the structure, remove it from the class
    delete CrudController.prototype.create;
  }
  if (!controllerStructure.update) {
    // If update method is not defined in the structure, remove it from the class
    delete CrudController.prototype.update;
  }
  if (!controllerStructure.remove) {
    // If remove method is not defined in the structure, remove it from the class
    delete CrudController.prototype.remove;
  }
  if (!controllerStructure.hardRemove) {
    // If hardRemove method is not defined in the structure, remove it from the class
    delete CrudController.prototype.hardRemove;
  }

  return mixin(CrudController);
}