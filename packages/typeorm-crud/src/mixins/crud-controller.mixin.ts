import { DeepPartial } from 'typeorm';
import { Body, Delete, HttpCode, HttpStatus, Param, ParseIntPipe, PipeTransform, Post, Put, Type, mixin } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam  } from '@nestjs/swagger';
import { Context, IdTypeFrom, Entity, FindArgsInterface, CrudServiceInterface, CrudControllerStructure } from '../interfaces';
import { ApiResponses, CurrentContext } from '../decorators';
import { applyMethodDecorators } from '../utils';
import { CountResult, DefaultArgs } from '../classes';
import { DataControllerFrom } from './data-controller.mixin';

export function CrudControllerFrom<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  CreateInputType extends DeepPartial<EntityType>,
  UpdateInputType extends DeepPartial<EntityType>,
  ServiceType extends CrudServiceInterface<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    FindArgsType,
    ContextType
  >,
  FindArgsType extends FindArgsInterface = DefaultArgs,
  ContextType extends Context = Context,
>(
  controllerStructure: CrudControllerStructure<IdType,EntityType,CreateInputType,UpdateInputType,ServiceType,FindArgsType,ContextType>
) {

  const { entityType, createInputType, updateInputType } = controllerStructure;

  const ContextDecorator =
    controllerStructure.parameterDecorators?.context ?? CurrentContext;

  let idType:any = Number;
  let pipeTransforms:Type<PipeTransform>[] = [ParseIntPipe];

  if(controllerStructure.entityId)
  {
    idType = controllerStructure.entityId.type;
    pipeTransforms = controllerStructure.entityId.pipeTransforms ?? [];
  }

  const createStructure = (typeof(controllerStructure.operations?.create) == 'object')?controllerStructure.operations?.create:null;
  const createRoute = createStructure?.route;
  const createDecorators = createStructure?.decorators ?? [];
  const createSummary = createStructure?.title ?? ('Create ' + entityType.name.toLowerCase() + ' record');
  const createDescription = createStructure?.description ?? ('creation of ' + entityType.name.toLowerCase() + ' record');
  const createOperationId = createStructure?.operationId;
  const createSuccessCode = createStructure?.successCode ?? (createStructure?.successCodes ?? [])[0] ?? HttpStatus.CREATED;
  const createSuccessCodes = createStructure?.successCodes ?? [createSuccessCode];
  const findAllErrorCodes = createStructure?.errorCodes ?? [HttpStatus.BAD_REQUEST];

  const updateStructure = (typeof(controllerStructure.operations?.update) == 'object')?controllerStructure.operations?.update:null;
  const updateRoute = updateStructure?.route ?? ':id';
  const updateDecorators = updateStructure?.decorators ?? [];
  const updateSummary = updateStructure?.title ?? ('Update ' + entityType.name.toLowerCase() + ' record');
  const updateDescription = updateStructure?.description ?? ('update of ' + entityType.name.toLowerCase() + ' record');
  const updateOperationId = updateStructure?.operationId;
  const updateSuccessCode = updateStructure?.successCode ?? (updateStructure?.successCodes ?? [])[0] ?? HttpStatus.ACCEPTED;
  const updateSuccessCodes = updateStructure?.successCodes ?? [updateSuccessCode];
  const findOneErrorCodes = updateStructure?.errorCodes ?? [HttpStatus.BAD_REQUEST,HttpStatus.NOT_FOUND];
  
  const removeStructure = (typeof(controllerStructure.operations?.remove) == 'object')?controllerStructure.operations?.remove:null;
  const removeRoute = removeStructure?.route ?? ':id';
  const removeDecorators = removeStructure?.decorators ?? [];
  const removeSummary = removeStructure?.title ?? ('Remove ' + entityType.name.toLowerCase() + ' record');
  const removeDescription = removeStructure?.description ?? ('removal of ' + entityType.name.toLowerCase() + ' record');
  const removeOperationId = removeStructure?.operationId;
  const removeSuccessCode = removeStructure?.successCode ?? (removeStructure?.successCodes ?? [])[0] ?? HttpStatus.ACCEPTED;
  const removeSuccessCodes = removeStructure?.successCodes ?? [removeSuccessCode];
  const removeErrorCodes = removeStructure?.errorCodes ?? [HttpStatus.BAD_REQUEST,HttpStatus.NOT_FOUND];

  const hardRemoveStructure = (typeof(controllerStructure.operations?.hardRemove) == 'object')?controllerStructure.operations?.hardRemove:null;
  const hardRemoveRoute = hardRemoveStructure?.route ?? 'hard/:id';
  const hardRemoveDecorators = hardRemoveStructure?.decorators ?? [];
  const hardRemoveSummary = hardRemoveStructure?.title ?? ('Remove (HARD) ' + entityType.name.toLowerCase() + ' record');
  const hardRemoveDescription = hardRemoveStructure?.description ?? ('removal (HARD) of ' + entityType.name.toLowerCase() + ' record');
  const hardRemoveOperationId = hardRemoveStructure?.operationId;
  const hardRemoveSuccessCode = hardRemoveStructure?.successCode ?? (hardRemoveStructure?.successCodes ?? [])[0] ?? HttpStatus.ACCEPTED;
  const hardRemoveSuccessCodes = hardRemoveStructure?.successCodes ?? [hardRemoveSuccessCode];
  const hardRemoveErrorCodes = hardRemoveStructure?.errorCodes ?? [HttpStatus.BAD_REQUEST,HttpStatus.NOT_FOUND];

  const paramApiConfig = { name: 'id', description: 'ID of the ' + entityType.name + ' entity', required: true };

  class CrudController extends DataControllerFrom(controllerStructure) 
  {
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
      @Param('id', ...pipeTransforms)  id: IdType,
      @Body() updateInput: UpdateInputType
    ) : Promise<EntityType>
    {
      return this.service.update(context, updateInput.id as IdType, { ...updateInput, id });
    }

    @Delete(removeRoute)
    @applyMethodDecorators(removeDecorators)
    @ApiOperation({ summary: removeSummary, description: removeDescription, operationId: removeOperationId })
    @ApiParam(paramApiConfig)
    @HttpCode(removeSuccessCode)
    @ApiResponses({ type:entityType, successCodes:removeSuccessCodes, errorCodes: removeErrorCodes })
    async remove?(
      @ContextDecorator() context: ContextType,
      @Param('id', ...pipeTransforms) id: IdType
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
      @Param('id', ...pipeTransforms) id: IdType
    ) : Promise<EntityType>
    {
      return this.service.hardRemove(context, id);
    } 
  }

  //remove controller methods if they are disabled in the structure
  if (controllerStructure.operations?.create === false) {
    delete CrudController.prototype.create;
  }
  if (controllerStructure.operations?.update === false) {
    delete CrudController.prototype.update;
  }
  if (controllerStructure.operations?.remove === false) {
    delete CrudController.prototype.remove;
  }
  //this method is disabled by default
  if (!controllerStructure.operations?.hardRemove) {
    delete CrudController.prototype.hardRemove;
  }

  return mixin(CrudController);
}