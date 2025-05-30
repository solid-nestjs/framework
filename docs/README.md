# SOLID NestJS Framework Documentation

Welcome to the comprehensive documentation for the SOLID NestJS Framework! This collection of guides will help you master building scalable, type-safe NestJS applications with automatic CRUD generation.

## 📚 Documentation Structure

### Getting Started

- **[README](../README.md)** - Framework overview and quick start guide
- **[Examples & Tutorials](EXAMPLES.md)** - Step-by-step tutorials and real-world examples
- **[Migration Guide](MIGRATION_GUIDE.md)** - Upgrade between versions and migrate from other frameworks

### Reference & Advanced Topics

- **[API Reference](API_REFERENCE.md)** - Comprehensive API documentation
- **[Architecture Decisions](ARCHITECTURE.md)** - Framework design decisions and rationale
- **[Troubleshooting](TROUBLESHOOTING.md)** - Common issues and solutions

### Contributing

- **[Contributing Guide](../CONTRIBUTING.md)** - How to contribute to the framework

## 🚀 Quick Navigation

### New to SOLID NestJS?

1. Start with the [Framework Overview](../README.md#-overview)
2. Follow the [Quick Start Guide](../README.md#️-quick-start)
3. Try the [Basic Tutorial](EXAMPLES.md#tutorial-1-building-your-first-crud-api)

### Building Your First App?

1. [Tutorial: Building Your First CRUD API](EXAMPLES.md#tutorial-1-building-your-first-crud-api)
2. [Tutorial: Adding Relations](EXAMPLES.md#tutorial-2-adding-relations)
3. [Advanced Examples](EXAMPLES.md#advanced-examples)

### Looking for Specific Information?

- **Types & Interfaces**: [API Reference - Types and Interfaces](API_REFERENCE.md#types-and-interfaces)
- **Service Configuration**: [API Reference - TypeORM Package](API_REFERENCE.md#typeorm-package)
- **Controller Setup**: [API Reference - REST API Package](API_REFERENCE.md#rest-api-package)
- **Common Issues**: [Troubleshooting Guide](TROUBLESHOOTING.md)

### Migrating or Upgrading?

- **From v0.1.x to v0.2.x**: [Migration Guide](MIGRATION_GUIDE.md#from-v01x-to-v02x)
- **From @nestjsx/crud**: [Migration Guide](MIGRATION_GUIDE.md#from-nestjs-crud-nestjsxcrud)
- **Breaking Changes**: [Migration Guide - Breaking Changes](MIGRATION_GUIDE.md#breaking-changes)

## 🎯 Framework Features

### Core Capabilities

- ✅ **Auto-generated CRUD Operations** - Services and controllers with full CRUD functionality
- ✅ **Advanced Query System** - Filtering, pagination, sorting, and relation handling
- ✅ **Transaction Support** - Built-in transaction management with isolation levels
- ✅ **Type Safety** - Full TypeScript support with comprehensive type definitions
- ✅ **OpenAPI Integration** - Automatic Swagger documentation generation

### Advanced Features

- ✅ **Flexible Relations** - Easy configuration of entity relationships and eager loading
- ✅ **Input Validation** - Integrated class-validator support
- ✅ **Modular Architecture** - Clean separation following SOLID principles
- ✅ **Extensible Design** - Easy to extend and customize for specific needs
- ✅ **Soft Delete Support** - Built-in soft delete functionality

## 📦 Package Overview

The framework is organized into focused packages:

### `@solid-nestjs/common`

Common utilities, interfaces, and decorators shared across all packages.

**Key exports:**

- `Context` - Request context interface
- `FindArgs` - Generic query arguments type
- Base interfaces and types

### `@solid-nestjs/typeorm`

TypeORM-specific service implementations and utilities.

**Key exports:**

- `CrudServiceFrom()` - Service mixin factory
- `CrudServiceStructure()` - Service configuration builder
- `DataServiceFrom()` - Data service mixin factory

### `@solid-nestjs/rest-api`

REST API controller implementations with Swagger integration.

**Key exports:**

- `CrudControllerFrom()` - Controller mixin factory
- `CrudControllerStructure()` - Controller configuration builder
- `FindArgsMixin()` - Query arguments mixin

## 🏗️ Architecture Overview

The framework follows a **composition-over-inheritance** approach using mixins:

```typescript
// 1. Define structure configuration
export const serviceStructure = CrudServiceStructure({
  entityType: Product,
  createInputType: CreateProductDto,
  updateInputType: UpdateProductDto,
  findArgsType: FindProductArgs,
});

// 2. Create service using mixin
export class ProductsService extends CrudServiceFrom(serviceStructure) {
  // Inherits all CRUD operations + custom methods
}

// 3. Create controller using mixin
export const controllerStructure = CrudControllerStructure({
  ...serviceStructure,
  serviceType: ProductsService,
});

export class ProductsController extends CrudControllerFrom(
  controllerStructure,
) {
  // Inherits all REST endpoints + custom endpoints
}
```

**Benefits:**

- **Flexible**: Compose multiple behaviors easily
- **Type-safe**: Full TypeScript inference
- **Testable**: Easy mocking and dependency injection
- **Extensible**: Add custom methods and endpoints naturally

## 🔍 Common Use Cases

### Basic CRUD API

Perfect for simple entity management with standard operations.

```typescript
// Minimal setup for complete CRUD API
export class ProductsService extends CrudServiceFrom(serviceStructure) {}
export class ProductsController extends CrudControllerFrom(
  controllerStructure,
) {}
```

### Advanced Business Logic

Extend with custom operations and complex business rules.

```typescript
export class ProductsService extends CrudServiceFrom(serviceStructure) {
  async findLowStock(context: Context, threshold: number): Promise<Product[]> {
    return this.findAll(context, {
      filter: { stock: { $lte: threshold } },
    });
  }

  async updateStock(
    context: Context,
    id: string,
    quantity: number,
  ): Promise<Product> {
    return this.runInTransaction(context, async txContext => {
      const product = await this.findOne(txContext, id, true);
      return this.update(txContext, id, {
        stock: product.stock + quantity,
      });
    });
  }
}
```

### Complex Relations

Handle nested entities and complex relationships.

```typescript
export const serviceStructure = CrudServiceStructure({
  entityType: Product,
  createInputType: CreateProductDto,
  updateInputType: UpdateProductDto,
  findArgsType: FindProductArgs,
  relationsConfig: {
    relations: {
      category: true,
      supplier: {
        relations: {
          address: true,
        },
      },
      reviews: {
        relations: {
          user: true,
        },
      },
    },
  },
});
```

## 🛠️ Development Workflow

### 1. Design Phase

- Define entities and relationships
- Plan DTOs and validation rules
- Consider business logic requirements

### 2. Implementation Phase

```bash
# 1. Create entity
# 2. Create DTOs (Create, Update, FindArgs)
# 3. Define service structure
# 4. Create service class
# 5. Define controller structure
# 6. Create controller class
# 7. Register in module
```

### 3. Testing Phase

- Unit test custom service methods
- Integration test API endpoints
- Validate business logic

### 4. Documentation Phase

- Update Swagger documentation
- Add code examples
- Document custom endpoints

## 🎓 Learning Path

### Beginner (New to NestJS or SOLID NestJS)

1. **NestJS Fundamentals** - Understand modules, services, controllers
2. **TypeORM Basics** - Entity definitions, relations, repositories
3. **SOLID NestJS Tutorial** - Follow the [basic tutorial](EXAMPLES.md#tutorial-1-building-your-first-crud-api)
4. **Simple Project** - Build a basic CRUD API

### Intermediate (Familiar with NestJS)

1. **Advanced Configuration** - Relations, transactions, custom operations
2. **Authentication & Authorization** - Guards, decorators, context usage
3. **Testing Strategies** - Unit and integration testing patterns
4. **Real-world Project** - E-commerce or CMS system

### Advanced (Framework Extension)

1. **Custom Mixins** - Create your own service/controller mixins
2. **Framework Contribution** - Add features, fix bugs
3. **Performance Optimization** - Query optimization, caching strategies
4. **Microservices Integration** - Use with microservices architecture

## 🔗 External Resources

### NestJS Official

- [NestJS Documentation](https://docs.nestjs.com/)
- [NestJS Fundamentals Course](https://courses.nestjs.com/)

### TypeORM

- [TypeORM Documentation](https://typeorm.io/)
- [TypeORM Entity Relations](https://typeorm.io/relations)

### TypeScript

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TypeScript Mixins](https://www.typescriptlang.org/docs/handbook/mixins.html)

### Testing

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [NestJS Testing Guide](https://docs.nestjs.com/fundamentals/testing)

## 🤝 Community & Support

### Getting Help

- **GitHub Issues** - Bug reports and feature requests
- **Discussions** - Community questions and ideas
- **Discord** - Real-time chat and support
- **Stack Overflow** - Tag questions with `solid-nestjs`

### Contributing

- **Code Contributions** - See [Contributing Guide](../CONTRIBUTING.md)
- **Documentation** - Help improve these docs
- **Examples** - Share your implementations
- **Bug Reports** - Help us fix issues

### Staying Updated

- **GitHub Releases** - Watch for new versions
- **Roadmap** - See planned features in [README](../README.md#-roadmap)
- **Changelog** - Review changes between versions

---

**Ready to build something awesome?** Start with the [Quick Start Guide](../README.md#️-quick-start) or dive into the [tutorials](EXAMPLES.md)!

For questions or suggestions about this documentation, please [open an issue](https://github.com/solid-nestjs/framework/issues) or join our community discussions.
