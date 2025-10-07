# SNEST CLI - SOLID NestJS Command Line Interface

<p align="center">
  <img src="https://img.shields.io/badge/version-0.3.0--alpha.1-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg" alt="Node Version">
  <img src="https://img.shields.io/badge/typescript-%3E%3D5.0.0-blue.svg" alt="TypeScript">
  <img src="https://img.shields.io/badge/status-stable-green.svg" alt="Status">
</p>

## Overview

SNEST CLI is a powerful command-line interface for generating SOLID NestJS applications and components. It provides automated code generation, intelligent module updates, and seamless integration with the SOLID NestJS framework.

## Features

- 🚀 **Complete Project Generation** - Generate full SOLID NestJS projects
- 🎯 **Component Generators** - Entity, Service, Controller, Module generators
- 🔄 **AST-based Module Updates** - Automatic module updates using TypeScript AST
- 🎨 **Interactive Mode** - Guided component generation
- 📝 **SOLID Integration** - Built-in SOLID decorators and patterns
- 🗄️ **Multi-Database Support** - SQLite, PostgreSQL, MySQL, SQL Server
- 📚 **API Types** - REST, GraphQL, and Hybrid APIs
- ✨ **Smart Templates** - Handlebars templates with custom helpers

## Installation

### Global Installation (Recommended)

```bash
npm install -g @solid-nestjs/cli
```

### Local Installation

```bash
npm install @solid-nestjs/cli
npx snest --help
```

### Development Setup

```bash
# Clone the repository
git clone https://github.com/solid-nestjs/framework.git
cd framework/packages-tools/cli

# Install dependencies
npm install

# Build the CLI
npm run build

# Copy templates
cp -r src/templates/* dist/templates/

# Test the CLI
node dist/cli.js --help
```

## Quick Start

### Create a New Project

```bash
# Create a new SOLID NestJS project
snest new my-app

# With custom options
snest new my-app --database postgres --type hybrid --package-manager yarn
```

### Generate Components

```bash
# Generate an entity
snest generate entity Product --fields "name:string,price:number,description:string:optional"

# Generate a service
snest generate service Products --entity-name Product --with-bulk-operations

# Generate a controller
snest generate controller Products --entity-name Product --with-validation

# Generate a module
snest generate module Products --entities "Product" --services "Products" --controllers "Products"
```

### Interactive Mode

```bash
# Launch interactive generator
snest generate interactive

# Or use shorthand
snest g -i
```

## Commands

### `snest new`

Create a new SOLID NestJS project with complete setup.

```bash
snest new <project-name> [options]
```

**Options:**

- `--package-manager <manager>` - Package manager (npm, yarn, pnpm)
- `--database <type>` - Database type (sqlite, postgres, mysql, mssql)
- `--type <api-type>` - API type (rest, graphql, hybrid)
- `--skip-install` - Skip package installation
- `--skip-git` - Skip git initialization

### `snest generate`

Generate SOLID NestJS components.

```bash
snest generate <component> <name> [options]
```

**Available Components:**

- `entity` - Database entity with SOLID decorators
- `service` - CRUD service with operations
- `controller` - REST API controller
- `module` - NestJS module with auto-imports

## Generators Guide

### Entity Generator

Generate TypeORM entities with SOLID decorators.

```bash
snest generate entity <name> [options]
```

**Options:**

- `--fields <fields>` - Entity fields (format: `name:type:modifier`)
- `--with-soft-delete` - Enable soft deletion
- `--with-solid` - Use SOLID decorators (default: true)
- `--skip-module-update` - Skip automatic module updates
- `--path <path>` - Custom output path
- `--overwrite` - Overwrite existing files

**Field Format:**

```
name:type[:modifier]
```

**Types:** `string`, `number`, `boolean`, `Date`
**Modifiers:** `optional`, `required` (default)

**Example:**

```bash
snest generate entity Product --fields "name:string,price:number,description:string:optional,createdAt:Date"
```

**Generated Code:**

