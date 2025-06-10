import { mixin, Type } from '@nestjs/common';
import {
  Constructable,
  Context,
  DataService,
  DeepPartial,
  Entity,
  FindArgs,
  IdTypeFrom,
} from '@solid-nestjs/common';
import {
  ControllerPlugin,
  DataController,
  DataControllerStructure,
  ExtractDataAddOnsFromControllerPluginArray,
  ExtractDataOptionsFromControllerPluginArray,
  ExtractDataServiceAddOnsFromControllerPluginArray,
} from '../interfaces';
import { DefaultArgs } from '../classes';
import { DataControllerFrom } from './data-controller.mixin';

/**
 * Creates an enhanced data REST API controller class with plugin support for read-only operations.
 *
 * This factory function applies controller plugins to extend the base DataController functionality.
 * Plugins are applied in two phases: structure modification and class modification.
 *
 * The controller provides REST endpoints for:
 * - GET /entities - List entities with filtering/pagination
 * - GET /entities/:id - Get entity by ID
 *
 * @template IdType - The type of the entity's identifier (string, number, etc.)
 * @template EntityType - The entity type this controller operates on
 * @template ServiceType - The data service type that provides business logic
 * @template FindArgsType - The DTO type for filtering/pagination (defaults to DefaultArgs)
 * @template ContextType - The request context type (defaults to Context)
 * @template PluginArrayType - Array of controller plugins to apply
 *
 * @param controllerStructure - Configuration object containing:
 *   - entity: The entity class
 *   - service: The data service instance
 *   - route?: Base route path (defaults to entity name)
 *   - plugins?: Array of controller plugins to apply
 *   - ...additional plugin-specific options
 *
 * @returns A mixin class that extends DataController with plugin functionality
 *
 * @example
 * ```typescript
 * // Basic data controller with caching plugin
 * const UserDataController = DataControllerExFrom({
 *   entity: User,
 *   service: userService,
 *   plugins: [cachePlugin],
 *   route: 'users'
 * });
 *
 * // Data controller with multiple plugins
 * const ProductDataController = DataControllerExFrom({
 *   entity: Product,
 *   service: productService,
 *   plugins: [authPlugin, cachePlugin, analyticsPlugin],
 *   route: 'products',
 *   // Plugin-specific options merged automatically
 *   requireAuth: false, // from authPlugin
 *   cacheTtl: 600, // from cachePlugin
 *   trackViews: true // from analyticsPlugin
 * });
 *
 * @Controller('products')
 * class ProductController extends ProductDataController {
 *   // Additional custom endpoints can be added here
 * }
 * ```
 *
 * @see {@link DataController} - Base data controller class
 * @see {@link ControllerPlugin} - Plugin interface for extending controllers
 * @see {@link DataControllerStructure} - Configuration structure interface
 */
export function DataControllerExFrom<
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
  PluginArrayType extends ControllerPlugin<
    IdType,
    EntityType,
    DeepPartial<EntityType>,
    DeepPartial<EntityType>,
    FindArgsType,
    ContextType
  >[] = [],
>(
  controllerStructure: DataControllerStructure<
    IdType,
    EntityType,
    ServiceType &
      ExtractDataServiceAddOnsFromControllerPluginArray<PluginArrayType>,
    FindArgsType,
    ContextType
  > & {
    plugins?: PluginArrayType;
  } & ExtractDataOptionsFromControllerPluginArray<PluginArrayType>,
): Type<
  DataController<
    IdType,
    EntityType,
    ServiceType &
      ExtractDataServiceAddOnsFromControllerPluginArray<PluginArrayType>,
    FindArgsType,
    ContextType
  > &
    ExtractDataAddOnsFromControllerPluginArray<PluginArrayType>
> {
  if (controllerStructure.plugins && controllerStructure.plugins.length > 0) {
    controllerStructure.plugins.forEach(element => {
      if (element.applyDataControllerStructure)
        element.applyDataControllerStructure(controllerStructure);
    });
  }

  let controllerClass = DataControllerFrom(
    controllerStructure,
  ) as Constructable<any>;

  if (controllerStructure.plugins && controllerStructure.plugins.length > 0) {
    controllerStructure.plugins.forEach(element => {
      if (element.applyDataControllerClass)
        controllerClass = element.applyDataControllerClass(
          controllerClass,
          controllerStructure,
        );
    });
  }

  return mixin(controllerClass);
}
