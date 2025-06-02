import { EntityManager } from 'typeorm';
import { IsolationLevel } from 'typeorm/driver/types/IsolationLevel';
import {
  BooleanType,
  Entity,
  FindArgs,
  IdTypeFrom,
  If,
  NotNullableIf,
  PaginationResult,
  Where,
  DataService as CommonDataService,
} from '@solid-nestjs/common';
import {
  TypeOrmFindManyOptions as FindManyOptions,
  TypeOrmRepository as Repository,
  TypeOrmSelectQueryBuilder as SelectQueryBuilder,
} from '../../types';
import { Context, DataRetrievalOptions, ExtendedRelationInfo } from '../misc';
import { QueryBuilderHelper } from '../../helpers';

/**
 * Generic interface for a data service that provides CRUD operations and advanced querying capabilities
 * for entities using TypeORM. Extends {@link CommonDataService} and adds methods for repository access,
 * query building, pagination, transactional execution, and auditing.
 *
 * @remarks
 * This interface is designed to abstract data access logic and provide a consistent API for
 * working with entities, including support for advanced features such as relation info,
 * custom query builders, and transactional execution.
 *
 * @see CommonDataService
 * @see Repository
 * @see EntityManager
 * @see SelectQueryBuilder
 * @see PaginationResult
 */
export interface DataService<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  FindArgsType extends FindArgs<EntityType> = FindArgs<EntityType>,
  ContextType extends Context = Context,
