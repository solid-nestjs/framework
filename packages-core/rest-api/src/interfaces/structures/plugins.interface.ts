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
import { DataControllerStructure } from './data-controller-structure.interface';
import { CrudControllerStructure } from './crud-controller-structure.interface';
import { CrudController, DataController } from '../controllers';

/**
 * Interface defining a plugin system for extending REST API controller functionality.
 *
 * Controller plugins allow developers to enhance data and CRUD controllers with additional endpoints,
 * middleware, decorators, and custom behavior. Plugins can modify controller structures during
 * configuration and enhance controller classes with new routes and functionality.
 *
 * @template IdType - The type of the entity's identifier
 * @template EntityType - The entity type this plugin operates on
 * @template CreateInputType - The input type for create operations, defaults to DeepPartial<EntityType>
 * @template UpdateInputType - The input type for update operations, defaults to DeepPartial<EntityType>
 * @template FindArgsType - The type for find operation arguments, defaults to FindArgs<EntityType>
 * @template ContextType - The context type for operations, defaults to Context
 * @template TDataServiceAddOns - Record of additional methods/properties expected from data services
 * @template TCrudServiceAddOns - Record of additional methods/properties expected from CRUD services
 * @template TDataOptions - Record of additional options that can be added to data controller structures
 * @template TCrudOptions - Record of additional options that can be added to CRUD controller structures
 * @template TDataAddOns - Record of additional methods/properties added to data controllers
 * @template TCrudAddOns - Record of additional methods/properties added to CRUD controllers
 *
 * @example
 * ```typescript
 * // Define a REST API caching plugin
 * const cachingControllerPlugin: ControllerPlugin<string, User> = {
 *   applyDataControllerStructure(structure) {
 *     // Add caching configuration to routes
 *     structure.cacheTimeout = 300;
 *   },
 *
 *   applyDataControllerClass(controllerClass, structure) {
 *     // Extend controller class with cache-related endpoints
 *     class CachingController extends controllerClass {
 *       @Get('cache/clear')
 *       clearCache() {
 *         // Clear cache logic
 *         return { message: 'Cache cleared' };
 *       }
 *     }
 *     return CachingController;
 *   }
 * };
 * ```
 */
