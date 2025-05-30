# @solid-nestjs/rest-api

Core REST API utilities for the SOLID NestJS framework. This package provides controller mixins, decorators, and filtering utilities for building type-safe REST APIs with automatic CRUD endpoints and advanced query capabilities.

## 🚀 Features

- **🎯 Auto-generated Controllers** - Instant REST controllers with full CRUD endpoints
- **🔍 Advanced Filtering** - Type-safe query parameter filtering with multiple operators
- **📄 Pagination Support** - Built-in pagination with metadata
- **🛡️ Input Validation** - Integrated validation with class-validator
- **📝 OpenAPI Integration** - Automatic Swagger documentation generation
- **🎨 Customizable Endpoints** - Enable/disable specific operations
- **🔧 Query Parameter Handling** - Advanced query parameter parsing and validation
- **⚡ Performance Optimized** - Efficient query building and execution

## 📦 Installation

```bash
npm install @solid-nestjs/rest-api @solid-nestjs/common
```

## 🏗️ Quick Start

### 1. Create Controller Structure

```typescript
import {
  CrudControllerFrom,
  CrudControllerStructure,
} from '@solid-nestjs/rest-api';
import { ProductsService, serviceStructure } from './products.service';

const controllerStructure = CrudControllerStructure({
  ...serviceStructure,
  serviceType: ProductsService,
});

@Controller('products')
export class ProductsController extends CrudControllerFrom(
  controllerStructure,
) {
  // Automatically provides:
  // GET    /products        - findAll with filtering/pagination
  // GET    /products/:id    - findOne
  // POST   /products        - create
  // PUT    /products/:id    - update
  // DELETE /products/:id    - remove (soft delete)
}
```

### 2. Generated Endpoints

The controller automatically creates these endpoints:

#### `GET /products` - Find All with Filtering

The framework supports complex filtering with multiple operators:

### Basic Filtering

```bash
# Filter by name
GET /products?where={"name":{"_contains":"laptop"}}}

# Filter by price range
GET /products?where={"price":{"_gte":100, "_lte":1000}}

# Filter with multiple conditions
GET /products?where={"name":{"_contains":"laptop"}},"price":{"_gte":100, "_lte":1000}}
```

### Logical Operators

```bash
# OR conditions
GET /products?where={"name":{"_contains":"laptop"}},"_or":[{"name":{"_eq":"iphone"}}]}

# AND conditions (default)
GET /products?where={"price":{"_lt":1000}},"_and":[{"name":{"_eq":"iphone"}}]}

# Complex nested conditions
GET /products?where={"price":{"_lt":1000}},"_and":[{"name":{"_eq":"iphone"},"_and":[{ "_stock":{"_gt":10} }]}]}
```

### Available Filter Operators

**String Filters:**

- `_eq` - Equals
- `_ne` - Not equals
- `_contains` - Contains substring
- `_startsWith` - Starts with
- `_endsWith` - Ends with
- `_in` - In array
- `_notIn` - Not in array

**Number Filters:**

- `_eq` - Equals
- `_ne` - Not equals
- `_gt` - Greater than
- `_gte` - Greater than or equal
- `_lt` - Less than
- `_lte` - Less than or equal
- `_in` - In array
- `_notIn` - Not in array

### Sorting

```bash
# Sort by single field
GET /products?orderBy=[{"price":"DESC"}]

# Sort by multiple fields
GET /products?orderBy=[{"price":"DESC"},{"stock":"ASC"}]
```

### Pagination

```bash
# Basic pagination
GET /products/pagination?pagination={"page":1,"limit":10}

# With filtering and sorting
GET /products/pagination?where={"price":{"_lt":1000}},"_and":[{"name":{"_eq":"iphone"}}]}&pagination={"page":1,"limit":10}
```

#### `GET /products/:id` - Find One

```bash
GET /products/123
```

#### `POST /products` - Create

```bash
POST /products
Content-Type: application/json

{
  "name": "Gaming Laptop",
  "price": 1299.99,
  "supplierId": 456
}
```

#### `PUT /products/:id` - Update

```bash
PUT /products/123
Content-Type: application/json

{
  "name": "Updated Gaming Laptop",
  "price": 1199.99
}
```

#### `DELETE /products/:id` - Remove

```bash
DELETE /products/123
```

## 🔧 Advanced Configuration

### Custom Operations

