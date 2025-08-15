import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseIntPipe,
  PipeTransform,
  Query,
  Type,
  ValidationPipe,
  mixin,
} from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  Context,
  IdTypeFrom,
  Entity,
  FindArgs,
  DataService,
  CurrentContext,
  applyClassDecorators,
  applyMethodDecorators,
  QueryTransformPipe,
  GroupByArgs,
} from '@solid-nestjs/common';
import {
  DataControllerStructure,
  OperationStructure,
  DataController,
} from '../interfaces';
import { DefaultArgs, PaginationResult, GroupedPaginationResult } from '../classes';
import { ApiResponses } from '../decorators';

/**
 * Generates a NestJS controller class for a given entity, service, and context,
 * providing standard RESTful endpoints for data access and manipulation.
 *
 * This mixin function dynamically creates a controller with endpoints for:
 * - Listing all entities (`findAll`)
 * - Paginated listing (`pagination`)
 * - Paginated list with data and pagination info (`findAllPaginated`)
 * - Retrieving a single entity by ID (`findOne`)
 *
 * The generated controller is decorated with OpenAPI/Swagger decorators for API documentation,
 * and supports custom decorators, pipes, and operation settings via the `controllerStructure` parameter.
 *
 * Disabled operations (set to `false` in `controllerStructure.operations`) are omitted from the controller.
 *
 * @param controllerStructure - Configuration object specifying entity, service, decorators,
 *   operation settings, and other controller customizations.
 *
 * @returns A NestJS controller class (as a mixin) with the specified endpoints and configuration.
 */
export function DataControllerFrom<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  ServiceType extends DataService<
    IdType,
    EntityType,
    FindArgsType,
    ContextType
  >,
  FindArgsType extends FindArgs<EntityType> = DefaultArgs<EntityType>,
  ContextType extends Context = Context,
>(
  controllerStructure: DataControllerStructure<
    IdType,
    EntityType,
    ServiceType,
    FindArgsType,
    ContextType
  >,
): Type<
  DataController<IdType, EntityType, ServiceType, FindArgsType, ContextType>
