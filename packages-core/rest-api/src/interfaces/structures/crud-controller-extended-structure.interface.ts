import {
  Context,
  CrudService,
  DeepPartial,
  Entity,
  fillEntityId,
  FindArgs,
  IdTypeFrom,
} from '@solid-nestjs/common';
import { CrudControllerStructure } from './crud-controller-structure.interface';
import {
  ControllerPlugin,
  ExtractOptionsFromControllerPluginArray,
  ExtractServiceAddOnsFromControllerPluginArray,
} from './plugins.interface';

/**
 * Creates an enhanced CRUD controller structure configuration with plugin support.
 *
 * This function helps configure a CRUD REST API controller structure that can be extended
 * with plugins. The structure defines all the necessary configurations for creating a
 * controller that supports full CRUD operations (Create, Read, Update, Delete) with
 * plugin-enhanced functionality.
 *
 * @template IdType - The type of the entity's identifier (string, number, etc.)
 * @template EntityType - The entity type this controller will operate on
 * @template CreateInputType - The DTO type for creating new entities
 * @template UpdateInputType - The DTO type for updating existing entities
 * @template ServiceType - The CRUD service type that provides business logic
 * @template FindArgsType - The type for filtering/pagination parameters
 * @template ContextType - The request context type (defaults to Context)
 * @template PluginArrayType - Array of controller plugins to apply
 *
 * @param input - Configuration object containing:
 *   - entityType: The entity class
 *   - serviceType: The CRUD service class
 *   - createInputType: DTO class for create operations
 *   - updateInputType: DTO class for update operations
 *   - route?: Base route path for the controller
 *   - operations?: Configuration for which CRUD operations to enable/disable
 *   - plugins?: Array of controller plugins to apply
 *   - ...additional plugin-specific options
 *
 * @returns Enhanced controller structure with plugin support and type-safe configuration
 *
 * @example
 * ```typescript
 * // Basic CRUD controller structure with validation plugin
 * const userControllerStructure = CrudControllerStructureEx({
 *   entityType: User,
 *   serviceType: UserService,
 *   createInputType: CreateUserDto,
 *   updateInputType: UpdateUserDto,
 *   route: 'users',
 *   plugins: [validationPlugin],
 *   operations: {
 *     create: { route: 'create' },
 *     update: { route: 'update/:id' },
 *     remove: false // Disable delete operation
 *   }
 * });
 *
 * // Advanced structure with multiple plugins
 * const productControllerStructure = CrudControllerStructureEx({
 *   entityType: Product,
 *   serviceType: ProductService,
 *   createInputType: CreateProductDto,
 *   updateInputType: UpdateProductDto,
 *   plugins: [authPlugin, auditPlugin, cachePlugin],
 *
 *   // Plugin-specific options are type-safe
 *   requireAuth: true, // from authPlugin
 *   auditEvents: ['create', 'update', 'delete'], // from auditPlugin
 *   cacheTtl: 300, // from cachePlugin
 *
 *   operations: {
 *     findAll: {
 *       decorators: [() => UseGuards(AuthGuard)]
 *     }
 *   }
 * });
 * ```
 *
 * @see {@link CrudControllerStructure} - Base controller structure interface
 * @see {@link ControllerPlugin} - Plugin interface for extending controllers
 * @see {@link CrudControllerExFrom} - Factory for creating controller classes from structures
 */
export function CrudControllerStructureEx<
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
  PluginArrayType extends ControllerPlugin<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    FindArgsType,
    ContextType
  >[] = [],
>(
  input: CrudControllerStructure<
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
): CrudControllerStructure<
  IdType,
  EntityType,
  CreateInputType,
  UpdateInputType,
  ServiceType & ExtractServiceAddOnsFromControllerPluginArray<PluginArrayType>,
  FindArgsType,
  ContextType
> & {
  plugins?: PluginArrayType;
} & ExtractOptionsFromControllerPluginArray<PluginArrayType> {
  fillEntityId(input);

  return input;
}