```typescript
const controllerStructure = CrudControllerStructure({
  ...serviceStructure,
  serviceType: ProductsService,
  operations: {
    create: true,
    update: true,
    remove: true,
    hardRemove: false, // Disable hard delete endpoint
    findAll: {
      name: 'getAllProducts',
      summary: 'Retrieve all products with filtering',
    },
    findOne: {
      summary: 'Get product by ID',
    },
  },
});
```

### Query Parameter Types

Create type-safe query parameter classes:

```typescript
import { FindArgsFrom } from '@solid-nestjs/rest-api';
import { Product } from './entities/product.entity';

export class FindProductArgs extends FindArgsFrom(Product) {
  // Automatically includes filtering, pagination, and sorting
  // for all Product entity fields
}
```

### Custom Query Parameters

```typescript
export class FindProductArgs extends FindArgsFrom(Product) {
  @ApiPropertyOptional()
  @IsOptional()
  featured?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value.split(','))
  tags?: string[];
}
```

## 📊 API Reference

### Core Functions

#### `CrudControllerFrom(structure)`

Creates a controller class with full CRUD endpoints.

```typescript
function CrudControllerFrom<T>(
  structure: CrudControllerStructure<T>,
): Constructor<CrudController<T>>;
```

#### `DataControllerFrom(structure)`

Creates a controller class with read-only endpoints.

```typescript
function DataControllerFrom<T>(
  structure: DataControllerStructure<T>,
): Constructor<DataController<T>>;
```

#### `CrudControllerStructure(config)`

Configuration builder for CRUD controllers.

```typescript
function CrudControllerStructure<T>(
  config: CrudControllerStructureConfig<T>,
): CrudControllerStructure<T>;
```

#### `FindArgsFrom(entityClass)`

Creates query parameter class with filtering capabilities.

```typescript
function FindArgsFrom<T>(entityClass: Constructor<T>): Constructor<FindArgs<T>>;
```

### Filter Classes

#### `StringFilter`

Filter input type for string fields with operators like contains, startsWith, etc.

#### `NumberFilter`

Filter input type for numeric fields with operators like gt, gte, lt, lte, etc.

#### `DateFilter`

Filter input type for date fields with operators for date comparisons.

### Response Types

#### `PaginationResult<T>`

Pagination metadata included with paginated responses.

```typescript
interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pageCount: number;
  };
}
```

## 🛠️ Integration Examples

### With Swagger/OpenAPI

```typescript
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('products')
@Controller('products')
export class ProductsController extends CrudControllerFrom(
  controllerStructure,
) {
  @ApiOperation({ summary: 'Get featured products' })
  @Get('featured')
  async getFeatured() {
    return this.service.findAll({}, { where: { featured: true } });
  }
}
```

### Custom Endpoints

```typescript
@Controller('products')
export class ProductsController extends CrudControllerFrom(
  controllerStructure,
) {
  @Get('search')
  async search(@Query('q') query: string) {
    return this.service.findAll(
      {},
      {
        where: [
          { name: Like(`%${query}%`) },
          { description: Like(`%${query}%`) },
        ],
      },
    );
  }

  @Post(':id/activate')
  async activate(@Param('id') id: number) {
    return this.service.update({}, id, { active: true });
  }
}
```

## 🔗 Related Packages

- **[@solid-nestjs/typeorm-crud](https://github.com/solid-nestjs/framework/tree/master/packages-bundles/typeorm-crud)** - Complete TypeORM + REST API bundle
- **[@solid-nestjs/typeorm-hybrid-crud](https://github.com/solid-nestjs/framework/tree/master/packages-bundles/typeorm-hybrid-crud)** - Complete REST + GraphQL bundle
- **[@solid-nestjs/typeorm](https://github.com/solid-nestjs/framework/tree/master/packages-core/typeorm)** - TypeORM service utilities
- **[@solid-nestjs/common](https://github.com/solid-nestjs/framework/tree/master/packages-core/common)** - Shared utilities and interfaces
- **[@solid-nestjs/rest-graphql](https://github.com/solid-nestjs/framework/tree/master/packages-core/rest-graphql)** - Hybrid REST/GraphQL utilities

## 📝 Example Projects

See the [examples directory](https://github.com/solid-nestjs/framework/tree/master/apps-examples) for complete working applications:

- **[simple-crud-app](https://github.com/solid-nestjs/framework/tree/master/apps-examples/simple-crud-app)** - REST API with TypeORM
- **[simple-hybrid-crud-app](https://github.com/solid-nestjs/framework/tree/master/apps-examples/simple-hybrid-crud-app)** - Hybrid REST + GraphQL API

For complete documentation and tutorials, visit the [main framework documentation](https://github.com/solid-nestjs/framework).

## 📄 License

MIT