> extends CommonDataService<IdType, EntityType, ContextType> {
  /**
   * Retrieves the TypeORM repository instance for the entity type.
   *
   * @param context - The execution context containing request-specific information
   * @returns The TypeORM repository instance for performing database operations
   *
   * @example
   * ```typescript
   * const repository = dataService.getRepository(context);
   * const entity = await repository.findOneBy({ id: 1 });
   * ```
   */
  getRepository(context: ContextType): Repository<EntityType>;

  /**
   * Retrieves the TypeORM entity manager instance for advanced database operations.
   *
   * @param context - The execution context containing request-specific information
   * @returns The TypeORM entity manager for managing entities and transactions
   *
   * @remarks
   * The entity manager provides access to low-level database operations and is useful
   * for complex queries, transactions, and operations that span multiple repositories.
   *
   * @example
   * ```typescript
   * const entityManager = dataService.getEntityManager(context);
   * await entityManager.transaction(async transactionalEntityManager => {
   *   // Perform multiple operations within a transaction
   * });
   * ```
   */
  getEntityManager(context: ContextType): EntityManager;

  /**
   * Retrieves extended relation information for the entity type.
   *
   * @param context - The execution context containing request-specific information
   * @returns An array of extended relation information objects describing entity relationships
   *
   * @remarks
   * This method provides metadata about entity relationships, including foreign keys,
   * join columns, and relation types. It's useful for dynamic query building and
   * understanding entity structure at runtime.
   *
   * @example
   * ```typescript
   * const relations = dataService.getRelationsInfo(context);
   * relations.forEach(relation => {
   *   console.log(`Relation: ${relation.propertyName}, Type: ${relation.relationType}`);
   * });
   * ```
   */
  getRelationsInfo(context: ContextType): ExtendedRelationInfo[];

  /**
   * Gets the query builder helper instance for advanced query construction.
   *
   * @returns The query builder helper instance for creating complex queries
   *
   * @remarks
   * The query builder helper provides utilities for constructing TypeORM queries
   * with support for filtering, sorting, pagination, and relation loading.
   *
   * @example
   * ```typescript
   * const helper = dataService.queryBuilderHelper;
   * const queryBuilder = helper.createQueryBuilder('entity');
   * ```
   */
  get queryBuilderHelper(): QueryBuilderHelper<IdType, EntityType>;

  /**
   * Creates a TypeORM select query builder with optional filtering and options.
   *
   * @param context - The execution context containing request-specific information
   * @param args - Optional find arguments for filtering, sorting, and pagination
   * @param options - Optional data retrieval options for customizing the query
   * @returns A configured TypeORM select query builder
   *
   * @remarks
   * This method creates a query builder that can be further customized before execution.
   * It applies the provided arguments and options to configure filtering, sorting,
   * relation loading, and other query parameters.
   *
   * @example
   * ```typescript
   * const qb = dataService.getQueryBuilder(context, {
   *   where: { status: 'active' },
   *   order: { createdAt: 'DESC' }
   * });
   * const results = await qb.getMany();
   * ```
   */
  getQueryBuilder(
    context: ContextType,
    args?: FindArgsType,
    options?: DataRetrievalOptions<EntityType>,
  ): SelectQueryBuilder<EntityType>;

  /**
   * Creates a non-multiplying paginated query builder for efficient pagination with relations.
   *
   * @param context - The execution context containing request-specific information
   * @param args - Optional find arguments for filtering, sorting, and pagination
   * @param options - Optional data retrieval options for customizing the query
   * @returns A configured query builder or false if non-multiplying pagination is not possible
   *
   * @remarks
   * This method attempts to create a query builder that avoids the N+1 problem
   * when paginating results with relations. It returns false if the query structure
   * doesn't allow for non-multiplying pagination (e.g., with certain join types).
   *
   * @example
   * ```typescript
   * const qb = dataService.getNonMultiplyingPaginatedQueryBuilder(context, {
   *   relations: ['products'],
   *   pagination: { page: 1, limit: 10 }
   * });
   * if (qb) {
   *   const results = await qb.getMany();
   * }
   * ```
   */
  getNonMultiplyingPaginatedQueryBuilder(
    context: ContextType,
    args?: FindArgsType,
    options?: DataRetrievalOptions<EntityType>,
  ): SelectQueryBuilder<EntityType> | false;

  /**
   * Finds entities using TypeORM's native find options.
   *
   * @param context - The execution context containing request-specific information
   * @param options - Optional TypeORM find options for filtering and customization
   * @returns A promise that resolves to an array of entities
   *
   * @remarks
   * This method provides direct access to TypeORM's find functionality with native
   * find options. Use this when you need the full power of TypeORM's find options
   * or when working with complex queries that don't fit the standard find patterns.
   *
   * @example
   * ```typescript
   * const entities = await dataService.find(context, {
   *   where: { status: 'active' },
   *   relations: ['products'],
   *   order: { createdAt: 'DESC' },
   *   take: 10
   * });
   * ```
   */
  find(
    context: ContextType,
    options?: FindManyOptions<EntityType>,
  ): Promise<EntityType[]>;

  /**
   * Finds all entities with optional pagination support.
   *
   * @template TBool - Boolean type parameter to determine return type
   * @param context - The execution context containing request-specific information
   * @param args - Optional find arguments for filtering, sorting, and pagination
   * @param withPagination - Whether to include pagination metadata in the result
   * @param options - Optional data retrieval options for customizing the query
   * @returns A promise that resolves to entities or paginated result based on withPagination parameter
   *
   * @remarks
   * This method provides a flexible way to retrieve entities with or without pagination.
   * When withPagination is true, it returns both the data and pagination metadata.
   * When false, it returns only the array of entities.
   *
   * @example
   * ```typescript
   * // Without pagination
   * const entities = await dataService.findAll(context, {
   *   where: { status: 'active' }
   * });
   *
   * // With pagination
   * const result = await dataService.findAll(context, {
   *   where: { status: 'active' },
   *   pagination: { page: 1, limit: 10 }
   * }, true);
   * console.log(result.data); // Entities
   * console.log(result.pagination); // Pagination metadata
   * ```
   */
  findAll<TBool extends BooleanType = false>(
    context: ContextType,
    args?: FindArgsType,
    withPagination?: TBool,
    options?: DataRetrievalOptions<EntityType>,
  ): Promise<
    If<
      TBool,
      { data: EntityType[]; pagination: PaginationResult },
      EntityType[]
    >
  >;

  /**
   * Calculates pagination metadata for a given query without retrieving the actual data.
   *
   * @param context - The execution context containing request-specific information
   * @param args - Optional find arguments for filtering and pagination parameters
   * @param options - Optional data retrieval options for customizing the query
   * @returns A promise that resolves to pagination metadata including total count, pages, etc.
   *
   * @remarks
   * This method is useful when you need only pagination information without the actual
   * entity data, such as for building pagination controls or calculating result statistics.
   * It executes a count query to determine the total number of matching records.
   *
   * @example
   * ```typescript
   * const paginationInfo = await dataService.pagination(context, {
   *   where: { status: 'active' },
   *   pagination: { page: 1, limit: 10 }
   * });
   * console.log(`Total: ${paginationInfo.total}, Pages: ${paginationInfo.totalPages}`);
   * ```
   */
  pagination(
    context: ContextType,
    args?: FindArgsType,
    options?: DataRetrievalOptions<EntityType>,
  ): Promise<PaginationResult>;

  /**
   * Finds a single entity by its identifier.
   *
   * @template TBool - Boolean type parameter to determine if the method should fail when entity is not found
   * @param context - The execution context containing request-specific information
   * @param id - The unique identifier of the entity to find
   * @param orFail - Whether to throw an error if the entity is not found
   * @param options - Optional data retrieval options for customizing the query
   * @returns A promise that resolves to the entity or null/undefined based on orFail parameter
   *
   * @throws {EntityNotFoundError} When orFail is true and the entity is not found
   *
   * @remarks
   * This method provides a convenient way to find entities by their primary key.
   * When orFail is true, it guarantees that the returned entity is not null/undefined.
   * When orFail is false, it may return null/undefined if the entity doesn't exist.
   *
   * @example
   * ```typescript
   * // May return null if not found
   * const entity = await dataService.findOne(context, 1);
   *
   * // Throws error if not found
   * const entity = await dataService.findOne(context, 1, true);
   * ```
   */
  findOne<TBool extends BooleanType = false>(
    context: ContextType,
    id: IdType,
    orFail?: TBool,
    options?: DataRetrievalOptions<EntityType>,
  ): Promise<NotNullableIf<TBool, EntityType>>;

  /**
   * Finds a single entity by custom where conditions.
   *
   * @template TBool - Boolean type parameter to determine if the method should fail when entity is not found
   * @param context - The execution context containing request-specific information
   * @param where - The where conditions to match against
   * @param orFail - Whether to throw an error if the entity is not found
   * @param options - Optional data retrieval options for customizing the query
   * @returns A promise that resolves to the entity or null/undefined based on orFail parameter
   *
   * @throws {EntityNotFoundError} When orFail is true and the entity is not found
   *
   * @remarks
   * This method allows finding entities by any field or combination of fields.
   * It's more flexible than findOne as it accepts custom where conditions.
   * When orFail is true, it guarantees that the returned entity is not null/undefined.
   *
   * @example
   * ```typescript
   * // Find by email, may return null
   * const user = await dataService.findOneBy(context, { email: 'user@example.com' });
   *
   * // Find by multiple conditions, throw error if not found
   * const user = await dataService.findOneBy(context, {
   *   email: 'user@example.com',
   *   status: 'active'
   * }, true);
   * ```
   */
  findOneBy<TBool extends BooleanType = false>(
    context: ContextType,
    where: Where<EntityType>,
    orFail?: TBool,
    options?: DataRetrievalOptions<EntityType>,
  ): Promise<NotNullableIf<TBool, EntityType>>;

  /**
   * Executes a function within a database transaction.
   *
   * @template ReturnType - The return type of the function to execute
   * @param context - The execution context containing request-specific information
   * @param fn - The function to execute within the transaction, receives a transactional context
   * @param isolationLevel - Optional transaction isolation level for controlling concurrent access
   * @returns A promise that resolves to the return value of the executed function
   *
   * @throws {Error} If the transaction fails or the function throws an error
   *
   * @remarks
   * This method ensures that all database operations within the provided function
   * are executed as a single atomic transaction. If any operation fails, the entire
   * transaction is rolled back. The function receives a new context with a transactional
   * entity manager that should be used for all database operations within the transaction.
   *
   * @example
   * ```typescript
   * const result = await dataService.runInTransaction(context, async (txContext) => {
   *   const user = await userService.create(txContext, userData);
   *   const profile = await profileService.create(txContext, { userId: user.id });
   *   return { user, profile };
   * }, 'READ_COMMITTED');
   * ```
   */
  runInTransaction<ReturnType>(
    context: ContextType,
    fn: (context: ContextType) => Promise<ReturnType>,
    isolationLevel?: IsolationLevel,
  ): Promise<ReturnType>;

  /**
   * Records an audit log entry for tracking entity changes and actions.
   *
   * @param context - The execution context containing request-specific information
   * @param action - A descriptive string identifying the action performed (e.g., 'CREATE', 'UPDATE', 'DELETE')
   * @param objectId - Optional identifier of the entity that was affected
   * @param valueBefore - Optional object representing the state before the action
   * @param valueAfter - Optional object representing the state after the action
   * @returns A promise that resolves when the audit entry has been recorded
   *
   * @remarks
   * This method provides a standardized way to record audit trails for compliance,
   * debugging, and monitoring purposes. It can track what actions were performed,
   * on which entities, and what changes were made. The audit implementation may
   * vary based on the specific audit strategy configured in the application.
   *
   * @example
   * ```typescript
   * // Audit entity creation
   * await dataService.audit(context, 'CREATE', newEntity.id, null, newEntity);
   *
   * // Audit entity update
   * await dataService.audit(context, 'UPDATE', entity.id, oldValues, newValues);
   *
   * // Audit entity deletion
   * await dataService.audit(context, 'DELETE', entity.id, entity, null);
   *
   * // Audit custom action
   * await dataService.audit(context, 'EXPORT_DATA', null, { query: filters });
   * ```
   */
  audit(
    context: ContextType,
    action: string,
    objectId?: IdType,
    valueBefore?: object,
    valueAfter?: object,
  ): Promise<void>;
}
