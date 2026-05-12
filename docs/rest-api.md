# REST API

The `@solid-nestjs/rest-api` package provides controller mixins, Swagger/OpenAPI integration, args helpers, decorators, and query pipes for building RESTful CRUD APIs with minimal code.

## Controller Mixins

### `CrudControllerFrom(structure)`

Generates a full CRUD controller with standard REST endpoints:

```typescript
import { CrudControllerFrom } from '@solid-nestjs/rest-api';
import { ProductService } from '../services/product.service';
import { Product } from '../entities/product.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { FindProductArgs } from '../dto/args/find-product-args.dto';

export const ProductController = CrudControllerFrom({
  entityType: Product,
  createInputType: CreateProductDto,
  updateInputType: UpdateProductDto,
  findArgsType: FindProductArgs,
  service: ProductService,
  route: 'products',
  operations: {
    create: true,
    update: true,
    remove: true,
    hardRemove: false,
    softRemove: true,
    recover: true,
  },
  entityId: {
    type: String,
    pipeTransforms: [],  // e.g. ParseUUIDPipe
  },
});
```

### `DataControllerFrom(structure)`

Generates a read-only data controller (no POST/PATCH/DELETE):

```typescript
import { DataControllerFrom } from '@solid-nestjs/rest-api';

export const ProductDataController = DataControllerFrom({
  entityType: Product,
  serviceType: ProductDataService,
  findArgsType: FindProductArgs,
  groupByArgsType: GroupedProductArgs,
  route: 'products',
  operations: {
    findAll: true,
    findOne: true,
    pagination: true,
    findAllGrouped: true,
  },
});
```

### CrudControllerStructure Config

```typescript
CrudControllerStructure({
  entityType,             // The @Entity class
  createInputType,        // Create DTO class
  updateInputType,        // Update DTO class
  service,                // Service class reference (injected)
  findArgsType?,          // Find args type (optional, default: DefaultArgs)
  groupByArgsType?,       // GroupBy args type (enables findAllGrouped)
  route?: string,         // URL prefix (default: entity name lowercase + 's')
  operations?: {
    create?: boolean | OperationStructure,
    update?: boolean | OperationStructure,
    remove?: boolean | OperationStructure,
    hardRemove?: boolean | OperationStructure,
    softRemove?: boolean | OperationStructure,
    recover?: boolean | OperationStructure,
    findAll?: boolean | OperationStructure,
    findOne?: boolean | OperationStructure,
    pagination?: boolean | OperationStructure,
    findAllGrouped?: boolean | OperationStructure,
  },
  classDecorators?: ClassDecorator[],
  parameterDecorators?: {
    context?: ParameterDecorator,
  },
  entityId?: {
    type: Number | String | Object,
    pipeTransforms: Type<PipeTransform>[],
  },
})
```

## Auto-Generated Endpoints

Given `ProductsController = CrudControllerFrom({ route: 'products', ... })`:

| Method | Route | Description |
|---|---|---|
| `GET` | `/products` | List all records with query args (`?where[name][contains]=foo`) |
| `GET` | `/products/pagination` | Paginated list with metadata |
| `GET` | `/products/:id` | Retrieve single record by ID |
| `POST` | `/products` | Create new record |
| `PUT` | `/products/:id` | Full update of record |
| `DELETE` | `/products/:id` | Soft-delete record |
| `DELETE` | `/products/hard/:id` | Hard-delete record (disabled by default) |
| `PATCH` | `/products/recover/:id` | Recover a soft-deleted record |
| `GET` | `/products/groups` | Grouped query with aggregates |

### HTTP Request Examples

```bash
# List with filters and ordering
GET /products?where[name][contains]=Widget&orderBy[createdAt]=DESC&page=1&limit=20

# Pagination
GET /products/pagination?page=1&limit=10

# Get by ID
GET /products/abc-123

# Create
POST /products
Content-Type: application/json
{ "name": "New Widget", "price": 29.99, "stock": 100 }

# Update
PUT /products/abc-123
Content-Type: application/json
{ "price": 24.99 }

# Soft delete
DELETE /products/abc-123

# Recover
PATCH /products/recover/abc-123
```

## Swagger / OpenAPI Integration

The package integrates with `@nestjs/swagger` to auto-generate OpenAPI documentation:

- `@ApiTags` from the route name
- `@ApiOperation` with summary/description per endpoint
- `@ApiParam` for `:id` parameters
- `@ApiBody` with DTO type for POST/PUT
- `@ApiQuery` for pagination parameters
- Response schemas via `@ApiResponses` composite decorator

Enable Swagger in your `main.ts`:

```typescript
const swaggerConfig = new DocumentBuilder()
  .setTitle('Products API')
  .setVersion('1.0')
  .build();
const document = SwaggerModule.createDocument(app, swaggerConfig);
SwaggerModule.setup('api', app, document);
```

