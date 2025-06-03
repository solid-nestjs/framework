# 🔄 Context Pattern in SOLID NestJS Framework

The Context pattern is a fundamental architectural concept in the SOLID NestJS Framework that enables passing request-scoped data through the entire application layer stack. This document explains how to effectively use the Context argument that flows through controllers, resolvers, and services.

## 📋 Table of Contents

- [Overview](#overview)
- [Core Concepts](#core-concepts)
- [Current Implementation](#current-implementation)
- [Common Use Cases](#common-use-cases)
- [Examples](#examples)
- [Best Practices](#best-practices)
- [Advanced Patterns](#advanced-patterns)

---

## 🎯 Overview

The Context pattern provides a way to pass request-specific information through your application's layers without explicitly passing multiple parameters. Every method in controllers, resolvers, and services receives a `context` parameter that can carry various types of data relevant to the current request.

### Why Use Context?

- **Request Isolation**: Each request gets its own context instance
- **Cross-cutting Concerns**: Authentication, localization, tenant isolation
- **Transaction Management**: Database transaction state
- **Audit Trail**: User information for logging and tracking
- **Feature Flags**: Request-specific configuration

---

## 🏗️ Core Concepts

### Context Interface

```typescript
interface Context {
  // Core properties that all contexts should have
  requestId?: string;
  timestamp?: Date;

  // Extensible for application-specific needs
  [key: string]: any;
}
```

### Context Flow

```
HTTP Request → Controller → Service → Repository
     ↓             ↓          ↓          ↓
   Context  →   Context  →  Context  →  Context
```

---

## 🔧 Current Implementation

### Transaction Management

The framework currently uses context primarily for transaction management:

```typescript
// Automatic transaction context injection
@Transaction()
async createProduct(context: Context, productData: CreateProductDto) {
  // context.transactionManager is automatically available
  return this.productService.create(context, productData);
}

// Manual transaction management
async complexOperation(context: Context) {
  return this.runInTransaction(context, async (txContext) => {
    await this.productService.create(txContext, productData);
    await this.auditService.log(txContext, 'Product created');
  });
}
```

### Context Decorator

```typescript
@Controller('products')
export class ProductController {
  @Get()
  async findAll(
    @CurrentContext() context: Context,
    @Query() args: FindProductArgs,
  ) {
    return this.productService.findAll(context, args);
  }
}
```

---

## 🎯 Common Use Cases

### 1. Authentication & User Context

Store authenticated user information for access throughout the request:

```typescript
interface AuthContext extends Context {
  user?: {
    id: string;
    email: string;
    roles: string[];
    permissions: string[];
  };
}

// In authentication middleware/guard
context.user = {
  id: '123',
  email: 'user@example.com',
  roles: ['admin'],
  permissions: ['read:products', 'write:products']
};

// In service layer
async findUserProducts(context: AuthContext) {
  if (!context.user) {
    throw new UnauthorizedException('User not authenticated');
  }

  return this.productRepository.findByUserId(context.user.id);
}
```

### 2. Internationalization (i18n)

Store language and locale information:

```typescript
interface I18nContext extends Context {
  language?: string;
  locale?: string;
  timezone?: string;
}

// Set in middleware or controller
context.language = 'en';
context.locale = 'en-US';
context.timezone = 'America/New_York';

// Use in services
async getLocalizedProducts(context: I18nContext) {
  const products = await this.productRepository.findAll();

  return products.map(product => ({
    ...product,
    name: this.i18n.translate(product.nameKey, context.language),
    description: this.i18n.translate(product.descriptionKey, context.language)
  }));
}
```

### 3. Multi-tenancy

Isolate data by tenant:

```typescript
interface TenantContext extends Context {
  tenantId?: string;
  tenantConfig?: {
    features: string[];
    limits: Record<string, number>;
  };
}

// Set in tenant middleware
context.tenantId = 'tenant-123';
context.tenantConfig = await this.tenantService.getConfig('tenant-123');

// Automatic data isolation in repository
async findAll(context: TenantContext, args: FindArgs) {
  const queryBuilder = this.repository.createQueryBuilder('entity');

  if (context.tenantId) {
    queryBuilder.where('entity.tenantId = :tenantId', {
      tenantId: context.tenantId
    });
  }

  return queryBuilder.getMany();
}
```

### 4. Fiscal Year Data Segregation

Filter data by fiscal year:

```typescript
interface FiscalContext extends Context {
  fiscalYear?: number;
  fiscalPeriod?: {
    start: Date;
    end: Date;
  };
}

// Set fiscal year context
context.fiscalYear = 2024;
context.fiscalPeriod = {
  start: new Date('2024-01-01'),
  end: new Date('2024-12-31')
};

// Apply fiscal year filtering
async findInvoices(context: FiscalContext, args: FindInvoiceArgs) {
  const queryBuilder = this.repository.createQueryBuilder('invoice');

  if (context.fiscalPeriod) {
    queryBuilder.where(
      'invoice.createdAt BETWEEN :start AND :end',
      {
        start: context.fiscalPeriod.start,
        end: context.fiscalPeriod.end
      }
    );
  }

  return queryBuilder.getMany();
}
```

### 5. Audit Trail & Logging

Track user actions and changes:

```typescript
interface AuditContext extends Context {
  user?: UserInfo;
  requestId?: string;
  ipAddress?: string;
  userAgent?: string;
}

// Enhanced service with audit logging
async updateProduct(
  context: AuditContext,
  id: string,
  updateData: UpdateProductDto
) {
  const existingProduct = await this.findOne(context, id);
  const updatedProduct = await this.repository.update(id, updateData);

  // Audit log with context information
  await this.auditService.log({
    action: 'UPDATE_PRODUCT',
    entityType: 'Product',
    entityId: id,
    userId: context.user?.id,
    requestId: context.requestId,
    ipAddress: context.ipAddress,
    changes: this.calculateChanges(existingProduct, updatedProduct),
    timestamp: new Date()
  });

  return updatedProduct;
}
```

---

## 🛠️ Examples

### Complete Controller Example

```typescript
@Controller('products')
export class ProductController extends CrudControllerFrom({
  entityType: Product,
  serviceType: ProductService,
  createInputType: CreateProductDto,
  updateInputType: UpdateProductDto,
  findArgsType: FindProductArgs,
}) {
  @Get('my-products')
  @UseGuards(AuthGuard)
  async getMyProducts(
    @CurrentContext() context: AuthContext,
    @Query() args: FindProductArgs,
  ) {
    // Context automatically includes user info from AuthGuard
    return this.service.findUserProducts(context, args);
  }

  @Post('bulk-import')
  @Transaction()
  async bulkImport(
    @CurrentContext() context: AuditContext,
    @Body() importData: BulkImportDto,
  ) {
    // Context includes transaction manager and user info
    return this.service.bulkImport(context, importData);
  }
}
```

### Service Layer Implementation

```typescript
@Injectable()
export class ProductService extends CrudServiceFrom({
  entityType: Product,
  repositoryType: ProductRepository,
}) {
  async findUserProducts(
    context: AuthContext,
    args: FindProductArgs,
  ): Promise<Product[]> {
    // Apply user-specific filtering
    const enhancedArgs = {
      ...args,
      where: {
        ...args.where,
        createdBy: context.user?.id,
      },
    };

    return this.findAll(context, enhancedArgs);
  }

  async bulkImport(
    context: AuditContext,
    importData: BulkImportDto,
  ): Promise<Product[]> {
    const results = [];

    for (const productData of importData.products) {
      try {
        const product = await this.create(context, productData);
        results.push(product);

        // Log successful import
        await this.auditService.log(context, {
          action: 'BULK_IMPORT_SUCCESS',
          entityId: product.id,
          data: productData,
        });
      } catch (error) {
        // Log failed import
        await this.auditService.log(context, {
          action: 'BULK_IMPORT_FAILED',
          error: error.message,
          data: productData,
        });

        throw error; // Transaction will rollback
      }
    }

    return results;
  }
}
```

### Custom Context Types

```typescript
// Application-specific context interface
export interface AppContext extends Context {
  // Authentication
  user?: {
    id: string;
    email: string;
    roles: string[];
    permissions: string[];
  };

  // Internationalization
  language?: string;
  locale?: string;
  timezone?: string;

  // Multi-tenancy
  tenantId?: string;
  tenantFeatures?: string[];

  // Fiscal period
  fiscalYear?: number;
  fiscalPeriod?: {
    start: Date;
    end: Date;
  };

  // Audit & tracking
  requestId?: string;
  ipAddress?: string;
  userAgent?: string;

  // Transaction management (framework managed)
  transactionManager?: EntityManager;
}
```

---

## ✅ Best Practices

### 1. Type Safety

Always use typed context interfaces:

```typescript
// ❌ Avoid generic context
async method(context: Context) {
  const user = context.user; // No type safety
}

// ✅ Use specific context types
async method(context: AuthContext) {
  const user = context.user; // Fully typed
}
```

### 2. Context Validation

Validate required context properties:

```typescript
async method(context: AuthContext) {
  if (!context.user) {
    throw new UnauthorizedException('Authentication required');
  }

  if (!context.tenantId) {
    throw new BadRequestException('Tenant context required');
  }

  // Proceed with business logic
}
```

### 3. Context Middleware

Create middleware to populate context:

```typescript
@Injectable()
export class ContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Initialize context
    req.context = {
      requestId: uuidv4(),
      timestamp: new Date(),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    };

    next();
  }
}
```

### 4. Context Inheritance

Extend base context for specific features:

```typescript
// Base context
interface BaseContext extends Context {
  requestId: string;
  timestamp: Date;
}

// Feature-specific contexts
interface AuthContext extends BaseContext {
  user: UserInfo;
}

interface TenantContext extends BaseContext {
  tenantId: string;
}

// Combined context
interface AppContext extends AuthContext, TenantContext {
  // Combines all features
}
```

---

## 🚀 Advanced Patterns

### 1. Context Factory

Create context instances with proper initialization:

```typescript
@Injectable()
export class ContextFactory {
  create(request: Request): AppContext {
    return {
      requestId: uuidv4(),
      timestamp: new Date(),
      ipAddress: request.ip,
      userAgent: request.get('User-Agent'),
      language: request.get('Accept-Language')?.split(',')[0] || 'en',
      // ... other properties
    };
  }
}
```

### 2. Context Scoped Providers

Use request-scoped providers for context:

```typescript
@Injectable({ scope: Scope.REQUEST })
export class RequestContextService {
  private context: AppContext;

  setContext(context: AppContext) {
    this.context = context;
  }

  getContext(): AppContext {
    return this.context;
  }

  getCurrentUser() {
    return this.context.user;
  }
}
```

### 3. Context Decorators

Create custom decorators for context extraction:

```typescript
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.context?.user;
  },
);

export const CurrentTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.context?.tenantId;
  },
);

// Usage
@Get()
async findAll(
  @CurrentContext() context: AppContext,
  @CurrentUser() user: UserInfo,
  @CurrentTenant() tenantId: string
) {
  // Multiple ways to access context data
}
```

### 4. Context Validation Decorator

Create validation decorators for context requirements:

```typescript
export function RequireAuth() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const context = args.find(arg => arg && typeof arg === 'object' && 'requestId' in arg);

      if (!context?.user) {
        throw new UnauthorizedException('Authentication required');
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

// Usage
@RequireAuth()
async sensitiveOperation(context: AuthContext, data: any) {
  // Method automatically validates authentication
}
```

---

## 🔮 Future Enhancements

The Context pattern will be enhanced in future versions with:

- **Context Middleware Chain** - Composable context processors
- **Context Caching** - Performance optimizations for repeated context operations
- **Context Analytics** - Built-in tracking and monitoring
- **Context Validation** - Schema-based context validation
- **Context Serialization** - For distributed systems and microservices

---

## 📚 Related Documentation

- [Architecture Guide](ARCHITECTURE.md) - Understanding the framework's architecture
- [API Reference](API_REFERENCE.md) - Detailed API documentation
- [Examples](EXAMPLES.md) - Practical implementation examples
- [Troubleshooting](TROUBLESHOOTING.md) - Common issues and solutions

---

_This document is part of the SOLID NestJS Framework documentation. For more information, visit our [GitHub repository](https://github.com/solid-nestjs/framework)._
