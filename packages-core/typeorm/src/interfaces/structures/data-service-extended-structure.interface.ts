import {
  Context,
  Entity,
  fillEntityId,
  FindArgs,
  IdTypeFrom,
  DeepPartial,
  ExtractDataOptionsFromServicePluginArray,
  ServicePlugin,
} from '@solid-nestjs/common';
import { DataServiceStructure } from './data-service-structure.interface';

/**
 * Creates an extended data service structure configuration with plugin support.
 *
 * This function extends the base `DataServiceStructure` to support plugins that can add
 * additional configuration options and functionality. It processes the input structure,
 * fills in entity ID configuration, and returns a structure enhanced with plugin-specific options.
 *
 * The returned structure can be used with `DataServiceExFrom` to create a service class
 * that includes functionality from all specified plugins.
 *
 * @template IdType - The type of the entity's identifier
 * @template EntityType - The entity type this service operates on
 * @template FindArgsType - The type for find operation arguments, defaults to FindArgs<EntityType>
 * @template ContextType - The context type for operations, defaults to Context
 * @template PluginArrayType - Array type of service plugins to be applied
 *
 * @param input - The base data service structure configuration enhanced with plugins and plugin options
 * @returns Enhanced data service structure with plugin support and extracted plugin options
 *
 * @example
 * ```typescript
 * // Create a data service structure with plugins
 * const serviceStructure = DataServiceStructureEx({
 *   entityType: Product,
 *   findArgsType: FindProductArgs,
 *
 *   // Plugin configuration
 *   plugins: [
 *     cachingPlugin(providerStructure),
 *     loggingPlugin(providerStructure),
 *     searchPlugin(providerStructure)
 *   ],
 *
 *   // Plugin-specific options (these become available due to plugin types)
 *   cacheTimeout: 600,        // from caching plugin
 *   logLevel: 'info',         // from logging plugin
 *   searchIndexes: ['name'],  // from search plugin
 *
 *   // Standard data service configuration
 *   functions: {
 *     findAll: {
 *       relationsConfig: { category: true, supplier: true }
 *     },
 *     findOne: {
 *       relationsConfig: { category: true, supplier: true, reviews: true }
 *     }
 *   }
 * });
 *
 * // Use with DataServiceExFrom to create service class
 * export class ProductService extends DataServiceExFrom(serviceStructure) {}
 * ```
 *
 * @example
 * ```typescript
 * // Structure with read-only and analytics plugins
 * const analyticsServiceStructure = DataServiceStructureEx({
 *   entityType: Analytics,
 *   findArgsType: FindAnalyticsArgs,
 *
 *   plugins: [
 *     readOnlyPlugin(analyticsProvider),
 *     aggregationPlugin(analyticsProvider)
 *   ],
 *
 *   // Plugin options
 *   enableAggregations: true,
 *   aggregationTypes: ['sum', 'avg', 'count'],
 *
 *   functions: {
 *     findAll: {
 *       decorators: [() => UseInterceptors(CacheInterceptor)]
 *     },
 *     pagination: {
 *       decorators: [() => UseInterceptors(TransformInterceptor)]
 *     }
 *   }
 * });
 * ```
 */
export function DataServiceStructureEx<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  FindArgsType extends FindArgs<EntityType> = FindArgs<EntityType>,
  ContextType extends Context = Context,
  PluginArrayType extends ServicePlugin<
    IdType,
    EntityType,
    DeepPartial<EntityType>,
    DeepPartial<EntityType>,
    FindArgsType,
    ContextType
  >[] = ServicePlugin<
    IdType,
    EntityType,
    DeepPartial<EntityType>,
    DeepPartial<EntityType>,
    FindArgsType,
    ContextType
  >[],
>(
  input: DataServiceStructure<IdType, EntityType, FindArgsType, ContextType> & {
    plugins?: PluginArrayType;
  } & ExtractDataOptionsFromServicePluginArray<PluginArrayType>,
): DataServiceStructure<IdType, EntityType, FindArgsType, ContextType> & {
  plugins?: PluginArrayType;
} & ExtractDataOptionsFromServicePluginArray<PluginArrayType> {
  fillEntityId(input);

  return input;
}
