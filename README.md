# @nestjz/typeorm-crud

A powerful and flexible TypeORM CRUD utilities package for NestJS applications that provides mixins for quick implementation of data access and CRUD operations.

## Features

- 🚀 Easy-to-use mixins for CRUD operations
- 🔍 Advanced query building with filtering, pagination and sorting
- 🔒 Transaction support
- 📝 Comprehensive type safety
- 🎯 Built-in OpenAPI (Swagger) documentation
- 🔄 Relation handling and extended queries
- 🛡️ Input validation using class-validator
- 📦 Clean architecture with separation of concerns

## Installation

```bash
npm install @nestjz/typeorm-crud
```

## Usage

### Creating a CRUD Service

```typescript
import { CrudServiceFrom, ICrudServiceStructure } from '@nestjz/typeorm-crud';

// Define your service structure
const serviceStructure: ICrudServiceStructure<number, YourEntity, CreateDto, UpdateDto> = {
  entityType: YourEntity,
  createInputType: CreateDto,
  updateInputType: UpdateDto
};

// Create the service
export class YourService extends CrudServiceFrom(serviceStructure) {
  // Add custom methods here
}
```

### Creating a CRUD Controller

```typescript
import { CrudControllerFrom, ICrudControllerStructure } from '@nestjz/typeorm-crud';

// Define your controller structure
const controllerStructure: ICrudControllerStructure<number, YourEntity, CreateDto, UpdateDto> = {
  entityType: YourEntity,
  serviceType: YourService,
  createInputType: CreateDto,
  updateInputType: UpdateDto
};

// Create the controller
@Controller('your-route')
export class YourController extends CrudControllerFrom(controllerStructure) {
  // Add custom endpoints here
}
```

## Query Features

### Filtering

The package supports advanced filtering operations:

- Equality: `_eq`, `_neq`
- Comparison: `_gt`, `_gte`, `_lt`, `_lte`
- Lists: `_in`
- Ranges: `_between`, `_notbetween`
- Text search: `_contains`, `_startswith`, `_endswith`
- Pattern matching: `_like`, `_notlike`

### Pagination

```typescript
{
  pagination: {
    page: 1,
    pageSize: 10
    // or
    skip: 0,
    take: 10
  }
}
```

### Sorting

```typescript
{
  orderBy: [
    { field: "ASC" },
    { anotherField: "DESC" }
  ]
}
```

## Transactions

Use the `@Transactional()` decorator to wrap operations in a transaction:

```typescript
@Transactional()
async yourMethod() {
  // Operations will be executed in a transaction
}
```

## Documentation

The package automatically generates OpenAPI (Swagger) documentation for your endpoints using `@ApiResponses()` decorator.

## License

MIT License - see the [LICENSE](LICENSE) file for details.