export interface ControllerPlugin<
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
   * Hook that allows modifying the data controller structure during configuration.
   * This method is called before the controller class is created, allowing plugins
   * to add route configurations, middleware, decorators, or operation settings.
   *
   * @param structure - The data controller structure being configured, enhanced with plugin options
   *
   * @example
   * ```typescript
   * applyDataControllerStructure(structure) {
   *   // Configure route-level caching
   *   structure.operations.findAll = {
   *     ...structure.operations?.findAll,
   *     decorators: [() => UseInterceptors(CacheInterceptor)]
   *   };
   * }
   * ```
   */
  applyDataControllerStructure?(
    structure: DataControllerStructure<
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
   * Hook that allows modifying the CRUD controller structure during configuration.
   * This method is called before the controller class is created, allowing plugins
   * to add route configurations, middleware, decorators, or operation settings for CRUD operations.
   *
   * @param structure - The CRUD controller structure being configured, enhanced with plugin options
   *
   * @example
   * ```typescript
   * applyCrudControllerStructure(structure) {
   *   // Add validation to create and update operations
   *   structure.operations.create = {
   *     ...structure.operations?.create,
   *     decorators: [() => UseGuards(ValidationGuard)]
   *   };
   *   structure.operations.update = {
   *     ...structure.operations?.update,
   *     decorators: [() => UseGuards(ValidationGuard)]
   *   };
   * }
   * ```
   */
  applyCrudControllerStructure?(
    structure: CrudControllerStructure<
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
   * Hook that allows modifying or extending the data controller class.
   * This method receives the constructed controller class and can return an enhanced
   * version with additional routes, middleware, or behavior.
   *
   * @param controllerClass - The original data controller class constructor
   * @param structure - The data controller structure with plugin options
   * @returns Enhanced controller class constructor with additional functionality
   *
   * @example
   * ```typescript
   * applyDataControllerClass(controllerClass, structure) {
   *   class EnhancedController extends controllerClass {
   *     @Get('search')
   *     @ApiOperation({ summary: 'Advanced search' })
   *     async advancedSearch(@Query() searchParams: SearchDto) {
   *       return this.service.advancedSearch(searchParams);
   *     }
   *
   *     @Get('export')
   *     @Header('Content-Type', 'application/csv')
   *     async exportData(@Res() res: Response) {
   *       const data = await this.service.findAll();
   *       // Convert to CSV and send
   *     }
   *   }
   *   return EnhancedController;
   * }
   * ```
   */
  applyDataControllerClass?(
    controllerClass: Constructable<
      DataController<
        IdType,
        EntityType,
        DataService<IdType, EntityType, FindArgsType, ContextType> &
          TDataServiceAddOns,
        FindArgsType,
        ContextType
      >
    >,
    structure: DataControllerStructure<
      IdType,
      EntityType,
      DataService<IdType, EntityType, FindArgsType, ContextType> &
        TDataServiceAddOns,
      FindArgsType,
      ContextType
    > &
      TDataOptions,
  ): Type<
    DataController<
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
   * Hook that allows modifying or extending the CRUD controller class.
   * This method receives the constructed controller class and can return an enhanced
   * version with additional routes, middleware, or behavior for CRUD operations.
   *
   * @param controllerClass - The original CRUD controller class constructor
   * @param structure - The CRUD controller structure with plugin options
   * @returns Enhanced controller class constructor with additional functionality
   *
   * @example
   * ```typescript
   * applyCrudControllerClass(controllerClass, structure) {
   *   class AuditedController extends controllerClass {
   *     @Post('bulk')
   *     @ApiOperation({ summary: 'Bulk create entities' })
   *     async bulkCreate(@Body() inputs: CreateInputType[]) {
   *       const results = [];
   *       for (const input of inputs) {
   *         const result = await this.service.create(this.getContext(), input);
   *         await this.auditLog('BULK_CREATE', result.id);
   *         results.push(result);
   *       }
   *       return results;
   *     }
   *
   *     @Delete('bulk')
   *     @ApiOperation({ summary: 'Bulk delete entities' })
   *     async bulkDelete(@Body() ids: IdType[]) {
   *       const results = await Promise.all(
   *         ids.map(id => this.service.remove(this.getContext(), id))
   *       );
   *       await this.auditLog('BULK_DELETE', ids);
   *       return results;
   *     }
   *   }
   *   return AuditedController;
   * }
   * ```
   */
  applyCrudControllerClass?(
    controllerClass: Constructable<
      CrudController<
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
    structure: CrudControllerStructure<
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
    CrudController<
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
 * Utility type that extracts and merges all data add-ons from an array of controller plugins.
 * This type is used to determine what additional methods and properties will be available
 * on data controllers when using a specific set of plugins.
 *
 * @template ControllerPluginArrayType - An array of controller plugins
 * @returns Union-to-intersection type of all TDataAddOns from the plugins
 *
 * @example
 * ```typescript
 * type MyPlugins = [CachingPlugin, ExportPlugin];
 * type DataAddOns = ExtractDataAddOnsFromControllerPluginArray<MyPlugins>;
 * // DataAddOns will contain methods from both caching and export plugins
 * ```
 */
export type ExtractDataAddOnsFromControllerPluginArray<
  ControllerPluginArrayType extends readonly ControllerPlugin<
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
  ControllerPluginArrayType[number] extends ControllerPlugin<
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
 * Utility type that extracts and merges all CRUD add-ons from an array of controller plugins.
 * This type is used to determine what additional methods and properties will be available
 * on CRUD controllers when using a specific set of plugins.
 *
 * @template ControllerPluginArrayType - An array of controller plugins
 * @returns Union-to-intersection type of all TCrudAddOns from the plugins
 *
 * @example
 * ```typescript
 * type MyPlugins = [ValidationPlugin, AuditPlugin];
 * type CrudAddOns = ExtractCrudAddOnsFromControllerPluginArray<MyPlugins>;
 * // CrudAddOns will contain methods from both validation and audit plugins
 * ```
 */
export type ExtractCrudAddOnsFromControllerPluginArray<
  ControllerPluginArrayType extends readonly ControllerPlugin<
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
  ControllerPluginArrayType[number] extends ControllerPlugin<
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
 * Utility type that extracts and merges both data and CRUD add-ons from an array of controller plugins.
 * This provides a complete view of all additional functionality that will be available
 * on controllers when using a specific set of plugins.
 *
 * @template ControllerPluginArrayType - An array of controller plugins
 * @returns Combined type of all data and CRUD add-ons from the plugins
 *
 * @example
 * ```typescript
 * type MyPlugins = [CachingPlugin, ValidationPlugin, ExportPlugin];
 * type AllAddOns = ExtractAddOnsFromControllerPluginArray<MyPlugins>;
 * // AllAddOns will contain methods from all plugins combined
 * ```
 */
export type ExtractAddOnsFromControllerPluginArray<
  ControllerPluginArrayType extends readonly ControllerPlugin<
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
> = ExtractDataAddOnsFromControllerPluginArray<ControllerPluginArrayType> &
  ExtractCrudAddOnsFromControllerPluginArray<ControllerPluginArrayType>;

/**
 * Utility type that extracts and merges all data options from an array of controller plugins.
 * These options become available in the data controller structure configuration when using the plugins.
 *
 * @template ControllerPluginArrayType - An array of controller plugins
 * @returns Union-to-intersection type of all TDataOptions from the plugins
 *
 * @example
 * ```typescript
 * type MyPlugins = [CachingPlugin, PaginationPlugin];
 * type DataOptions = ExtractDataOptionsFromControllerPluginArray<MyPlugins>;
 * // DataOptions might include { cacheTimeout?: number; defaultPageSize?: number; }
 * ```
 */
export type ExtractDataOptionsFromControllerPluginArray<
  ControllerPluginArrayType extends readonly ControllerPlugin<
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
  ControllerPluginArrayType[number] extends ControllerPlugin<
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
 * Utility type that extracts and merges all CRUD options from an array of controller plugins.
 * These options become available in the CRUD controller structure configuration when using the plugins.
 *
 * @template ControllerPluginArrayType - An array of controller plugins
 * @returns Union-to-intersection type of all TCrudOptions from the plugins
 *
 * @example
 * ```typescript
 * type MyPlugins = [ValidationPlugin, AuditPlugin];
 * type CrudOptions = ExtractCrudOptionsFromControllerPluginArray<MyPlugins>;
 * // CrudOptions might include { enableValidation?: boolean; auditLevel?: string; }
 * ```
 */
export type ExtractCrudOptionsFromControllerPluginArray<
  ControllerPluginArrayType extends readonly ControllerPlugin<
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
  ControllerPluginArrayType[number] extends ControllerPlugin<
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
 * Utility type that extracts and merges both data and CRUD options from an array of controller plugins.
 * This provides a complete view of all configuration options that will be available
 * when using a specific set of plugins.
 *
 * @template ControllerPluginArrayType - An array of controller plugins
 * @returns Combined type of all data and CRUD options from the plugins
 *
 * @example
 * ```typescript
 * type MyPlugins = [CachingPlugin, ValidationPlugin, AuditPlugin];
 * type AllOptions = ExtractOptionsFromControllerPluginArray<MyPlugins>;
 * // AllOptions will include all configuration options from all plugins
 * ```
 */
export type ExtractOptionsFromControllerPluginArray<
  ControllerPluginArrayType extends readonly ControllerPlugin<
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
> = ExtractDataOptionsFromControllerPluginArray<ControllerPluginArrayType> &
  ExtractCrudOptionsFromControllerPluginArray<ControllerPluginArrayType>;

/**
 * Utility type that extracts and merges all data service add-ons from an array of controller plugins.
 * This type represents the service functionality that controller plugins expect to be available.
 *
 * @template ControllerPluginArrayType - An array of controller plugins
 * @returns Union-to-intersection type of all TDataServiceAddOns from the plugins
 *
 * @example
 * ```typescript
 * type MyPlugins = [CachingPlugin, SearchPlugin];
 * type ServiceAddOns = ExtractDataServiceAddOnsFromControllerPluginArray<MyPlugins>;
 * // ServiceAddOns will contain service methods that these controller plugins expect
 * ```
 */
export type ExtractDataServiceAddOnsFromControllerPluginArray<
  ControllerPluginArrayType extends readonly ControllerPlugin<
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
  ControllerPluginArrayType[number] extends ControllerPlugin<
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
 * Utility type that extracts and merges all CRUD service add-ons from an array of controller plugins.
 * This type represents the CRUD service functionality that controller plugins expect to be available.
 *
 * @template ControllerPluginArrayType - An array of controller plugins
 * @returns Union-to-intersection type of all TCrudServiceAddOns from the plugins
 *
 * @example
 * ```typescript
 * type MyPlugins = [ValidationPlugin, AuditPlugin];
 * type CrudServiceAddOns = ExtractCrudServiceAddOnsFromControllerPluginArray<MyPlugins>;
 * // CrudServiceAddOns will contain CRUD service methods that these controller plugins expect
 * ```
 */
export type ExtractCrudServiceAddOnsFromControllerPluginArray<
  ControllerPluginArrayType extends readonly ControllerPlugin<
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
  ControllerPluginArrayType[number] extends ControllerPlugin<
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
 * Utility type that extracts and merges both data and CRUD service add-ons from an array of controller plugins.
 * This provides a complete view of all service functionality that controller plugins expect to be available.
 *
 * @template ControllerPluginArrayType - An array of controller plugins
 * @returns Combined type of all data and CRUD service add-ons from the plugins
 *
 * @example
 * ```typescript
 * type MyPlugins = [CachingPlugin, ValidationPlugin, SearchPlugin];
 * type ServiceAddOns = ExtractServiceAddOnsFromControllerPluginArray<MyPlugins>;
 * // ServiceAddOns will contain all service methods that these controller plugins expect
 * ```
 */
export type ExtractServiceAddOnsFromControllerPluginArray<
  ControllerPluginArrayType extends readonly ControllerPlugin<
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
> =
  ExtractDataServiceAddOnsFromControllerPluginArray<ControllerPluginArrayType> &
    ExtractCrudServiceAddOnsFromControllerPluginArray<ControllerPluginArrayType>;
