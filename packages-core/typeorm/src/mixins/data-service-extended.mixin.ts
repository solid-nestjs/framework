import { mixin, Type } from '@nestjs/common';
import {
  Constructable,
  Context,
  DeepPartial,
  Entity,
  ExtractDataAddOnsFromServicePluginArray,
  ExtractDataOptionsFromServicePluginArray,
  FindArgs,
  IdTypeFrom,
  ServicePlugin,
} from '@solid-nestjs/common';
import { DataService, DataServiceStructure } from '../interfaces';
import { DataServiceFrom } from './data-service.mixin';

/**
 * Creates an enhanced data service class with plugin support.
 *
 * This function processes a data service structure that includes plugins and creates a service class
 * with all the functionality from the base data service plus additional functionality provided by the plugins.
 * The plugins are applied in two phases:
 *
 * 1. **Structure Phase**: Plugins can modify the service structure configuration
 * 2. **Class Phase**: Plugins can extend the service class with additional methods and behavior
 *
 * The resulting service class will have type-safe access to all plugin-provided methods and properties.
 * This is ideal for read-only services or services that only need data retrieval functionality.
 *
 * @template IdType - The type of the entity's identifier
 * @template EntityType - The entity type this service operates on
 * @template FindArgsType - The type for find operation arguments, defaults to FindArgs<EntityType>
 * @template ContextType - The context type for operations, defaults to Context
 * @template PluginArrayType - Array type of service plugins to be applied
 *
 * @param serviceStructure - The data service structure configuration with plugins and plugin options
 * @returns A service class constructor enhanced with plugin functionality
 *
 * @example
 * ```typescript
 * // Create a read-only service with caching and search plugins
 * const plugins = [
 *   cachingPlugin(providerStructure),
 *   searchPlugin(providerStructure),
 *   analyticsPlugin(providerStructure)
 * ];
 *
 * const serviceStructure = DataServiceStructureEx({
 *   entityType: Product,
 *   findArgsType: FindProductArgs,
 *   plugins,
 *
 *   // Plugin options
 *   cacheTimeout: 600,
 *   searchIndexes: ['name', 'description'],
 *   trackAnalytics: true,
 *
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
 * // Create enhanced data service class
 * export class ProductReadService extends DataServiceExFrom(serviceStructure) {
 *   // The service now has access to plugin methods:
 *   // - this.getCached(key) from caching plugin
 *   // - this.search(query) from search plugin
 *   // - this.trackView(productId) from analytics plugin
 *
 *   async findPopularProducts(context: Context) {
 *     const cacheKey = 'popular-products';
 *     let products = await this.getCached(cacheKey);
 *
 *     if (!products) {
 *       products = await this.findAll(context, {
 *         orderBy: { views: 'DESC' },
 *         pagination: { limit: 10 }
 *       });
 *       await this.setCached(cacheKey, products, 300);
 *     }
 *
 *     return products;
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Analytics service with aggregation and reporting plugins
 * const analyticsServiceStructure = DataServiceStructureEx({
 *   entityType: UserActivity,
 *   findArgsType: FindActivityArgs,
 *
 *   plugins: [
 *     aggregationPlugin(activityProvider),
 *     reportingPlugin(activityProvider),
 *     exportPlugin(activityProvider)
 *   ],
 *
 *   // Plugin configurations
 *   aggregationTypes: ['count', 'sum', 'avg'],
 *   reportFormats: ['csv', 'pdf', 'excel'],
 *   exportBatchSize: 1000
 * });
 *
 * export class AnalyticsService extends DataServiceExFrom(analyticsServiceStructure) {
 *   async generateUserReport(context: Context, userId: string) {
 *     const activities = await this.findAll(context, { where: { userId } });
 *     const aggregated = await this.aggregateData(activities, 'daily');
 *     return this.generateReport(aggregated, 'pdf');
 *   }
 * }
 * ```
 */
export function DataServiceExFrom<
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
  serviceStructure: DataServiceStructure<
    IdType,
    EntityType,
    FindArgsType,
    ContextType
  > & {
    plugins?: PluginArrayType;
  } & ExtractDataOptionsFromServicePluginArray<PluginArrayType>,
): Type<
  DataService<IdType, EntityType, FindArgsType, ContextType> &
    ExtractDataAddOnsFromServicePluginArray<PluginArrayType>
> {
  // Phase 1: Apply structure modifications from plugins
  if (serviceStructure.plugins && serviceStructure.plugins.length > 0) {
    serviceStructure.plugins.forEach(element => {
      if (element.applyDataServiceStructure)
        element.applyDataServiceStructure(serviceStructure);
    });
  }

  // Create base service class
  let serviceClass = DataServiceFrom(serviceStructure) as Constructable<any>;

  // Phase 2: Apply class enhancements from plugins
  if (serviceStructure.plugins && serviceStructure.plugins.length > 0) {
    serviceStructure.plugins.forEach(element => {
      if (element.applyDataServiceClass)
        serviceClass = element.applyDataServiceClass(
          serviceClass,
          serviceStructure,
        );
    });
  }

  return mixin(serviceClass);
}
