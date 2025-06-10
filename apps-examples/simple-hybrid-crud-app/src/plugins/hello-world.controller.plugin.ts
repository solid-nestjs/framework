import {
  Body,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  PipeTransform,
  Post,
  Put,
  Type,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam } from '@nestjs/swagger';
import {
  ApiResponses,
  extractOperationSettings,
  OperationStructure,
} from '@solid-nestjs/rest-api';
import {
  applyMethodDecorators,
  Context,
  ControllerPlugin,
  CrudProviderStructure,
  DataProviderStructure,
  DeepPartial,
  Entity,
  FindArgs,
  IdTypeFrom,
} from '@solid-nestjs/typeorm-hybrid-crud';
import {
  HWCrudServicePluginAddOn,
  HWDataServicePluginAddOn,
} from './hello-world.service.plugin';

export interface HWDataControllerPluginAddOn {
  saySimpleHello?(): Promise<string>;
  saySimpleBye?(): Promise<string>;
}

export interface HWCrudControllerPluginAddOn<
  IdType,
  CreateInputType,
  UpdateInputType,
> {
  sayHelloToCreate?(input: CreateInputType): Promise<string>;
  sayByeToUpdate?(id: IdType, input: UpdateInputType): Promise<string>;
}

export interface HWDataControllerOptions {
  operations?: {
    saySimpleHello?: OperationStructure | boolean;
    saySimpleBye?: OperationStructure | boolean;
  };
}

export interface HWCrudControllerOptions {
  operations?: {
    sayHelloToCreate?: OperationStructure | boolean;
    sayByeToUpdate?: OperationStructure | boolean;
  };
}

export function helloWorldControllerPlugin<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  CreateInputType extends DeepPartial<EntityType> = DeepPartial<EntityType>,
  UpdateInputType extends DeepPartial<EntityType> = DeepPartial<EntityType>,
  FindArgsType extends FindArgs<EntityType> = FindArgs<EntityType>,
  ContextType extends Context = Context,
