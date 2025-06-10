import { mixin, Type } from '@nestjs/common';
import {
  Context,
  IdTypeFrom,
  Entity,
  FindArgs,
  CrudService,
  DeepPartial,
  Constructable,
} from '@solid-nestjs/common';
import {
  ResolverPlugin,
  CrudResolver,
  CrudResolverStructure,
  ExtractAddOnsFromResolverPluginArray,
  ExtractOptionsFromResolverPluginArray,
  ExtractServiceAddOnsFromResolverPluginArray,
} from '../interfaces';
import { DefaultArgs } from '../classes';
import { CrudResolverFrom } from './crud-resolver.mixin';

/**
 * Creates an enhanced CRUD GraphQL resolver class with plugin support.
 *
 * This function processes a CRUD resolver structure that includes plugins and creates a resolver class
 * with all the functionality from the base CRUD resolver plus additional GraphQL operations provided by the plugins.
 * The plugins are applied in two phases:
 *
 * 1. **Structure Phase**: Plugins can modify the resolver structure configuration, add new operations, or configure GraphQL-specific settings
 * 2. **Class Phase**: Plugins can extend the resolver class with additional queries, mutations, subscriptions, and field resolvers
 *
 * The resulting resolver class will have type-safe access to all plugin-provided methods and GraphQL operations.
 *
 * @template IdType - The type of the entity's identifier
 * @template EntityType - The entity type this resolver operates on
 * @template CreateInputType - The input type for create operations
 * @template UpdateInputType - The input type for update operations
 * @template ServiceType - The CRUD service type that handles the business logic
 * @template FindArgsType - The type for find operation arguments, defaults to DefaultArgs<EntityType>
 * @template ContextType - The context type for operations, defaults to Context
 * @template PluginArrayType - Array type of resolver plugins to be applied
 *
 * @param resolverStructure - The CRUD resolver structure configuration with plugins and plugin options
 * @returns A resolver class constructor enhanced with plugin functionality
 *
 * @example
 * ```typescript
 * // Create enhanced CRUD resolver with validation and subscription plugins
 * const plugins = [
 *   validationResolverPlugin(providerStructure),
 *   subscriptionResolverPlugin(providerStructure),
 *   auditResolverPlugin(providerStructure)
 * ];
 *
 * const resolverStructure = CrudResolverStructureEx({
 *   entityType: User,
 *   createInputType: CreateUserInput,
 *   updateInputType: UpdateUserInput,
 *   serviceType: UserService,
 *   plugins,
 *
 *   // Plugin options
 *   enableValidation: true,
 *   validationRules: ['email', 'strongPassword'],
 *   enableSubscriptions: true,
 *   subscriptionFilters: ['role', 'department'],
 *   auditLevel: 'detailed',
 *
 *   operations: {
 *     create: { complexity: 10 },
 *     update: { complexity: 8 },
 *     findAll: { complexity: 5 }
 *   }
 * });
 *
 * @Resolver(() => User)
 * export class UserResolver extends CrudResolverExFrom(resolverStructure) {
 *   // The resolver now has access to plugin methods and operations:
 *   // - this.validateCreateInput(input) from validation plugin
 *   // - this.publishUserCreated(user) from subscription plugin
 *   // - this.auditOperation(operation, data) from audit plugin
 *
 *   @Mutation(() => User)
 *   async createUserWithNotification(
 *     @Args('createInput') input: CreateUserInput,
 *     @Context() context: GraphQLContext
 *   ) {
 *     await this.validateCreateInput(input);
 *     const user = await this.createUser(input, context);
 *     await this.publishUserCreated(user);
 *     await this.auditOperation('CREATE_USER', user);
 *     return user;
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Order resolver with real-time updates and complex business logic
 * const orderResolverStructure = CrudResolverStructureEx({
 *   entityType: Order,
 *   createInputType: CreateOrderInput,
 *   updateInputType: UpdateOrderInput,
 *   serviceType: OrderService,
 *
 *   plugins: [
 *     realTimePlugin(orderProvider),
 *     paymentPlugin(orderProvider),
 *     inventoryPlugin(orderProvider)
 *   ],
 *
 *   // Plugin configurations
 *   enableRealTime: true,
 *   paymentGateways: ['stripe', 'paypal'],
 *   inventoryCheck: true,
 *
 *   operations: {
 *     create: {
 *       complexity: 15,
 *       description: 'Create a new order with payment processing'
 *     }
 *   }
 * });
 *
 * @Resolver(() => Order)
 * export class OrderResolver extends CrudResolverExFrom(orderResolverStructure) {
 *   @Mutation(() => Order)
 *   async processOrder(
 *     @Args('orderInput') input: CreateOrderInput,
 *     @Context() context: GraphQLContext
 *   ) {
 *     await this.checkInventory(input.items);
 *     const order = await this.createOrder(input, context);
 *     await this.processPayment(order);
 *     await this.broadcastOrderUpdate(order);
 *     return order;
 *   }
 * }
 * ```
 */
export function CrudResolverExFrom<
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
  FindArgsType extends FindArgs<EntityType> = DefaultArgs<EntityType>,
  ContextType extends Context = Context,
  PluginArrayType extends ResolverPlugin<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    FindArgsType,
    ContextType
  >[] = [],
>(
  resolverStructure: CrudResolverStructure<
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
): Type<
  CrudResolver<
    IdType,
    EntityType,
    CreateInputType,
    UpdateInputType,
    ServiceType & ExtractServiceAddOnsFromResolverPluginArray<PluginArrayType>,
    FindArgsType,
    ContextType
  > &
    ExtractAddOnsFromResolverPluginArray<PluginArrayType>
> {
  // Phase 1: Apply structure modifications from plugins
  if (resolverStructure.plugins && resolverStructure.plugins.length > 0) {
    resolverStructure.plugins.forEach(element => {
      if (element.applyDataResolverStructure)
        element.applyDataResolverStructure(resolverStructure);
      if (element.applyCrudResolverStructure)
        element.applyCrudResolverStructure(resolverStructure);
    });
  }

  // Create base resolver class
  let resolverClass = CrudResolverFrom(resolverStructure) as Constructable<any>;

  // Phase 2: Apply class enhancements from plugins
  if (resolverStructure.plugins && resolverStructure.plugins.length > 0) {
    resolverStructure.plugins.forEach(element => {
      if (element.applyDataResolverClass)
        resolverClass = element.applyDataResolverClass(
          resolverClass,
          resolverStructure,
        );
      if (element.applyCrudResolverClass)
        resolverClass = element.applyCrudResolverClass(
          resolverClass,
          resolverStructure,
        );
    });
  }

  return mixin(resolverClass);
}
