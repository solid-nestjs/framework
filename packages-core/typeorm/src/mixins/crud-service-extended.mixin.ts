import { mixin, Type } from '@nestjs/common';
import {
  Constructable,
  Context,
  CrudService,
  DeepPartial,
  Entity,
  ExtractAddOnsFromServicePluginArray,
  ExtractOptionsFromServicePluginArray,
  FindArgs,
  IdTypeFrom,
  ServicePlugin,
} from '@solid-nestjs/common';
import { CrudServiceStructure } from '../interfaces';
import { CrudServiceFrom } from './crud-service.mixin';

/**
 * Creates an enhanced CRUD service class with plugin support.
 *
 * This function processes a CRUD service structure that includes plugins and creates a service class
 * with all the functionality from the base CRUD service plus additional functionality provided by the plugins.
 * The plugins are applied in two phases:
 *
 * 1. **Structure Phase**: Plugins can modify the service structure configuration
 * 2. **Class Phase**: Plugins can extend the service class with additional methods and behavior
 *
 * The resulting service class will have type-safe access to all plugin-provided methods and properties.
 *
 * @template IdType - The type of the entity's identifier
 * @template EntityType - The entity type this service operates on
 * @template CreateInputType - The input type for create operations
 * @template UpdateInputType - The input type for update operations
 * @template FindArgsType - The type for find operation arguments, defaults to FindArgs<EntityType>
 * @template ContextType - The context type for operations, defaults to Context
 * @template PluginArrayType - Array type of service plugins to be applied
 *
 * @param serviceStructure - The CRUD service structure configuration with plugins and plugin options
 * @returns A service class constructor enhanced with plugin functionality
 *
 * @example
 * ```typescript
 * // Define plugins for the service
 * const plugins = [
 *   auditPlugin(providerStructure),
 *   cachingPlugin(providerStructure),
 *   validationPlugin(providerStructure)
 * ];
 *
 * // Create enhanced service structure
 * const serviceStructure = CrudServiceStructureEx({
 *   entityType: User,
 *   createInputType: CreateUserDto,
 *   updateInputType: UpdateUserDto,
 *   plugins,
 *
 *   // Plugin options
 *   enableAudit: true,
 *   cacheTimeout: 300,
 *   validationRules: ['email', 'required'],
 *
 *   functions: {
 *     create: { transactional: true },
 *     update: { transactional: true }
 *   }
 * });
 *
 * // Create enhanced service class
 * export class UserService extends CrudServiceExFrom(serviceStructure) {
 *   // The service now has access to plugin methods:
 *   // - this.auditCreate(data) from audit plugin
 *   // - this.getCached(key) from caching plugin
 *   // - this.validateInput(input) from validation plugin
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Example with custom business logic
 * const orderServiceStructure = CrudServiceStructureEx({
 *   entityType: Order,
 *   createInputType: CreateOrderDto,
 *   updateInputType: UpdateOrderDto,
 *
 *   plugins: [
 *     notificationPlugin(orderProvider),
 *     inventoryPlugin(orderProvider),
 *     paymentPlugin(orderProvider)
 *   ],
 *
 *   // Plugin configurations
 *   notificationChannels: ['email', 'sms'],
 *   inventoryCheckEnabled: true,
 *   paymentGateway: 'stripe'
 * });
 *
 * export class OrderService extends CrudServiceExFrom(orderServiceStructure) {
 *   async createOrder(context: Context, input: CreateOrderDto) {
 *     // Plugin methods are available
 *     await this.checkInventory(input.items);        // from inventory plugin
 *     const order = await this.create(context, input);
 *     await this.processPayment(order.totalAmount);  // from payment plugin
 *     await this.sendNotification(order.customerId); // from notification plugin
 *     return order;
 *   }
 * }
 * ```
 */
export function CrudServiceExFrom<
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
  >[] = [],
>(
  serviceStructure: CrudServiceStructure<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    FindArgsType,
    ContextType
  > & {
    plugins?: PluginArrayType;
  } & ExtractOptionsFromServicePluginArray<PluginArrayType>,
): Type<
  CrudService<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    FindArgsType,
    ContextType
  > &
    ExtractAddOnsFromServicePluginArray<PluginArrayType>
> {
  // Phase 1: Apply structure modifications from plugins
  if (serviceStructure.plugins && serviceStructure.plugins.length > 0) {
    serviceStructure.plugins.forEach(element => {
      if (element.applyDataServiceStructure)
        element.applyDataServiceStructure(serviceStructure);
      if (element.applyCrudServiceStructure)
        element.applyCrudServiceStructure(serviceStructure);
    });
  }

  // Create base service class
  let serviceClass = CrudServiceFrom(serviceStructure) as Constructable<any>;

  // Phase 2: Apply class enhancements from plugins
  if (serviceStructure.plugins && serviceStructure.plugins.length > 0) {
    serviceStructure.plugins.forEach(element => {
      if (element.applyDataServiceClass)
        serviceClass = element.applyDataServiceClass(
          serviceClass,
          serviceStructure,
        );
      if (element.applyCrudServiceClass)
        serviceClass = element.applyCrudServiceClass(
          serviceClass,
          serviceStructure,
        );
    });
  }

  return mixin(serviceClass);
}
