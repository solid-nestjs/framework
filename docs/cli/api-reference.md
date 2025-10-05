# SNEST CLI API Reference

Complete reference for all SNEST CLI commands, options, and configurations.

## Global Options

Available for all commands:

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--version` | `-v` | Output the current version | - |
| `--help` | `-h` | Display help for command | - |

## Commands

### `snest new`

Create a new SOLID NestJS project.

```bash
snest new <project-name> [options]
```

#### Arguments

| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| `project-name` | string | Yes | Name of the project to create |

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--package-manager` | `npm\|yarn\|pnpm` | `npm` | Package manager to use |
| `--database` | `sqlite\|postgres\|mysql\|mssql` | `sqlite` | Database type |
| `--type` | `rest\|graphql\|hybrid` | `hybrid` | API type |
| `--skip-install` | boolean | `false` | Skip package installation |
| `--skip-git` | boolean | `false` | Skip git initialization |

#### Examples

```bash
# Basic project
snest new my-app

# PostgreSQL with GraphQL
snest new my-app --database postgres --type graphql

# Skip installation
snest new my-app --skip-install --skip-git
```

---

### `snest generate`

Generate SOLID NestJS components.

```bash
snest generate [options] [command]
```

#### Global Generate Options

| Option | Alias | Description |
|--------|-------|-------------|
| `--interactive` | `-i` | Run in interactive mode |

#### Subcommands

