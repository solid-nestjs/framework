import { DeepPartial } from 'typeorm';
import {
  Entity,
  IdTypeFrom,
  CudService as CommonCudService,
  FindArgs,
  Where,
  Context,
} from '@solid-nestjs/common';
import { TypeOrmRepository as Repository } from '../../types';
import {
  CreateEventsHandler,
  UpdateEventsHandler,
  RemoveEventsHandler,
  HardRemoveEventsHandler,
  BulkInsertEventsHandler,
  BulkUpdateEventsHandler,
  BulkDeleteEventsHandler,
  BulkRemoveEventsHandler,
} from '../event-handlers';
import { DataService } from './data-service.interface';

/**
 * Result interface for bulk insert operations.
 *
 * @typeParam IdType - The type of the entity's identifier.
 */
export interface BulkInsertResult<IdType> {
  /**
   * Array of IDs of the created entities.
   */
  ids: IdType[];
}

/**
 * Result interface for bulk update operations.
 */
export interface BulkUpdateResult {
  /**
   * Number of entities affected by the update operation.
   * Can be undefined if the database doesn't provide this information.
   */
  affected: number | undefined;
}

/**
 * Result interface for bulk delete operations.
 */
export interface BulkDeleteResult {
  /**
   * Number of entities affected by the delete operation.
   * Can be undefined if the database doesn't provide this information.
   */
  affected: number | undefined | null;
}

/**
 * Result interface for bulk remove operations.
 */
export interface BulkRemoveResult {
  /**
   * Number of entities affected by the remove operation.
   * Can be undefined if the database doesn't provide this information.
   */
  affected: number | undefined | null;
}

/**
 * Interface representing a generic CRUD (Create, Read, Update, Delete) service for entities.
 *
 * @extends DataService
 * @extends CommonCudService
 *
 * @remarks
 * This interface defines the contract for CRUD operations, including hooks for actions before and after
 * create, update, remove, and hard remove operations. It is intended to be implemented by services that
 * interact with a data repository, such as TypeORM repositories.
 *
 * @method create - Creates a new entity.
 * @method update - Updates an existing entity by its identifier.
 * @method remove - Soft-removes (marks as deleted) an entity by its identifier.
 * @method hardRemove - Permanently removes an entity by its identifier.
 *
 * @method beforeCreate - Hook executed before creating an entity.
 * @method beforeUpdate - Hook executed before updating an entity.
 * @method beforeRemove - Hook executed before soft-removing an entity.
 * @method beforeHardRemove - Hook executed before hard-removing an entity.
 *
 * @method afterCreate - Hook executed after creating an entity.
 * @method afterUpdate - Hook executed after updating an entity.
 * @method afterRemove - Hook executed after soft-removing an entity.
 * @method afterHardRemove - Hook executed after hard-removing an entity.
 */
export interface CrudService<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  CreateInputType extends DeepPartial<EntityType>,
  UpdateInputType extends DeepPartial<EntityType>,
  FindArgsType extends FindArgs<EntityType> = FindArgs<EntityType>,
  ContextType extends Context = Context,
