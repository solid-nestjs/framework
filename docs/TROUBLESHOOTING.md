# Troubleshooting Guide

This guide helps you resolve common issues when using the SOLID NestJS Framework.

## Table of Contents

- [Common Issues](#common-issues)
- [TypeScript Errors](#typescript-errors)
- [Runtime Errors](#runtime-errors)
- [Database Issues](#database-issues)
- [Performance Issues](#performance-issues)
- [Testing Issues](#testing-issues)
- [Debugging Tips](#debugging-tips)

## Common Issues

### Installation Problems

#### Issue: Package Installation Fails

```bash
npm ERR! peer dep missing: @nestjs/common@^8.0.0
```

**Solution:**

```bash
# Ensure you have compatible NestJS version
npm install @nestjs/common@^10.0.0 @nestjs/core@^10.0.0

# Then install SOLID NestJS packages
npm install @solid-nestjs/common @solid-nestjs/typeorm @solid-nestjs/rest-api
```

#### Issue: TypeScript Compilation Errors During Installation

```bash
error TS2307: Cannot find module '@solid-nestjs/common'
```

**Solution:**

```bash
# Clean installation
rm -rf node_modules package-lock.json
npm install

# Ensure TypeScript is installed
npm install typescript@^5.0.0 --save-dev
```

### Module Import Issues

#### Issue: Cannot Import Mixins

```typescript
// Error: Cannot find module '@solid-nestjs/typeorm'
import { CrudServiceFrom } from '@solid-nestjs/typeorm';
```

**Solution:**

```typescript
// Ensure correct package installation
npm install @solid-nestjs/typeorm

// Check import path
import { CrudServiceFrom, CrudServiceStructure } from '@solid-nestjs/typeorm';
```

#### Issue: Decorator Metadata Missing

```bash
Error: Reflect.getMetadata is not a function
```

**Solution:**

```typescript
// Install reflect-metadata
npm install reflect-metadata

// Import at the top of main.ts
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
```

## TypeScript Errors

### Type Safety Issues

#### Issue: Generic Type Errors

```typescript
// Error: Type 'unknown' is not assignable to type 'Product'
export class ProductsService extends CrudServiceFrom(serviceStructure) {}
```

**Solution:**

```typescript
// Ensure proper typing in structure
export const serviceStructure = CrudServiceStructure({
  entityType: Product,
  createInputType: CreateProductDto,
  updateInputType: UpdateProductDto,
  findArgsType: FindProductArgs,
});

// Use typed service
export class ProductsService extends CrudServiceFrom(serviceStructure) {
  // TypeScript will now infer correct types
}
```

#### Issue: Missing Type Definitions

```typescript
// Error: Cannot find type definition for 'Context'
async findAll(context: Context): Promise<Product[]>
```

**Solution:**

```typescript
// Import Context type
import { Context } from '@solid-nestjs/common';

// Or define custom context
interface CustomContext extends Context {
  user: User;
  tenant?: string;
}
```

### Decorator Type Issues

#### Issue: Decorator Type Mismatch

```typescript
// Error: Type '() => any' is not assignable to type 'MethodDecorator'
decorators: [() => UseGuards(JwtAuthGuard)];
```

**Solution:**

```typescript
// Import proper decorator types
import { UseGuards, applyDecorators } from '@nestjs/common';

// Use proper decorator factory
const controllerStructure = CrudControllerStructure({
  // ...
  operations: {
    create: {
      decorators: [() => UseGuards(JwtAuthGuard), () => ApiBearerAuth()],
    },
  },
});
```

## Runtime Errors

### Service Initialization Errors

#### Issue: Repository Not Found

```bash
Error: Repository for "Product" not found
```

**Solution:**

```typescript
// Ensure entity is registered in module
@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  providers: [ProductsService],
  controllers: [ProductsController],
})
export class ProductsModule {}

// Check entity decorator
@Entity('products')
export class Product {
  // Entity definition
}
```

#### Issue: Circular Dependency

```bash
Error: Nest cannot create the ProductsService instance.
The module ProductsService is involved in a circular dependency.
```

**Solution:**

```typescript
// Use forwardRef for circular dependencies
@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    forwardRef(() => SuppliersModule)
  ],
  providers: [ProductsService],
  controllers: [ProductsController],
  exports: [ProductsService]
})
export class ProductsModule {}

// In service with circular dependency
constructor(
  @Inject(forwardRef(() => SuppliersService))
  private suppliersService: SuppliersService
) {}
```

### Controller Runtime Errors

#### Issue: Method Not Found

```bash
Error: Cannot read property 'findAll' of undefined
```

**Solution:**

```typescript
// Ensure service is properly injected
export const controllerStructure = CrudControllerStructure({
  entityType: Product,
  createInputType: CreateProductDto,
  updateInputType: UpdateProductDto,
  findArgsType: FindProductArgs,
  serviceType: ProductsService, // Make sure this matches your service
});

// Verify module registration
@Module({
  providers: [ProductsService], // Service must be in providers
  controllers: [ProductsController],
})
export class ProductsModule {}
```

#### Issue: Swagger Documentation Errors

```bash
Error: Cannot read property 'name' of undefined (Swagger)
```

**Solution:**

```typescript
// Ensure DTOs have proper decorators
export class CreateProductDto {
  @ApiProperty({ description: 'Product name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Product price' })
  @IsNumber()
  price: number;
}

// Register in controller structure
const controllerStructure = CrudControllerStructure({
  entityType: Product,
  createInputType: CreateProductDto, // Must have @ApiProperty decorators
  updateInputType: UpdateProductDto,
  findArgsType: FindProductArgs,
});
```

## Database Issues

### Connection Problems

#### Issue: Database Connection Failed

```bash
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**

```typescript
// Check database configuration
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_DATABASE || 'myapp',
      entities: [Product],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
    }),
  ],
})
export class AppModule {}
```

### Query Issues

#### Issue: Invalid Column Name

```bash
Error: column "product.invalidField" must appear in the GROUP BY clause
```

**Solution:**

```typescript
// Check entity field names
@Entity('products')
export class Product {
  @Column({ name: 'product_name' }) // Database column name
  name: string; // TypeScript property name
}

// Use correct field names in queries
const products = await service.findAll(context, {
  filter: { name: 'laptop' }, // Use TypeScript property name
  orderBy: { name: 'ASC' },
});
```

#### Issue: Transaction Deadlock

```bash
Error: deadlock detected
```

**Solution:**

```typescript
// Use appropriate lock modes
export const serviceStructure = CrudServiceStructure({
  entityType: Product,
  createInputType: CreateProductDto,
  updateInputType: UpdateProductDto,
  findArgsType: FindProductArgs,
  lockMode: 'pessimistic_read', // Prevent deadlocks
  functions: {
    update: {
      lockMode: 'pessimistic_write',
      isolationLevel: 'READ_COMMITTED'
    }
  }
});

// Order operations consistently
async updateInventory(context: Context, updates: InventoryUpdate[]) {
  // Always update in the same order (e.g., by ID)
  const sortedUpdates = updates.sort((a, b) => a.productId.localeCompare(b.productId));

  return this.runInTransaction(context, async (transactionContext) => {
    for (const update of sortedUpdates) {
      await this.update(transactionContext, update.productId, update.data);
    }
  });
}
```

### Migration Issues

#### Issue: Entity Sync Errors

```bash
Error: Table 'products' already exists
```

**Solution:**

```typescript
// Use migrations instead of synchronize in production
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      // ... connection config
      synchronize: false, // Disable in production
      migrationsRun: true,
      migrations: ['dist/migrations/*.js'],
      entities: [Product],
    }),
  ],
})
export class AppModule {}
```

## Performance Issues

### Slow Query Performance

#### Issue: N+1 Query Problem

```typescript
// This creates N+1 queries
const products = await service.findAll(context, {});
for (const product of products) {
  console.log(product.supplier.name); // Additional query for each product
}
```

**Solution:**

```typescript
// Use eager loading with relations configuration
export const serviceStructure = CrudServiceStructure({
  entityType: Product,
  createInputType: CreateProductDto,
  updateInputType: UpdateProductDto,
  findArgsType: FindProductArgs,
  relationsConfig: {
    relations: {
      supplier: true, // Eager load supplier
    },
  },
});