Visit `http://localhost:3000/api` to browse the interactive docs.

## Swagger Adapter

When using SOLID decorators on entities/DTOs, the Swagger adapter auto-applies:

- `@ApiProperty()` on entity/DTO properties with metadata from the entity
- `@ApiPropertyOptional()` for optional fields
- Proper type mapping for `@ApiProperty({ type: ... })`

This means your entity `@ApiProperty` metadata flows through to generated DTOs automatically.

## `@ApiResponses()` Composite Decorator

Defines multiple success and error response schemas in a single decorator:

```typescript
import { ApiResponses } from '@solid-nestjs/rest-api';

@Get()
@ApiResponses({
  type: Product,
  isArray: true,
  successCodes: [HttpStatus.OK],
  errorCodes: [HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND],
})
async findAll() { ... }
```

Expands to individual `@ApiResponse()` decorators for each status code, using `ErrorResponse` as the standard error type:

```json
{
  "statusCode": 400,
  "message": "error message",
  "error": "Bad Request"
}
```

## `@TransformFromJson()` Decorator

Parses a JSON string property into its object form during class-transformer deserialization:

```typescript
import { TransformFromJson } from '@solid-nestjs/rest-api';

class ConfigDto {
  @TransformFromJson()
  data: Record<string, any>;
}

// Input:  { "data": "{\"key\":\"value\"}" }
// Result: { data: { key: "value" } }
```

Useful for query parameters or form data that arrive as JSON strings.

## Pipes for Query Parameter Transformation

The framework includes validation pipes used in auto-generated controllers:

| Pipe | Query Param | Usage |
|---|---|---|
| `ParseIntPipe` | `?page=1` | Converts string → number |
| `ParseUUIDPipe` | `/:id` | Validates UUID format |
| `ParseBoolPipe` | `?active=true` | Converts string → boolean |
| `ValidationPipe` | `@Body()` | Validates DTO with class-validator |
| `QueryTransformPipe` | `@Query()` | Transforms query string args |

The ID pipe is configured via `entityId.pipeTransforms`:

```typescript
entityId: {
  type: String,
  pipeTransforms: [ParseUUIDPipe],  // for UUID primary keys
}

entityId: {
  type: Number,
  pipeTransforms: [ParseIntPipe],   // default for numeric IDs
}
```

## Operation Configuration

Each operation supports per-endpoint customization:

```typescript
operations: {
  create: {
    route: 'new',                       // custom sub-route
    title: 'Create Product',
    description: 'Creates a new product in the catalog',
    successCode: HttpStatus.CREATED,
    decorators: [UseGuards(AdminGuard)], // additional decorators
  },
  remove: {
    decorators: [UseGuards(OwnerGuard)],
  },
  hardRemove: false,                    // disabled entirely
}
```

The `OperationStructure` type supports: `route`, `title`, `description`, `successCode`, `successCodes`, `errorCodes`, `operationId`, `decorators`.

## Custom Endpoints Alongside Auto-Generated Ones

Extend the generated class with additional endpoints:

```typescript
const ProductControllerBase = CrudControllerFrom({ ... });

@Controller('products')
export class ProductController extends ProductControllerBase {
  @Post(':id/activate')
  @ApiOperation({ summary: 'Activate product' })
  async activate(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.activate(id);
  }
}
```

## Full Controller Module Example

```typescript
// products.module.ts
import { Module } from '@nestjs/common';
import { CrudControllerFrom } from '@solid-nestjs/rest-api';
import { ProductService } from './services/product.service';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FindProductArgs } from './dto/args/find-product-args.dto';

const ProductController = CrudControllerFrom({
  entityType: Product,
  createInputType: CreateProductDto,
  updateInputType: UpdateProductDto,
  findArgsType: FindProductArgs,
  service: ProductService,
  route: 'products',
  operations: {
    create: true,
    update: true,
    remove: true,
    softRemove: true,
    recover: true,
  },
});

@Module({
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductsModule {}
```

## PaginationResult

The REST `PaginationResult` class (auto-returned by the `pagination` endpoint):

```json
{
  "data": [ { "id": 1, "name": "Widget", ... } ],
  "total": 150,
  "count": 20,
  "page": 1,
  "limit": 20,
  "pageCount": 8,
  "hasNextPage": true,
  "hasPreviousPage": false
}
```

## Grouped Results

When `findAllGrouped` is enabled with a `groupByArgsType`:

```
GET /products/groups?groupBy[fields][category]=true&groupBy[aggregates][0][field]=price&groupBy[aggregates][0][function]=AVG
```

Returns paginated grouped results with aggregates (count, sum, avg, min, max).

## Related Docs

- [DTO Generation](./dto-generation.md) — createWhereFields, createOrderByFields, GenerateDtoFromEntity
- [GraphQL Features](./graphql.md)
- [Hybrid REST + GraphQL](./hybrid.md)
