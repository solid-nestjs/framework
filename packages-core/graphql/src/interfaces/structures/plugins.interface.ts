import { Type } from '@nestjs/common';
import {
  Constructable,
  Context,
  CrudService,
  DataService,
  DeepPartial,
  Entity,
  FindArgs,
  IdTypeFrom,
  UnionToIntersection,
} from '@solid-nestjs/common';
import { DataResolverStructure } from './data-resolver-structure.interface';
import { CrudResolverStructure } from './crud-resolver-structure.interface';
import { CrudResolver, DataResolver } from '../resolvers';

/**
 * Interface defining a plugin system for extending GraphQL resolver functionality.
 *
 * Resolver plugins allow developers to enhance data and CRUD resolvers with additional queries,
 * mutations, fields, directives, and custom behavior. Plugins can modify resolver structures during
 * configuration and enhance resolver classes with new GraphQL operations and functionality.
 *
 * @template IdType - The type of the entity's identifier
 * @template EntityType - The entity type this plugin operates on
 * @template CreateInputType - The input type for create operations, defaults to DeepPartial<EntityType>
 * @template UpdateInputType - The input type for update operations, defaults to DeepPartial<EntityType>
 * @template FindArgsType - The type for find operation arguments, defaults to FindArgs<EntityType>
 * @template ContextType - The context type for operations, defaults to Context
 * @template TDataServiceAddOns - Record of additional methods/properties expected from data services
 * @template TCrudServiceAddOns - Record of additional methods/properties expected from CRUD services
 * @template TDataOptions - Record of additional options that can be added to data resolver structures
 * @template TCrudOptions - Record of additional options that can be added to CRUD resolver structures
 * @template TDataAddOns - Record of additional methods/properties added to data resolvers
 * @template TCrudAddOns - Record of additional methods/properties added to CRUD resolvers
 *
 * @example
 * ```typescript
 * // Define a GraphQL subscription plugin
 * const subscriptionResolverPlugin: ResolverPlugin<string, User> = {
 *   applyDataResolverStructure(structure) {
 *     // Add subscription configuration
 *     structure.enableSubscriptions = true;
 *   },
 *
 *   applyDataResolverClass(resolverClass, structure) {
 *     // Extend resolver class with subscription fields
 *     class SubscriptionResolver extends resolverClass {
 *       @Subscription(() => User, { name: 'userUpdated' })
 *       userUpdated(@Args('id') id: string) {
 *         return this.pubSub.asyncIterator(`user_${id}_updated`);
 *       }
 *     }
 *     return SubscriptionResolver;
 *   }
 * };
 * ```
 */
export interface ResolverPlugin<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  CreateInputType extends DeepPartial<EntityType> = DeepPartial<EntityType>,
  UpdateInputType extends DeepPartial<EntityType> = DeepPartial<EntityType>,
  FindArgsType extends FindArgs<EntityType> = FindArgs<EntityType>,
  ContextType extends Context = Context,
  TDataServiceAddOns extends Record<string, any> = {},
  TCrudServiceAddOns extends Record<string, any> = {},
  TDataOptions extends Record<string, any> = {},
  TCrudOptions extends Record<string, any> = {},
  TDataAddOns extends Record<string, any> = {},
  TCrudAddOns extends Record<string, any> = {},