// Or specify relations in query
const products = await service.findAll(context, {
  relations: ['supplier'],
});
```

#### Issue: Large Dataset Performance

```typescript
// Slow: Loading all records
const products = await service.findAll(context, {});
```

**Solution:**

```typescript
// Use pagination
const products = await service.findAll(context, {
  pagination: { limit: 20, offset: 0 }
});

// Use streaming for large datasets
async *streamProducts(context: Context) {
  let offset = 0;
  const limit = 100;

  while (true) {
    const batch = await this.findAll(context, {
      pagination: { limit, offset }
    });

    if (batch.length === 0) break;

    yield* batch;
    offset += limit;
  }
}
```

### Memory Issues

#### Issue: Memory Leaks in Tests

```bash
Error: Jest has detected the following 1 open handle potentially keeping Jest from exiting
```

**Solution:**

```typescript
// Close database connections in tests
afterAll(async () => {
  const module = app.get(DatabaseModule);
  await module.close();
  await app.close();
});

// Use proper test isolation
beforeEach(async () => {
  // Clear test data
  await testRepository.clear();
});
```

## Testing Issues

### Mock Setup Problems

#### Issue: Service Mocking Errors

```typescript
// Error: Cannot spy on property 'findAll' of object because it's not a function
jest.spyOn(service, 'findAll').mockResolvedValue([]);
```

**Solution:**

```typescript
// Create proper service mock
const mockService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  runInTransaction: jest.fn(),
};

