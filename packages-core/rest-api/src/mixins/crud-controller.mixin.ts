import {
  Body,
  Delete,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  PipeTransform,
  Post,
  Put,
  Patch,
  Type,
  ValidationPipe,
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
  isSoftDeletableCrudService,
} from '@solid-nestjs/common';
import { CrudController, CrudControllerStructure } from '../interfaces';
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
    FindArgsType,
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
): Type<
  CrudController<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    ServiceType,
    FindArgsType,
    ContextType
  >
> {
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

  const softRemoveSettings = extractOperationSettings(
    controllerStructure.operations?.softRemove,
    {
      disabled: !controllerStructure.operations?.softRemove,
      route: 'soft/:id',
      summary: 'Soft remove ' + entityType.name.toLowerCase() + ' record',
      description:
        'soft removal of ' + entityType.name.toLowerCase() + ' record',
      successCode: HttpStatus.ACCEPTED,
      errorCodes: [HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND],
    },
  );

  const recoverSettings = extractOperationSettings(
    controllerStructure.operations?.recover,
    {
      disabled: !controllerStructure.operations?.recover,
      route: 'recover/:id',
      summary: 'Recover ' + entityType.name.toLowerCase() + ' record',
      description: 'recovery of ' + entityType.name.toLowerCase() + ' record',
      successCode: HttpStatus.ACCEPTED,
      errorCodes: [HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND],
    },
  );

  const paramApiConfig = {
    name: 'id',
    description: 'ID of the ' + entityType.name + ' entity',
    required: true,
  };

  class CrudControllerClass
    extends DataControllerFrom(controllerStructure)
    implements
      CrudController<
        IdType,
        EntityType,
        CreateInputType,
        UpdateInputType,
        ServiceType,
        FindArgsType,
        ContextType
      >
  {
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
      @Body(
        new ValidationPipe({
          transform: true,
          expectedType: createInputType,
          whitelist: true,
          forbidNonWhitelisted: true,
          forbidUnknownValues: true,
        }),
      )
      createInput: CreateInputType,
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
      @Body(
        new ValidationPipe({
          transform: true,
          expectedType: updateInputType,
          whitelist: true,
          forbidNonWhitelisted: true,
          forbidUnknownValues: true,
        }),
      )
      updateInput: UpdateInputType,
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
      if (!isSoftDeletableCrudService(this.service))
        throw new HttpException(
          'Hard remove operation is not supported by this service',
          HttpStatus.NOT_IMPLEMENTED,
        );
      return this.service.hardRemove(context, id);
    }

    @Delete(softRemoveSettings.route)
    @applyMethodDecorators(softRemoveSettings.decorators)
    @ApiOperation({
      summary: softRemoveSettings.summary,
      description: softRemoveSettings.description,
      operationId: softRemoveSettings.operationId,
    })
    @ApiParam(paramApiConfig)
    @HttpCode(softRemoveSettings.successCode)
    @ApiResponses({
      type: entityType,
      successCodes: softRemoveSettings.successCodes,
      errorCodes: softRemoveSettings.errorCodes,
    })
    async softRemove?(
      @ContextDecorator() context: ContextType,
      @Param('id', ...pipeTransforms) id: IdType,
    ): Promise<EntityType> {
      if (!isSoftDeletableCrudService(this.service))
        throw new HttpException(
          'Soft remove operation is not supported by this service',
          HttpStatus.NOT_IMPLEMENTED,
        );
      return this.service.softRemove(context, id);
    }

    @Patch(recoverSettings.route)
    @applyMethodDecorators(recoverSettings.decorators)
    @ApiOperation({
      summary: recoverSettings.summary,
      description: recoverSettings.description,
      operationId: recoverSettings.operationId,
    })
    @ApiParam(paramApiConfig)
    @HttpCode(recoverSettings.successCode)
    @ApiResponses({
      type: entityType,
      successCodes: recoverSettings.successCodes,
      errorCodes: recoverSettings.errorCodes,
    })
    async recover?(
      @ContextDecorator() context: ContextType,
      @Param('id', ...pipeTransforms) id: IdType,
    ): Promise<EntityType> {
      if (!isSoftDeletableCrudService(this.service))
        throw new HttpException(
          'Recover operation is not supported by this service',
          HttpStatus.NOT_IMPLEMENTED,
        );
      return this.service.recover(context, id);
    }
  }

  //remove controller methods if they are disabled in the structure
  if (createSettings.disabled) {
    delete CrudControllerClass.prototype.create;
  }
  if (updateSettings.disabled) {
    delete CrudControllerClass.prototype.update;
  }
  if (removeSettings.disabled) {
    delete CrudControllerClass.prototype.remove;
  }
  //this method is disabled by default
  if (hardRemoveSettings.disabled) {
    delete CrudControllerClass.prototype.hardRemove;
  }
  //softRemove and recover are enabled by default if not explicitly disabled
  if (softRemoveSettings.disabled) {
    delete CrudControllerClass.prototype.softRemove;
  }
  if (recoverSettings.disabled) {
    delete CrudControllerClass.prototype.recover;
  }

  return mixin(CrudControllerClass);
}
