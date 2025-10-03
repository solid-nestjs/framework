# SNEST CLI

Official CLI tool for the SOLID NestJS Framework. A powerful code generator that scaffolds entities, DTOs, services, controllers, resolvers, and modules using SOLID decorators and advanced query capabilities.

## Installation

```bash
# Install globally
npm install -g @solid-nestjs/snest-cli

# Or use npx (recommended)
npx @solid-nestjs/snest-cli

# Or install locally in your project
npm install --save-dev @solid-nestjs/snest-cli
```

## Quick Start

```bash
# Create a new project
npx @solid-nestjs/snest-cli new my-project

# Navigate to your project
cd my-project

# Generate a complete resource with advanced features
npx @solid-nestjs/snest-cli generate resource Product --fields "name:string,price:number,category:string" --generate-find-args --generate-group-by

# Generate a module
npx @solid-nestjs/snest-cli generate module products

# Start development server
npm run start:dev
```

## Commands

### `snest new <name>`

Create a new SOLID NestJS project with pre-configured dependencies and structure.

```bash
snest new my-project [options]
```

**Options:**

- `--package-manager <manager>`: Package manager to use (npm, yarn, pnpm) - default: npm
- `--database <type>`: Database type (sqlite, postgres, mysql, mssql) - default: sqlite
- `--type <type>`: API type (rest, graphql, hybrid) - default: hybrid
- `--skip-install`: Skip package installation
- `--skip-git`: Skip git initialization

**Examples:**

```bash
# Create a REST API project with PostgreSQL
snest new my-api --type rest --database postgres

# Create a GraphQL project with MySQL
snest new my-graphql --type graphql --database mysql

# Create a hybrid project with custom package manager
snest new my-app --type hybrid --package-manager yarn
```

### `snest generate resource <name>`

Generate a complete CRUD resource including entity, DTOs, service, controller/resolver, and module.

```bash
snest generate resource <name> [options]
```

**Options:**

- `--fields <fields>`: Entity fields in format "field1:type,field2:type" (required)
- `--type <type>`: API type (rest, graphql, hybrid) - default: hybrid
- `--path <path>`: Custom output path - default: src/
- `--generate-find-args`: Generate FindArgs DTO for advanced querying
- `--generate-group-by`: Generate GroupBy DTO for aggregation queries
- `--with-tests`: Generate test files
- `--overwrite`: Overwrite existing files
- `--skip-entity`: Skip entity generation
- `--skip-controller`: Skip controller generation
- `--skip-service`: Skip service generation
- `--skip-module`: Skip module generation

**Field Types:**

- `string` - Text fields
- `number` - Numeric fields
- `boolean` - Boolean fields
- `date` - Date fields
- `uuid` - UUID fields

**Examples:**

```bash
# Basic resource generation
snest generate resource Product --fields "name:string,price:number,stock:number"

# Advanced resource with all features
snest generate resource User --fields "email:string,password:string,firstName:string,lastName:string,age:number,isActive:boolean" --generate-find-args --generate-group-by --type hybrid

# GraphQL-only resource
snest generate resource Category --fields "name:string,description:string,parentId:uuid" --type graphql --generate-find-args

# REST-only resource with custom path
snest generate resource Order --fields "total:number,status:string,userId:uuid" --type rest --path src/modules/orders
```

### `snest generate module <name>`

Generate a NestJS module with proper structure and imports.

```bash
snest generate module <name> [options]
```

**Options:**

- `--path <path>`: Custom output path - default: src/
- `--with-tests`: Generate test files
- `--overwrite`: Overwrite existing files

**Examples:**

```bash
# Generate a basic module
snest generate module products

# Generate a nested module
snest generate module accounting/invoices

# Generate module with tests
snest generate module users --with-tests
```

### `snest generate --interactive`

Launch interactive mode for guided code generation with intelligent suggestions.

```bash
snest generate --interactive
```

**Interactive Flow:**

1. Choose generation type (resource, module)
2. Enter resource/module name
3. Select API type (rest, graphql, hybrid)
4. Define entity fields with type suggestions
5. Choose advanced features (FindArgs, GroupBy)
6. Confirm generation settings

