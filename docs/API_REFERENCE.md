# API Reference

This document provides detailed API documentation for the SOLID NestJS Framework.

## Table of Contents

- [Common Package](#common-package)
- [TypeORM Package](#typeorm-package)
- [REST API Package](#rest-api-package)
- [GraphQL Package](#graphql-package)
- [Soft Deletion & Recovery Operations](#soft-deletion--recovery-operations)
- [Bulk Operations](#bulk-operations)
- [Types and Interfaces](#types-and-interfaces)
- [Decorators](#decorators)
- [Utilities](#utilities)

## Common Package

### Interfaces

#### `ICrudService<T>`

Base interface for CRUD service implementations.

```typescript
interface ICrudService<T> {
  findAll(context: Context, findArgs?: FindArgs): Promise<T[]>;
  findOne(context: Context, id: string, throwsError?: boolean): Promise<T>;
  create(context: Context, createInput: any): Promise<T>;
  update(context: Context, id: string, updateInput: any): Promise<T>;
  remove(context: Context, id: string): Promise<T>;

  // Soft deletion operations (when supported)
  softRemove?(context: Context, id: string): Promise<T>;
  hardRemove?(context: Context, id: string): Promise<T>;
  recover?(context: Context, id: string): Promise<T>;

  // Bulk operations
  bulkInsert?(context: Context, entities: any[]): Promise<{ ids: string[] }>;
  bulkUpdate?(
    context: Context,
    updates: any,
    where: any,
  ): Promise<{ affected: number }>;
  bulkRemove?(context: Context, where: any): Promise<{ affected: number }>;
  bulkDelete?(context: Context, where: any): Promise<{ affected: number }>;
  bulkRecover?(context: Context, where: any): Promise<{ affected: number }>;
}
```

#### `ICrudController<T>`

Base interface for CRUD controller implementations.

```typescript
interface ICrudController<T> {
  findAll(context: Context, findArgs?: FindArgs): Promise<T[]>;
  findOne(context: Context, id: string): Promise<T>;
  create(context: Context, createInput: any): Promise<T>;
  update(context: Context, id: string, updateInput: any): Promise<T>;
  remove(context: Context, id: string): Promise<T>; // softDeletes if able

  // Soft deletion endpoints (when supported)
  softRemove?(context: Context, id: string): Promise<T>;
  hardRemove?(context: Context, id: string): Promise<T>;
  recover?(context: Context, id: string): Promise<T>;
}
```

#### `Context`

Request context interface for dependency injection and transaction management.

```typescript
interface Context {
  user?: any;
  transaction?: any;
  request?: any;
  [key: string]: any;
}
```

### Types

#### `FindArgs`

Generic type for query arguments.

```typescript
type FindArgs = {
  filter?: FilterInput;
  pagination?: PaginationInput;
  orderBy?: OrderByInput;
  relations?: string[];
};
```

#### `PaginationInput`

Pagination configuration.

```typescript
type PaginationInput = {
  limit?: number;
  offset?: number;
  page?: number;
};
```

#### `OrderByInput`

Sorting configuration.

```typescript
type OrderByInput = {
  [key: string]: 'ASC' | 'DESC';
};
```

### Enums

#### `StandardActions`

Standard CRUD operations.

```typescript
enum StandardActions {
  FIND_ALL = 'findAll',
  FIND_ONE = 'findOne',
  CREATE = 'create',
  UPDATE = 'update',
  REMOVE = 'remove',
  SOFT_REMOVE = 'softRemove',
  HARD_REMOVE = 'hardRemove',
  RECOVER = 'recover',
  BULK_INSERT = 'bulkInsert',
  BULK_UPDATE = 'bulkUpdate',
  BULK_REMOVE = 'bulkRemove',
  BULK_DELETE = 'bulkDelete',
  BULK_RECOVER = 'bulkRecover',
}
```

#### `OrderByType`

Sort order types.

```typescript
enum OrderByType {
  ASC = 'ASC',
  DESC = 'DESC',
}
```

## TypeORM Package

### Service Mixins

#### `CrudServiceFrom(structure)`

Creates a service class with CRUD operations based on the provided structure.

```typescript
function CrudServiceFrom<T>(
  structure: CrudServiceStructure<T>,
): Constructor<ICrudService<T>>;
```

**Parameters:**

- `structure`: Service configuration structure

**Returns:** Service class constructor

#### `DataServiceFrom(structure)`

Creates a data service class for database operations.

```typescript
function DataServiceFrom<T>(
  structure: DataServiceStructure<T>,
): Constructor<IDataService<T>>;
```

### Structure Builders

#### `CrudServiceStructure(config)`

Builds configuration for CRUD service.

```typescript
function CrudServiceStructure<T>(config: {
  entityType: Constructor<T>;
  createInputType: Constructor<any>;
  updateInputType: Constructor<any>;
  findArgsType: Constructor<any>;
  relationsConfig?: RelationsConfig;
  lockMode?: LockMode;
  functions?: FunctionConfig;
}): CrudServiceStructure<T>;
```

**Configuration Options:**

- `entityType`: Entity class constructor
- `createInputType`: DTO for create operations
- `updateInputType`: DTO for update operations
- `findArgsType`: DTO for find operations
- `relationsConfig`: Relations configuration
- `lockMode`: Database lock mode
- `functions`: Function-specific configurations

#### `RelationsConfig`

Configuration for entity relations.

```typescript
interface RelationsConfig {
  mainAlias?: string;
  relations?: {
    [key: string]:
      | boolean
      | {
          relations?: RelationsConfig['relations'];
        };
  };
}
```

#### `FunctionConfig`

Configuration for specific CRUD functions.

```typescript
interface FunctionConfig {
  findAll?: OperationConfig;
  findOne?: OperationConfig;
  create?: OperationConfig;
  update?: OperationConfig;
  remove?: OperationConfig;
  softRemove?: OperationConfig;
  hardRemove?: OperationConfig;
  recover?: OperationConfig;

  // Bulk operations
  bulkInsert?: OperationConfig;
  bulkUpdate?: OperationConfig;
  bulkRemove?: OperationConfig;
  bulkDelete?: OperationConfig;
  bulkRecover?: OperationConfig;
}

interface OperationConfig {
  relationsConfig?: RelationsConfig;
  lockMode?: LockMode;
  transactional?: boolean;
  isolationLevel?: IsolationLevel;
  decorators?: MethodDecorator[];
}
```

### Database Operations

#### Lock Modes

```typescript
type LockMode =
  | 'optimistic'
  | 'pessimistic_read'
  | 'pessimistic_write'
  | 'dirty_read'
  | 'pessimistic_partial_write'
  | 'pessimistic_write_or_fail'
  | 'for_no_key_update';
```

#### Isolation Levels

```typescript
type IsolationLevel =
  | 'READ_UNCOMMITTED'
  | 'READ_COMMITTED'
  | 'REPEATABLE_READ'
  | 'SERIALIZABLE';
```

## REST API Package

### Controller Mixins

#### `CrudControllerFrom(structure)`

Creates a REST controller with CRUD endpoints.

```typescript
function CrudControllerFrom<T>(
  structure: CrudControllerStructure<T>,
): Constructor<ICrudController<T>>;
```

#### `DataControllerFrom(structure)`

Creates a data controller for REST operations.

```typescript
function DataControllerFrom<T>(
  structure: DataControllerStructure<T>,
): Constructor<IDataController<T>>;
```

### Structure Builders

#### `CrudControllerStructure(config)`

Builds configuration for CRUD controller.

```typescript
function CrudControllerStructure<T>(config: {
  entityType: Constructor<T>;
  createInputType: Constructor<any>;
  updateInputType: Constructor<any>;
  findArgsType: Constructor<any>;
  serviceType: Constructor<ICrudService<T>>;
  operations?: OperationsConfig;
  classDecorators?: ClassDecorator[];
  parameterDecorators?: ParameterDecorators;
  routeConfig?: RouteConfig;
}): CrudControllerStructure<T>;
```

#### `OperationsConfig`

Configuration for controller operations.

```typescript
interface OperationsConfig {
  findAll?: boolean | OperationDefinition;
  findOne?: boolean | OperationDefinition;
  create?: boolean | OperationDefinition;
  update?: boolean | OperationDefinition;
  remove?: boolean | OperationDefinition;
  softRemove?: boolean | OperationDefinition;
  hardRemove?: boolean | OperationDefinition;
  recover?: boolean | OperationDefinition;
  pagination?: boolean;
}

interface OperationDefinition {
  summary?: string;
  description?: string;
  decorators?: MethodDecorator[];
  response?: ApiResponseOptions;
}
```

#### `RouteConfig`

Route configuration for controller.

```typescript
interface RouteConfig {
  path?: string;
  version?: string;
  prefix?: string;
}
```

### Swagger Integration

#### API Response Types

```typescript
interface ApiResponseOptions {
  status?: number;
  description?: string;
  type?: any;
  schema?: any;
  examples?: any;
  headers?: any;
}
```

#### Pagination Response

```typescript
class PaginationResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}
```

## Decorators

### Service Decorators

#### `@Transaction()`

Marks a method to run in a database transaction.

```typescript
@Transaction()
async createProduct(context: Context, input: CreateProductDto): Promise<Product> {
  // Method implementation
}
```

#### `@Lock(mode)`

Applies database locking to a method.

```typescript
@Lock('pessimistic_write')
async updateInventory(context: Context, id: string, quantity: number): Promise<Product> {
  // Method implementation
}
```

### Controller Decorators

#### `@ApiCrudOperation(config)`

Configures Swagger documentation for CRUD operations.

```typescript
@ApiCrudOperation({
  summary: 'Create a new product',
  description: 'Creates a new product with the provided data'
})
@Post()
async create(@Body() createDto: CreateProductDto): Promise<Product> {
  // Method implementation
}
```

#### `@CurrentUser()`

Injects the current user from the request context.

```typescript
async findAll(
  @CurrentUser() user: User,
  @Query() findArgs: FindProductArgs
): Promise<Product[]> {
  // Method implementation
}
```

## Utilities

### Pagination Helper

#### `calculatePagination(input, total)`

Calculates pagination metadata.

```typescript
function calculatePagination(
  input: PaginationInput,
  total: number,
): PaginationMeta;
```

### Type Helpers

#### `DeepPartial<T>`

Creates a type with all properties optional recursively.

```typescript
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
```

#### `Constructor<T>`

Type for class constructors.

```typescript
type Constructor<T = {}> = new (...args: any[]) => T;
```

#### `BulkOperationResult`

Result types for bulk operations.

```typescript
interface BulkInsertResult {
  ids: (string | number)[];
}

interface BulkUpdateResult {
  affected?: number;
}

interface BulkRemoveResult {
  affected?: number;
}

interface BulkDeleteResult {
  affected?: number;
}

interface BulkRecoverResult {
  affected?: number;
}
```

#### `SoftDeletionOptions`

Options for soft deletion operations.

```typescript
interface RemoveOptions<IdType, EntityType, ContextType> {
  eventHandler?: RemoveEventsHandler<IdType, EntityType, ContextType>;
  noAudits?: boolean;
}

interface SoftRemoveOptions<IdType, EntityType, ContextType> {
  eventHandler?: SoftRemoveEventsHandler<IdType, EntityType, ContextType>;
  noAudits?: boolean;
}

interface HardRemoveOptions<IdType, EntityType, ContextType> {
  eventHandler?: HardRemoveEventsHandler<IdType, EntityType, ContextType>;
  noAudits?: boolean;
}

interface RecoverOptions<IdType, EntityType, ContextType> {
  eventHandler?: RecoverEventsHandler<IdType, EntityType, ContextType>;
  noAudits?: boolean;
}
```

#### `BulkOperationOptions`

Options for bulk operations.

```typescript
interface BulkInsertOptions<IdType, EntityType, ContextType> {
  eventHandler?: BulkInsertEventsHandler<IdType, EntityType, ContextType>;
  noAudits?: boolean;
}

interface BulkUpdateOptions<IdType, EntityType, ContextType> {
  eventHandler?: BulkUpdateEventsHandler<IdType, EntityType, ContextType>;
  noAudits?: boolean;
}

interface BulkRemoveOptions<IdType, EntityType, ContextType> {
  eventHandler?: BulkRemoveEventsHandler<IdType, EntityType, ContextType>;
  noAudits?: boolean;
}

interface BulkDeleteOptions<IdType, EntityType, ContextType> {
  eventHandler?: BulkDeleteEventsHandler<IdType, EntityType, ContextType>;
  noAudits?: boolean;
}

interface BulkRecoverOptions<IdType, EntityType, ContextType> {
  eventHandler?: BulkRecoverEventsHandler<IdType, EntityType, ContextType>;
  noAudits?: boolean;
}
```

## Error Handling

### Exception Types

#### `CrudException`

Base exception for CRUD operations.

```typescript
class CrudException extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  );
}
```

#### `EntityNotFoundException`

Exception thrown when an entity is not found.

```typescript
class EntityNotFoundException extends CrudException {
  constructor(entityName: string, id: string);
}
```

#### `SoftDeletionException`

Exception thrown for soft deletion related errors.

```typescript
class SoftDeletionException extends CrudException {
  constructor(message: string, entityName?: string);
}
```

#### `BulkOperationException`

Exception thrown for bulk operation errors.

```typescript
class BulkOperationException extends CrudException {
  constructor(
    message: string,
    public operation: string,
    public affectedCount?: number
  );
}
```

#### `ValidationException`

Exception thrown for validation errors.

```typescript
class ValidationException extends CrudException {
  constructor(
    message: string,
    public validationErrors: ValidationError[]
  );
}
```

## Configuration

### Default Settings

```typescript
const DEFAULT_CONFIG = {
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },
  relations: {
    maxDepth: 3,
  },
  transactions: {
    isolationLevel: 'READ_COMMITTED' as const,
  },
  locks: {
    timeout: 10000,
  },
};
```

### Environment Variables

```typescript
interface EnvironmentConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  DB_HOST: string;
  DB_PORT: number;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_DATABASE: string;
  DB_SYNCHRONIZE: boolean;
  DB_LOGGING: boolean;
  API_PREFIX: string;
  API_VERSION: string;
  SWAGGER_ENABLED: boolean;
}
```

## Examples

### Complete Service Implementation

```typescript
import { CrudServiceFrom, CrudServiceStructure } from '@solid-nestjs/typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto, UpdateProductDto, FindProductArgs } from './dto';

export const serviceStructure = CrudServiceStructure({
  entityType: Product,
  createInputType: CreateProductDto,
  updateInputType: UpdateProductDto,
  findArgsType: FindProductArgs,
  relationsConfig: {
    supplier: true,
    category: true,
  },
  functions: {
    create: {
      transactional: true,
      isolationLevel: 'READ_COMMITTED',
    },
    update: {
      transactional: true,
      lockMode: 'pessimistic_write',
    },
    remove: {
      transactional: true, // Soft delete by default if entity supports it
    },
    softRemove: {
      transactional: true, // Explicit soft delete
    },
    hardRemove: {
      transactional: true, // Permanent deletion
    },
    recover: {
      transactional: true, // Recovery operation
    },
    // Bulk operations
    bulkInsert: {
      transactional: true,
      isolationLevel: 'READ_COMMITTED',
    },
    bulkUpdate: {
      transactional: true,
      lockMode: 'pessimistic_write',
    },
    bulkRemove: {
      transactional: true,
    },
    bulkDelete: {
      transactional: true,
    },
    bulkRecover: {
      transactional: true,
    },
  },
});

export class ProductsService extends CrudServiceFrom(serviceStructure) {
  // Custom query methods
  async findByCategory(
    context: Context,
    categoryId: string,
  ): Promise<Product[]> {
    return this.findAll(context, {
      where: { category: { id: categoryId } },
    });
  }

  // Soft deletion hooks
  async beforeSoftRemove(
    context: Context,
    repository: Repository<Product>,
    entity: Product,
  ) {
    // Archive related data before soft deletion
    await this.archiveRelatedData(entity.id);

    // Validate soft delete permissions
    if (!context.user.canSoftDelete) {
      throw new Error('User does not have soft delete permissions');
    }
  }

  async afterSoftRemove(
    context: Context,
    repository: Repository<Product>,
    entity: Product,
  ) {
    // Notify related services
    await this.notificationService.notifyDeletion(entity.id, 'soft');

    // Update search index
    await this.searchService.removeFromIndex(entity.id);
  }

  // Recovery hooks
  async beforeRecover(
    context: Context,
    repository: Repository<Product>,
    entity: Product,
  ) {
    // Validate recovery conditions
    if (entity.category?.isArchived) {
      throw new Error('Cannot recover product with archived category');
    }
  }

  async afterRecover(
    context: Context,
    repository: Repository<Product>,
    entity: Product,
  ) {
    // Restore to search index
    await this.searchService.addToIndex(entity);

    // Notify recovery
    await this.notificationService.notifyRecovery(entity.id);
  }

  // Bulk operation hooks
  async beforeBulkRemove(
    context: Context,
    repository: Repository<Product>,
    where: any,
  ) {
    // Validate bulk remove permissions
    if (!context.user.canBulkRemove) {
      throw new Error('User does not have bulk remove permissions');
    }
  }

  async afterBulkRemove(
    context: Context,
    repository: Repository<Product>,
    affectedCount: number,
    where: any,
  ) {
    // Clear related caches
    if (affectedCount > 0) {
      await this.cacheService.invalidatePattern('products:*');
    }

    // Update analytics
    await this.analyticsService.recordBulkOperation('remove', affectedCount);
  }

  async bulkArchiveExpiredProducts(
    context: Context,
  ): Promise<{ affected: number }> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return this.bulkRemove(context, {
      status: 'inactive',
      lastUsedAt: { _lt: thirtyDaysAgo },
    });
  }
}
```

### Complete Controller Implementation

```typescript
import {
  CrudControllerFrom,
  CrudControllerStructure,
} from '@solid-nestjs/rest-api';
import {
  UseGuards,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiBody, ApiResponse, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard, AdminGuard } from '../guards';
import { ProductsService } from './products.service';
import { serviceStructure } from './products.service';

export const controllerStructure = CrudControllerStructure({
  ...serviceStructure,
  serviceType: ProductsService,
  operations: {
    findAll: {
      summary: 'Get all products',
      description: 'Retrieve all products with filtering and pagination',
    },
    create: {
      summary: 'Create product',
      description: 'Create a new product',
      decorators: [() => UseGuards(AdminGuard)],
    },
    update: {
      decorators: [() => UseGuards(AdminGuard)],
    },
    remove: {
      summary: 'Remove product',
      description: 'Soft delete a product (default behavior)',
      decorators: [() => UseGuards(AdminGuard)],
    },
    softRemove: {
      summary: 'Soft remove product',
      description: 'Explicitly soft delete a product',
      decorators: [() => UseGuards(AdminGuard)],
    },
    hardRemove: {
      summary: 'Hard remove product',
      description: 'Permanently delete a product',
      decorators: [() => UseGuards(AdminGuard)],
    },
    recover: {
      summary: 'Recover product',
      description: 'Restore a soft-deleted product',
      decorators: [() => UseGuards(AdminGuard)],
    },
  },
  classDecorators: [() => UseGuards(JwtAuthGuard)],
});

export class ProductsController extends CrudControllerFrom(
  controllerStructure,
) {
  // Custom query endpoints
  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Get products by category' })
  @ApiParam({ name: 'categoryId', description: 'Category ID' })
  async findByCategory(
    @Param('categoryId') categoryId: string,
    @CurrentUser() user: any,
  ): Promise<Product[]> {
    const context = { user };
    return this.service.findAll(context, { category: { id: categoryId } });
  }

  // Custom bulk operations
  @Post('bulk')
  @ApiOperation({ summary: 'Bulk create products' })
  @ApiBody({ type: [CreateProductDto] })
  @UseGuards(AdminGuard)
  async bulkCreate(
    @CurrentContext() context: Context,
    @Body() createDtos: CreateProductDto[],
  ): Promise<{ ids: string[] }> {
    return this.service.bulkInsert(context, createDtos);
  }

  @Put('bulk/update-price-by-category')
  @ApiOperation({ summary: 'Bulk update product prices by category' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        categoryId: { type: 'string' },
        priceMultiplier: { type: 'number', minimum: 0 },
      },
    },
  })
  @UseGuards(AdminGuard)
  async bulkUpdatePriceByCategory(
    @CurrentContext() context: Context,
    @Body() updateDto: { categoryId: string; priceMultiplier: number },
  ): Promise<{ affected: number }> {
    return this.service.bulkUpdate(
      context,
      { priceMultiplier: updateDto.priceMultiplier },
      { category: { id: updateDto.categoryId } },
    );
  }

  @Delete('bulk/expired')
  @ApiOperation({ summary: 'Archive expired products' })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        affected: { type: 'number' },
      },
    },
  })
  @UseGuards(AdminGuard)
  async bulkArchiveExpired(
    @CurrentContext() context: Context,
  ): Promise<{ affected: number }> {
    return this.service.bulkArchiveExpiredProducts(context);
  }

  @Delete('bulk/remove-by-status')
  @ApiOperation({ summary: 'Bulk remove products by status' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['inactive', 'discontinued'] },
      },
    },
  })
  @UseGuards(AdminGuard)
  async bulkRemoveByStatus(
    @CurrentContext() context: Context,
    @Body() removeDto: { status: string },
  ): Promise<{ affected: number }> {
    const result = await this.service.bulkRemove(context, {
      status: removeDto.status,
    });
    return { affected: result.affected || 0 };
  }

  @Patch('bulk/recover-by-category')
  @ApiOperation({ summary: 'Bulk recover products by category' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        categoryId: { type: 'string' },
      },
    },
  })
  @UseGuards(AdminGuard)
  async bulkRecoverByCategory(
    @CurrentContext() context: Context,
    @Body() recoverDto: { categoryId: string },
  ): Promise<{ affected: number }> {
    const result = await this.service.bulkRecover(context, {
      category: { id: recoverDto.categoryId },
    });
    return { affected: result.affected || 0 };
  }
}
```

### GraphQL Resolver Implementation

```typescript
import { CrudResolverFrom, CrudResolverStructure } from '@solid-nestjs/graphql';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard, AdminGuard } from '../guards';
import { ProductsService } from './products.service';
import { serviceStructure } from './products.service';

export const resolverStructure = CrudResolverStructure({
  ...serviceStructure,
  serviceType: ProductsService,
  operations: {
    findAll: true,
    findOne: true,
    create: true,
    update: true,
    remove: true, // Soft delete by default
    softRemove: true, // Explicit soft delete
    hardRemove: true, // Hard delete
    recover: true, // Recovery operation
  },
});

@Resolver(() => Product)
@UseGuards(JwtAuthGuard)
export class ProductsResolver extends CrudResolverFrom(resolverStructure) {
  @Query(() => [Product])
  async productsByCategory(
    @Args('categoryId') categoryId: string,
    @CurrentUser() user: any,
  ): Promise<Product[]> {
    const context = { user };
    return this.service.findBy(context, {
      category: { id: recoverDto.categoryId },
    });
  }

  @Mutation(() => BulkInsertResponse)
  @UseGuards(AdminGuard)
  async bulkCreateProducts(
    @Args('input', { type: () => [CreateProductInput] })
    input: CreateProductInput[],
    @CurrentContext() context: Context,
  ): Promise<{ ids: string[] }> {
    return this.service.bulkInsert(context, input);
  }

  @Mutation(() => BulkOperationResponse)
  @UseGuards(AdminGuard)
  async bulkRemoveProductsByStatus(
    @Args('status') status: string,
    @CurrentContext() context: Context,
  ): Promise<{ affected: number }> {
    const result = await this.service.bulkRemove(context, { status });
    return { affected: result.affected || 0 };
  }

  @Mutation(() => BulkOperationResponse)
  @UseGuards(AdminGuard)
  async bulkRecoverProductsByCategory(
    @Args('categoryId') categoryId: string,
    @CurrentContext() context: Context,
  ): Promise<{ affected: number }> {
    const result = await this.service.bulkRecover(context, {
      category: { id: categoryId },
    });
    return { affected: result.affected || 0 };
  }
}
```

## Best Practices

1. **Type Safety**: Always use TypeScript with strict mode enabled
2. **Error Handling**: Implement proper error handling with custom exceptions
3. **Validation**: Use class-validator for input validation
4. **Security**: Apply guards and authentication at appropriate levels
5. **Performance**: Use appropriate database locks and transaction isolation levels
6. **Testing**: Write comprehensive unit and integration tests
7. **Documentation**: Keep API documentation up to date with Swagger

### Soft Deletion Best Practices

1. **Entity Design**: Always include a `deletedAt` column for entities that support soft deletion
2. **Cascade Configuration**: Configure cascade behavior for related entities to maintain data integrity
3. **Query Filtering**: Be explicit about including soft-deleted entities in queries when needed
4. **Recovery Validation**: Implement validation logic before recovering entities
5. **Audit Trails**: Log all soft deletion and recovery operations for compliance

### Bulk Operations Best Practices

1. **Transaction Management**: Always wrap bulk operations in transactions
2. **Performance Optimization**: Use appropriate batch sizes for large datasets
3. **Error Handling**: Implement proper error handling for partial failures
4. **Progress Tracking**: Provide progress feedback for long-running bulk operations
5. **Resource Management**: Monitor memory usage during bulk operations
6. **Validation**: Validate data before performing bulk operations
7. **Rollback Strategy**: Have a rollback plan for failed bulk operations

### Security Considerations

1. **Permission Checks**: Implement proper authorization for soft deletion and bulk operations
2. **Rate Limiting**: Apply rate limiting to bulk operation endpoints
3. **Input Validation**: Validate all input parameters for bulk operations
4. **Audit Logging**: Log all bulk operations for security auditing
5. **Data Sanitization**: Sanitize data before bulk operations

For more examples and detailed guides, see the [examples directory](../apps-examples/) and [main documentation](../README.md).