> extends DataService<IdType, EntityType, FindArgsType, ContextType>,
    CommonCudService<
      IdType,
      EntityType,
      CreateInputType,
      UpdateInputType,
      ContextType
    > {
  /**
   * Creates a new entity in the database.
   *
   * @param context - The execution context containing request-specific information
   * @param createInput - The input data for creating the entity
   * @param options - Optional configuration for the create operation
   * @returns A promise that resolves to the created entity
   *
   * @remarks
   * This method handles the complete entity creation lifecycle, including:
   * - Input validation and transformation
   * - Execution of beforeCreate hooks
   * - Database insertion
   * - Execution of afterCreate hooks
   * - Event handler processing if configured
   *
   * @example
   * ```typescript
   * const newUser = await crudService.create(context, {
   *   name: 'John Doe',
   *   email: 'john@example.com'
   * });
   * console.log(`Created user with ID: ${newUser.id}`);
   * ```
   */
  create(
    context: ContextType,
    createInput: CreateInputType,
    options?: CreateOptions<IdType, EntityType, CreateInputType, ContextType>,
  ): Promise<EntityType>;

  /**
   * Performs bulk insertion of multiple entities in a single database operation.
   *
   * @param context - The execution context containing request-specific information
   * @param createInputs - Array of input data for creating multiple entities
   * @param options - Optional configuration for the bulk insert operation
   * @returns A promise that resolves to bulk insert result containing the IDs of created entities
   *
   * @remarks
   * This method is optimized for inserting large numbers of entities efficiently.
   * It executes beforeBulkInsert and afterBulkInsert hooks and supports custom
   * event handlers for additional processing. The operation is typically faster
   * than multiple individual create operations.
   *
   * @example
   * ```typescript
   * const result = await crudService.bulkInsert(context, [
   *   { name: 'User 1', email: 'user1@example.com' },
   *   { name: 'User 2', email: 'user2@example.com' },
   *   { name: 'User 3', email: 'user3@example.com' }
   * ]);
   * console.log(`Created ${result.ids.length} users`);
   * ```
   */
  bulkInsert(
    context: ContextType,
    createInputs: DeepPartial<EntityType>[],
    options?: BulkInsertOptions<IdType, EntityType, ContextType>,
  ): Promise<BulkInsertResult<IdType>>;

  /**
   * Updates an existing entity identified by its ID.
   *
   * @param context - The execution context containing request-specific information
   * @param id - The unique identifier of the entity to update
   * @param updateInput - The partial data to update on the entity
   * @param options - Optional configuration for the update operation
   * @returns A promise that resolves to the updated entity
   *
   * @throws {EntityNotFoundError} When the entity with the specified ID doesn't exist
   *
   * @remarks
   * This method handles the complete entity update lifecycle, including:
   * - Entity retrieval and existence validation
   * - Input validation and transformation
   * - Execution of beforeUpdate hooks
   * - Database update
   * - Execution of afterUpdate hooks
   * - Event handler processing if configured
   *
   * @example
   * ```typescript
   * const updatedUser = await crudService.update(context, 1, {
   *   name: 'John Smith',
   *   email: 'johnsmith@example.com'
   * });
   * console.log(`Updated user: ${updatedUser.name}`);
   * ```
   */
  update(
    context: ContextType,
    id: IdType,
    updateInput: UpdateInputType,
    options?: UpdateOptions<IdType, EntityType, UpdateInputType, ContextType>,
  ): Promise<EntityType>;

  /**
   * Performs a soft delete (logical deletion) of an entity by its ID.
   *
   * @param context - The execution context containing request-specific information
   * @param id - The unique identifier of the entity to soft delete
   * @param options - Optional configuration for the remove operation
   * @returns A promise that resolves to the soft-deleted entity
   *
   * @throws {EntityNotFoundError} When the entity with the specified ID doesn't exist
   *
   * @remarks
   * Soft delete marks the entity as deleted without physically removing it from the database.
   * This is typically done by setting a deletedAt timestamp or a status field. The entity
   * will be excluded from normal queries but can be restored if needed. This method executes
   * beforeRemove and afterRemove hooks and supports custom event handlers.
   *
   * @example
   * ```typescript
   * const deletedUser = await crudService.remove(context, 1);
   * console.log(`Soft deleted user: ${deletedUser.name}`);
   * // Entity is marked as deleted but still exists in database
   * ```
   */
  remove(
    context: ContextType,
    id: IdType,
    options?: RemoveOptions<IdType, EntityType, ContextType>,
  ): Promise<EntityType>;

  /**
   * Performs a hard delete (physical deletion) of an entity by its ID.
   *
   * @param context - The execution context containing request-specific information
   * @param id - The unique identifier of the entity to permanently delete
   * @param options - Optional configuration for the hard remove operation
   * @returns A promise that resolves to the deleted entity (state before deletion)
   *
   * @throws {EntityNotFoundError} When the entity with the specified ID doesn't exist
   *
   * @remarks
   * Hard delete permanently removes the entity from the database. This operation cannot
   * be undone and will also cascade to related entities if foreign key constraints are
   * configured to do so. This method executes beforeHardRemove and afterHardRemove hooks
   * and supports custom event handlers.
   *
   * @example
   * ```typescript
   * const deletedUser = await crudService.hardRemove(context, 1);
   * console.log(`Permanently deleted user: ${deletedUser.name}`);
   * // Entity is completely removed from database
   * ```
   */
  hardRemove(
    context: ContextType,
    id: IdType,
    options?: HardRemoveOptions<IdType, EntityType, ContextType>,
  ): Promise<EntityType>;

  /**
   * Hook method executed before creating a new entity.
   *
   * @param context - The execution context containing request-specific information
   * @param repository - The TypeORM repository instance for the entity
   * @param entity - The entity instance that will be created (before persistence)
   * @param createInput - The original input data used to create the entity
   * @returns A promise that resolves when the hook processing is complete
   *
   * @remarks
   * This hook allows you to perform validation, transformation, or side effects
   * before the entity is persisted to the database. You can modify the entity
   * properties, validate business rules, or prepare related data. If this method
   * throws an error, the creation process will be aborted.
   *
   * @example
   * ```typescript
   * async beforeCreate(context, repository, entity, createInput) {
   *   // Validate business rules
   *   if (entity.email && await this.isEmailTaken(entity.email)) {
   *     throw new Error('Email already exists');
   *   }
   *
   *   // Set computed fields
   *   entity.slug = this.generateSlug(entity.name);
   *   entity.createdBy = context.user.id;
   * }
   * ```
   */
  beforeCreate(
    context: ContextType,
    repository: Repository<EntityType>,
    entity: EntityType,
    createInput: CreateInputType,
  ): Promise<void>;

  /**
   * Hook method executed before bulk inserting multiple entities.
   *
   * @param context - The execution context containing request-specific information
   * @param repository - The TypeORM repository instance for the entities
   * @param entities - Array of entity instances that will be created (before persistence)
   * @param createInputs - Array of original input data used to create the entities
   * @returns A promise that resolves when the hook processing is complete
   *
   * @remarks
   * This hook allows you to perform batch validation, transformation, or preparation
   * before the entities are persisted to the database. You can modify entity properties,
   * validate business rules across the entire batch, or prepare related data. This is
   * more efficient than processing each entity individually for bulk operations.
   *
   * @example
   * ```typescript
   * async beforeBulkInsert(context, repository, entities, createInputs) {
   *   // Validate unique constraints across the batch
   *   const emails = entities.map(e => e.email);
   *   const duplicates = await this.findDuplicateEmails(emails);
   *   if (duplicates.length > 0) {
   *     throw new Error(`Duplicate emails found: ${duplicates.join(', ')}`);
   *   }
   *
   *   // Set batch-specific fields
   *   const batchId = generateBatchId();
   *   entities.forEach(entity => {
   *     entity.batchId = batchId;
   *     entity.createdBy = context.user.id;
   *   });
   * }
   * ```
   */
  beforeBulkInsert(
    context: ContextType,
    repository: Repository<EntityType>,
    entities: EntityType[],
    createInputs: DeepPartial<EntityType>[],
  ): Promise<void>;

  /**
   * Hook method executed before updating an existing entity.
   *
   * @param context - The execution context containing request-specific information
   * @param repository - The TypeORM repository instance for the entity
   * @param entity - The current entity instance (before applying updates)
   * @param updateInput - The input data containing the updates to apply
   * @returns A promise that resolves when the hook processing is complete
   *
   * @remarks
   * This hook allows you to perform validation, transformation, or side effects
   * before the entity is updated in the database. You can validate business rules,
   * modify the update data, or prepare audit trails. The entity parameter contains
   * the current state, and you can access both old and new values for comparison.
   *
   * @example
   * ```typescript
   * async beforeUpdate(context, repository, entity, updateInput) {
   *   // Validate business rules
   *   if (updateInput.status === 'published' && !entity.content) {
   *     throw new Error('Cannot publish entity without content');
   *   }
   *
   *   // Audit changes
   *   if (updateInput.status && updateInput.status !== entity.status) {
   *     await this.logStatusChange(entity.id, entity.status, updateInput.status);
   *   }
   *
   *   // Set update metadata
   *   updateInput.updatedBy = context.user.id;
   *   updateInput.updatedAt = new Date();
   * }
   * ```
   */
  beforeUpdate(
    context: ContextType,
    repository: Repository<EntityType>,
    entity: EntityType,
    updateInput: UpdateInputType,
  ): Promise<void>;

  /**
   * Hook method executed before soft-deleting an entity.
   *
   * @param context - The execution context containing request-specific information
   * @param repository - The TypeORM repository instance for the entity
   * @param entity - The entity instance that will be soft-deleted
   * @returns A promise that resolves when the hook processing is complete
   *
   * @remarks
   * This hook allows you to perform validation or side effects before the entity
   * is soft-deleted. You can validate business rules, check dependencies, or
   * prepare related data for the deletion. Use this for operations that need to
   * happen before the entity is marked as deleted but while it's still accessible.
   *
   * @example
   * ```typescript
   * async beforeRemove(context, repository, entity) {
   *   // Check if entity can be deleted
   *   const activeRelations = await this.checkActiveRelations(entity.id);
   *   if (activeRelations.length > 0) {
   *     throw new Error('Cannot delete entity with active relations');
   *   }
   *
   *   // Archive related data
   *   await this.archiveRelatedData(entity.id);
   *
   *   // Log deletion
   *   await this.logDeletion(entity.id, context.user.id);
   * }
   * ```
   */
  beforeRemove(
    context: ContextType,
    repository: Repository<EntityType>,
    entity: EntityType,
  ): Promise<void>;

  /**
   * Hook method executed before hard-deleting an entity.
   *
   * @param context - The execution context containing request-specific information
   * @param repository - The TypeORM repository instance for the entity
   * @param entity - The entity instance that will be permanently deleted
   * @returns A promise that resolves when the hook processing is complete
   *
   * @remarks
   * This hook allows you to perform validation or side effects before the entity
   * is permanently deleted from the database. You can validate business rules,
   * check dependencies, backup data, or clean up related resources. This is your
   * last chance to access the entity data before it's permanently removed.
   *
   * @example
   * ```typescript
   * async beforeHardRemove(context, repository, entity) {
   *   // Backup entity data
   *   await this.backupEntityData(entity);
   *
   *   // Clean up file system resources
   *   if (entity.attachments) {
   *     await this.deleteAttachments(entity.attachments);
   *   }
   *
   *   // Notify related systems
   *   await this.notifyEntityDeletion(entity.id);
   *
   *   // Check for cascading deletions
   *   await this.validateCascadeDeletion(entity.id);
   * }
   * ```
   */
  beforeHardRemove(
    context: ContextType,
    repository: Repository<EntityType>,
    entity: EntityType,
  ): Promise<void>;

  /**
   * Hook method executed after successfully creating a new entity.
   *
   * @param context - The execution context containing request-specific information
   * @param repository - The TypeORM repository instance for the entity
   * @param entity - The created entity instance (after persistence)
   * @param createInput - The original input data used to create the entity
   * @returns A promise that resolves when the hook processing is complete
   *
   * @remarks
   * This hook allows you to perform side effects after the entity has been successfully
   * created and persisted to the database. You can trigger notifications, update caches,
   * create audit logs, or perform other post-creation operations. The entity parameter
   * contains the final state with generated IDs and computed fields.
   *
   * @example
   * ```typescript
   * async afterCreate(context, repository, entity, createInput) {
   *   // Send notification
   *   await this.notificationService.sendWelcomeEmail(entity.email);
   *
   *   // Update cache
   *   await this.cacheService.invalidate(`users:${entity.id}`);
   *
   *   // Create audit log
   *   await this.auditService.log('USER_CREATED', entity.id, context.user.id);
   *
   *   // Trigger analytics event
   *   await this.analyticsService.track('user_registered', {
   *     userId: entity.id,
   *     registrationDate: entity.createdAt
   *   });
   * }
   * ```
   */
  afterCreate(
    context: ContextType,
    repository: Repository<EntityType>,
    entity: EntityType,
    createInput: CreateInputType,
  ): Promise<void>;

  /**
   * Hook method executed after successfully bulk inserting multiple entities.
   *
   * @param context - The execution context containing request-specific information
   * @param repository - The TypeORM repository instance for the entities
   * @param ids - Array of IDs of the successfully created entities
   * @param createInputs - Array of original input data used to create the entities
   * @returns A promise that resolves when the hook processing is complete
   *
   * @remarks
   * This hook allows you to perform side effects after entities have been successfully
   * bulk inserted and persisted to the database. You can trigger notifications, update
   * caches, create audit logs, or perform other post-insertion operations. This is more
   * efficient than processing each entity individually for bulk operations.
   *
   * @example
   * ```typescript
   * async afterBulkInsert(context, repository, ids, createInputs) {
   *   // Update search index
   *   await this.searchService.indexEntities(ids);
   *
   *   // Clear related caches
   *   await this.cacheService.invalidatePattern('users:*');
   *
   *   // Create bulk audit log
   *   await this.auditService.logBulk('USERS_BULK_CREATED', ids, context.user.id);
   *
   *   // Send batch notification
   *   await this.notificationService.sendBulkCreationNotification(
   *     context.user.id,
   *     ids.length
   *   );
   *
   *   // Update analytics
   *   await this.analyticsService.track('bulk_users_created', {
   *     count: ids.length,
   *     batchSize: createInputs.length
   *   });
   * }
   * ```
   */
  afterBulkInsert(
    context: ContextType,
    repository: Repository<EntityType>,
    ids: IdType[],
    createInputs: DeepPartial<EntityType>[],
  ): Promise<void>;

  /**
   * Hook method executed after successfully updating an entity.
   *
   * @param context - The execution context containing request-specific information
   * @param repository - The TypeORM repository instance for the entity
   * @param entity - The updated entity instance (after persistence)
   * @param updateInput - The input data that was applied to update the entity
   * @returns A promise that resolves when the hook processing is complete
   *
   * @remarks
   * This hook allows you to perform side effects after the entity has been successfully
   * updated and persisted to the database. You can trigger notifications, update caches,
   * create audit logs, or perform other post-update operations. The entity parameter
   * contains the final state with all applied changes.
   *
   * @example
   * ```typescript
   * async afterUpdate(context, repository, entity, updateInput) {
   *   // Update search index
   *   await this.searchService.updateEntity(entity.id, entity);
   *
   *   // Clear entity cache
   *   await this.cacheService.invalidate(`users:${entity.id}`);
   *
   *   // Send notification if status changed
   *   if (updateInput.status && updateInput.status === 'published') {
   *     await this.notificationService.sendPublishedNotification(entity);
   *   }
   *
   *   // Create audit log
   *   await this.auditService.log('USER_UPDATED', entity.id, context.user.id, {
   *     changes: updateInput
   *   });
   *
   *   // Trigger webhooks
   *   await this.webhookService.trigger('user.updated', entity);
   * }
   * ```
   */
  afterUpdate(
    context: ContextType,
    repository: Repository<EntityType>,
    entity: EntityType,
    updateInput: UpdateInputType,
  ): Promise<void>;

  /**
   * Performs bulk update of multiple entities matching the specified conditions.
   *
   * @param context - The execution context containing request-specific information
   * @param updateInput - The partial data to apply to all matching entities
   * @param where - The conditions that determine which entities to update
   * @param options - Optional configuration for the bulk update operation
   * @returns A promise that resolves to bulk update result containing the number of affected entities
   *
   * @remarks
   * This method efficiently updates multiple entities in a single database operation.
   * It's much faster than updating entities individually when dealing with large datasets.
   * The method executes beforeBulkUpdate and afterBulkUpdate hooks and supports custom
   * event handlers. The affected count may be undefined if the database doesn't provide it.
   *
   * @example
   * ```typescript
   * const result = await crudService.bulkUpdate(context,
   *   { status: 'inactive' },
   *   { lastLoginAt: { _lt: new Date('2023-01-01') } }
   * );
   * console.log(`Updated ${result.affected} inactive users`);
   * ```
   */
  bulkUpdate(
    context: ContextType,
    updateInput: DeepPartial<EntityType>,
    where: Where<EntityType>,
    options?: BulkUpdateOptions<IdType, EntityType, ContextType>,
  ): Promise<BulkUpdateResult>;

  /**
   * Performs bulk deletion of multiple entities matching the specified conditions.
   *
   * @param context - The execution context containing request-specific information
   * @param where - The conditions that determine which entities to delete
   * @param options - Optional configuration for the bulk delete operation
   * @returns A promise that resolves to bulk delete result containing the number of affected entities
   *
   * @remarks
   * This method efficiently deletes multiple entities in a single database operation.
   * It's much faster than deleting entities individually when dealing with large datasets.
   * The method executes beforeBulkDelete and afterBulkDelete hooks and supports custom
   * event handlers. The affected count may be undefined if the database doesn't provide it.
   * The deletion behavior (soft vs hard) depends on the entity configuration.
   *
   * @example
   * ```typescript
   * const result = await crudService.bulkDelete(context, {
   *   status: 'pending',
   *   createdAt: { _lt: new Date('2023-01-01') }
   * });
   * console.log(`Deleted ${result.affected} old pending records`);
   * ```
   */
  bulkDelete(
    context: ContextType,
    where: Where<EntityType>,
    options?: BulkDeleteOptions<IdType, EntityType, ContextType>,
  ): Promise<BulkDeleteResult>;

  /**
   * Performs bulk remove operation of multiple entities matching the specified conditions.
   *
   * @param context - The execution context containing request-specific information
   * @param where - The conditions that determine which entities to remove
   * @param options - Optional configuration for the bulk remove operation
   * @returns A promise that resolves to bulk remove result containing the number of affected entities
   *
   * @remarks
   * This method efficiently removes multiple entities in a single database operation.
   * If the entity has a delete date column (soft delete enabled), it performs a soft remove
   * by setting the delete date instead of physically deleting the records. Otherwise, it
   * performs a hard delete. This method executes beforeBulkRemove and afterBulkRemove hooks
   * and supports custom event handlers.
   *
   * @example
   * ```typescript
   * const result = await crudService.bulkRemove(context, {
   *   status: 'expired',
   *   expiresAt: { _lt: new Date() }
   * });
   * console.log(`Removed ${result.affected} expired records`);
   * ```
   */
  bulkRemove(
    context: ContextType,
    where: Where<EntityType>,
    options?: BulkRemoveOptions<IdType, EntityType, ContextType>,
  ): Promise<BulkRemoveResult>;

  /**
   * Hook method executed before performing a bulk update operation.
   *
   * @param context - The execution context containing request-specific information
   * @param repository - The TypeORM repository instance for the entities
   * @param updateInput - The partial data that will be applied to matching entities
   * @param where - The conditions that determine which entities will be updated
   * @returns A promise that resolves when the hook processing is complete
   *
   * @remarks
   * This hook allows you to perform validation or side effects before bulk updating
   * entities. You can validate the update data, check permissions, or prepare audit
   * trails. Note that individual entities are not loaded in bulk operations, so you
   * work with the update criteria rather than specific entity instances.
   *
   * @example
   * ```typescript
   * async beforeBulkUpdate(context, repository, updateInput, where) {
   *   // Validate bulk update permissions
   *   if (updateInput.status === 'published' && !context.user.canPublish) {
   *     throw new Error('User does not have permission to publish entities');
   *   }
   *
   *   // Add audit fields
   *   updateInput.updatedBy = context.user.id;
   *   updateInput.updatedAt = new Date();
   *
   *   // Log bulk operation
   *   await this.logBulkUpdate(where, updateInput, context.user.id);
   * }
   * ```
   */
  beforeBulkUpdate(
    context: ContextType,
    repository: Repository<EntityType>,
    updateInput: DeepPartial<EntityType>,
    where: Where<EntityType>,
  ): Promise<void>;

  /**
   * Hook method executed after successfully performing a bulk update operation.
   *
   * @param context - The execution context containing request-specific information
   * @param repository - The TypeORM repository instance for the entities
   * @param affectedCount - The number of entities that were updated (may be undefined)
   * @param updateInput - The partial data that was applied to the entities
   * @param where - The conditions that determined which entities were updated
   * @returns A promise that resolves when the hook processing is complete
   *
   * @remarks
   * This hook allows you to perform side effects after entities have been successfully
   * bulk updated. You can trigger notifications, update caches, create audit logs, or
   * perform other post-update operations. The affectedCount parameter tells you how
   * many entities were actually modified by the operation.
   *
   * @example
   * ```typescript
   * async afterBulkUpdate(context, repository, affectedCount, updateInput, where) {
   *   // Log bulk operation result
   *   await this.auditService.logBulk('BULK_UPDATE', affectedCount, context.user.id, {
   *     where,
   *     changes: updateInput
   *   });
   *
   *   // Clear related caches
   *   if (affectedCount && affectedCount > 0) {
   *     await this.cacheService.invalidatePattern('entities:*');
   *   }
   *
   *   // Send notification
   *   await this.notificationService.sendBulkUpdateNotification(
   *     context.user.id,
   *     affectedCount || 0
   *   );
   *
   *   // Update search index
   *   await this.searchService.reindexByQuery(where);
   * }
   * ```
   */
  afterBulkUpdate(
    context: ContextType,
    repository: Repository<EntityType>,
    affectedCount: number | undefined,
    updateInput: DeepPartial<EntityType>,
    where: Where<EntityType>,
  ): Promise<void>;

  /**
   * Hook method executed before performing a bulk delete operation.
   *
   * @param context - The execution context containing request-specific information
   * @param repository - The TypeORM repository instance for the entities
   * @param where - The conditions that determine which entities will be deleted
   * @returns A promise that resolves when the hook processing is complete
   *
   * @remarks
   * This hook allows you to perform validation or side effects before bulk deleting
   * entities. You can validate the delete criteria, check permissions, backup data,
   * or prepare related systems. Note that individual entities are not loaded in bulk
   * operations, so you work with the deletion criteria rather than specific instances.
   *
   * @example
   * ```typescript
   * async beforeBulkDelete(context, repository, where) {
   *   // Validate delete permissions
   *   if (!context.user.canBulkDelete) {
   *     throw new Error('User does not have permission for bulk delete');
   *   }
   *
   *   // Backup entities before deletion
   *   const entitiesToDelete = await repository.find({ where });
   *   await this.backupEntities(entitiesToDelete);
   *
   *   // Check for protected entities
   *   const protectedCount = await repository.count({
   *     where: { ...where, protected: true }
   *   });
   *   if (protectedCount > 0) {
   *     throw new Error('Cannot delete protected entities');
   *   }
   *
   *   // Log bulk operation
   *   await this.logBulkDelete(where, context.user.id);
   * }
   * ```
   */
  beforeBulkDelete(
    context: ContextType,
    repository: Repository<EntityType>,
    where: Where<EntityType>,
  ): Promise<void>;

  /**
   * Hook method executed after successfully performing a bulk delete operation.
   *
   * @param context - The execution context containing request-specific information
   * @param repository - The TypeORM repository instance for the entities
   * @param affectedCount - The number of entities that were deleted (may be undefined)
   * @param where - The conditions that determined which entities were deleted
   * @returns A promise that resolves when the hook processing is complete
   *
   * @remarks
   * This hook allows you to perform side effects after entities have been successfully
   * bulk deleted. You can trigger notifications, update caches, create audit logs, or
   * perform cleanup operations. The affectedCount parameter tells you how many entities
   * were actually removed by the operation.
   *
   * @example
   * ```typescript
   * async afterBulkDelete(context, repository, affectedCount, where) {
   *   // Log bulk deletion
   *   await this.auditService.logBulk('BULK_DELETE', affectedCount, context.user.id, {
   *     where,
   *     deletedAt: new Date()
   *   });
   *
   *   // Clear related caches
   *   if (affectedCount && affectedCount > 0) {
   *     await this.cacheService.invalidatePattern('entities:*');
   *   }
   *
   *   // Clean up related resources
   *   await this.cleanupRelatedResources(where);
   *
   *   // Send notification
   *   await this.notificationService.sendBulkDeleteNotification(
   *     context.user.id,
   *     affectedCount || 0
   *   );
   *
   *   // Update search index
   *   await this.searchService.removeByQuery(where);
   * }
   * ```
   */
  afterBulkDelete(
    context: ContextType,
    repository: Repository<EntityType>,
    affectedCount: number | undefined,
    where: Where<EntityType>,
  ): Promise<void>;

  /**
   * Hook method executed before performing a bulk remove operation.
   *
   * @param context - The execution context containing request-specific information
   * @param repository - The TypeORM repository instance for the entities
   * @param where - The conditions that determine which entities will be removed
   * @returns A promise that resolves when the hook processing is complete
   *
   * @remarks
   * This hook allows you to perform validation or side effects before bulk removing
   * entities. You can validate the remove criteria, check permissions, backup data,
   * or prepare related systems. Note that individual entities are not loaded in bulk
   * operations, so you work with the removal criteria rather than specific instances.
   * The behavior depends on whether the entity supports soft delete.
   *
   * @example
   * ```typescript
   * async beforeBulkRemove(context, repository, where) {
   *   // Validate remove permissions
   *   if (!context.user.canBulkRemove) {
   *     throw new Error('User does not have permission for bulk remove');
   *   }
   *
   *   // Backup entities before removal
   *   const entitiesToRemove = await repository.find({ where });
   *   await this.backupEntities(entitiesToRemove);
   *
   *   // Check for protected entities
   *   const protectedCount = await repository.count({
   *     where: { ...where, protected: true }
   *   });
   *   if (protectedCount > 0) {
   *     throw new Error('Cannot remove protected entities');
   *   }
   *
   *   // Log bulk operation
   *   await this.logBulkRemove(where, context.user.id);
   * }
   * ```
   */
  beforeBulkRemove(
    context: ContextType,
    repository: Repository<EntityType>,
    where: Where<EntityType>,
  ): Promise<void>;

  /**
   * Hook method executed after successfully performing a bulk remove operation.
   *
   * @param context - The execution context containing request-specific information
   * @param repository - The TypeORM repository instance for the entities
   * @param affectedCount - The number of entities that were removed (may be undefined)
   * @param where - The conditions that determined which entities were removed
   * @returns A promise that resolves when the hook processing is complete
   *
   * @remarks
   * This hook allows you to perform side effects after entities have been successfully
   * bulk removed. You can trigger notifications, update caches, create audit logs, or
   * perform cleanup operations. The affectedCount parameter tells you how many entities
   * were actually removed by the operation. The removal behavior (soft vs hard) depends
   * on the entity configuration.
   *
   * @example
   * ```typescript
   * async afterBulkRemove(context, repository, affectedCount, where) {
   *   // Log bulk removal
   *   await this.auditService.logBulk('BULK_REMOVE', affectedCount, context.user.id, {
   *     where,
   *     removedAt: new Date()
   *   });
   *
   *   // Clear related caches
   *   if (affectedCount && affectedCount > 0) {
   *     await this.cacheService.invalidatePattern('entities:*');
   *   }
   *
   *   // Clean up related resources
   *   await this.cleanupRelatedResources(where);
   *
   *   // Send notification
   *   await this.notificationService.sendBulkRemoveNotification(
   *     context.user.id,
   *     affectedCount || 0
   *   );
   *
   *   // Update search index
   *   await this.searchService.removeByQuery(where);
   * }
   * ```
   */
  afterBulkRemove(
    context: ContextType,
    repository: Repository<EntityType>,
    affectedCount: number | undefined,
    where: Where<EntityType>,
  ): Promise<void>;

  /**
   * Hook method executed after successfully soft-deleting an entity.
   *
   * @param context - The execution context containing request-specific information
   * @param repository - The TypeORM repository instance for the entity
   * @param entity - The soft-deleted entity instance (after marking as deleted)
   * @returns A promise that resolves when the hook processing is complete
   *
   * @remarks
   * This hook allows you to perform side effects after the entity has been successfully
   * soft-deleted. You can trigger notifications, update caches, create audit logs, or
   * perform cleanup operations. The entity is still available in the database but marked
   * as deleted, so you can access its data for logging or notification purposes.
   *
   * @example
   * ```typescript
   * async afterRemove(context, repository, entity) {
   *   // Create audit log
   *   await this.auditService.log('ENTITY_REMOVED', entity.id, context.user.id, {
   *     entityData: entity,
   *     deletedAt: new Date()
   *   });
   *
   *   // Clear entity cache
   *   await this.cacheService.invalidate(`entities:${entity.id}`);
   *
   *   // Send notification
   *   await this.notificationService.sendDeletionNotification(entity, context.user);
   *
   *   // Archive related data
   *   await this.archiveService.moveToArchive(entity.id);
   *
   *   // Update search index
   *   await this.searchService.removeFromIndex(entity.id);
   * }
   * ```
   */
  afterRemove(
    context: ContextType,
    repository: Repository<EntityType>,
    entity: EntityType,
  ): Promise<void>;

  /**
   * Hook method executed after successfully hard-deleting an entity.
   *
   * @param context - The execution context containing request-specific information
   * @param repository - The TypeORM repository instance for the entity
   * @param entity - The entity instance (state before permanent deletion)
   * @returns A promise that resolves when the hook processing is complete
   *
   * @remarks
   * This hook allows you to perform side effects after the entity has been successfully
   * and permanently deleted from the database. You can trigger notifications, update caches,
   * create audit logs, or perform final cleanup operations. Note that the entity parameter
   * contains the state before deletion since the entity no longer exists in the database.
   *
   * @example
   * ```typescript
   * async afterHardRemove(context, repository, entity) {
   *   // Create audit log with final state
   *   await this.auditService.log('ENTITY_PERMANENTLY_DELETED', entity.id, context.user.id, {
   *     finalEntityState: entity,
   *     deletedAt: new Date()
   *   });
   *
   *   // Clear all related caches
   *   await this.cacheService.invalidatePattern(`*:${entity.id}:*`);
   *
   *   // Clean up file system resources
   *   await this.fileService.deleteEntityFiles(entity.id);
   *
   *   // Notify external systems
   *   await this.webhookService.trigger('entity.permanently_deleted', {
   *     id: entity.id,
   *     type: entity.constructor.name
   *   });
   *
   *   // Final cleanup
   *   await this.cleanupService.performFinalCleanup(entity.id);
   * }
   * ```
   */
  afterHardRemove(
    context: ContextType,
    repository: Repository<EntityType>,
    entity: EntityType,
  ): Promise<void>;
}