## Generated Code Features

### SOLID Decorators Integration

All generated code uses SOLID decorators for maximum code reduction:

```typescript
// Generated entity with SOLID decorators
@SolidEntity()
export class Product {
  @SolidId({ generated: 'uuid' })
  id: string;

  @SolidField({ description: 'Product name', maxLength: 100 })
  name: string;

  @SolidField({ description: 'Product price', min: 0, precision: 10, scale: 2 })
  price: number;

  @SolidCreatedAt()
  createdAt: Date;

  @SolidUpdatedAt()
  updatedAt: Date;
}
```

### Advanced Query DTOs

When using `--generate-find-args`, the CLI generates sophisticated DTOs for advanced querying:

```typescript
// Generated FindArgs with automatic type inference
const ProductWhere = createWhereFields(Product, {
  name: true, // Auto-infers StringFilter
  price: true, // Auto-infers NumberFilter
  category: true, // Auto-infers StringFilter
});

const ProductOrderBy = createOrderByFields(Product, {
  name: true,
  price: true,
  createdAt: true,
});

@ArgsType()
export class FindProductArgs extends FindArgsMixin(Product) {
  @Field(() => ProductWhere, { nullable: true })
  where?: InstanceType<typeof ProductWhere>;

  @Field(() => ProductOrderBy, { nullable: true })
  orderBy?: InstanceType<typeof ProductOrderBy>;
}
```

### GroupBy Aggregations

When using `--generate-group-by`, the CLI generates DTOs for data aggregation:

```typescript
// Generated GroupBy DTOs
export const ProductGroupByFields = createGroupByFields(Product, {
  category: { description: 'Group by category' },
  createdAt: { description: 'Group by creation date' },
});

@ArgsType()
export class GroupedProductArgs extends GroupByArgsFrom(Product) {
  @Field(() => ProductGroupByFields)
  fields: InstanceType<typeof ProductGroupByFields>;
}
```

### Automatic CRUD Operations

Generated services, controllers, and resolvers include:

- **Basic CRUD**: Create, Read, Update, Delete operations
- **Advanced Filtering**: Complex WHERE conditions with relations
- **Pagination**: Offset-based and cursor-based pagination
- **Sorting**: Multi-field sorting with relation support
- **Relations**: Automatic relation loading and joining
- **GroupBy Aggregations**: COUNT, SUM, AVG, MIN, MAX functions
- **Soft Deletion**: Optional soft delete with recovery
- **Bulk Operations**: Bulk insert, update, delete, recover

### API Endpoints

Generated REST endpoints:

```
GET    /products           # List products with filtering/pagination
GET    /products/:id       # Get product by ID
GET    /products/grouped   # Group products with aggregations
POST   /products           # Create new product
PUT    /products/:id       # Update existing product
DELETE /products/:id       # Delete product
```

Generated GraphQL operations:

```graphql
query {
  products(where: {...}, orderBy: {...}, pagination: {...}) {
    items { id name price }
    pagination { total count page }
  }

  productsGrouped(groupBy: {...}) {
    groups { key aggregates }
    pagination { total count }
  }

  product(id: "123") { id name price }
}

mutation {
  createProduct(input: {...}) { id name }
  updateProduct(id: "123", input: {...}) { id name }
  removeProduct(id: "123") { id }
}
```

## Project Structure

Generated projects follow SOLID NestJS conventions:

```
my-project/
├── src/
│   ├── app.module.ts
│   ├── main.ts
│   └── modules/
│       └── products/
│           ├── dto/
│           │   ├── args/
│           │   │   ├── find-product-args.dto.ts
│           │   │   ├── grouped-product-args.dto.ts
│           │   │   └── index.ts
│           │   ├── create-product.dto.ts
│           │   ├── update-product.dto.ts
│           │   └── index.ts
│           ├── entities/
│           │   └── product.entity.ts
│           ├── products.controller.ts
│           ├── products.resolver.ts
│           ├── products.service.ts
│           ├── products.module.ts
│           └── index.ts
├── package.json
├── tsconfig.json
├── nest-cli.json
└── test/
    └── app.e2e-spec.ts
```