- [`entity`](#snest-generate-entity) - Generate database entity
- [`service`](#snest-generate-service) - Generate CRUD service
- [`controller`](#snest-generate-controller) - Generate REST controller
- [`module`](#snest-generate-module) - Generate NestJS module
- [`interactive`](#snest-generate-interactive) - Interactive mode

---

### `snest generate entity`

Generate a database entity with SOLID decorators.

```bash
snest generate entity <name> [options]
```

#### Arguments

| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | string | Yes | Entity name (PascalCase recommended) |

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--fields` | string | - | Entity fields definition |
| `--path` | string | `src/entities` | Custom output path |
| `--with-soft-delete` | boolean | `false` | Enable soft deletion |
| `--with-solid` | boolean | `true` | Use SOLID decorators |
| `--skip-module-update` | boolean | `false` | Skip automatic module updates |
| `--overwrite` | boolean | `false` | Overwrite existing files |

#### Field Definition Format

```
name:type[:modifier][,name:type[:modifier]]...
```

**Types:**
- `string` - Text field
- `number` - Numeric field  
- `boolean` - Boolean field
- `Date` - Date/timestamp field

**Modifiers:**
- `optional` - Nullable field
- `required` - Non-nullable field (default)

#### Examples

```bash
# Basic entity
snest generate entity User --fields "name:string,email:string"

# With optional fields
snest generate entity Product --fields "name:string,price:number,description:string:optional"

# With soft deletion
snest generate entity Order --fields "total:number,status:string" --with-soft-delete

# Custom path
snest generate entity Category --fields "name:string" --path "src/domain/entities"
```

#### Generated Output

```typescript
import { SolidEntity, SolidId, SolidField } from '@solid-nestjs/common';

@SolidEntity()
export class User {
  @SolidId()
  id: number;

  @SolidField({"type":"varchar"})
  name: string;

  @SolidField({"type":"varchar"})
  email: string;
}
```

---

### `snest generate service`

Generate a CRUD service with operations.

```bash
snest generate service <name> [options]
```

#### Arguments

| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | string | Yes | Service name (PascalCase recommended) |

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--entity-name` | string | - | Associated entity name |
| `--relations` | string | - | Entity relations definition |
| `--path` | string | `src/services` | Custom output path |
| `--with-solid` | boolean | `true` | Use SOLID decorators |
| `--with-args-helpers` | boolean | `false` | Include Args helpers |
| `--with-bulk-operations` | boolean | `false` | Enable bulk operations |
| `--with-soft-delete` | boolean | `false` | Enable soft deletion support |
| `--skip-module-update` | boolean | `false` | Skip automatic module updates |
| `--overwrite` | boolean | `false` | Overwrite existing files |

#### Relations Definition Format

```
name:type:target[:options][,name:type:target[:options]]...
```

**Relation Types:**
- `oneToOne` - One-to-one relationship
- `oneToMany` - One-to-many relationship
- `manyToOne` - Many-to-one relationship
- `manyToMany` - Many-to-many relationship

**Options:**
- `eager` - Eager loading
- `cascade` - Cascade operations

#### Examples

```bash
# Basic service
snest generate service Users --entity-name User

# With bulk operations
snest generate service Products --entity-name Product --with-bulk-operations

# With relations
snest generate service Orders --entity-name Order --relations "user:manyToOne:User:eager,items:oneToMany:OrderItem"

# With Args helpers
snest generate service Users --entity-name User --with-args-helpers --with-soft-delete
```

#### Generated Output

```typescript
import { Injectable } from '@nestjs/common';
import { CrudServiceFrom, CrudServiceStructure } from '@solid-nestjs/typeorm';
import { User } from '../entities/user.entity';

export const usersServiceStructure = CrudServiceStructure({
  entityType: User,
  createInputType: CreateUsersDto,
  updateInputType: UpdateUsersDto,
  enableBulkOperations: true,
});

@Injectable()
export class UsersService extends CrudServiceFrom(usersServiceStructure) {
  // Custom business logic methods can be added here
}
```

---

### `snest generate controller`

Generate a REST API controller.

```bash
snest generate controller <name> [options]
```

#### Arguments

| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | string | Yes | Controller name (PascalCase recommended) |

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--entity-name` | string | - | Associated entity name |
| `--service-name` | string | - | Associated service name |
| `--path` | string | `src/controllers` | Custom output path |
| `--type` | `rest\|graphql\|hybrid` | `rest` | API type |
| `--with-solid` | boolean | `true` | Use SOLID decorators |
| `--with-validation` | boolean | `true` | Enable request validation |
| `--with-args-helpers` | boolean | `false` | Include Args helpers |
| `--with-bulk-operations` | boolean | `false` | Enable bulk operations endpoints |
| `--with-soft-delete` | boolean | `false` | Enable soft deletion endpoints |
| `--with-guards` | boolean | `false` | Add authentication guards |
| `--skip-module-update` | boolean | `false` | Skip automatic module updates |
| `--overwrite` | boolean | `false` | Overwrite existing files |

#### Examples

```bash
# Basic controller
snest generate controller Users --entity-name User --service-name Users

# With validation and guards
snest generate controller Products --entity-name Product --with-validation --with-guards

# With bulk operations
snest generate controller Orders --entity-name Order --with-bulk-operations --with-soft-delete

# GraphQL controller
snest generate controller Users --entity-name User --type graphql
```

#### Generated Output

```typescript
import { Controller } from '@nestjs/common';
import { CrudControllerFrom, CrudControllerStructure } from '@solid-nestjs/rest-api';
import { UsersService } from '../services/users.service';
import { User } from '../entities/user.entity';

export const usersControllerStructure = CrudControllerStructure({
  entityType: User,
  serviceType: UsersService,
  createInputType: CreateUsersDto,
  updateInputType: UpdateUsersDto,
  operations: {
    findAll: true,
    findOne: true,
    create: true,
    update: true,
    remove: true,
  },
});

@Controller('users')
export class UsersController extends CrudControllerFrom(usersControllerStructure) {
  // Custom endpoints can be added here
}
```

---

### `snest generate module`

Generate a NestJS module with automatic imports.

```bash
snest generate module <name> [options]
```

#### Arguments

| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | string | Yes | Module name (PascalCase recommended) |

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--entities` | string | - | Entities to include (comma-separated) |
| `--services` | string | - | Services to include (comma-separated) |
| `--controllers` | string | - | Controllers to include (comma-separated) |
| `--path` | string | `src/modules` | Custom output path |
| `--with-exports` | boolean | `true` | Export services for other modules |
| `--overwrite` | boolean | `false` | Overwrite existing files |

#### Examples

```bash
# Basic module
snest generate module Users

# With components
snest generate module Products --entities "Product" --services "Products" --controllers "Products"

# Multiple entities
snest generate module Ecommerce --entities "User,Product,Order" --services "Users,Products,Orders" --controllers "Users,Products,Orders"

# No exports
snest generate module Internal --entities "Log" --services "Logs" --with-exports false
```

#### Generated Output

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { UsersService } from '../services/users.service';
import { UsersController } from '../controllers/users.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
    ]),
  ],
  controllers: [
    UsersController,
  ],
  providers: [
    UsersService,
  ],
  exports: [
    TypeOrmModule,
    UsersService,
  ],
})
export class UsersModule {}
```

---

### `snest generate interactive`

Launch interactive generation mode.

```bash
snest generate interactive
```

#### Features

- Component type selection
- Step-by-step configuration
- Input validation
- Smart defaults
- Preview before generation

#### Example Flow

```
🔍 SOLID NestJS Interactive Generator

? What would you like to generate?
❯ Entity - Database entity with SOLID decorators
  Service - CRUD service with operations
  Controller - REST API controller
  Module - NestJS module

? Entity name: Product
? Entity fields: name:string,price:number,description:string:optional
? Enable soft deletion? No
? Use SOLID decorators? Yes
? Output path: (leave empty for default)