```typescript
import { SolidEntity, SolidId, SolidField } from '@solid-nestjs/common';

@SolidEntity()
export class Product {
  @SolidId()
  id: number;

  @SolidField({ type: 'varchar' })
  name: string;

  @SolidField({ type: 'integer' })
  price: number;

  @SolidField({ nullable: true, type: 'varchar' })
  description?: string;

  @SolidField({ type: 'timestamp' })
  createdAt: Date;
}
```

### Service Generator

Generate CRUD services with SOLID patterns.

```bash
snest generate service <name> [options]
```

**Options:**

- `--entity-name <name>` - Associated entity name
- `--relations <relations>` - Entity relations
- `--with-solid` - Use SOLID decorators (default: true)
- `--with-args-helpers` - Include Args helpers
- `--with-bulk-operations` - Enable bulk operations
- `--with-soft-delete` - Enable soft deletion support
- `--skip-module-update` - Skip automatic module updates
- `--path <path>` - Custom output path

**Relations Format:**

```
name:type:target[:options]
```

**Example:**

```bash
snest generate service Products --entity-name Product --with-bulk-operations --relations "supplier:manyToOne:Supplier:eager"
```

**Generated Code:**

```typescript
import { Injectable } from '@nestjs/common';
import { CrudServiceFrom, CrudServiceStructure } from '@solid-nestjs/typeorm';
import { Product } from '../entities/product.entity';

export const productsServiceStructure = CrudServiceStructure({
  entityType: Product,
  createInputType: CreateProductsDto,
  updateInputType: UpdateProductsDto,
  enableBulkOperations: true,
});

@Injectable()
export class ProductsService extends CrudServiceFrom(productsServiceStructure) {
  // Custom business logic methods can be added here
}
```

### Controller Generator

Generate REST API controllers with validation and Swagger.

```bash
snest generate controller <name> [options]
```

**Options:**

- `--entity-name <name>` - Associated entity name
- `--service-name <name>` - Associated service name
- `--type <type>` - API type (rest, graphql, hybrid)
- `--with-solid` - Use SOLID decorators (default: true)
- `--with-validation` - Enable request validation (default: true)
- `--with-args-helpers` - Include Args helpers
- `--with-bulk-operations` - Enable bulk operation endpoints
- `--with-soft-delete` - Enable soft deletion endpoints
- `--with-guards` - Add authentication guards
- `--skip-module-update` - Skip automatic module updates
- `--path <path>` - Custom output path

**Example:**

```bash
snest generate controller Products --entity-name Product --service-name Products --with-validation --with-bulk-operations
```

### Module Generator

Generate NestJS modules with automatic imports and configuration.

```bash
snest generate module <name> [options]
```

**Options:**

- `--entities <entities>` - Entities to include (comma-separated)
- `--services <services>` - Services to include (comma-separated)
- `--controllers <controllers>` - Controllers to include (comma-separated)
- `--with-exports` - Export services for other modules (default: true)
- `--path <path>` - Custom output path

**Example:**

```bash
snest generate module Products --entities "Product" --services "Products" --controllers "Products"
```