> {
  /**
   * Hook that allows modifying the data resolver structure during configuration.
   * This method is called before the resolver class is created, allowing plugins
   * to add query configurations, field resolvers, directives, or operation settings.
   *
   * @param structure - The data resolver structure being configured, enhanced with plugin options
   *
   * @example
   * ```typescript
   * applyDataResolverStructure(structure) {
   *   // Configure GraphQL-specific options
   *   structure.operations.findAll = {
   *     ...structure.operations?.findAll,
   *     complexity: 5,
   *     description: 'Find all entities with advanced filtering'
   *   };
   * }
   * ```
   */
  applyDataResolverStructure?(
    structure: DataResolverStructure<
      IdType,
      EntityType,
      DataService<IdType, EntityType, FindArgsType, ContextType> &
        TDataServiceAddOns,
      FindArgsType,
      ContextType
    > &
      TDataOptions,
  ): void;

  /**
   * Hook that allows modifying the CRUD resolver structure during configuration.
   * This method is called before the resolver class is created, allowing plugins
   * to add mutation configurations, field resolvers, directives, or operation settings for CRUD operations.
   *
   * @param structure - The CRUD resolver structure being configured, enhanced with plugin options
   *
   * @example
   * ```typescript
   * applyCrudResolverStructure(structure) {
   *   // Add input validation to mutations
   *   structure.operations.create = {
   *     ...structure.operations?.create,
   *     complexity: 10,
   *     description: 'Create a new entity with validation',
   *     directives: ['@validate']
   *   };
   * }
   * ```
   */
  applyCrudResolverStructure?(
    structure: CrudResolverStructure<
      IdType,
      EntityType,
      CreateInputType,
      UpdateInputType,
      CrudService<
        IdType,
        EntityType,
        CreateInputType,
        UpdateInputType,
        FindArgsType,
        ContextType
      > &
        TDataServiceAddOns &
        TCrudServiceAddOns,
      FindArgsType,
      ContextType
    > &
      TDataOptions &
      TCrudOptions,
  ): void;

  /**
   * Hook that allows modifying or extending the data resolver class.
   * This method receives the constructed resolver class and can return an enhanced
   * version with additional queries, field resolvers, subscriptions, or behavior.
   *
   * @param resolverClass - The original data resolver class constructor
   * @param structure - The data resolver structure with plugin options
   * @returns Enhanced resolver class constructor with additional functionality
   *
   * @example
   * ```typescript
   * applyDataResolverClass(resolverClass, structure) {
   *   class EnhancedResolver extends resolverClass {
   *     @Query(() => [EntityType], { name: 'searchEntities' })
   *     @Complexity(({ childComplexity, args }) => childComplexity * args.limit)
   *     async searchEntities(
   *       @Args() searchArgs: SearchArgsType,
   *       @Context() context: ContextType
   *     ) {
   *       return this.service.advancedSearch(context, searchArgs);
   *     }
   *
   *     @ResolveField(() => String)
   *     async computedField(@Parent() entity: EntityType) {
   *       return `computed_${entity.id}`;
   *     }
   *   }
   *   return EnhancedResolver;
   * }
   * ```
   */
  applyDataResolverClass?(
    resolverClass: Constructable<
      DataResolver<
        IdType,
        EntityType,
        DataService<IdType, EntityType, FindArgsType, ContextType> &
          TDataServiceAddOns,
        FindArgsType,
        ContextType
      >
    >,
    structure: DataResolverStructure<
      IdType,
      EntityType,
      DataService<IdType, EntityType, FindArgsType, ContextType> &
        TDataServiceAddOns,
      FindArgsType,
      ContextType
    > &
      TDataOptions,
  ): Type<
    DataResolver<
      IdType,
      EntityType,
      DataService<IdType, EntityType, FindArgsType, ContextType> &
        TDataServiceAddOns,
      FindArgsType,
      ContextType
    > &
      TDataAddOns
  >;

  /**
   * Hook that allows modifying or extending the CRUD resolver class.
   * This method receives the constructed resolver class and can return an enhanced
   * version with additional mutations, field resolvers, subscriptions, or behavior for CRUD operations.
   *
   * @param resolverClass - The original CRUD resolver class constructor
   * @param structure - The CRUD resolver structure with plugin options
   * @returns Enhanced resolver class constructor with additional functionality
   *
   * @example
   * ```typescript
   * applyCrudResolverClass(resolverClass, structure) {
   *   class AuditedResolver extends resolverClass {
   *     @Mutation(() => [EntityType], { name: 'bulkCreateEntities' })
   *     async bulkCreate(
   *       @Args('inputs', { type: () => [CreateInputType] }) inputs: CreateInputType[],
   *       @Context() context: ContextType
   *     ) {
   *       const results = [];
   *       for (const input of inputs) {
   *         const result = await this.service.create(context, input);
   *         await this.auditLog('BULK_CREATE', result.id);
   *         results.push(result);
   *       }
   *       return results;
   *     }
   *
   *     @Subscription(() => EntityType, { name: 'entityCreated' })
   *     entityCreated(@Args('filter') filter?: FilterType) {
   *       return this.pubSub.asyncIterator('entity_created', filter);
   *     }
   *   }
   *   return AuditedResolver;
   * }
   * ```
   */
  applyCrudResolverClass?(
    resolverClass: Constructable<
      CrudResolver<
        IdType,
        EntityType,
        CreateInputType,
        UpdateInputType,
        CrudService<
          IdType,
          EntityType,
          CreateInputType,
          UpdateInputType,
          FindArgsType,
          ContextType
        > &
          TDataServiceAddOns &
          TCrudServiceAddOns,
        FindArgsType,
        ContextType
      >
    >,
    structure: CrudResolverStructure<
      IdType,
      EntityType,
      CreateInputType,
      UpdateInputType,
      CrudService<
        IdType,
        EntityType,
        CreateInputType,
        UpdateInputType,
        FindArgsType,
        ContextType
      > &
        TDataServiceAddOns &
        TCrudServiceAddOns,
      FindArgsType,
      ContextType
    > &
      TDataOptions &
      TCrudOptions,
  ): Type<
    CrudResolver<
      IdType,
      EntityType,
      CreateInputType,
      UpdateInputType,
      CrudService<
        IdType,
        EntityType,
        CreateInputType,
        UpdateInputType,
        FindArgsType,
        ContextType
      > &
        TDataServiceAddOns &
        TCrudServiceAddOns,
      FindArgsType,
      ContextType
    > &
      TDataAddOns &
      TCrudAddOns
  >;
}

