# Migration Guide

This guide helps you migrate between different versions of the SOLID NestJS Framework and provides guidance for migrating from other CRUD solutions.

## Table of Contents

- [Version Migrations](#version-migrations)
- [From Other Frameworks](#from-other-frameworks)
- [Breaking Changes](#breaking-changes)
- [Migration Tools](#migration-tools)

## Version Migrations

### From v0.1.x to v0.2.x

#### Breaking Changes

1. **Service Structure Changes**
   ```typescript
   // OLD (v0.1.x)
   const serviceConfig = {
     entity: Product,
     createDto: CreateProductDto,
     updateDto: UpdateProductDto,
     findArgs: FindProductArgs
   };

   // NEW (v0.2.x)
   const serviceStructure = CrudServiceStructure({
     entityType: Product,
     createInputType: CreateProductDto,
     updateInputType: UpdateProductDto,
     findArgsType: FindProductArgs
   });
   ```

2. **Mixin Function Names**
   ```typescript
   // OLD (v0.1.x)
   export class ProductsService extends CrudService(serviceConfig) {}

   // NEW (v0.2.x)
   export class ProductsService extends CrudServiceFrom(serviceStructure) {}
   ```

3. **Relations Configuration**
   ```typescript
   // OLD (v0.1.x)
   const serviceConfig = {
     entity: Product,
     relations: ['supplier', 'category']
   };

   // NEW (v0.2.x)
   const serviceStructure = CrudServiceStructure({
     entityType: Product,
     createInputType: CreateProductDto,
     updateInputType: UpdateProductDto,
     findArgsType: FindProductArgs,
     relationsConfig: {
       relations: {
         supplier: true,
         category: true
       }
     }
   });
   ```

#### Migration Steps

1. **Update Dependencies**
   ```bash
   npm uninstall @solid-nestjs/crud
   npm install @solid-nestjs/common @solid-nestjs/typeorm @solid-nestjs/rest-api
   ```

2. **Update Service Imports**
   ```typescript
   // OLD
   import { CrudService } from '@solid-nestjs/crud';
   
   // NEW
   import { CrudServiceFrom, CrudServiceStructure } from '@solid-nestjs/typeorm';
   ```

3. **Update Controller Imports**
   ```typescript
   // OLD
   import { CrudController } from '@solid-nestjs/crud';
   
   // NEW
   import { CrudControllerFrom, CrudControllerStructure } from '@solid-nestjs/rest-api';
   ```

4. **Migrate Service Configuration**
   ```typescript
   // OLD
   export class ProductsService extends CrudService({
     entity: Product,
     createDto: CreateProductDto,
     updateDto: UpdateProductDto,
     findArgs: FindProductArgs,
     relations: ['supplier']
   }) {}

   // NEW
   export const serviceStructure = CrudServiceStructure({
     entityType: Product,
     createInputType: CreateProductDto,
     updateInputType: UpdateProductDto,
     findArgsType: FindProductArgs,
     relationsConfig: {
       relations: {
         supplier: true
       }
     }
   });

   export class ProductsService extends CrudServiceFrom(serviceStructure) {}
   ```

5. **Migrate Controller Configuration**
   ```typescript
   // OLD
   export class ProductsController extends CrudController({
     service: ProductsService,
     entity: Product,
     createDto: CreateProductDto,
     updateDto: UpdateProductDto,
     findArgs: FindProductArgs
   }) {}

   // NEW
   export const controllerStructure = CrudControllerStructure({
     ...serviceStructure,
     serviceType: ProductsService
   });

   export class ProductsController extends CrudControllerFrom(controllerStructure) {}
   ```

### From v0.2.x to v0.3.x (Upcoming)

#### Expected Changes

1. **GraphQL Support**
   ```typescript
   // New GraphQL structure builders
   import { GraphQLServiceStructure, GraphQLResolverFrom } from '@solid-nestjs/graphql';

   const graphqlStructure = GraphQLServiceStructure({
     entityType: Product,
     createInputType: CreateProductInput,
     updateInputType: UpdateProductInput,
     whereInputType: ProductWhereInput
   });

   export class ProductsResolver extends GraphQLResolverFrom(graphqlStructure) {}
   ```

2. **Enhanced Query Builder**
   ```typescript
   // Enhanced filtering with new operators
   const serviceStructure = CrudServiceStructure({
     entityType: Product,
     createInputType: CreateProductDto,
     updateInputType: UpdateProductDto,
     findArgsType: FindProductArgs,
     queryBuilder: {
       enableFullTextSearch: true,
       enableGeoQueries: true,
       enableAggregations: true
     }
   });
   ```

## From Other Frameworks

### From NestJS CRUD (@nestjsx/crud)

#### Key Differences

1. **Architecture**
   - SOLID NestJS uses composition over inheritance
   - More flexible structure configuration
   - Better TypeScript support

2. **Configuration Style**
   ```typescript
   // @nestjsx/crud
   @Crud({
     model: {
       type: Product,
     },
     dto: {
       create: CreateProductDto,
       update: UpdateProductDto,
     },
   })
   export class ProductsController implements CrudController<Product> {
     constructor(public service: ProductsService) {}
   }

   // SOLID NestJS
   export const controllerStructure = CrudControllerStructure({
     entityType: Product,
     createInputType: CreateProductDto,
     updateInputType: UpdateProductDto,
     findArgsType: FindProductArgs,
     serviceType: ProductsService
   });

   export class ProductsController extends CrudControllerFrom(controllerStructure) {}
   ```

#### Migration Steps

1. **Replace Dependencies**
   ```bash
   npm uninstall @nestjsx/crud @nestjsx/crud-typeorm
   npm install @solid-nestjs/common @solid-nestjs/typeorm @solid-nestjs/rest-api
   ```

2. **Convert Service Implementation**
   ```typescript
   // OLD (@nestjsx/crud)
   @Injectable()
   export class ProductsService extends TypeOrmCrudService<Product> {
     constructor(@InjectRepository(Product) repo: Repository<Product>) {
       super(repo);
     }
   }

   // NEW (SOLID NestJS)
   export const serviceStructure = CrudServiceStructure({
     entityType: Product,
     createInputType: CreateProductDto,
     updateInputType: UpdateProductDto,
     findArgsType: FindProductArgs
   });

   @Injectable()
   export class ProductsService extends CrudServiceFrom(serviceStructure) {}
   ```

3. **Convert Controller Implementation**
   ```typescript
   // OLD (@nestjsx/crud)
   @Crud({
     model: { type: Product },
     dto: {
       create: CreateProductDto,
       update: UpdateProductDto,
     },
     query: {
       relations: ['supplier'],
     },
   })
   @Controller('products')
   export class ProductsController implements CrudController<Product> {
     constructor(public service: ProductsService) {}
   }

   // NEW (SOLID NestJS)
   export const controllerStructure = CrudControllerStructure({
     ...serviceStructure,
     serviceType: ProductsService,
     relationsConfig: {
       relations: {
         supplier: true
       }
     }
   });

   @Controller('products')
   export class ProductsController extends CrudControllerFrom(controllerStructure) {}
   ```

4. **Update Query Parameters**
   ```typescript
   // OLD (@nestjsx/crud)
   // GET /products?filter=name||$cont||laptop&join=supplier

   // NEW (SOLID NestJS)
   // GET /products?filter={"name":{"$like":"%laptop%"}}&relations=["supplier"]
   ```

### From TypeORM Generic Repository

#### Migration Steps

1. **Replace Generic Repository**
   ```typescript
   // OLD (Generic Repository)
   @Injectable()
   export class ProductsService {
     constructor(
       @InjectRepository(Product)
       private productRepository: Repository<Product>,
     ) {}

     async findAll(): Promise<Product[]> {
       return this.productRepository.find();
     }

     async findOne(id: string): Promise<Product> {
       return this.productRepository.findOne({ where: { id } });
     }

     async create(createProductDto: CreateProductDto): Promise<Product> {
       const product = this.productRepository.create(createProductDto);
       return this.productRepository.save(product);
     }

     async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
       await this.productRepository.update(id, updateProductDto);
       return this.findOne(id);
     }

     async remove(id: string): Promise<void> {
       await this.productRepository.delete(id);
     }
   }

   // NEW (SOLID NestJS)
   export const serviceStructure = CrudServiceStructure({
     entityType: Product,
     createInputType: CreateProductDto,
     updateInputType: UpdateProductDto,
     findArgsType: FindProductArgs
   });

   @Injectable()
   export class ProductsService extends CrudServiceFrom(serviceStructure) {
     // Automatically includes all CRUD operations plus advanced features
     // Add custom methods as needed
   }
   ```

2. **Replace Manual Controller Implementation**
   ```typescript
   // OLD (Manual Implementation)
   @Controller('products')
   export class ProductsController {
     constructor(private readonly productsService: ProductsService) {}

     @Get()
     findAll() {
       return this.productsService.findAll();
     }

     @Get(':id')
     findOne(@Param('id') id: string) {
       return this.productsService.findOne(id);
     }

     @Post()
     create(@Body() createProductDto: CreateProductDto) {
       return this.productsService.create(createProductDto);
     }

     @Patch(':id')
     update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
       return this.productsService.update(id, updateProductDto);
     }

     @Delete(':id')
     remove(@Param('id') id: string) {
       return this.productsService.remove(id);
     }
   }

   // NEW (SOLID NestJS)
   export const controllerStructure = CrudControllerStructure({
     ...serviceStructure,
     serviceType: ProductsService,
     operations: {
       findAll: {
         summary: 'Get all products',
         description: 'Retrieve all products with filtering and pagination'
       },
       findOne: {
         summary: 'Get product by ID',
         description: 'Retrieve a specific product by its ID'
       },
       create: {
         summary: 'Create product',
         description: 'Create a new product'
       },
       update: {
         summary: 'Update product',
         description: 'Update an existing product'
       },
       remove: {
         summary: 'Delete product',
         description: 'Soft delete a product'
       }
     }
   });

   @Controller('products')
   export class ProductsController extends CrudControllerFrom(controllerStructure) {
     // Automatically includes all CRUD endpoints plus Swagger documentation
     // Add custom endpoints as needed
   }
   ```

## Breaking Changes

### Version 0.2.0

#### Configuration Structure
- Renamed service configuration properties
- Changed mixin function names
- Updated relations configuration format

#### Method Signatures
- Added `Context` parameter to all service methods
- Updated return types for better type safety
- Changed transaction handling approach

#### Dependencies
- Split single package into multiple packages
- Updated peer dependencies
- Removed deprecated APIs

### Version 0.3.0 (Upcoming)

#### Expected Breaking Changes
- New GraphQL support may require additional configuration
- Enhanced query builder may change filter syntax
- Prisma support may introduce new configuration options

## Migration Tools

### Automated Migration Script

Create a migration script to help automate the process:

```typescript
// migrate-to-v0.2.ts
import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

function migrateFiles() {
  const files = glob.sync('src/**/*.ts');
  
  files.forEach(file => {
    let content = readFileSync(file, 'utf8');
    
    // Replace old imports
    content = content.replace(
      /import.*CrudService.*from '@solid-nestjs\/crud'/g,
      "import { CrudServiceFrom, CrudServiceStructure } from '@solid-nestjs/typeorm';"
    );
    
    content = content.replace(
      /import.*CrudController.*from '@solid-nestjs\/crud'/g,
      "import { CrudControllerFrom, CrudControllerStructure } from '@solid-nestjs/rest-api';"
    );
    
    // Replace old mixin usage
    content = content.replace(
      /CrudService\(/g,
      'CrudServiceFrom(CrudServiceStructure('
    );
    
    content = content.replace(
      /CrudController\(/g,
      'CrudControllerFrom(CrudControllerStructure('
    );
    
    // Update configuration format
    content = content.replace(
      /entity:/g,
      'entityType:'
    );
    
    content = content.replace(
      /createDto:/g,
      'createInputType:'
    );
    
    content = content.replace(
      /updateDto:/g,
      'updateInputType:'
    );
    
    content = content.replace(
      /findArgs:/g,
      'findArgsType:'
    );
    
    writeFileSync(file, content);
  });
}

migrateFiles();
console.log('Migration completed!');
```

### Validation Script

Create a script to validate the migration:

```typescript
// validate-migration.ts
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function validateMigration() {
  try {
    // Check if project compiles
    await execAsync('npm run build');
    console.log('✅ TypeScript compilation successful');
    
    // Run tests
    await execAsync('npm run test');
    console.log('✅ Tests passing');
    
    // Check for deprecated imports
    const { stdout } = await execAsync('grep -r "@solid-nestjs/crud" src/ || true');
    if (stdout.trim()) {
      console.log('❌ Found deprecated imports:');
      console.log(stdout);
    } else {
      console.log('✅ No deprecated imports found');
    }
    
  } catch (error) {
    console.error('❌ Migration validation failed:', error);
  }
}

validateMigration();
```

## Best Practices for Migration

1. **Create a Backup**
   ```bash
   git checkout -b pre-migration-backup
   git commit -am "Backup before SOLID NestJS migration"
   git checkout main
   ```

2. **Migrate Incrementally**
   - Start with one service/controller pair
   - Test thoroughly before moving to the next
   - Keep old and new implementations side by side initially

3. **Update Tests**
   - Update test mocks to match new interfaces
   - Test migration with existing data
   - Verify all API endpoints still work

4. **Review Dependencies**
   - Update package.json dependencies
   - Check for peer dependency conflicts
   - Remove unused dependencies

5. **Update Documentation**
   - Update API documentation
   - Update development setup instructions
   - Document any breaking changes for your team

## Getting Help

If you encounter issues during migration:

1. Check the [API Reference](API_REFERENCE.md) for updated interfaces
2. Review the [examples directory](../examples/) for working implementations
3. Open an issue on GitHub with your specific migration challenge
4. Join our community discussions for migration support

Remember to test thoroughly after migration and validate that all functionality works as expected.
