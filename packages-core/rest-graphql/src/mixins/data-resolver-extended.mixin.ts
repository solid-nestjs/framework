import { Type } from '@nestjs/common';
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
  DataResolver,
  DataResolverStructure,
  ExtractDataAddOnsFromResolverPluginArray,
  ExtractDataOptionsFromResolverPluginArray,
  ExtractDataServiceAddOnsFromResolverPluginArray,
  ResolverPlugin,
  DataResolverExFrom as GraphDataResolverExFrom,
} from '@solid-nestjs/graphql';
import { DefaultArgs } from '../classes';

/**
 * Creates an enhanced data GraphQL resolver class with plugin support for data operations.
 *
 * This factory function applies resolver plugins to extend the base DataResolver functionality.
 * Plugins are applied in two phases: structure modification and class modification.
 *
 * The resolver provides GraphQL operations for data access including:
 * - Finding entities by ID
 * - Querying with filtering and pagination
 * - Subscription support (if configured)
 *
 * @template IdType - The type of the entity's identifier (string, number, etc.)
 * @template EntityType - The entity type this resolver operates on
 * @template ServiceType - The data service type that provides business logic
 * @template FindArgsType - The GraphQL input type for filtering/pagination (defaults to DefaultArgs)
 * @template ContextType - The GraphQL execution context type (defaults to Context)
 * @template PluginArrayType - Array of resolver plugins to apply
 *
 * @param resolverStructure - Configuration object containing:
 *   - entity: The entity class
 *   - service: The data service instance
 *   - findMany?: GraphQL field configuration for listing entities
 *   - findById?: GraphQL field configuration for finding by ID
 *   - plugins?: Array of resolver plugins to apply
 *   - ...additional plugin-specific options
 *
 * @returns A mixin class that extends DataResolver with plugin functionality
 *
 * @example
 * ```typescript
 * // Basic data resolver with logging plugin
 * const UserDataResolver = DataResolverExFrom({
 *   entity: User,
 *   service: userService,
 *   plugins: [loggingPlugin],
 *   findMany: {
 *     name: 'users',
 *     description: 'Find all users'
 *   }
 * });
 *
 * // Data resolver with multiple plugins
 * const ProductDataResolver = DataResolverExFrom({
 *   entity: Product,
 *   service: productService,
 *   plugins: [authPlugin, cachePlugin, auditPlugin],
 *   findMany: { name: 'products' },
 *   findById: { name: 'product' },
 *   // Plugin-specific options merged automatically
 *   cacheTtl: 300, // from cachePlugin
 *   auditEvents: ['query'] // from auditPlugin
 * });
 *
 * @Resolver(() => Product)
 * class ProductResolver extends ProductDataResolver {
 *   // Additional custom resolvers can be added here
 * }
 * ```
 *
 * @see {@link DataResolver} - Base data resolver class
 * @see {@link ResolverPlugin} - Plugin interface for extending resolvers
 * @see {@link DataResolverStructure} - Configuration structure interface
 */
export function DataResolverExFrom<
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
  resolverStructure: DataResolverStructure<
    IdType,
    EntityType,
    ServiceType &
      ExtractDataServiceAddOnsFromResolverPluginArray<PluginArrayType>,
    FindArgsType,
    ContextType
  > & {
    plugins?: PluginArrayType;
  } & ExtractDataOptionsFromResolverPluginArray<PluginArrayType>,
): Type<
  DataResolver<
    IdType,
    EntityType,
    ServiceType &
      ExtractDataServiceAddOnsFromResolverPluginArray<PluginArrayType>,
    FindArgsType,
    ContextType
  > &
    ExtractDataAddOnsFromResolverPluginArray<PluginArrayType>
> {
  const { findArgsType } = resolverStructure;

  const argsType =
    findArgsType ?? (DefaultArgs<EntityType> as Constructable<FindArgsType>);

  return GraphDataResolverExFrom<
    IdType,
    EntityType,
    ServiceType,
    FindArgsType,
    ContextType,
    PluginArrayType
  >({ ...resolverStructure, findArgsType: argsType });
}
