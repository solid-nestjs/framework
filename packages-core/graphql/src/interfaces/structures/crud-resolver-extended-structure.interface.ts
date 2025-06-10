import {
  Context,
  CrudService,
  DeepPartial,
  Entity,
  fillEntityId,
  FindArgs,
  IdTypeFrom,
} from '@solid-nestjs/common';
import { CrudResolverStructure } from './crud-resolver-structure.interface';
import {
  ResolverPlugin,
  ExtractOptionsFromResolverPluginArray,
  ExtractServiceAddOnsFromResolverPluginArray,
} from './plugins.interface';

/**
 * Creates an enhanced CRUD GraphQL resolver structure configuration with plugin support.
 *
 * This function helps configure a CRUD GraphQL resolver structure that can be extended
 * with plugins. The structure defines all the necessary configurations for creating a
 * resolver that supports full CRUD operations (Create, Read, Update, Delete) through
 * GraphQL mutations and queries with plugin-enhanced functionality.
 *
 * @template IdType - The type of the entity's identifier (string, number, etc.)
 * @template EntityType - The entity type this resolver will operate on
 * @template CreateInputType - The GraphQL input type for creating new entities
 * @template UpdateInputType - The GraphQL input type for updating existing entities
 * @template ServiceType - The CRUD service type that provides business logic
 * @template FindArgsType - The type for filtering/pagination parameters
 * @template ContextType - The GraphQL execution context type (defaults to Context)
 * @template PluginArrayType - Array of resolver plugins to apply
 *
 * @param input - Configuration object containing:
 *   - entityType: The entity class
 *   - serviceType: The CRUD service class
 *   - createInputType: GraphQL input type for create operations
 *   - updateInputType: GraphQL input type for update operations
 *   - findMany?: Configuration for the findMany query
 *   - findById?: Configuration for the findById query
 *   - create?: Configuration for the create mutation
 *   - update?: Configuration for the update mutation
 *   - remove?: Configuration for the remove mutation
 *   - plugins?: Array of resolver plugins to apply
 *   - ...additional plugin-specific options
 *
 * @returns Enhanced resolver structure with plugin support and type-safe configuration
 *
 * @example
 * ```typescript
 * // Basic CRUD resolver structure with validation plugin
 * const userResolverStructure = CrudResolverStructureEx({
 *   entityType: User,
 *   serviceType: UserService,
 *   createInputType: CreateUserInput,
 *   updateInputType: UpdateUserInput,
 *   plugins: [validationPlugin],
 *
 *   findMany: {
 *     name: 'users',
 *     description: 'Get all users'
 *   },
 *   create: {
 *     name: 'createUser',
 *     description: 'Create a new user'
 *   },
 *   remove: false // Disable delete mutation
 * });
 *
 * // Advanced structure with multiple plugins
 * const orderResolverStructure = CrudResolverStructureEx({
 *   entityType: Order,
 *   serviceType: OrderService,
 *   createInputType: CreateOrderInput,
 *   updateInputType: UpdateOrderInput,
 *   plugins: [authPlugin, subscriptionPlugin, auditPlugin],
 *
 *   // Plugin-specific options are type-safe
 *   requireAuth: true, // from authPlugin
 *   enableSubscriptions: true, // from subscriptionPlugin
 *   auditEvents: ['create', 'update'], // from auditPlugin
 *
 *   findMany: { name: 'orders' },
 *   create: {
 *     name: 'createOrder',
 *     decorators: [() => UseGuards(AuthGuard)]
 *   }
 * });
 * ```
 *
 * @see {@link CrudResolverStructure} - Base resolver structure interface
 * @see {@link ResolverPlugin} - Plugin interface for extending resolvers
 * @see {@link CrudResolverExFrom} - Factory for creating resolver classes from structures
 */
export function CrudResolverStructureEx<
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
  FindArgsType extends FindArgs<EntityType>,
  ContextType extends Context,
  PluginArrayType extends ResolverPlugin<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    FindArgsType,
    ContextType
  >[] = [],
>(
  input: CrudResolverStructure<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    ServiceType & ExtractServiceAddOnsFromResolverPluginArray<PluginArrayType>,
    FindArgsType,
    ContextType
  > & {
    plugins?: PluginArrayType;
  } & ExtractOptionsFromResolverPluginArray<PluginArrayType>,
): CrudResolverStructure<
  IdType,
  EntityType,
  CreateInputType,
  UpdateInputType,
  ServiceType & ExtractServiceAddOnsFromResolverPluginArray<PluginArrayType>,
  FindArgsType,
  ContextType
> & {
  plugins?: PluginArrayType;
} & ExtractOptionsFromResolverPluginArray<PluginArrayType> {
  fillEntityId(input);

  return input;
}