✓ Entity 'Product' generated successfully
```

## AST Module Updates

The CLI automatically updates existing modules when generating new components.

### How It Works

1. **Detects** relevant modules in the project
2. **Analyzes** module structure using TypeScript AST
3. **Updates** imports and module arrays
4. **Preserves** existing code formatting
5. **Prevents** duplicate entries

### Affected Operations

| Component | Module Updates |
|-----------|----------------|
| Entity | Adds to `TypeOrmModule.forFeature([])` |
| Service | Adds to `providers` and `exports` arrays |
| Controller | Adds to `controllers` array |

### Disabling Auto-Updates

Use `--skip-module-update` to disable:

```bash
snest generate service Users --entity-name User --skip-module-update
```

## Template System

The CLI uses Handlebars templates with custom helpers.

### Available Helpers

| Helper | Description | Example |
|--------|-------------|---------|
| `pascalCase` | Convert to PascalCase | `{{pascalCase "user name"}}` → `UserName` |
| `camelCase` | Convert to camelCase | `{{camelCase "user name"}}` → `userName` |
| `kebabCase` | Convert to kebab-case | `{{kebabCase "user name"}}` → `user-name` |
| `snakeCase` | Convert to snake_case | `{{snakeCase "user name"}}` → `user_name` |
| `pluralize` | Pluralize string | `{{pluralize "user"}}` → `users` |
| `typeScriptType` | Convert to TS type | `{{typeScriptType "string"}}` → `string` |
| `jsonOptions` | Convert to JSON | `{{jsonOptions options}}` → `{"key":"value"}` |

### Template Structure

```
src/templates/
├── entity/
│   └── entity.hbs
├── service/
│   └── service.hbs
├── controller/
│   └── rest-controller.hbs
└── module/
    └── module.hbs
```

### Custom Templates

1. Copy default templates
2. Modify as needed
3. Use with `--template-path`

```bash
cp -r node_modules/@solid-nestjs/snest-cli/templates ./custom-templates
# Modify templates
snest generate entity User --template-path ./custom-templates
```

## Configuration

### Project Detection

The CLI automatically detects:

- **package.json** - Dependencies and project info
- **tsconfig.json** - TypeScript configuration
- **.snestrc** - CLI-specific settings (optional)

### Default Paths

```json
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

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SNEST_TEMPLATE_PATH` | Custom template directory | Built-in templates |
| `SNEST_SKIP_MODULE_UPDATE` | Disable auto-updates | `false` |
| `DEBUG` | Enable debug logging | - |

## Error Codes

| Code | Description | Resolution |
|------|-------------|------------|
| `E001` | Command not found | Install CLI globally |
| `E002` | Template not found | Rebuild CLI or check template path |
| `E003` | File write error | Check permissions |
| `E004` | Invalid field format | Check field syntax |
| `E005` | Module update failed | Use `--skip-module-update` |
| `E006` | TypeScript compilation error | Check generated code syntax |

## Best Practices

### Naming Conventions

- **Entities:** Singular PascalCase (`User`, `Product`)
- **Services:** Plural PascalCase (`Users`, `Products`)
- **Controllers:** Plural PascalCase (`Users`, `Products`)
- **Modules:** Descriptive PascalCase (`Users`, `Ecommerce`)
- **Files:** kebab-case (`user.entity.ts`, `users.service.ts`)

### Component Organization

```
src/
├── entities/          # Database entities
├── services/          # Business logic
├── controllers/       # API endpoints
├── modules/           # Feature modules
├── dto/
│   ├── args/          # Query arguments
│   └── inputs/        # Input DTOs
├── guards/            # Authentication guards
├── filters/           # Exception filters
└── interceptors/      # Request interceptors
```

### Field Types

| CLI Type | TypeScript | Database |
|----------|------------|----------|
| `string` | `string` | `varchar` |
| `number` | `number` | `integer` |
| `boolean` | `boolean` | `boolean` |
| `Date` | `Date` | `timestamp` |

### Advanced Usage

```bash
# Multi-domain project
snest g entity User --path "src/auth/entities"
snest g entity Product --path "src/catalog/entities"
snest g entity Order --path "src/orders/entities"

# With custom relations
snest g service Orders \
  --entity-name Order \
  --relations "user:manyToOne:User:eager,items:oneToMany:OrderItem:cascade"

# Full-featured controller
snest g controller Orders \
  --entity-name Order \
  --service-name Orders \
  --with-validation \
  --with-guards \
  --with-bulk-operations \
  --with-soft-delete
```

## Troubleshooting

### Common Issues

**Template not found:**
```bash
# Solution: Rebuild and copy templates
npm run build
cp -r src/templates/* dist/templates/
```

**Module update fails:**
```bash
# Solution: Skip auto-updates
snest generate service Users --skip-module-update
```

**Permission denied:**
```bash
# Solution: Check directory permissions
chmod 755 src/
```

**Command not found:**
```bash
# Solution: Install globally
npm install -g @solid-nestjs/snest-cli
```

### Debug Mode

Enable detailed logging:

```bash
DEBUG=snest:* snest generate entity User
```

### Support

- **Documentation:** [SOLID NestJS Docs](https://solid-nestjs.com)
- **Issues:** [GitHub Issues](https://github.com/solid-nestjs/framework/issues)
- **Community:** [Discord](https://discord.gg/solid-nestjs)