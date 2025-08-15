import { Type } from '@nestjs/common';
import { Constructable, DeepPartial, UnionToIntersection } from '../../types';
import { Context, Entity, IdTypeFrom } from '../misc';
import { FindArgs } from '../inputs';
import { DataService, CrudService } from '../services';
import { CrudServiceStructure } from './crud-service-structure.interface';
import { DataServiceStructure } from './data-service-structure.interface';

/**
 * Interface defining a plugin system for extending service functionality in the SOLID NestJS framework.
 *
 * Service plugins allow developers to enhance data and CRUD services with additional methods,
 * configuration options, and custom behavior. Plugins can modify service structures during
 * configuration and enhance service classes with new functionality.
 *
 * @template IdType - The type of the entity's identifier
 * @template EntityType - The entity type this plugin operates on
 * @template CreateInputType - The input type for create operations, defaults to DeepPartial<EntityType>
 * @template UpdateInputType - The input type for update operations, defaults to DeepPartial<EntityType>
 * @template FindArgsType - The type for find operation arguments, defaults to FindArgs<EntityType>
 * @template ContextType - The context type for operations, defaults to Context
 * @template TDataOptions - Record of additional options that can be added to data service structures
 * @template TCrudOptions - Record of additional options that can be added to CRUD service structures
 * @template TDataAddOns - Record of additional methods/properties added to data services
 * @template TCrudAddOns - Record of additional methods/properties added to CRUD services
 *
 * @example
 * ```typescript
 * // Define a logging plugin
 * const loggingPlugin: ServicePlugin<string, User> = {
 *   applyDataServiceStructure(structure) {
 *     // Modify structure configuration
 *     structure.enableLogging = true;
 *   },
 *
 *   applyDataServiceClass(serviceClass, structure) {
 *     // Extend service class with logging methods
 *     class LoggingService extends serviceClass {
 *       log(message: string) {
 *         console.log(`[${structure.entityType.name}] ${message}`);
 *       }
 *     }
 *     return LoggingService;
 *   }
 * };
 * ```
 */
export interface ServicePlugin<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  CreateInputType extends DeepPartial<EntityType> = DeepPartial<EntityType>,
  UpdateInputType extends DeepPartial<EntityType> = DeepPartial<EntityType>,
  FindArgsType extends FindArgs<EntityType> = FindArgs<EntityType>,
  ContextType extends Context = Context,
  TDataOptions extends Record<string, any> = {},
  TCrudOptions extends Record<string, any> = {},
  TDataAddOns extends Record<string, any> = {},
  TCrudAddOns extends Record<string, any> = {},
> {
  /**
   * Hook that allows modifying the data service structure during configuration.
   * This method is called before the service class is created, allowing plugins
   * to add configuration options, modify function settings, or add decorators.
   *
   * @param structure - The data service structure being configured, enhanced with plugin options
   *
   * @example
   * ```typescript
   * applyDataServiceStructure(structure) {
   *   // Add caching configuration
   *   structure.enableCache = true;
   *   structure.cacheTimeout = 300;
   * }
   * ```
   */
  applyDataServiceStructure?(
    structure: DataServiceStructure<
      IdType,
      EntityType,
      FindArgsType,
      ContextType
    > &
      TDataOptions,
  ): void;

  /**
   * Hook that allows modifying the CRUD service structure during configuration.
   * This method is called before the service class is created, allowing plugins
   * to add configuration options, modify function settings, or add decorators.
   *
   * @param structure - The CRUD service structure being configured, enhanced with plugin options
   *
   * @example
   * ```typescript
   * applyCrudServiceStructure(structure) {
   *   // Add validation configuration
   *   structure.enableValidation = true;
   *   structure.validationRules = ['email', 'required'];
   * }
   * ```
   */
  applyCrudServiceStructure?(
    structure: CrudServiceStructure<
      IdType,
      EntityType,
      CreateInputType,
      UpdateInputType,
      FindArgsType,
      ContextType
    > &
      TDataOptions &
      TCrudOptions,
  ): void;

  /**
   * Hook that allows modifying or extending the data service class.
   * This method receives the constructed service class and can return an enhanced
   * version with additional methods, properties, or behavior.
   *
   * @param serviceClass - The original data service class constructor
   * @param structure - The data service structure with plugin options
   * @returns Enhanced service class constructor with additional functionality
   *
   * @example
   * ```typescript
   * applyDataServiceClass(serviceClass, structure) {
   *   class EnhancedService extends serviceClass {
   *     async findWithCache(id: string) {
   *       // Add caching logic
   *       return this.findOne(context, id);
   *     }
   *   }
   *   return EnhancedService;
   * }
   * ```
   */
  applyDataServiceClass?(
    serviceClass: Constructable<
      DataService<IdType, EntityType, FindArgsType, ContextType>
    >,
    structure: DataServiceStructure<
      IdType,
      EntityType,
      FindArgsType,
      ContextType
    > &
      TDataOptions,
  ): Type<
    DataService<IdType, EntityType, FindArgsType, ContextType> & TDataAddOns
  >;

  /**
   * Hook that allows modifying or extending the CRUD service class.
   * This method receives the constructed service class and can return an enhanced
   * version with additional methods, properties, or behavior.
   *
   * @param serviceClass - The original CRUD service class constructor
   * @param structure - The CRUD service structure with plugin options
   * @returns Enhanced service class constructor with additional functionality
   *
   * @example
   * ```typescript
   * applyCrudServiceClass(serviceClass, structure) {
   *   class AuditedService extends serviceClass {
   *     async create(context, input) {
   *       const result = await super.create(context, input);
   *       await this.auditLog('CREATE', result.id);
   *       return result;
   *     }
   *   }
   *   return AuditedService;
   * }
   * ```
   */
  applyCrudServiceClass?(
    serviceClass: Constructable<
      CrudService<
        IdType,
        EntityType,
        CreateInputType,
        UpdateInputType,
        FindArgsType,
        ContextType
      > &
        TDataAddOns
    >,
    structure: CrudServiceStructure<
      IdType,
      EntityType,
      CreateInputType,
      UpdateInputType,
      FindArgsType,
      ContextType
    > &
      TDataOptions &
      TCrudOptions,
  ): Type<
    CrudService<
      IdType,
      EntityType,
      CreateInputType,
      UpdateInputType,
      FindArgsType,
      ContextType
    > &
      TDataAddOns &
      TCrudAddOns
  >;
}