// Use in test module
const module: TestingModule = await Test.createTestingModule({
  controllers: [ProductsController],
  providers: [
    {
      provide: ProductsService,
      useValue: mockService,
    },
  ],
}).compile();
```

### Database Test Issues

#### Issue: Test Database Conflicts

```bash
Error: Database "test_db" is being accessed by other users
```

**Solution:**

```typescript
// Use unique database per test
const testConfig = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'test',
  password: 'test',
  database: `test_db_${process.env.JEST_WORKER_ID || 0}`,
  synchronize: true,
  dropSchema: true,
  entities: [Product],
};

// Or use in-memory database
const testConfig = {
  type: 'sqlite',
  database: ':memory:',
  synchronize: true,
  entities: [Product],
};
```

## Debugging Tips

### Enable Debug Logging

```typescript
// Enable TypeORM logging
TypeOrmModule.forRoot({
  // ... other config
  logging: ['query', 'error', 'schema'],
  logger: 'advanced-console',
});

// Enable NestJS debug logging
const app = await NestFactory.create(AppModule, {
  logger: ['error', 'warn', 'log', 'debug', 'verbose'],
});
```

### Use Performance Profiling

```typescript
// Add query performance monitoring
@Injectable()
export class QueryProfiler {
  private readonly logger = new Logger(QueryProfiler.name);

  @EventSubscriber()
  class QueryProfilerSubscriber implements EntitySubscriberInterface {
    beforeQuery(event: any) {
      event.startTime = Date.now();
    }

    afterQuery(event: any) {
      const duration = Date.now() - event.startTime;
      if (duration > 100) { // Log slow queries
        this.logger.warn(`Slow query (${duration}ms): ${event.query}`);
      }
    }
  }
}
```

### Debug Service Methods

```typescript
export class ProductsService extends CrudServiceFrom(serviceStructure) {
  private readonly logger = new Logger(ProductsService.name);

  async findAll(
    context: Context,
    findArgs?: FindProductArgs,
  ): Promise<Product[]> {
    this.logger.debug(`findAll called with args: ${JSON.stringify(findArgs)}`);

    try {
      const result = await super.findAll(context, findArgs);
      this.logger.debug(`findAll returned ${result.length} results`);
      return result;
    } catch (error) {
      this.logger.error(`findAll failed: ${error.message}`, error.stack);
      throw error;
    }
  }
}
```

### Common Debugging Commands

```bash
# Check TypeScript compilation
npx tsc --noEmit

# Run tests with verbose output
npm test -- --verbose

# Check for circular dependencies
npm install madge --save-dev
npx madge --circular src/

# Analyze bundle size
npm install webpack-bundle-analyzer --save-dev
npx webpack-bundle-analyzer dist/main.js
```

## Getting Help

If you're still experiencing issues:

1. **Check the logs** - Enable debug logging to see what's happening
2. **Review the documentation** - Check [API Reference](API_REFERENCE.md) and [README](../README.md)
3. **Search existing issues** - Look for similar problems in the GitHub repository
4. **Create a minimal reproduction** - Isolate the problem in a simple test case
5. **Open an issue** - Provide detailed information including:
   - Framework version
   - NestJS version
   - TypeScript version
   - Complete error message and stack trace
   - Minimal code reproduction
   - Steps to reproduce

## Emergency Fixes

### Quick Rollback

If you need to quickly rollback changes:

```bash
# Revert to previous working version
npm install @solid-nestjs/common@previous-version
npm install @solid-nestjs/typeorm@previous-version
npm install @solid-nestjs/rest-api@previous-version

# Or use package-lock.json backup
git checkout HEAD~1 -- package-lock.json
npm ci
```

### Bypass Framework Features

If a specific feature is causing issues:

```typescript
// Temporarily disable transactions
export const serviceStructure = CrudServiceStructure({
  entityType: Product,
  createInputType: CreateProductDto,
  updateInputType: UpdateProductDto,
  findArgsType: FindProductArgs,
  functions: {
    create: { transactional: false },
    update: { transactional: false },
    remove: { transactional: false },
  },
});

// Disable specific operations
export const controllerStructure = CrudControllerStructure({
  ...serviceStructure,
  serviceType: ProductsService,
  operations: {
    findAll: true,
    findOne: true,
    create: false, // Disable problematic operation
    update: true,
    remove: true,
  },
});
```

Remember: These are temporary fixes. Always investigate and resolve the root cause.
