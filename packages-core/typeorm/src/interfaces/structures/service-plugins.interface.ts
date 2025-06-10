import { Type } from '@nestjs/common';
import {
  Constructable,
  Context,
  DataService,
  DeepPartial,
  Entity,
  FindArgs,
  IdTypeFrom,
  UnionToIntersection,
} from '@solid-nestjs/common';
import { DataServiceStructure } from './data-service-structure.interface';
import { CrudServiceStructure } from './crud-service-structure.interface';
import { DataService as TypeOrmDataService, CrudService } from '../services';

/**
 * Extended interface for TypeORM-specific service plugins.
 *
 * This interface extends the base ServicePlugin from the common package with
 * TypeORM-specific functionality and structure types. It provides hooks for
 * modifying both the service structure configuration and the generated service classes.
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
 * // TypeORM-specific plugin with query builder enhancements
 * const queryBuilderPlugin: ServicePlugin<string, User> = {
 *   applyDataServiceStructure(structure) {
 *     // Add TypeORM-specific configurations
 *     structure.relationsConfig = { posts: true };
 *     structure.lockMode = 'pessimistic_read';
 *   },
 *
 *   applyDataServiceClass(serviceClass, structure) {
 *     class EnhancedService extends serviceClass {
 *       async findWithCustomQuery(customWhere: string) {
 *         const qb = this.getQueryBuilder();
 *         return qb.where(customWhere).getMany();
 *       }
 *     }
 *     return EnhancedService;
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
   * Hook that allows modifying the TypeORM data service structure during configuration.
   * This method is called before the service class is created and allows plugins to modify
   * TypeORM-specific configurations like relations, lock modes, and query builder settings.
   *
   * @param structure - The TypeORM data service structure being configured, enhanced with plugin options
   *
   * @example
   * ```typescript
   * applyDataServiceStructure(structure) {
   *   // Configure TypeORM-specific options
   *   structure.relationsConfig = {
   *     posts: true,
   *     comments: { posts: true }
   *   };
   *   structure.lockMode = 'pessimistic_write';
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
   * Hook that allows modifying the TypeORM CRUD service structure during configuration.
   * This method is called before the service class is created and allows plugins to modify
   * TypeORM-specific configurations for CRUD operations.
   *
   * @param structure - The TypeORM CRUD service structure being configured, enhanced with plugin options
   *
   * @example
   * ```typescript
   * applyCrudServiceStructure(structure) {
   *   // Configure transactional operations
   *   structure.functions = {
   *     create: { transactional: true },
   *     update: { transactional: true },
   *     remove: { transactional: true }
   *   };
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
   * Hook that allows modifying or extending the TypeORM data service class.
   * This method receives the constructed TypeORM data service class and can return an
   * enhanced version with additional methods that can leverage TypeORM features.
   *
   * @param serviceClass - The original TypeORM data service class constructor
   * @param structure - The TypeORM data service structure with plugin options
   * @returns Enhanced service class constructor with additional TypeORM functionality
   *
   * @example
   * ```typescript
   * applyDataServiceClass(serviceClass, structure) {
   *   class TypeOrmEnhancedService extends serviceClass {
   *     async findWithRawQuery(sql: string, parameters?: any[]) {
   *       const repository = this.getRepository();
   *       return repository.query(sql, parameters);
   *     }
   *
   *     getCustomQueryBuilder() {
   *       return this.getQueryBuilder().select('entity.id, entity.name');
   *     }
   *   }
   *   return TypeOrmEnhancedService;
   * }
   * ```
   */
  applyDataServiceClass?(
    serviceClass: Constructable<
      TypeOrmDataService<IdType, EntityType, FindArgsType, ContextType>
    >,
    structure: DataServiceStructure<
      IdType,
      EntityType,
      FindArgsType,
      ContextType
    > &
      TDataOptions,
  ): Type<
    TypeOrmDataService<IdType, EntityType, FindArgsType, ContextType> &
      TDataAddOns
  >;

  /**
   * Hook that allows modifying or extending the TypeORM CRUD service class.
   * This method receives the constructed TypeORM CRUD service class and can return an
   * enhanced version with additional methods that can leverage TypeORM features.
   *
   * @param serviceClass - The original TypeORM CRUD service class constructor
   * @param structure - The TypeORM CRUD service structure with plugin options
   * @returns Enhanced service class constructor with additional TypeORM functionality
   *
   * @example
   * ```typescript
   * applyCrudServiceClass(serviceClass, structure) {
   *   class TypeOrmCrudEnhanced extends serviceClass {
   *     async bulkCreateWithTransaction(inputs: CreateInputType[]) {
   *       return this.getRepository().manager.transaction(async manager => {
   *         const entities = inputs.map(input => manager.create(this.entityType, input));
   *         return manager.save(entities);
   *       });
   *     }
   *
   *     async softDeleteWithAudit(id: IdType, userId: string) {
   *       const result = await this.softRemove(context, id);
   *       await this.audit(context, 'SOFT_DELETE', id, null, { deletedBy: userId });
   *       return result;
   *     }
   *   }
   *   return TypeOrmCrudEnhanced;
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
      >
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
 * Utility type that extracts and merges all data add-ons from an array of TypeORM service plugins.
 * This type is used to determine what additional methods and properties will be available
 * on TypeORM data services when using a specific set of plugins.
 *
 * @template ServicePluginArrayType - An array of TypeORM service plugins
 * @returns Union-to-intersection type of all TDataAddOns from the plugins
 *
 * @example
 * ```typescript
 * type MyTypeOrmPlugins = [QueryBuilderPlugin, TransactionPlugin];
 * type DataAddOns = ExtractDataAddOnsFromServicePluginArray<MyTypeOrmPlugins>;
 * // DataAddOns will contain TypeORM-specific methods from both plugins
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
 * Utility type that extracts and merges all CRUD add-ons from an array of TypeORM service plugins.
 * This type is used to determine what additional methods and properties will be available
 * on TypeORM CRUD services when using a specific set of plugins.
 *
 * @template ServicePluginArrayType - An array of TypeORM service plugins
 * @returns Union-to-intersection type of all TCrudAddOns from the plugins
 *
 * @example
 * ```typescript
 * type MyTypeOrmPlugins = [TransactionPlugin, AuditPlugin];
 * type CrudAddOns = ExtractCrudAddOnsFromServicePluginArray<MyTypeOrmPlugins>;
 * // CrudAddOns will contain TypeORM-specific CRUD methods from both plugins
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
 * Utility type that extracts and merges both data and CRUD add-ons from an array of TypeORM service plugins.
 * This provides a complete view of all additional TypeORM functionality that will be available
 * on services when using a specific set of plugins.
 *
 * @template ServicePluginArrayType - An array of TypeORM service plugins
 * @returns Combined type of all data and CRUD add-ons from the plugins
 *
 * @example
 * ```typescript
 * type MyTypeOrmPlugins = [QueryBuilderPlugin, TransactionPlugin, AuditPlugin];
 * type AllAddOns = ExtractAddOnsFromServicePluginArray<MyTypeOrmPlugins>;
 * // AllAddOns will contain all TypeORM-specific methods from all plugins combined
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
 * Utility type that extracts and merges all data options from an array of TypeORM service plugins.
 * These options become available in the TypeORM data service structure configuration when using the plugins.
 *
 * @template ServicePluginArrayType - An array of TypeORM service plugins
 * @returns Union-to-intersection type of all TDataOptions from the plugins
 *
 * @example
 * ```typescript
 * type MyTypeOrmPlugins = [CachingPlugin, QueryBuilderPlugin];
 * type DataOptions = ExtractDataOptionsFromServicePluginArray<MyTypeOrmPlugins>;
 * // DataOptions might include { relationsConfig?: object; lockMode?: LockMode; }
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
 * Utility type that extracts and merges all CRUD options from an array of TypeORM service plugins.
 * These options become available in the TypeORM CRUD service structure configuration when using the plugins.
 *
 * @template ServicePluginArrayType - An array of TypeORM service plugins
 * @returns Union-to-intersection type of all TCrudOptions from the plugins
 *
 * @example
 * ```typescript
 * type MyTypeOrmPlugins = [TransactionPlugin, ValidationPlugin];
 * type CrudOptions = ExtractCrudOptionsFromServicePluginArray<MyTypeOrmPlugins>;
 * // CrudOptions might include { transactional?: boolean; enableValidation?: boolean; }
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
 * Utility type that extracts and merges both data and CRUD options from an array of TypeORM service plugins.
 * This provides a complete view of all TypeORM-specific configuration options that will be available
 * when using a specific set of plugins.
 *
 * @template ServicePluginArrayType - An array of TypeORM service plugins
 * @returns Combined type of all data and CRUD options from the plugins
 *
 * @example
 * ```typescript
 * type MyTypeOrmPlugins = [QueryBuilderPlugin, TransactionPlugin, ValidationPlugin];
 * type AllOptions = ExtractOptionsFromServicePluginArray<MyTypeOrmPlugins>;
 * // AllOptions will include all TypeORM-specific configuration options from all plugins
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