/**
 * Utility type that extracts and merges all data add-ons from an array of resolver plugins.
 * This type is used to determine what additional methods and properties will be available
 * on data resolvers when using a specific set of plugins.
 *
 * @template ResolverPluginArrayType - An array of resolver plugins
 * @returns Union-to-intersection type of all TDataAddOns from the plugins
 *
 * @example
 * ```typescript
 * type MyPlugins = [SubscriptionPlugin, FieldResolverPlugin];
 * type DataAddOns = ExtractDataAddOnsFromResolverPluginArray<MyPlugins>;
 * // DataAddOns will contain methods from both subscription and field resolver plugins
 * ```
 */
export type ExtractDataAddOnsFromResolverPluginArray<
  ResolverPluginArrayType extends readonly ResolverPlugin<
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
  >[],
> = UnionToIntersection<
  ResolverPluginArrayType[number] extends ResolverPlugin<
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    infer TAddOns,
    any
  >
    ? TAddOns
    : never
>;

/**
 * Utility type that extracts and merges all CRUD add-ons from an array of resolver plugins.
 * This type is used to determine what additional methods and properties will be available
 * on CRUD resolvers when using a specific set of plugins.
 *
 * @template ResolverPluginArrayType - An array of resolver plugins
 * @returns Union-to-intersection type of all TCrudAddOns from the plugins
 *
 * @example
 * ```typescript
 * type MyPlugins = [ValidationPlugin, AuditPlugin];
 * type CrudAddOns = ExtractCrudAddOnsFromResolverPluginArray<MyPlugins>;
 * // CrudAddOns will contain methods from both validation and audit plugins
 * ```
 */
export type ExtractCrudAddOnsFromResolverPluginArray<
  ResolverPluginArrayType extends readonly ResolverPlugin<
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
  >[],
> = UnionToIntersection<
  ResolverPluginArrayType[number] extends ResolverPlugin<
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    infer TAddOns
  >
    ? TAddOns
    : never
>;

/**
 * Utility type that extracts and merges both data and CRUD add-ons from an array of resolver plugins.
 * This provides a complete view of all additional functionality that will be available
 * on resolvers when using a specific set of plugins.
 *
 * @template ResolverPluginArrayType - An array of resolver plugins
 * @returns Combined type of all data and CRUD add-ons from the plugins
 *
 * @example
 * ```typescript
 * type MyPlugins = [SubscriptionPlugin, ValidationPlugin, FieldResolverPlugin];
 * type AllAddOns = ExtractAddOnsFromResolverPluginArray<MyPlugins>;
 * // AllAddOns will contain methods from all plugins combined
 * ```
 */
export type ExtractAddOnsFromResolverPluginArray<
  ResolverPluginArrayType extends readonly ResolverPlugin<
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
  >[],
> = ExtractDataAddOnsFromResolverPluginArray<ResolverPluginArrayType> &
  ExtractCrudAddOnsFromResolverPluginArray<ResolverPluginArrayType>;

/**
 * Utility type that extracts and merges all data options from an array of resolver plugins.
 * These options become available in the data resolver structure configuration when using the plugins.
 *
 * @template ResolverPluginArrayType - An array of resolver plugins
 * @returns Union-to-intersection type of all TDataOptions from the plugins
 *
 * @example
 * ```typescript
 * type MyPlugins = [ComplexityPlugin, CachingPlugin];
 * type DataOptions = ExtractDataOptionsFromResolverPluginArray<MyPlugins>;
 * // DataOptions might include { maxComplexity?: number; cacheTimeout?: number; }
 * ```
 */
export type ExtractDataOptionsFromResolverPluginArray<
  ResolverPluginArrayType extends readonly ResolverPlugin<
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
  >[],
> = UnionToIntersection<
  ResolverPluginArrayType[number] extends ResolverPlugin<
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    infer TOptions,
    any,
    any,
    any
  >
    ? TOptions
    : never
>;

/**
 * Utility type that extracts and merges all CRUD options from an array of resolver plugins.
 * These options become available in the CRUD resolver structure configuration when using the plugins.
 *
 * @template ResolverPluginArrayType - An array of resolver plugins
 * @returns Union-to-intersection type of all TCrudOptions from the plugins
 *
 * @example
 * ```typescript
 * type MyPlugins = [ValidationPlugin, AuditPlugin];
 * type CrudOptions = ExtractCrudOptionsFromResolverPluginArray<MyPlugins>;
 * // CrudOptions might include { enableValidation?: boolean; auditLevel?: string; }
 * ```
 */
