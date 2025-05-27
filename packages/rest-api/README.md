# @solid-nestjs/rest-api

REST API utilities for the SOLID NestJS framework. This package provides mixins and decorators for building REST controllers with automatic CRUD operations.

## Installation

```bash
npm install @solid-nestjs/rest-api @solid-nestjs/common
```

## Features

- **CRUD Controller Mixin**: Automatically generates REST endpoints for CRUD operations
- **Data Controller Mixin**: Base controller functionality for data handling
- **Find Args Mixin**: Query parameter handling and validation
- **REST-specific decorators**: Custom decorators for REST API development
- **Type-safe interfaces**: TypeScript interfaces for REST API structures

## Quick Start

```typescript
import { CrudControllerFrom, CrudControllerStructure } from '@solid-nestjs/typeorm-crud';
import { ProductsService, serviceStructure } from './products.service';

const controllerStructure = CrudControllerStructure({
    entityType: Product,
    createInputType: CreateProductDto,
    updateInputType: UpdateProductDto,
    serviceType:ProductsService,
});

export class ProductsController extends CrudControllerFrom(controllerStructure) {
  // Automatically provides:
  // GET /users - findAll
  // GET /users/:id - findOne
  // POST /users - create
  // PUT /users/:id - update
  // DELETE /users/:id - delete
}
```

## Main Exports

### Mixins
- `CrudController.Mixin` - Complete CRUD REST controller
- `DataController.Mixin` - Base data controller functionality
- `FindArgsMixin` - Query parameter handling

### Interfaces
- REST API interfaces and types
- Request/response structures
- Query parameter definitions

### Decorators
- Custom REST API decorators
- Route configuration helpers

### Classes
- Base controller classes
- Utility classes for REST operations

## Documentation

For complete documentation, examples, and advanced usage, see the [main framework documentation](https://github.com/solid-nestjs/framework).

## License

MIT
