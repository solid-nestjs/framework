import {
  Context,
  DataService,
  DeepPartial,
  Entity,
  fillEntityId,
  FindArgs,
  IdTypeFrom,
} from '@solid-nestjs/common';
import { DataResolverStructure } from './data-resolver-structure.interface';
import {
  ResolverPlugin,
  ExtractDataOptionsFromResolverPluginArray,
  ExtractDataServiceAddOnsFromResolverPluginArray,
} from './plugins.interface';

/**
 * Creates an enhanced data GraphQL resolver structure configuration with plugin support.
 *
 * This function helps configure a data GraphQL resolver structure that can be extended
 * with plugins. The structure defines all the necessary configurations for creating a
 * resolver that supports read-only data operations (queries and subscriptions) through
 * GraphQL with plugin-enhanced functionality.
 *
 * @template IdType - The type of the entity's identifier (string, number, etc.)
 * @template EntityType - The entity type this resolver will operate on
 * @template ServiceType - The data service type that provides business logic
 * @template FindArgsType - The type for filtering/pagination parameters
 * @template ContextType - The GraphQL execution context type (defaults to Context)
 * @template PluginArrayType - Array of resolver plugins to apply
 *
 * @param input - Configuration object containing:
 *   - entityType: The entity class
 *   - serviceType: The data service class
 *   - findMany?: Configuration for the findMany query
 *   - findById?: Configuration for the findById query
 *   - plugins?: Array of resolver plugins to apply
 *   - ...additional plugin-specific options
 *
 * @returns Enhanced resolver structure with plugin support and type-safe configuration
 *
 * @example
 * ```typescript
 * // Basic data resolver structure with caching plugin
 * const userDataResolverStructure = DataResolverStructureEx({
 *   entityType: User,
 *   serviceType: UserDataService,
 *   plugins: [cachePlugin],
 *
 *   findMany: {
 *     name: 'users',
 *     description: 'Get all users with caching'
 *   },
 *   findById: {
 *     name: 'user',
 *     description: 'Get user by ID'
 *   }
 * });
 *
 * // Advanced structure with subscription and analytics plugins
 * const productDataResolverStructure = DataResolverStructureEx({
 *   entityType: Product,
 *   serviceType: ProductDataService,
 *   plugins: [subscriptionPlugin, analyticsPlugin, cachePlugin],
 *
 *   // Plugin-specific options are type-safe
 *   enableSubscriptions: true, // from subscriptionPlugin
 *   trackQueries: true, // from analyticsPlugin
 *   cacheTtl: 300, // from cachePlugin
 *
 *   findMany: {
 *     name: 'products',
 *     decorators: [() => UseInterceptors(LoggingInterceptor)]
 *   },
 *   findById: { name: 'product' }
 * });
 * ```
 *
 * @see {@link DataResolverStructure} - Base resolver structure interface
 * @see {@link ResolverPlugin} - Plugin interface for extending resolvers
 * @see {@link DataResolverExFrom} - Factory for creating resolver classes from structures
 */
export function DataResolverStructureEx<
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
  PluginArrayType extends ResolverPlugin<
    IdType,
    EntityType,
    DeepPartial<EntityType>,
    DeepPartial<EntityType>,
    FindArgsType,
    ContextType
  >[] = ResolverPlugin<
    IdType,
    EntityType,
    DeepPartial<EntityType>,
    DeepPartial<EntityType>,
    FindArgsType,
    ContextType
  >[],
>(
  input: DataResolverStructure<
    IdType,
    EntityType,
    ServiceType &
      ExtractDataServiceAddOnsFromResolverPluginArray<PluginArrayType>,
    FindArgsType,
    ContextType
  > & {
    plugins?: PluginArrayType;
  } & ExtractDataOptionsFromResolverPluginArray<PluginArrayType>,
): DataResolverStructure<
  IdType,
  EntityType,
  ServiceType &
    ExtractDataServiceAddOnsFromResolverPluginArray<PluginArrayType>,
  FindArgsType,
  ContextType
> & {
  plugins?: PluginArrayType;
} & ExtractDataOptionsFromResolverPluginArray<PluginArrayType> {
  fillEntityId(input);

  return input;
}