> {
  const { entityType, serviceType, findArgsType, groupByArgsType } = controllerStructure;

  const ContextDecorator =
    controllerStructure.parameterDecorators?.context ?? CurrentContext;

  const argsType = findArgsType ?? DefaultArgs;

  let idType: any = Number;
  let pipeTransforms: Type<PipeTransform>[] = [ParseIntPipe];

  if (controllerStructure.entityId) {
    idType = controllerStructure.entityId.type;
    pipeTransforms = controllerStructure.entityId.pipeTransforms ?? [];
  }

  const controllerApiTags =
    controllerStructure.route ?? entityType.name.toLowerCase() + 's';
  const controllerRoute =
    controllerStructure.route ?? entityType.name.toLowerCase() + 's';
  const controllerDecorators = controllerStructure.classDecorators ?? [];

  const findAllSettings = extractOperationSettings(
    controllerStructure.operations?.findAll,
    {
      disabled: controllerStructure.operations?.findAll === false,
      route: '',
      summary: 'List of ' + entityType.name.toLowerCase() + 's records',
      description: 'list of ' + entityType.name.toLowerCase() + 's records',
      successCode: HttpStatus.OK,
      errorCodes: [HttpStatus.BAD_REQUEST],
    },
  );

  const findOneSettings = extractOperationSettings(
    controllerStructure.operations?.findOne,
    {
      disabled: controllerStructure.operations?.findOne === false,
      route: ':id',
      summary: 'Retrieve ' + entityType.name.toLowerCase() + ' record by id',
      description:
        'retrieval of ' + entityType.name.toLowerCase() + ' record by id',
      successCode: HttpStatus.OK,
      errorCodes: [HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND],
    },
  );

  const paginationSettings = extractOperationSettings(
    controllerStructure.operations?.pagination,
    {
      disabled: !controllerStructure.operations?.pagination,
      route: 'pagination',
      summary: 'Pagination of ' + entityType.name.toLowerCase(),
      description: 'pagination of ' + entityType.name.toLowerCase(),
      successCode: HttpStatus.OK,
      errorCodes: [HttpStatus.BAD_REQUEST],
    },
  );

  const findAllPaginatedSettings = extractOperationSettings(
    controllerStructure.operations?.findAllPaginated,
    {
      disabled: controllerStructure.operations?.findAllPaginated === false,
      route: 'paginated',
      summary:
        'Paginated List of ' + entityType.name.toLowerCase() + 's records',
      description:
        'paginated list of ' + entityType.name.toLowerCase() + 's records',
      successCode: HttpStatus.OK,
      errorCodes: [HttpStatus.BAD_REQUEST],
    },
  );

  const findAllGroupedSettings = extractOperationSettings(
    controllerStructure.operations?.findAllGrouped,
    {
      disabled: controllerStructure.operations?.findAllGrouped === false || !groupByArgsType,
      route: 'grouped',
      summary:
        'Grouped query of ' + entityType.name.toLowerCase() + 's with aggregations',
      description:
        'grouped query with aggregations for ' + entityType.name.toLowerCase() + 's',
      successCode: HttpStatus.OK,
      errorCodes: [HttpStatus.BAD_REQUEST],
    },
  );

  const paramApiConfig = {
    name: 'id',
    description: 'ID of the ' + entityType.name + ' entity',
    required: true,
  };

  @ApiTags(controllerApiTags)
  @Controller(controllerRoute)
  @applyClassDecorators(controllerDecorators)
  @ApiExtraModels(argsType, PaginationResult, ...(groupByArgsType ? [groupByArgsType, GroupedPaginationResult] : []))
  class DataControllerClass
    implements
      DataController<IdType, EntityType, ServiceType, FindArgsType, ContextType>
  {
    @Inject(serviceType) readonly service!: ServiceType;

    constructor() {}

    @Get(findAllSettings?.route ?? '')
    @applyMethodDecorators(findAllSettings?.decorators ?? [])
    @ApiOperation({
      summary: findAllSettings?.summary,
      description: findAllSettings?.description,
      operationId: findAllSettings?.operationId,
    })
    @ApiQuery({
      name: 'args',
      required: false,
      schema: {
        $ref: getSchemaPath(argsType),
      },
    })
    @HttpCode(findAllSettings?.successCode ?? HttpStatus.OK)
    @ApiResponses({
      type: entityType,
      isArray: true,
      successCodes: findAllSettings?.successCodes ?? [HttpStatus.OK],
      errorCodes: findAllSettings?.errorCodes ?? [HttpStatus.BAD_REQUEST],
    })
    async findAll?(
      @ContextDecorator() context: ContextType,
      @Query(
        QueryTransformPipe,
        new ValidationPipe({
          transform: true,
          expectedType: argsType,
          whitelist: true,
          forbidNonWhitelisted: true,
          forbidUnknownValues: true,
        }),
      )
      args: FindArgsType,
    ): Promise<EntityType[]> {
      return this.service.findAll(context, args);
    }

    @Get(paginationSettings?.route ?? 'pagination')
    @applyMethodDecorators(paginationSettings?.decorators ?? [])
    @ApiOperation({
      summary: paginationSettings?.summary,
      description: paginationSettings?.description,
      operationId: paginationSettings?.operationId,
    })
    @ApiQuery({
      name: 'args',
      required: false,
      schema: {
        $ref: getSchemaPath(argsType),
      },
    })
    @HttpCode(paginationSettings?.successCode ?? HttpStatus.OK)
    @ApiResponses({
      type: PaginationResult,
      successCodes: paginationSettings?.successCodes ?? [HttpStatus.OK],
      errorCodes: paginationSettings?.errorCodes ?? [HttpStatus.BAD_REQUEST],
    })
    async pagination?(
      @ContextDecorator() context: ContextType,
      @Query(
        QueryTransformPipe,
        new ValidationPipe({
          transform: true,
          expectedType: argsType,
          whitelist: true,
          forbidNonWhitelisted: true,
          forbidUnknownValues: true,
        }),
      )
      args: FindArgsType,
    ): Promise<PaginationResult> {
      return this.service.pagination(context, args);
    }

    @Get(findAllPaginatedSettings?.route ?? 'paginated')
    @applyMethodDecorators(findAllPaginatedSettings?.decorators ?? [])
    @ApiOperation({
      summary: findAllPaginatedSettings?.summary,
      description: findAllPaginatedSettings?.description,
      operationId: findAllPaginatedSettings?.operationId,
    })
    @ApiQuery({
      name: 'args',
      required: false,
      schema: {
        $ref: getSchemaPath(argsType),
      },
    })
    @HttpCode(findAllPaginatedSettings?.successCode ?? HttpStatus.OK)
    @ApiResponses({
      schema: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: {
              $ref: getSchemaPath(entityType),
            },
          },
          pagination: { $ref: getSchemaPath(PaginationResult) },
        },
      },
      isArray: true,
      successCodes: findAllPaginatedSettings?.successCodes ?? [HttpStatus.OK],
      errorCodes: findAllPaginatedSettings?.errorCodes ?? [
        HttpStatus.BAD_REQUEST,
      ],
    })
    async findAllPaginated?(
      @ContextDecorator() context: ContextType,
      @Query(
        QueryTransformPipe,
        new ValidationPipe({
          transform: true,
          expectedType: argsType,
          whitelist: true,
          forbidNonWhitelisted: true,
          forbidUnknownValues: true,
        }),
      )
      args: FindArgsType,
    ): Promise<{ data: EntityType[]; pagination: PaginationResult }> {
      return this.service.findAll(context, args, true);
    }

    @Get(findAllGroupedSettings?.route ?? 'grouped')
    @applyMethodDecorators(findAllGroupedSettings?.decorators ?? [])
    @ApiOperation({
      summary: findAllGroupedSettings?.summary,
      description: findAllGroupedSettings?.description,
      operationId: findAllGroupedSettings?.operationId,
    })
    @ApiQuery({
      name: 'args',
      required: false,
      schema: {
        $ref: getSchemaPath(groupByArgsType!),
      },
    })
    @HttpCode(findAllGroupedSettings?.successCode ?? HttpStatus.OK)
    @ApiResponses({
      type: GroupedPaginationResult,
      successCodes: findAllGroupedSettings?.successCodes ?? [HttpStatus.OK],
      errorCodes: findAllGroupedSettings?.errorCodes ?? [HttpStatus.BAD_REQUEST],
    })
    async findAllGrouped?(
      @ContextDecorator() context: ContextType,
      @Query(
        QueryTransformPipe,
        new ValidationPipe({
          transform: true,
          expectedType: groupByArgsType!,
          whitelist: true,
          forbidNonWhitelisted: true,
          forbidUnknownValues: true,
        }),
      )
      args: GroupByArgs<EntityType>,
    ): Promise<GroupedPaginationResult> {
      return await (this.service as any).findAllGrouped(context, args);
    }

    @Get(findOneSettings?.route ?? ':id')
    @applyMethodDecorators(findOneSettings?.decorators ?? [])
    @ApiOperation({
      summary: findOneSettings?.summary,
      description: findOneSettings?.description,
      operationId: findOneSettings?.operationId,
    })
    @ApiParam(paramApiConfig)
    @HttpCode(findOneSettings?.successCode ?? HttpStatus.OK)
    @ApiResponses({
      type: entityType,
      successCodes: findOneSettings?.successCodes ?? [HttpStatus.OK],
      errorCodes: findOneSettings?.errorCodes ?? [
        HttpStatus.BAD_REQUEST,
        HttpStatus.NOT_FOUND,
      ],
    })
    async findOne?(
      @ContextDecorator() context: ContextType,
      @Param('id', ...pipeTransforms) id: IdType,
    ): Promise<EntityType> {
      return await this.service.findOne(context, id, true);
    }
  }

  //remove controller methods if they are disabled in the structure
  if (findAllSettings.disabled) {
    delete DataControllerClass.prototype.findAll;
  }
  if (findOneSettings.disabled) {
    delete DataControllerClass.prototype.findOne;
  }
  if (paginationSettings.disabled) {
    delete DataControllerClass.prototype.pagination;
  }
  if (findAllPaginatedSettings.disabled) {
    delete DataControllerClass.prototype.findAllPaginated;
  }
  if (findAllGroupedSettings.disabled || !groupByArgsType) {
    delete DataControllerClass.prototype.findAllGrouped;
  }

  return mixin(DataControllerClass);
}

export function extractOperationSettings(
  operation: OperationStructure | boolean | undefined,
  defaults: {
    disabled: boolean;
    route: string | undefined;
    summary: string;
    description: string;
    successCode: HttpStatus;
    errorCodes: HttpStatus[];
  },
) {
  if (typeof operation !== 'object') operation = {} as OperationStructure;

  return {
    disabled: defaults.disabled,
    route: operation.route ?? defaults.route,
    decorators: operation.decorators ?? [],
    summary: operation.title ?? defaults.summary,
    description: operation.description ?? defaults.description,
    operationId: operation.operationId,
    successCode:
      operation.successCode ??
      (operation.successCodes ?? [])[0] ??
      defaults.successCode,
    successCodes: operation.successCodes ?? [defaults.successCode],
    errorCodes: operation.errorCodes ?? defaults.errorCodes,
  };
}
