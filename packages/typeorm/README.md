# @solid-nestjs/typeorm

TypeORM utilities for the SOLID NestJS framework. This package provides mixins and decorators for building services with automatic CRUD operations using TypeORM.

## Installation

```bash
npm install @solid-nestjs/typeorm @solid-nestjs/common typeorm
```

## Features

- **CRUD Service Mixin**: Automatically generates service methods for CRUD operations
- **Data Service Mixin**: Base service functionality for data handling
- **TypeORM decorators**: Custom decorators for TypeORM integration
- **Type-safe interfaces**: TypeScript interfaces for database operations
- **Query helpers**: Utilities for building TypeORM queries

## Quick Start

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

## Main Exports

### Mixins
- `CrudService.Mixin` - Complete CRUD service with TypeORM
- `DataService.Mixin` - Base data service functionality

### Interfaces
- Database operation interfaces
- Query result types
- Service configuration options

### Decorators
- TypeORM-specific decorators
- Database operation helpers

### Types
- TypeORM utility types
- Database query types
- Entity relationship types

For complete documentation, examples, and advanced usage, see the [main framework documentation](https://github.com/solid-nestjs/framework).

## License

MIT