export type ExtractCrudOptionsFromResolverPluginArray<
  ResolverPluginArrayType extends readonly ResolverPlugin<
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
  >[],
> = UnionToIntersection<
  ResolverPluginArrayType[number] extends ResolverPlugin<
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    infer TOptions,
    any,
    any
  >
    ? TOptions
    : never
>;

/**
 * Utility type that extracts and merges both data and CRUD options from an array of resolver plugins.
 * This provides a complete view of all configuration options that will be available
 * when using a specific set of plugins.
 *
 * @template ResolverPluginArrayType - An array of resolver plugins
 * @returns Combined type of all data and CRUD options from the plugins
 *
 * @example
 * ```typescript
 * type MyPlugins = [ComplexityPlugin, ValidationPlugin, AuditPlugin];
 * type AllOptions = ExtractOptionsFromResolverPluginArray<MyPlugins>;
 * // AllOptions will include all configuration options from all plugins
 * ```
 */
export type ExtractOptionsFromResolverPluginArray<
  ResolverPluginArrayType extends readonly ResolverPlugin<
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
  >[],
> = ExtractDataOptionsFromResolverPluginArray<ResolverPluginArrayType> &
  ExtractCrudOptionsFromResolverPluginArray<ResolverPluginArrayType>;

/**
 * Utility type that extracts and merges all data service add-ons from an array of resolver plugins.
 * This type represents the service functionality that resolver plugins expect to be available.
 *
 * @template ResolverPluginArrayType - An array of resolver plugins
 * @returns Union-to-intersection type of all TDataServiceAddOns from the plugins
 *
 * @example
 * ```typescript
 * type MyPlugins = [SearchPlugin, CachingPlugin];
 * type ServiceAddOns = ExtractDataServiceAddOnsFromResolverPluginArray<MyPlugins>;
 * // ServiceAddOns will contain service methods that these resolver plugins expect
 * ```
 */
export type ExtractDataServiceAddOnsFromResolverPluginArray<
  ResolverPluginArrayType extends readonly ResolverPlugin<
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
  >[],
> = UnionToIntersection<
  ResolverPluginArrayType[number] extends ResolverPlugin<
    any,
    any,
    any,
    any,
    any,
    any,
    infer TServiceAddOns,
    any,
    any,
    any,
    any,
    any
  >
    ? TServiceAddOns
    : never
>;

/**
 * Utility type that extracts and merges all CRUD service add-ons from an array of resolver plugins.
 * This type represents the CRUD service functionality that resolver plugins expect to be available.
 *
 * @template ResolverPluginArrayType - An array of resolver plugins
 * @returns Union-to-intersection type of all TCrudServiceAddOns from the plugins
 *
 * @example
 * ```typescript
 * type MyPlugins = [ValidationPlugin, AuditPlugin];
 * type CrudServiceAddOns = ExtractCrudServiceAddOnsFromResolverPluginArray<MyPlugins>;
 * // CrudServiceAddOns will contain CRUD service methods that these resolver plugins expect
 * ```
 */
export type ExtractCrudServiceAddOnsFromResolverPluginArray<
  ResolverPluginArrayType extends readonly ResolverPlugin<
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
  >[],
> = UnionToIntersection<
  ResolverPluginArrayType[number] extends ResolverPlugin<
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    infer TCrudServiceAddOns,
    any,
    any,
    any,
    any
  >
    ? TCrudServiceAddOns
    : never
>;

/**
 * Utility type that extracts and merges both data and CRUD service add-ons from an array of resolver plugins.
 * This provides a complete view of all service functionality that resolver plugins expect to be available.
 *
 * @template ResolverPluginArrayType - An array of resolver plugins
 * @returns Combined type of all data and CRUD service add-ons from the plugins
 *
 * @example
 * ```typescript
 * type MyPlugins = [SearchPlugin, ValidationPlugin, SubscriptionPlugin];
 * type ServiceAddOns = ExtractServiceAddOnsFromResolverPluginArray<MyPlugins>;
 * // ServiceAddOns will contain all service methods that these resolver plugins expect
 * ```
 */
export type ExtractServiceAddOnsFromResolverPluginArray<
  ResolverPluginArrayType extends readonly ResolverPlugin<
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
  >[],
> = ExtractDataServiceAddOnsFromResolverPluginArray<ResolverPluginArrayType> &
  ExtractCrudServiceAddOnsFromResolverPluginArray<ResolverPluginArrayType>;
