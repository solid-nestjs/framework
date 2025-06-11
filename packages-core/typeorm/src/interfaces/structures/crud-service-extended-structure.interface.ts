import {
  Context,
  DeepPartial,
  Entity,
  fillEntityId,
  FindArgs,
  IdTypeFrom,
  ServicePlugin,
  ExtractOptionsFromServicePluginArray,
} from '@solid-nestjs/common';
import { CrudServiceStructure } from './crud-service-structure.interface';

/**
 * Creates an extended CRUD service structure configuration with plugin support.
 *
 * This function extends the base `CrudServiceStructure` to support plugins that can add
 * additional configuration options and functionality. It processes the input structure,
 * fills in entity ID configuration, and returns a structure enhanced with plugin-specific options.
 *
 * The returned structure can be used with `CrudServiceExFrom` to create a service class
 * that includes functionality from all specified plugins.
 *
 * @template IdType - The type of the entity's identifier
 * @template EntityType - The entity type this service operates on
 * @template CreateInputType - The input type for create operations, defaults to DeepPartial<EntityType>
 * @template UpdateInputType - The input type for update operations, defaults to DeepPartial<EntityType>
 * @template FindArgsType - The type for find operation arguments, defaults to FindArgs<EntityType>
 * @template ContextType - The context type for operations, defaults to Context
 * @template PluginArrayType - Array type of service plugins to be applied
 *
 * @param input - The base CRUD service structure configuration enhanced with plugins and plugin options
 * @returns Enhanced CRUD service structure with plugin support and extracted plugin options
 *
 * @example
 * ```typescript
 * // Create a CRUD service structure with plugins
 * const serviceStructure = CrudServiceStructureEx({
 *   entityType: User,
 *   createInputType: CreateUserDto,
 *   updateInputType: UpdateUserDto,
 *   findArgsType: FindUserArgs,
 *
 *   // Plugin configuration
 *   plugins: [
 *     loggingPlugin(providerStructure),
 *     auditPlugin(providerStructure),
 *     cachingPlugin(providerStructure)
 *   ],
 *
 *   // Plugin-specific options (these become available due to plugin types)
 *   logLevel: 'debug',        // from logging plugin
 *   enableAudit: true,        // from audit plugin
 *   cacheTimeout: 300,        // from caching plugin
 *
 *   // Standard CRUD service configuration
 *   functions: {
 *     create: { transactional: true },
 *     update: { transactional: true },
 *     remove: { transactional: true }
 *   }
 * });
 *
 * // Use with CrudServiceExFrom to create service class
 * export class UserService extends CrudServiceExFrom(serviceStructure) {}
 * ```
 *
 * @example
 * ```typescript
 * // Structure with validation and notification plugins
 * const orderServiceStructure = CrudServiceStructureEx({
 *   entityType: Order,
 *   createInputType: CreateOrderDto,
 *   updateInputType: UpdateOrderDto,
 *
 *   plugins: [
 *     validationPlugin(orderProvider),
 *     notificationPlugin(orderProvider)
 *   ],
 *
 *   // Plugin options
 *   validationRules: ['required', 'email'],
 *   notificationChannels: ['email', 'sms'],
 *
 *   functions: {
 *     create: {
 *       transactional: true,
 *       decorators: [() => UseGuards(AuthGuard)]
 *     }
 *   }
 * });
 * ```
 */
export function CrudServiceStructureEx<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  CreateInputType extends DeepPartial<EntityType>,
  UpdateInputType extends DeepPartial<EntityType>,
  FindArgsType extends FindArgs<EntityType> = FindArgs<EntityType>,
  ContextType extends Context = Context,
  PluginArrayType extends ServicePlugin<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    FindArgsType,
    ContextType
  >[] = ServicePlugin<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    FindArgsType,
    ContextType
  >[],
>(
  input: CrudServiceStructure<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    FindArgsType,
    ContextType
  > & {
    plugins?: PluginArrayType;
  } & ExtractOptionsFromServicePluginArray<PluginArrayType>,
): CrudServiceStructure<
  IdType,
  EntityType,
  CreateInputType,
  UpdateInputType,
  FindArgsType,
  ContextType
> & {
  plugins?: PluginArrayType;
} & ExtractOptionsFromServicePluginArray<PluginArrayType> {
  fillEntityId(input);

  return input;
}
