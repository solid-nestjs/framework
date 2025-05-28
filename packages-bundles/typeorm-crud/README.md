# @solid-nestjs/typeorm-crud

Complete SOLID NestJS TypeORM CRUD bundle that includes all necessary packages for building TypeORM-based CRUD APIs.

## What's Included

This bundle automatically installs and exports:

- `@solid-nestjs/common` - Core utilities and interfaces
- `@solid-nestjs/typeorm` - TypeORM integration utilities  
- `@solid-nestjs/rest-api` - REST API CRUD controllers and services

## Installation

```bash
npm install @solid-nestjs/typeorm-crud
```
## Quick Start

### Service
```typescript
import { CrudServiceFrom, CrudServiceStructure } from '@solid-nestjs/typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto, UpdateProductDto } from './dto';

export const serviceStructure = CrudServiceStructure({
  entityType: Product,
  createInputType: CreateProductDto,
  updateInputType: UpdateProductDto,
});

export class ProductsService extends CrudServiceFrom(serviceStructure){
  
  // Automatically provides:
  // findAll, findOne, create, update, delete methods
  // with TypeORM repository integration
}
```

### Controller
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

## Documentation

For complete documentation, visit: [SOLID NestJS Framework Documentation](https://github.com/solid-nestjs/framework)

## Individual Packages

If you prefer to install packages individually:

- `@solid-nestjs/common` - Core utilities
- `@solid-nestjs/typeorm` - TypeORM integration
- `@solid-nestjs/rest-api` - REST API generation

## License

MIT