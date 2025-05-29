import {
  Body,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  PipeTransform,
  Post,
  Put,
  Type,
  mixin,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam } from '@nestjs/swagger';
import {
  Context,
  IdTypeFrom,
  Entity,
  FindArgs,
  CrudService,
  CurrentContext,
  applyMethodDecorators,
  DeepPartial,
} from '@solid-nestjs/common';
import { CrudControllerStructure } from '../interfaces';
import { ApiResponses } from '../decorators';
import { DefaultArgs } from '../classes';
import {
  DataControllerFrom,
  extractOperationSettings,
} from './data-controller.mixin';

/**
 * Generates a CRUD controller class based on the provided structure and configuration.
 *
 * This mixin function dynamically creates a controller class with standard CRUD endpoints
 * (`create`, `update`, `remove`, and optionally `hardRemove`) for a given entity type.
 * The generated controller methods are decorated with NestJS and Swagger decorators for
 * routing, validation, and API documentation. Methods can be selectively enabled or disabled
 * via the `controllerStructure.operations` configuration.
 *
 * @param controllerStructure - The configuration object describing the entity, input types,
 *   service, decorators, and operation settings for the controller.
 *
 * @returns A NestJS controller class with CRUD endpoints for the specified entity.
 *
 * @remarks
 * - The `hardRemove` method is disabled by default unless explicitly enabled.
 * - Supports custom parameter decorators and pipe transforms for the entity ID.
 * - Integrates with Swagger for API documentation.
 */
export function CrudControllerFrom<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  CreateInputType extends DeepPartial<EntityType>,
  UpdateInputType extends DeepPartial<EntityType>,
  ServiceType extends CrudService<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    ContextType
  >,
  FindArgsType extends FindArgs<EntityType> = DefaultArgs<EntityType>,
  ContextType extends Context = Context,