>(
  structure:
    | DataProviderStructure<IdType, EntityType, FindArgsType, ContextType>
    | CrudProviderStructure<
        IdType,
        EntityType,
        CreateInputType,
        UpdateInputType,
        FindArgsType,
        ContextType
      >,
) {
  const plugin: ControllerPlugin<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    FindArgsType,
    ContextType,
    HWDataServicePluginAddOn,
    HWCrudServicePluginAddOn<IdType, CreateInputType, UpdateInputType>,
    HWDataControllerOptions,
    HWCrudControllerOptions,
    HWDataControllerPluginAddOn,
    HWCrudControllerPluginAddOn<IdType, CreateInputType, UpdateInputType>
  > = {
    applyDataControllerClass(controllerClass, structure) {
      const sayHelloSettings = extractOperationSettings(
        structure.operations?.saySimpleHello,
        {
          disabled: structure.operations?.saySimpleHello === false,
          route: 'say/hello',
          summary: 'Say Hello',
          description: 'Say Hello',
          successCode: HttpStatus.OK,
          errorCodes: [HttpStatus.BAD_REQUEST],
        },
      );

      const sayByeSettings = extractOperationSettings(
        structure.operations?.saySimpleBye,
        {
          disabled: structure.operations?.saySimpleBye === false,
          route: 'say/bye',
          summary: 'Say Bye',
          description: 'Say Bye',
          successCode: HttpStatus.OK,
          errorCodes: [HttpStatus.BAD_REQUEST],
        },
      );

      class ControllerClassWithAddOn
        extends controllerClass
        implements HWDataControllerPluginAddOn
      {
        @Get(sayHelloSettings.route)
        @HttpCode(sayHelloSettings.successCode)
        @ApiOperation({
          summary: sayHelloSettings.summary,
          description: sayHelloSettings.description,
          operationId: sayHelloSettings.operationId,
        })
        @ApiResponses({
          type: String,
          successCodes: sayHelloSettings.successCodes,
          errorCodes: sayHelloSettings.errorCodes,
        })
        @applyMethodDecorators(sayHelloSettings.decorators)
        async saySimpleHello?(): Promise<string> {
          return this.service.saySimpleHello();
        }

        @Get(sayByeSettings.route)
        @HttpCode(sayByeSettings.successCode)
        @ApiOperation({
          summary: sayByeSettings.summary,
          description: sayByeSettings.description,
          operationId: sayByeSettings.operationId,
        })
        @ApiResponses({
          type: String,
          successCodes: sayByeSettings.successCodes,
          errorCodes: sayByeSettings.errorCodes,
        })
        @applyMethodDecorators(sayByeSettings.decorators)
        async saySimpleBye?(): Promise<string> {
          return this.service.saySimpleBye();
        }
      }

      if (sayHelloSettings.disabled) {
        delete ControllerClassWithAddOn.prototype.saySimpleHello;
      }
      if (sayByeSettings.disabled) {
        delete ControllerClassWithAddOn.prototype.saySimpleBye;
      }

      return ControllerClassWithAddOn;
    },

    applyCrudControllerClass(controllerClass, structure) {
      const { entityType, createInputType, updateInputType } = structure;

      let pipeTransforms: Type<PipeTransform>[] = [ParseIntPipe];

      if (structure.entityId) {
        pipeTransforms = structure.entityId.pipeTransforms ?? [];
      }

      const sayHelloSettings = extractOperationSettings(
        structure.operations?.sayHelloToCreate,
        {
          disabled: structure.operations?.sayHelloToCreate === false,
          route: 'say/hello',
          summary: 'say Hello to create ' + entityType.name.toLowerCase(),
          description: 'say Hello to create ' + entityType.name.toLowerCase(),
          successCode: HttpStatus.ACCEPTED,
          errorCodes: [HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND],
        },
      );

      const sayByeSettings = extractOperationSettings(
        structure.operations?.sayByeToUpdate,
        {
          disabled: structure.operations?.sayByeToUpdate === false,
          route: 'say/bye/:id',
          summary: 'say Bye to update ' + entityType.name.toLowerCase(),
          description: 'say Bye to update ' + entityType.name.toLowerCase(),
          successCode: HttpStatus.ACCEPTED,
          errorCodes: [HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND],
        },
      );

      const paramApiConfig = {
        name: 'id',
        description: 'ID of the ' + entityType.name + ' entity',
        required: true,
      };

      class ControllerClassWithAddOn
        extends controllerClass
        implements
          HWCrudControllerPluginAddOn<IdType, CreateInputType, UpdateInputType>
      {
        @Post(sayHelloSettings.route)
        @ApiBody({
          type: createInputType,
          required: true,
          isArray: false,
        })
        @HttpCode(sayHelloSettings.successCode)
        @ApiOperation({
          summary: sayHelloSettings.summary,
          description: sayHelloSettings.description,
          operationId: sayHelloSettings.operationId,
        })
        @ApiResponses({
          type: String,
          successCodes: sayHelloSettings.successCodes,
          errorCodes: sayHelloSettings.errorCodes,
        })
        @applyMethodDecorators(sayHelloSettings.decorators)
        async sayHelloToCreate?(
          @Body(
            new ValidationPipe({
              transform: true,
              expectedType: createInputType,
              whitelist: true,
              forbidNonWhitelisted: true,
              forbidUnknownValues: true,
            }),
          )
          input: CreateInputType,
        ): Promise<string> {
          return this.service.sayHelloToCreate(input);
        }

        @Put(sayByeSettings.route)
        @ApiParam(paramApiConfig)
        @ApiBody({
          type: updateInputType,
          required: true,
          isArray: false,
        })
        @HttpCode(sayByeSettings.successCode)
        @ApiOperation({
          summary: sayByeSettings.summary,
          description: sayByeSettings.description,
          operationId: sayByeSettings.operationId,
        })
        @ApiResponses({
          type: String,
          successCodes: sayByeSettings.successCodes,
          errorCodes: sayByeSettings.errorCodes,
        })
        @applyMethodDecorators(sayByeSettings.decorators)
        async sayByeToUpdate?(
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
          input: UpdateInputType,
        ): Promise<string> {
          return this.service.sayByeToUpdate(id, input);
        }
      }

      if (sayHelloSettings.disabled) {
        delete ControllerClassWithAddOn.prototype.sayHelloToCreate;
      }
      if (sayByeSettings.disabled) {
        delete ControllerClassWithAddOn.prototype.sayByeToUpdate;
      }

      return ControllerClassWithAddOn;
    },
  };

  return plugin;
}
