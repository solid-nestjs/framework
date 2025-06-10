import { mixin, Type } from '@nestjs/common';
import {
  Context,
  IdTypeFrom,
  Entity,
  FindArgs,
  CrudService,
  DeepPartial,
  Constructable,
} from '@solid-nestjs/common';
import {
  ControllerPlugin,
  CrudController,
  CrudControllerStructure,
  ExtractAddOnsFromControllerPluginArray,
  ExtractOptionsFromControllerPluginArray,
  ExtractServiceAddOnsFromControllerPluginArray,
} from '../interfaces';
import { DefaultArgs } from '../classes';
import { CrudControllerFrom } from './crud-controller.mixin';

/**
 * Creates an enhanced CRUD REST API controller class with plugin support for full CRUD operations.
 *
 * This factory function applies controller plugins to extend the base CrudController functionality.
 * Plugins are applied in two phases: structure modification and class modification.
 *
 * The controller provides REST endpoints for:
 * - GET /entities - List entities with filtering/pagination
 * - GET /entities/:id - Get entity by ID
 * - POST /entities - Create new entity
 * - PUT /entities/:id - Update entity
 * - DELETE /entities/:id - Delete entity
 *
 * @template IdType - The type of the entity's identifier (string, number, etc.)
 * @template EntityType - The entity type this controller operates on
 * @template CreateInputType - The DTO type for creating entities
 * @template UpdateInputType - The DTO type for updating entities
 * @template ServiceType - The CRUD service type that provides business logic
 * @template FindArgsType - The DTO type for filtering/pagination (defaults to DefaultArgs)
 * @template ContextType - The request context type (defaults to Context)
 * @template PluginArrayType - Array of controller plugins to apply
 *
 * @param controllerStructure - Configuration object containing:
 *   - entity: The entity class
 *   - service: The CRUD service instance
 *   - createDto?: DTO class for create operations
 *   - updateDto?: DTO class for update operations
 *   - route?: Base route path (defaults to entity name)
 *   - plugins?: Array of controller plugins to apply
 *   - ...additional plugin-specific options
 *
 * @returns A mixin class that extends CrudController with plugin functionality
 *
 * @example
 * ```typescript
 * // Basic CRUD controller with validation plugin
 * const UserCrudController = CrudControllerExFrom({
 *   entity: User,
 *   service: userService,
 *   createDto: CreateUserDto,
 *   updateDto: UpdateUserDto,
 *   plugins: [validationPlugin],
 *   route: 'users'
 * });
 *
 * // CRUD controller with multiple plugins
 * const ProductCrudController = CrudControllerExFrom({
 *   entity: Product,
 *   service: productService,
 *   createDto: CreateProductDto,
 *   updateDto: UpdateProductDto,
 *   plugins: [authPlugin, rateLimit, auditPlugin],
 *   route: 'products',
 *   // Plugin-specific options merged automatically
 *   requireAuth: true, // from authPlugin
 *   rateLimit: { max: 100 }, // from rateLimit
 *   auditEvents: ['create', 'update', 'delete'] // from auditPlugin
 * });
 *
 * @Controller('products')
 * class ProductController extends ProductCrudController {
 *   // Additional custom endpoints can be added here
 * }
 * ```
 *
 * @see {@link CrudController} - Base CRUD controller class
 * @see {@link ControllerPlugin} - Plugin interface for extending controllers
 * @see {@link CrudControllerStructure} - Configuration structure interface
 */
export function CrudControllerExFrom<
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
  PluginArrayType extends ControllerPlugin<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    FindArgsType,
    ContextType
  >[] = [],
>(
  controllerStructure: CrudControllerStructure<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    ServiceType &
      ExtractServiceAddOnsFromControllerPluginArray<PluginArrayType>,
    FindArgsType,
    ContextType
  > & {
    plugins?: PluginArrayType;
  } & ExtractOptionsFromControllerPluginArray<PluginArrayType>,
): Type<
  CrudController<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    ServiceType &
      ExtractServiceAddOnsFromControllerPluginArray<PluginArrayType>,
    FindArgsType,
    ContextType
  > &
    ExtractAddOnsFromControllerPluginArray<PluginArrayType>
> {
  if (controllerStructure.plugins && controllerStructure.plugins.length > 0) {
    controllerStructure.plugins.forEach(element => {
      if (element.applyDataControllerStructure)
        element.applyDataControllerStructure(controllerStructure);
      if (element.applyCrudControllerStructure)
        element.applyCrudControllerStructure(controllerStructure);
    });
  }

  let controllerClass = CrudControllerFrom(
    controllerStructure,
  ) as Constructable<any>;

  if (controllerStructure.plugins && controllerStructure.plugins.length > 0) {
    controllerStructure.plugins.forEach(element => {
      if (element.applyDataControllerClass)
        controllerClass = element.applyDataControllerClass(
          controllerClass,
          controllerStructure,
        );
      if (element.applyCrudControllerClass)
        controllerClass = element.applyCrudControllerClass(
          controllerClass,
          controllerStructure,
        );
    });
  }

  return mixin(controllerClass);
}
