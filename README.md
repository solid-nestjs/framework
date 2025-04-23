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
async controllerMethod() {
  // Operations will be executed in a transaction
}
```

## Documentation

The package automatically generates OpenAPI (Swagger) documentation for your endpoints using `@ApiResponses()` decorator.

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Roadmap

### Current Progress
- [x] Basic CRUD operations implementation
- [x] Filtering capabilities
- [x] Basic sorting functionality
- [x] Basic pagination support
- [x] OpenAPI (Swagger) documentation
- [x] Transaction support
- [x] Input validation
- [x] Basic relation handling

### [0.2.0] - Enhanced Data Retrieval
- [ ] Entity Id Type automatic detection.
  - currently If the PrimaryKeyType is not specified it's taken as int by default, it should be inferred by the EntityType.
  - supporting PrimaryKeyType inference means that it also should be a mapper that resolves what pipeTransform must be used for the controller retrieval of the PK from the query.
- [ ] Enhanced pagination
  - Return both data and pagination metadata in single response
  - Fix pagination calculations for relations with one-to-many/many-to-many cardinality
- [ ] Advanced relation handling
  - Configurable relation loading through request parameters
  - Enable/disable specific relations at service level
  - Optimize relation loading performance
- [ ] Implement bulk operations
- [ ] Query optimization improvements
  - Query caching options

### [0.3.0] - Architecture & GraphQL Support
- [ ] Architecture enhancements
  - Decouple data layer from presentation layer
  - Create separate package for REST utilities (@nestjz/rest)
  - Create separate package for TypeORM utilities (@nestjz/typeorm)
- [ ] GraphQL support
  - Create GraphQL-specific package (@nestjz/graphql)
  - GraphQL-optimized resolvers
  - GraphQL-specific decorators
- [ ] Comprehensive documentation