**Generated Code:**

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { ProductsService } from '../services/products.service';
import { ProductsController } from '../controllers/products.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [TypeOrmModule, ProductsService],
})
export class ProductsModule {}
```

## AST-based Module Updates

The CLI includes an advanced AST-based system that automatically updates existing modules when new components are generated.

### How it Works

1. **Component Detection** - Scans for relevant modules in the project
2. **Smart Updates** - Uses TypeScript AST to modify module files
3. **Import Management** - Automatically adds necessary imports
4. **Array Updates** - Updates provider, controller, and entity arrays
5. **Duplicate Prevention** - Prevents duplicate entries

### Features

- ✅ Automatic import statements
- ✅ TypeORM.forFeature entity registration
- ✅ Provider array updates for services
- ✅ Controller array updates
- ✅ Export array updates
- ✅ Preserves existing code format
- ✅ Prevents duplicate entries

### Example

When you generate a new service:

```bash
snest generate service Orders --entity-name Order
```

The CLI automatically:

1. Adds `import { OrdersService } from '../services/orders.service';`
2. Adds `OrdersService` to the module's `providers` array
3. Adds `OrdersService` to the module's `exports` array
4. Updates multiple relevant modules in the project

### Disabling Auto-Updates

Use the `--skip-module-update` flag to disable automatic module updates:

```bash
snest generate service Orders --entity-name Order --skip-module-update
```

## Interactive Mode

The interactive mode provides a guided experience for component generation.

### Launch Interactive Mode

```bash
snest generate interactive
# or
snest g -i
```

### Features

- 📋 **Component Selection** - Choose from available generators
- ⚙️ **Configuration Wizard** - Step-by-step option configuration
- ✅ **Input Validation** - Real-time validation of inputs
- 💡 **Smart Defaults** - Sensible default values
- 🔄 **Iterative Process** - Easy to modify and regenerate

### Example Flow

1. **Select Component Type**

   ```
   ? What would you like to generate?
   ❯ Entity - Database entity with SOLID decorators
     Service - CRUD service with operations
     Controller - REST API controller
     Module - NestJS module
   ```

2. **Configure Options**

   ```
   ? Entity name: Product
   ? Entity fields: name:string,price:number,description:string:optional
   ? Enable soft deletion? No
   ? Use SOLID decorators? Yes
   ? Output path: (leave empty for default)
   ```

3. **Generate Component**

   ```
   ✓ Entity 'Product' generated successfully

   Generated files:
     - src/entities/product.entity.ts

   Next steps:
     1. Add the entity to your module's TypeORM forFeature array
   ```

## Configuration

### Project Configuration

The CLI reads configuration from multiple sources:

1. **package.json** - Project metadata and dependencies
2. **tsconfig.json** - TypeScript configuration
3. **.snestrc** - CLI-specific configuration (optional)

### Default Paths

```javascript
{
  "paths": {
    "entities": "src/entities",
    "services": "src/services",
    "controllers": "src/controllers",
    "modules": "src/modules",
    "dto": "src/dto"
  }
}
```

### Custom Templates

You can customize the templates used by the CLI:

1. Copy default templates: `cp -r node_modules/@solid-nestjs/cli/templates ./custom-templates`
2. Modify templates as needed
3. Use with `--template-path ./custom-templates`

## Examples

### Complete Resource Generation

Generate a complete resource (entity + service + controller + module):

```bash
# Step 1: Generate entity
snest generate entity Product --fields "name:string,price:number,description:string:optional,categoryId:number"

# Step 2: Generate service
snest generate service Products --entity-name Product --with-bulk-operations

# Step 3: Generate controller
snest generate controller Products --entity-name Product --service-name Products --with-validation

# Step 4: Generate module
snest generate module Products --entities "Product" --services "Products" --controllers "Products"
```

### E-commerce Example

```bash
# Create project
snest new ecommerce-api --database postgres --type hybrid

cd ecommerce-api

# Generate User entity
snest g entity User --fields "email:string,password:string,firstName:string,lastName:string,role:string"

# Generate Product entity
snest g entity Product --fields "name:string,description:string,price:number,stock:number,categoryId:number" --with-soft-delete

# Generate Order entity
snest g entity Order --fields "userId:number,totalAmount:number,status:string,orderDate:Date" --with-soft-delete

# Generate services
snest g service Users --entity-name User --with-args-helpers
snest g service Products --entity-name Product --with-bulk-operations --with-soft-delete
snest g service Orders --entity-name Order --with-bulk-operations --with-soft-delete

# Generate controllers
snest g controller Users --entity-name User --with-guards
snest g controller Products --entity-name Product --with-validation --with-bulk-operations
snest g controller Orders --entity-name Order --with-validation --with-guards

# Generate modules
snest g module Users --entities "User" --services "Users" --controllers "Users"
snest g module Products --entities "Product" --services "Products" --controllers "Products"
snest g module Orders --entities "Order" --services "Orders" --controllers "Orders"
```

## Troubleshooting

### Common Issues

#### 1. Module Not Found Errors

**Problem:** TypeScript can't find generated modules
**Solution:**

```bash
# Rebuild the project
npm run build