## Configuration

### CLI Configuration

Create a `.snestrc.json` file in your project root for default settings:

```json
{
  "defaultType": "hybrid",
  "defaultDatabase": "sqlite",
  "packageManager": "npm",
  "generateTests": true,
  "basePath": "src"
}
```

### TypeORM Configuration

Generated projects include pre-configured TypeORM settings for multiple databases:

```typescript
// For SQLite (default)
TypeOrmModule.forRoot({
  type: 'sqlite',
  database: 'database.sqlite',
  entities: [Product],
  synchronize: true,
});

// For PostgreSQL
TypeOrmModule.forRoot({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [Product],
  synchronize: process.env.NODE_ENV !== 'production',
});
```

## Features

- **🚀 SOLID Decorators Integration** - Generates code using unified decorators with 70-80% code reduction
- **🎯 Context-Aware Generation** - Detects project dependencies and offers relevant options
- **🔧 Advanced Query System** - Automatic generation of filtering, sorting, and aggregation DTOs
- **📊 GROUP BY Aggregations** - Built-in support for data aggregation with multiple functions
- **🗂️ Multi-Database Support** - Works with PostgreSQL, MySQL, SQL Server, and SQLite
- **🎨 Interactive Mode** - Guided generation with intelligent suggestions and validation
- **🏗️ Nested Module Support** - Generate hierarchical module structures
- **🔄 Protocol Agnostic** - Same code works for REST API, GraphQL, and hybrid applications
- **📝 Type Safety** - Full TypeScript support with comprehensive type definitions
- **🧪 Test Generation** - Optional test file generation with comprehensive coverage
- **⚡ Fast Generation** - Optimized templates and build process for quick scaffolding

## Development

```bash
# Install dependencies
npm install

# Build the CLI
npm run build

# Run in development mode
npm run dev

# Run tests
npm test

# Link locally for testing
npm link
```

## Examples

### Complete E-commerce API

```bash
# Create project
snest new ecommerce-api --type hybrid --database postgres

cd ecommerce-api

# Generate product resource
snest generate resource Product --fields "name:string,description:string,price:number,stock:number,categoryId:uuid" --generate-find-args --generate-group-by

# Generate category resource
snest generate resource Category --fields "name:string,description:string,parentId:uuid" --generate-find-args

# Generate user resource
snest generate resource User --fields "email:string,firstName:string,lastName:string,password:string" --generate-find-args

# Generate order resource
snest generate resource Order --fields "total:number,status:string,userId:uuid,orderDate:date" --generate-find-args --generate-group-by

# Start development
npm run start:dev
```

### GraphQL Blog API

```bash
# Create GraphQL project
snest new blog-api --type graphql --database mysql

cd blog-api

# Generate post resource
snest generate resource Post --fields "title:string,content:string,published:boolean,authorId:uuid" --generate-find-args --generate-group-by

# Generate author resource
snest generate resource Author --fields "name:string,email:string,bio:string" --generate-find-args

# Generate comment resource
snest generate resource Comment --fields "content:string,postId:uuid,authorId:uuid" --generate-find-args
```

## Troubleshooting

### Common Issues

**"Command not found"**

```bash
# Install globally
npm install -g @solid-nestjs/snest-cli

# Or use npx
npx @solid-nestjs/snest-cli
```

**"Cannot find module" errors**

- Ensure all dependencies are installed: `npm install`
- Check that you're using compatible versions of SOLID NestJS packages

**"TypeORM connection errors"**

- Verify database configuration in `app.module.ts`
- Ensure database server is running
- Check database credentials and permissions

**"GraphQL schema errors"**

- Make sure `@solid-nestjs/graphql` is installed
- Check that resolvers are properly registered in modules

### Getting Help

- 📖 [Documentation](https://github.com/solid-nestjs/framework)
- 🐛 [Issue Tracker](https://github.com/solid-nestjs/framework/issues)
- 💬 [Discord Community](https://discord.gg/solid-nestjs)

## Version

Current version: 0.3.0-alpha.1

## License

MIT