>(
  controllerStructure: CrudControllerStructure<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    ServiceType,
    FindArgsType,
    ContextType
  >,
) {
  const { entityType, createInputType, updateInputType } = controllerStructure;

  const ContextDecorator =
    controllerStructure.parameterDecorators?.context ?? CurrentContext;

  let idType: any = Number;
  let pipeTransforms: Type<PipeTransform>[] = [ParseIntPipe];

  if (controllerStructure.entityId) {
    idType = controllerStructure.entityId.type;
    pipeTransforms = controllerStructure.entityId.pipeTransforms ?? [];
  }

  const createSettings = extractOperationSettings(
    controllerStructure.operations?.create,
    {
      disabled: controllerStructure.operations?.create === false,
      route: undefined,
      summary: 'Create ' + entityType.name.toLowerCase() + ' record',
      description: 'creation of ' + entityType.name.toLowerCase() + ' record',
      successCode: HttpStatus.CREATED,
      errorCodes: [HttpStatus.BAD_REQUEST],
    },
  );

  const updateSettings = extractOperationSettings(
    controllerStructure.operations?.update,
    {
      disabled: controllerStructure.operations?.update === false,
      route: ':id',
      summary: 'Update ' + entityType.name.toLowerCase() + ' record',
      description: 'update of ' + entityType.name.toLowerCase() + ' record',
      successCode: HttpStatus.ACCEPTED,
      errorCodes: [HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND],
    },
  );

  const removeSettings = extractOperationSettings(
    controllerStructure.operations?.remove,
    {
      disabled: controllerStructure.operations?.remove === false,
      route: ':id',
      summary: 'Remove ' + entityType.name.toLowerCase() + ' record',
      description: 'removal of ' + entityType.name.toLowerCase() + ' record',
      successCode: HttpStatus.ACCEPTED,
      errorCodes: [HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND],
    },
  );

  const hardRemoveSettings = extractOperationSettings(
    controllerStructure.operations?.hardRemove,
    {
      disabled: !controllerStructure.operations?.hardRemove,
      route: 'hard/:id',
      summary: 'Remove (HARD) ' + entityType.name.toLowerCase() + ' record',
      description:
        'removal (HARD) of ' + entityType.name.toLowerCase() + ' record',
      successCode: HttpStatus.ACCEPTED,
      errorCodes: [HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND],
    },
  );

  const paramApiConfig = {
    name: 'id',
    description: 'ID of the ' + entityType.name + ' entity',
    required: true,
  };

  class CrudController extends DataControllerFrom(controllerStructure) {
    @Post(createSettings.route)
    @applyMethodDecorators(createSettings.decorators)
    @ApiOperation({
      summary: createSettings.summary,
      description: createSettings.description,
      operationId: createSettings.operationId,
    })
    @ApiBody({
      type: createInputType,
      description: createSettings.description,
      required: true,
      isArray: false,
    })
    @HttpCode(createSettings.successCode)
    @ApiResponses({
      type: entityType,
      successCodes: createSettings.successCodes,
      errorCodes: createSettings.errorCodes,
    })
    async create?(
      @ContextDecorator() context: ContextType,
      @Body() createInput: CreateInputType,
    ): Promise<EntityType> {
      return this.service.create(context, createInput);
    }

    @Put(updateSettings.route)
    @applyMethodDecorators(updateSettings.decorators)
    @ApiOperation({
      summary: updateSettings.summary,
      description: updateSettings.description,
      operationId: updateSettings.operationId,
    })
    @ApiBody({
      type: updateInputType,
      description: updateSettings.description,
      required: true,
      isArray: false,
    })
    @ApiParam(paramApiConfig)
    @HttpCode(updateSettings.successCode)
    @ApiResponses({
      type: entityType,
      successCodes: updateSettings.successCodes,
      errorCodes: updateSettings.errorCodes,
    })
    async update?(
      @ContextDecorator() context: ContextType,
      @Param('id', ...pipeTransforms) id: IdType,
      @Body() updateInput: UpdateInputType,
    ): Promise<EntityType> {
      return this.service.update(context, id, updateInput);
    }

    @Delete(removeSettings.route)
    @applyMethodDecorators(removeSettings.decorators)
    @ApiOperation({
      summary: removeSettings.summary,
      description: removeSettings.description,
      operationId: removeSettings.operationId,
    })
    @ApiParam(paramApiConfig)
    @HttpCode(removeSettings.successCode)
    @ApiResponses({
      type: entityType,
      successCodes: removeSettings.successCodes,
      errorCodes: removeSettings.errorCodes,
    })
    async remove?(
      @ContextDecorator() context: ContextType,
      @Param('id', ...pipeTransforms) id: IdType,
    ): Promise<EntityType> {
      return this.service.remove(context, id);
    }

    @Delete(hardRemoveSettings.route)
    @applyMethodDecorators(hardRemoveSettings.decorators)
    @ApiOperation({
      summary: hardRemoveSettings.summary,
      description: hardRemoveSettings.description,
      operationId: hardRemoveSettings.operationId,
    })
    @ApiParam(paramApiConfig)
    @HttpCode(hardRemoveSettings.successCode)
    @ApiResponses({
      type: entityType,
      successCodes: hardRemoveSettings.successCodes,
      errorCodes: hardRemoveSettings.errorCodes,
    })
    async hardRemove?(
      @ContextDecorator() context: ContextType,
      @Param('id', ...pipeTransforms) id: IdType,
    ): Promise<EntityType> {
      return this.service.hardRemove(context, id);
    }
  }

  //remove controller methods if they are disabled in the structure
  if (createSettings.disabled) {
    delete CrudController.prototype.create;
  }
  if (updateSettings.disabled) {
    delete CrudController.prototype.update;
  }
  if (removeSettings.disabled) {
    delete CrudController.prototype.remove;
  }
  //this method is disabled by default
  if (hardRemoveSettings.disabled) {
    delete CrudController.prototype.hardRemove;
  }

  return mixin(CrudController);
}