# Verify paths in tsconfig.json
```

#### 2. Template Not Found

**Problem:** CLI can't find template files
**Solution:**

```bash
# Copy templates to dist directory
cp -r src/templates/* dist/templates/

# Or reinstall the CLI
npm install -g @solid-nestjs/cli
```

#### 3. AST Update Failures

**Problem:** Module updates fail with syntax errors
**Solution:**

```bash
# Use skip-module-update flag
snest generate service Products --skip-module-update

# Manually update modules
```

#### 4. Permission Errors

**Problem:** Cannot write files to directory
**Solution:**

```bash
# Check directory permissions
chmod 755 src/

# Run with proper permissions
sudo snest generate entity Product
```

### Debug Mode

Enable debug logging:

```bash
DEBUG=snest:* snest generate entity Product
```

### Getting Help

- **CLI Help:** `snest --help` or `snest generate --help`
- **Issues:** [GitHub Issues](https://github.com/solid-nestjs/framework/issues)
- **Documentation:** [SOLID NestJS Docs](https://solid-nestjs.com/docs)
- **Community:** [Discord](https://discord.gg/solid-nestjs)

## Contributing

### Development Setup

```bash
# Clone repository
git clone https://github.com/solid-nestjs/framework.git
cd framework/packages-tools/cli

# Install dependencies
npm install

# Build CLI
npm run build

# Run tests
npm test

# Copy templates
cp -r src/templates/* dist/templates/
```

### Adding New Generators

1. Create generator class in `src/generators/`
2. Create template in `src/templates/`
3. Add command to `src/commands/generate.command.ts`
4. Add tests in `src/generators/*.spec.ts`
5. Update documentation

### Template Development

Templates use Handlebars with custom helpers:

```handlebars
{{! Entity template example }}
import { SolidEntity, SolidId, SolidField } from '@solid-nestjs/common';
@SolidEntity() export class
{{pascalCase name}}
{ @SolidId() id: number;

{{#each fields}}
  @SolidField({{jsonOptions this.options}})
  {{this.name}}{{#unless this.required}}?{{/unless}}:
  {{typeScriptType this.type}};
{{/each}}
}
```

**Available Helpers:**

- `pascalCase` - Convert to PascalCase
- `camelCase` - Convert to camelCase
- `kebabCase` - Convert to kebab-case
- `snakeCase` - Convert to snake_case
- `pluralize` - Pluralize string
- `typeScriptType` - Convert to TypeScript type
- `jsonOptions` - Convert object to JSON

## Changelog

### v0.3.0-alpha.1 (Latest)

#### Added

- ✨ Complete Entity Generator with SOLID decorators
- ✨ Service Generator with CRUD operations
- ✨ Controller Generator with REST API support
- ✨ Module Generator with auto-imports
- ✨ AST-based module updating system
- ✨ Interactive mode for guided generation
- ✨ Handlebars template system with custom helpers
- ✨ Multi-database support (SQLite, PostgreSQL, MySQL, SQL Server)
- ✨ Support for REST, GraphQL, and Hybrid APIs
- ✨ Automatic module updates with TypeScript AST
- ✨ Bulk operations support
- ✨ Soft deletion support
- ✨ Validation and Swagger integration

#### Technical Details

- 🔧 Commander.js for CLI framework
- 🔧 Handlebars for templating
- 🔧 TypeScript AST for code manipulation
- 🔧 Inquirer.js for interactive prompts
- 🔧 Chalk for colored output
- 🔧 Ora for loading spinners

## License

MIT License - see [LICENSE](../../LICENSE) file for details.

## Support

- 📖 **Documentation:** [SOLID NestJS Docs](https://solid-nestjs.com/docs)
- 🐛 **Bug Reports:** [GitHub Issues](https://github.com/solid-nestjs/framework/issues)
- 💬 **Community:** [Discord](https://discord.gg/solid-nestjs)
- 📧 **Email:** support@solid-nestjs.com