export interface CreateOptions<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  CreateInputType extends DeepPartial<EntityType>,
  ContextType extends Context,
> {
  eventHandler?: CreateEventsHandler<
    IdType,
    EntityType,
    CreateInputType,
    ContextType
  >;
}

export interface UpdateOptions<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  UpdateInputType extends DeepPartial<EntityType>,
  ContextType extends Context,
> {
  eventHandler?: UpdateEventsHandler<
    IdType,
    EntityType,
    UpdateInputType,
    ContextType
  >;
}

export interface RemoveOptions<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  ContextType extends Context,
> {
  eventHandler?: RemoveEventsHandler<IdType, EntityType, ContextType>;
}

export interface HardRemoveOptions<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  ContextType extends Context,
> {
  eventHandler?: HardRemoveEventsHandler<IdType, EntityType, ContextType>;
}

export interface BulkInsertOptions<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  ContextType extends Context,
> {
  eventHandler?: BulkInsertEventsHandler<IdType, EntityType, ContextType>;
}

export interface BulkUpdateOptions<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  ContextType extends Context,
> {
  eventHandler?: BulkUpdateEventsHandler<IdType, EntityType, ContextType>;
}

export interface BulkDeleteOptions<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  ContextType extends Context,
> {
  eventHandler?: BulkDeleteEventsHandler<IdType, EntityType, ContextType>;
}

export interface BulkRemoveOptions<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
  ContextType extends Context,
> {
  eventHandler?: BulkRemoveEventsHandler<IdType, EntityType, ContextType>;
}