/**
 * Utility type that extracts and merges all data add-ons from an array of service plugins.
 * This type is used to determine what additional methods and properties will be available
 * on data services when using a specific set of plugins.
 *
 * @template ServicePluginArrayType - An array of service plugins
 * @returns Union-to-intersection type of all TDataAddOns from the plugins
 *
 * @example
 * ```typescript
 * type MyPlugins = [LoggingPlugin, CachingPlugin];
 * type DataAddOns = ExtractDataAddOnsFromServicePluginArray<MyPlugins>;
 * // DataAddOns will contain methods from both logging and caching plugins
 * ```
 */
export type ExtractDataAddOnsFromServicePluginArray<
  ServicePluginArrayType extends readonly ServicePlugin<
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
  ServicePluginArrayType[number] extends ServicePlugin<
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
 * Utility type that extracts and merges all CRUD add-ons from an array of service plugins.
 * This type is used to determine what additional methods and properties will be available
 * on CRUD services when using a specific set of plugins.
 *
 * @template ServicePluginArrayType - An array of service plugins
 * @returns Union-to-intersection type of all TCrudAddOns from the plugins
 *
 * @example
 * ```typescript
 * type MyPlugins = [ValidationPlugin, AuditPlugin];
 * type CrudAddOns = ExtractCrudAddOnsFromServicePluginArray<MyPlugins>;
 * // CrudAddOns will contain methods from both validation and audit plugins
 * ```
 */
export type ExtractCrudAddOnsFromServicePluginArray<
  ServicePluginArrayType extends readonly ServicePlugin<
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
  ServicePluginArrayType[number] extends ServicePlugin<
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
 * Utility type that extracts and merges both data and CRUD add-ons from an array of service plugins.
 * This provides a complete view of all additional functionality that will be available
 * on services when using a specific set of plugins.
 *
 * @template ServicePluginArrayType - An array of service plugins
 * @returns Combined type of all data and CRUD add-ons from the plugins
 *
 * @example
 * ```typescript
 * type MyPlugins = [LoggingPlugin, ValidationPlugin, CachingPlugin];
 * type AllAddOns = ExtractAddOnsFromServicePluginArray<MyPlugins>;
 * // AllAddOns will contain methods from all plugins combined
 * ```
 */
export type ExtractAddOnsFromServicePluginArray<
  ServicePluginArrayType extends readonly ServicePlugin<
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
> = ExtractDataAddOnsFromServicePluginArray<ServicePluginArrayType> &
  ExtractCrudAddOnsFromServicePluginArray<ServicePluginArrayType>;

/**
 * Utility type that extracts and merges all data options from an array of service plugins.
 * These options become available in the data service structure configuration when using the plugins.
 *
 * @template ServicePluginArrayType - An array of service plugins
 * @returns Union-to-intersection type of all TDataOptions from the plugins
 *
 * @example
 * ```typescript
 * type MyPlugins = [CachingPlugin, LoggingPlugin];
 * type DataOptions = ExtractDataOptionsFromServicePluginArray<MyPlugins>;
 * // DataOptions might include { cacheTimeout?: number; logLevel?: string; }
 * ```
 */
export type ExtractDataOptionsFromServicePluginArray<
  ServicePluginArrayType extends readonly ServicePlugin<
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
  ServicePluginArrayType[number] extends ServicePlugin<
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
 * Utility type that extracts and merges all CRUD options from an array of service plugins.
 * These options become available in the CRUD service structure configuration when using the plugins.
 *
 * @template ServicePluginArrayType - An array of service plugins
 * @returns Union-to-intersection type of all TCrudOptions from the plugins
 *
 * @example
 * ```typescript
 * type MyPlugins = [ValidationPlugin, AuditPlugin];
 * type CrudOptions = ExtractCrudOptionsFromServicePluginArray<MyPlugins>;
 * // CrudOptions might include { enableValidation?: boolean; auditLevel?: string; }
 * ```
 */
export type ExtractCrudOptionsFromServicePluginArray<
  ServicePluginArrayType extends readonly ServicePlugin<
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
  ServicePluginArrayType[number] extends ServicePlugin<
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
 * Utility type that extracts and merges both data and CRUD options from an array of service plugins.
 * This provides a complete view of all configuration options that will be available
 * when using a specific set of plugins.
 *
 * @template ServicePluginArrayType - An array of service plugins
 * @returns Combined type of all data and CRUD options from the plugins
 *
 * @example
 * ```typescript
 * type MyPlugins = [CachingPlugin, ValidationPlugin, AuditPlugin];
 * type AllOptions = ExtractOptionsFromServicePluginArray<MyPlugins>;
 * // AllOptions will include all configuration options from all plugins
 * ```
 */
export type ExtractOptionsFromServicePluginArray<
  ServicePluginArrayType extends readonly ServicePlugin<
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
> = ExtractDataOptionsFromServicePluginArray<ServicePluginArrayType> &
  ExtractCrudOptionsFromServicePluginArray<ServicePluginArrayType>;
