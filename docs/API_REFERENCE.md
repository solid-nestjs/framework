# API Reference

This document provides detailed API documentation for the SOLID NestJS Framework.

## Table of Contents

- [Common Package](#common-package)
- [TypeORM Package](#typeorm-package)
- [REST API Package](#rest-api-package)
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
  remove(context: Context, id: string): Promise<T>;
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
  HARD_REMOVE = 'hardRemove'
}
```

#### `OrderByType`

Sort order types.

```typescript
enum OrderByType {
  ASC = 'ASC',
  DESC = 'DESC'
}
```

## TypeORM Package

### Service Mixins

#### `CrudServiceFrom(structure)`

Creates a service class with CRUD operations based on the provided structure.

```typescript
function CrudServiceFrom<T>(
  structure: CrudServiceStructure<T>
): Constructor<ICrudService<T>>;
```

**Parameters:**
- `structure`: Service configuration structure

**Returns:** Service class constructor

#### `DataServiceFrom(structure)`

Creates a data service class for database operations.

```typescript
function DataServiceFrom<T>(
  structure: DataServiceStructure<T>
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
    [key: string]: boolean | {
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
  hardRemove?: OperationConfig;
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
  structure: CrudControllerStructure<T>
): Constructor<ICrudController<T>>;
```

#### `DataControllerFrom(structure)`

Creates a data controller for REST operations.

```typescript
function DataControllerFrom<T>(
  structure: DataControllerStructure<T>
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
  hardRemove?: boolean | OperationDefinition;
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
  total: number
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

### Query Builder Utilities

#### `buildWhereClause(filter, alias)`

Builds WHERE clause from filter input.

```typescript
function buildWhereClause(
  filter: FilterInput,
  alias: string
): string;
```

#### `buildOrderClause(orderBy, alias)`

Builds ORDER BY clause from order input.

```typescript
function buildOrderClause(
  orderBy: OrderByInput,
  alias: string
): string;
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
    maxLimit: 100
  },
  relations: {
    maxDepth: 3
  },
  transactions: {
    isolationLevel: 'READ_COMMITTED' as const
  },
  locks: {
    timeout: 10000
  }
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
    relations: {
      supplier: true,
      category: true
    }
  },
  functions: {
    create: {
      transactional: true,
      isolationLevel: 'READ_COMMITTED'
    },
    update: {
      transactional: true,
      lockMode: 'pessimistic_write'
    }
  }
});

export class ProductsService extends CrudServiceFrom(serviceStructure) {
  async findByCategory(context: Context, categoryId: string): Promise<Product[]> {
    return this.findAll(context, {
      where: { category: { id:categoryId } }
    });
  }
}
```

### Complete Controller Implementation

```typescript
import { CrudControllerFrom, CrudControllerStructure } from '@solid-nestjs/rest-api';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard, AdminGuard } from '../guards';
import { ProductsService } from './products.service';
import { serviceStructure } from './products.service';

export const controllerStructure = CrudControllerStructure({
  ...serviceStructure,
  serviceType: ProductsService,
  operations: {
    findAll: {
      summary: 'Get all products',
      description: 'Retrieve all products with filtering and pagination'
    },
    create: {
      summary: 'Create product',
      description: 'Create a new product',
      decorators: [() => UseGuards(AdminGuard)]
    },
    update: {
      decorators: [() => UseGuards(AdminGuard)]
    },
    remove: {
      decorators: [() => UseGuards(AdminGuard)]
    }
  },
  classDecorators: [() => UseGuards(JwtAuthGuard)]
});

export class ProductsController extends CrudControllerFrom(controllerStructure) {
  @Get('category/:categoryId')
  async findByCategory(
    @Param('categoryId') categoryId: string,
    @CurrentUser() user: any
  ): Promise<Product[]> {
    const context = { user };
    return this.service.findByCategory(context, categoryId);
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

For more examples and detailed guides, see the [examples directory](../examples/) and [main documentation](../README.md).
