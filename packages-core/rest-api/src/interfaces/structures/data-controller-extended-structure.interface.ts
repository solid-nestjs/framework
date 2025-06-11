import {
  Context,
  DataService,
  DeepPartial,
  Entity,
  fillEntityId,
  FindArgs,
  IdTypeFrom,
} from '@solid-nestjs/common';
import { DataControllerStructure } from './data-controller-structure.interface';
import {
  ControllerPlugin,
  ExtractDataOptionsFromControllerPluginArray,
  ExtractDataServiceAddOnsFromControllerPluginArray,
} from './plugins.interface';

/**
 * Creates an enhanced data controller structure configuration with plugin support.
 *
 * This function helps configure a data REST API controller structure that can be extended
 * with plugins. The structure defines all the necessary configurations for creating a
 * controller that supports read-only data operations (List, Get by ID) with
 * plugin-enhanced functionality.
 *
 * @template IdType - The type of the entity's identifier (string, number, etc.)
 * @template EntityType - The entity type this controller will operate on
 * @template ServiceType - The data service type that provides business logic
 * @template FindArgsType - The type for filtering/pagination parameters
 * @template ContextType - The request context type (defaults to Context)
 * @template PluginArrayType - Array of controller plugins to apply
 *
 * @param input - Configuration object containing:
 *   - entityType: The entity class
 *   - serviceType: The data service class
 *   - route?: Base route path for the controller
 *   - operations?: Configuration for which data operations to enable/disable
 *   - plugins?: Array of controller plugins to apply
 *   - ...additional plugin-specific options
 *
 * @returns Enhanced controller structure with plugin support and type-safe configuration
 *
 * @example
 * ```typescript
 * // Basic data controller structure with caching plugin
 * const userDataControllerStructure = DataControllerStructureEx({
 *   entityType: User,
 *   serviceType: UserDataService,
 *   route: 'users',
 *   plugins: [cachePlugin],
 *   operations: {
 *     findAll: { route: 'list' },
 *     findOne: { route: ':id' },
 *     pagination: false // Disable pagination endpoint
 *   }
 * });
 *
 * // Advanced structure with multiple plugins for analytics
 * const productDataControllerStructure = DataControllerStructureEx({
 *   entityType: Product,
 *   serviceType: ProductDataService,
 *   plugins: [analyticsPlugin, cachePlugin, rateLimit],
 *
 *   // Plugin-specific options are type-safe
 *   trackViews: true, // from analyticsPlugin
 *   cacheTtl: 600, // from cachePlugin
 *   rateLimit: { max: 100, windowMs: 60000 }, // from rateLimit
 *
 *   operations: {
 *     findAll: {
 *       decorators: [() => UseInterceptors(LoggingInterceptor)]
 *     }
 *   }
 * });
 * ```
 *
 * @see {@link DataControllerStructure} - Base controller structure interface
 * @see {@link ControllerPlugin} - Plugin interface for extending controllers
 * @see {@link DataControllerExFrom} - Factory for creating controller classes from structures
 */
export function DataControllerStructureEx<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  ServiceType extends DataService<
    IdType,
    EntityType,
    FindArgsType,
    ContextType
  >,
  FindArgsType extends FindArgs<EntityType>,
  ContextType extends Context,
  PluginArrayType extends ControllerPlugin<
    IdType,
    EntityType,
    DeepPartial<EntityType>,
    DeepPartial<EntityType>,
    FindArgsType,
    ContextType
  >[] = ControllerPlugin<
    IdType,
    EntityType,
    DeepPartial<EntityType>,
    DeepPartial<EntityType>,
    FindArgsType,
    ContextType
  >[],
>(
  input: DataControllerStructure<
    IdType,
    EntityType,
    ServiceType &
      ExtractDataServiceAddOnsFromControllerPluginArray<PluginArrayType>,
    FindArgsType,
    ContextType
  > & {
    plugins?: PluginArrayType;
  } & ExtractDataOptionsFromControllerPluginArray<PluginArrayType>,
): DataControllerStructure<
  IdType,
  EntityType,
  ServiceType &
    ExtractDataServiceAddOnsFromControllerPluginArray<PluginArrayType>,
  FindArgsType,
  ContextType
> & {
  plugins?: PluginArrayType;
} & ExtractDataOptionsFromControllerPluginArray<PluginArrayType> {
  fillEntityId(input);

  return input;
}
