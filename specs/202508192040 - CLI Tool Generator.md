# SNEST - SOLID NestJS CLI Tool Generator Specification

## Document Information

- **Date**: August 19, 2025
- **Version**: 1.1
- **Status**: Draft
- **Author**: Development Team

## Executive Summary

This specification defines the implementation of a Command Line Interface (CLI) tool called **SNEST** (SOLID + NestJS) for the SOLID NestJS Framework. The CLI will provide developers with scaffolding capabilities similar to the NestJS CLI, but optimized for the SOLID framework's architecture and patterns, including automatic generation of services, controllers, modules, entities, and DTOs with SOLID decorators.

> **Note**: The CLI is named `snest` to avoid conflicts with existing tools like SolidJS's `solid` CLI.

## Goals and Objectives

### Primary Goals

1. **Accelerate Development**: Reduce boilerplate code creation time by 80-90%
2. **Enforce Best Practices**: Generate code following SOLID principles and framework patterns
3. **Lower Entry Barrier**: Make the framework more accessible to new developers
4. **Maintain Consistency**: Ensure generated code follows established conventions

### Key Objectives

- Provide intuitive command-line interface for code generation
- Support all framework features (REST, GraphQL, Hybrid)
- Generate production-ready code with proper typing and validation
- Integrate with existing SOLID decorators and Args helpers
- Support multiple database types (TypeORM configurations)

## Functional Requirements

### Core Commands

#### 1. Project Initialization

```bash
snest new <project-name> [options]
```

**Options:**

- `--package-manager` (npm|yarn|pnpm) - Default: npm
- `--database` (sqlite|postgres|mysql|mssql) - Default: sqlite
- `--type` (rest|graphql|hybrid) - Default: hybrid
- `--docker` - Generate Docker and Docker Compose files
- `--skip-install` - Skip dependency installation
- `--skip-git` - Skip git initialization
- `--skip-docker` - Skip Docker files generation

**Generated Structure:**

```
project-name/
├── src/
│   ├── app.module.ts
│   ├── main.ts
│   └── config/
│       └── database.config.ts
├── test/
├── docker/                    # Generated if --docker flag
│   ├── docker-compose.yml
│   ├── docker-compose.dev.yml
│   ├── Dockerfile
│   └── .dockerignore
├── .env.example
├── .env.docker               # Docker-specific env vars
├── .gitignore
├── nest-cli.json
├── package.json
├── tsconfig.json
└── README.md
```

#### 2. Module Generation

```bash
snest generate module <name> [options]
snest g mo <name> [options]  # Alias
```

**Options:**

- `--path` - Custom path for module
- `--flat` - No dedicated folder
- `--no-spec` - Skip test file generation

**Generated Files:**

- `<name>.module.ts` - Module definition with imports

#### 3. Entity Generation

```bash
snest generate entity <name> [options]
snest g e <name> [options]  # Alias
```

**Options:**

- `--fields` - Comma-separated field definitions
- `--with-solid` - Use SOLID decorators (default: true)
- `--soft-delete` - Include soft deletion column
- `--composite-key` - Define composite primary key
- `--path` - Custom path

**Field Definition Format:**

```bash
--fields "name:string:required,price:number,description:string:optional,supplier:relation:manyToOne:Supplier"
```

**Generated Example:**

```typescript
import { SolidEntity, SolidId, SolidField } from '@solid-nestjs/common';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  DeleteDateColumn,
} from 'typeorm';

@SolidEntity()
export class Product {
  @SolidId()
  id: number;

  @SolidField()
  name: string;

  @SolidField()
  price: number;

  @SolidField({ nullable: true })
  description?: string;

  @DeleteDateColumn()
  deletedAt?: Date;
}
```

#### 4. Service Generation

```bash
snest generate service <name> [options]
snest g s <name> [options]  # Alias
```

**Options:**

- `--entity` - Associated entity name
- `--type` (crud|custom) - Default: crud
- `--with-bulk` - Include bulk operations
- `--with-soft-delete` - Include soft delete operations
- `--path` - Custom path

**Generated Example:**

```typescript
import { Injectable } from '@nestjs/common';
import { CrudServiceStructure, CrudServiceFrom } from '@solid-nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { CreateProductDto, UpdateProductDto, FindProductArgs } from '../dto';

export const productServiceStructure = CrudServiceStructure({
  entityType: Product,
  createInputType: CreateProductDto,
  updateInputType: UpdateProductDto,
  findArgsType: FindProductArgs,
  enableBulkOperations: true,
  enableSoftDelete: true,
});

@Injectable()
export class ProductsService extends CrudServiceFrom(productServiceStructure) {
  // Custom methods can be added here
}
```

#### 5. Controller Generation

```bash
snest generate controller <name> [options]
snest g co <name> [options]  # Alias
```

**Options:**

- `--type` (rest|graphql|hybrid) - Default: rest
- `--service` - Associated service name
- `--path` - Custom path
- `--with-swagger` - Add Swagger decorators (REST)
- `--with-guards` - Add authentication guards

**REST Controller Example:**

```typescript
import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  CrudControllerStructure,
  CrudControllerFrom,
} from '@solid-nestjs/rest-api';
import {
  ProductsService,
  productServiceStructure,
} from '../services/products.service';

const controllerStructure = CrudControllerStructure({
  ...productServiceStructure,
  serviceType: ProductsService,
  path: 'products',
  apiTags: ['Products'],
  operations: {
    findAll: true,
    findOne: true,
    create: true,
    update: true,
    remove: true,
    bulkCreate: true,
    bulkUpdate: true,
    bulkRemove: true,
  },
});

@Controller('products')
@ApiTags('Products')
export class ProductsController extends CrudControllerFrom(
  controllerStructure,
) {}
```

#### 6. DTO Generation

```bash
snest generate dto <entity-name> [options]
snest g d <entity-name> [options]  # Alias
```

**Options:**

- `--type` (create|update|find|all) - Default: all
- `--from-entity` - Generate from existing entity
- `--with-validation` - Add validation decorators
- `--with-args-helpers` - Use Args helpers
- `--path` - Custom path

**Generated Structure:**

```
dto/
├── inputs/
│   ├── create-product.dto.ts
│   └── update-product.dto.ts
└── args/
    └── find-product.args.ts
```

**Using Args Helpers Example:**

```typescript
import { ArgsType } from '@nestjs/graphql';
import {
  GroupByArgsFrom,
  createWhereFields,
  createOrderByFields,
} from '@solid-nestjs/graphql';
import { Product } from '../../entities/product.entity';

@ArgsType()
export class FindProductArgs extends GroupByArgsFrom(Product) {
  where = createWhereFields(Product, ['name', 'price', 'supplier']);
  orderBy = createOrderByFields(Product, ['name', 'price', 'createdAt']);
}
```

#### 7. Resource Generation (All-in-One)

```bash
snest generate resource <name> [options]
snest g res <name> [options]  # Alias
```

**Options:**

- `--type` (rest|graphql|hybrid) - Default: hybrid
- `--fields` - Entity field definitions
- `--with-tests` - Generate test files
- `--crud` - Generate full CRUD operations

**Generates:**

- Entity
- DTOs (Create, Update, Find)
- Service
- Controller/Resolver
- Module with imports
- Test files (optional)

#### 8. Docker Configuration Generation

```bash
snest generate docker [options]
snest g docker [options]  # Alias
```

**Options:**

- `--database` (postgres|mysql|mssql|redis|all) - Default: detected from project
- `--dev-only` - Generate only development configuration
- `--production` - Include production-ready configuration
- `--with-redis` - Include Redis service
- `--with-nginx` - Include Nginx reverse proxy
- `--override` - Override existing Docker files

**Generated Files:**

```bash
docker/
├── docker-compose.yml           # Production configuration
├── docker-compose.dev.yml       # Development with hot reload
├── docker-compose.override.yml  # Local overrides (gitignored)
├── Dockerfile                   # Multi-stage application build
├── Dockerfile.dev               # Development with hot reload
└── .dockerignore                # Docker ignore patterns
```

**Database-Specific Services:**

- **PostgreSQL**: Latest with persistent volume and health checks
- **MySQL**: Latest with charset configuration
- **SQL Server**: Latest with accept EULA and SA password
- **Redis**: For caching and session storage
- **Nginx**: Reverse proxy for production deployments

### Context-Aware Interactive Mode

```bash
snest generate --interactive
snest g -i  # Alias
```

Provides intelligent step-by-step wizard that adapts to the current project environment:

#### Project Context Detection

The wizard automatically detects and adapts based on:

- **Package.json analysis** - Detects installed dependencies
- **Framework version** - SOLID NestJS packages and versions
- **Project structure** - Existing entities, services, controllers
- **Database configuration** - TypeORM setup and database type
- **API type** - REST, GraphQL, or Hybrid based on dependencies

#### Smart Generation Options

**Dependency-Based Options:**

```typescript
interface ProjectContext {
  // Framework detection
  hasSolidNestjs: boolean;
  solidVersion: string;

  // API capabilities
  hasGraphQL: boolean; // @nestjs/graphql detected
  hasSwagger: boolean; // @nestjs/swagger detected
  hasTypeORM: boolean; // typeorm detected

  // Database type
  databaseType: 'sqlite' | 'postgres' | 'mysql' | 'mssql';

  // Existing structure
  existingEntities: string[];
  existingServices: string[];
  existingControllers: string[];

  // Framework features
  hasSolidDecorators: boolean; // @solid-nestjs/common detected
  hasArgsHelpers: boolean; // Args helper packages
  hasEntityGeneration: boolean; // Entity-to-DTO packages
}
```

**Context-Aware Prompts:**

1. **What would you like to generate?** (Filtered by capabilities)
   - ✅ Entity (always available)
   - ✅ Service (always available)
   - ✅ REST Controller (if @nestjs/swagger or basic REST)
   - ✅ GraphQL Resolver (only if @nestjs/graphql detected)
   - ✅ Hybrid Controller (only if both REST + GraphQL available)
   - ✅ Complete Resource (with detected API types)
2. **Select target entity** (if generating service/controller)
   - Shows existing entities from project scan
   - Option to create new entity
3. **Choose API type** (based on available dependencies)
   - REST API (if Swagger available)
   - GraphQL API (if GraphQL available)
   - Hybrid (if both available)
4. **Select framework features** (based on installed packages)
   - ✅ Use SOLID decorators (if @solid-nestjs/common available)
   - ✅ Use Args helpers (if args helper packages available)
   - ✅ Auto-generate DTOs (if entity generation packages available)
   - ✅ Soft deletion (if DeleteDateColumn support detected)
   - ✅ Bulk operations (if bulk operation packages available)

#### Example Context-Aware Flow

```bash
$ snest generate --interactive

🔍 Analyzing project context...
✓ Found SOLID NestJS v0.2.9
✓ GraphQL support detected (@nestjs/graphql)
✓ Swagger support detected (@nestjs/swagger)
✓ SOLID decorators available
✓ Args helpers available
✓ Database: PostgreSQL

? What would you like to generate?
❯ Complete Resource (Entity + Service + Controller + DTOs)
  Entity
  Service
  Controller (REST + GraphQL)  ← Smart: Both options available
  GraphQL Resolver            ← Smart: Only shown because GraphQL detected
  Module
  DTO

? Resource name: Product

? I found these existing entities, create relations?
  ◯ Category (category.entity.ts)
  ◯ Supplier (supplier.entity.ts)
  ◯ User (user.entity.ts)

? Choose API type: (Smart: Both detected)
  REST API
❯ GraphQL API
  Hybrid (REST + GraphQL)     ← Recommended for this project

? Framework features: (Smart: Pre-selected based on available packages)
❯◉ Use SOLID decorators      ← Auto-selected: @solid-nestjs/common found
 ◉ Use Args helpers          ← Auto-selected: Args packages found
 ◉ Auto-generate DTOs        ← Auto-selected: Generation packages found
 ◉ Soft deletion support     ← Available: TypeORM detected
 ◉ Bulk operations           ← Available: Bulk packages found
 ◯ Generate tests
```

### Configuration Commands

```bash
snest config set <key> <value>  # Set configuration
snest config get <key>          # Get configuration value
snest config list               # List all configurations
```

**Configuration Options:**

- `defaultDatabase` - Default database type
- `defaultPackageManager` - Default package manager
- `generateTests` - Auto-generate test files
- `useStrictMode` - Enable strict TypeScript
- `defaultApiType` - Default API type (rest|graphql|hybrid)

## Technical Architecture

### Technology Stack

- **Core**: Node.js with TypeScript
- **CLI Framework**: Commander.js or Yargs
- **Template Engine**: Handlebars or EJS
- **File Operations**: Node.js fs module with fs-extra
- **Interactive Prompts**: Inquirer.js
- **Code Formatting**: Prettier API
- **AST Manipulation**: TypeScript Compiler API

### Package Structure (Within Monorepo)

The CLI package will be integrated into the existing monorepo structure as a new workspace:

```
D:\NodeJS\solid-nestjs\framework/
├── packages-core/
├── packages-bundles/
├── packages-tools/          # New category for tooling
│   └── cli/           # CLI package as workspace
│       ├── src/
│       │   ├── commands/
│       │   │   ├── new.command.ts
│       │   │   ├── generate.command.ts
│       │   │   └── config.command.ts
│       │   ├── generators/
│       │   │   ├── entity.generator.ts
│       │   │   ├── service.generator.ts
│       │   │   ├── controller.generator.ts
│       │   │   ├── module.generator.ts
│       │   │   └── dto.generator.ts
│       │   ├── templates/
│       │   │   ├── entity/
│       │   │   ├── service/
│       │   │   ├── controller/
│       │   │   └── ...
│       │   ├── utils/
│       │   │   ├── file.utils.ts
│       │   │   ├── string.utils.ts
│       │   │   └── ast.utils.ts
│       │   ├── config/
│       │   │   └── cli.config.ts
│       │   └── cli.ts
│       ├── bin/
│       │   └── snest.js
│       ├── package.json
│       └── README.md
├── apps-examples/
└── package.json             # Root package.json needs workspace update
```

### Context Detection System

The CLI implements intelligent project analysis to provide context-aware generation:

```typescript
class ProjectAnalyzer {
  async analyzeProject(projectPath: string): Promise<ProjectContext> {
    const context: ProjectContext = {
      // Analyze package.json
      ...(await this.analyzePackageJson(projectPath)),

      // Scan project structure
      ...(await this.scanProjectStructure(projectPath)),

      // Detect database configuration
      ...(await this.detectDatabaseConfig(projectPath)),

      // Analyze existing code
      ...(await this.analyzeExistingCode(projectPath)),
    };

    return context;
  }

  private async analyzePackageJson(
    projectPath: string,
  ): Promise<Partial<ProjectContext>> {
    const packageJson = await this.readPackageJson(projectPath);
    const dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    return {
      hasSolidNestjs: Object.keys(dependencies).some(dep =>
        dep.startsWith('@solid-nestjs'),
      ),
      hasGraphQL: !!dependencies['@nestjs/graphql'],
      hasSwagger: !!dependencies['@nestjs/swagger'],
      hasTypeORM: !!dependencies['typeorm'],
      hasSolidDecorators: !!dependencies['@solid-nestjs/common'],
      hasArgsHelpers: !!(
        dependencies['@solid-nestjs/graphql'] ||
        dependencies['@solid-nestjs/rest-api'] ||
        dependencies['@solid-nestjs/rest-graphql']
      ),
      hasEntityGeneration: !!dependencies['@solid-nestjs/common'],
      solidVersion: this.extractSolidVersion(dependencies),
    };
  }

  private async scanProjectStructure(
    projectPath: string,
  ): Promise<Partial<ProjectContext>> {
    return {
      existingEntities: await this.findEntities(projectPath),
      existingServices: await this.findServices(projectPath),
      existingControllers: await this.findControllers(projectPath),
    };
  }

  private async detectDatabaseConfig(
    projectPath: string,
  ): Promise<Partial<ProjectContext>> {
    // Check ormconfig.js/ts, .env, app.module.ts for database configuration
    const configFiles = [
      'ormconfig.json',
      'ormconfig.js',
      '.env',
      'src/app.module.ts',
    ];

    for (const configFile of configFiles) {
      const dbType = await this.extractDatabaseType(
        `${projectPath}/${configFile}`,
      );
      if (dbType) return { databaseType: dbType };
    }

    return { databaseType: 'sqlite' }; // Default fallback
  }
}
```

**Detection Capabilities:**

| Feature               | Detection Method                       | Fallback Behavior       |
| --------------------- | -------------------------------------- | ----------------------- |
| **GraphQL Support**   | `@nestjs/graphql` in package.json      | Hide GraphQL options    |
| **Swagger Support**   | `@nestjs/swagger` in package.json      | Hide Swagger decorators |
| **SOLID Decorators**  | `@solid-nestjs/common` in package.json | Use standard decorators |
| **Args Helpers**      | SOLID packages in dependencies         | Manual DTO creation     |
| **Database Type**     | ormconfig/env analysis                 | Default to SQLite       |
| **Existing Entities** | File system scan for `*.entity.ts`     | Empty list              |
| **Soft Delete**       | `@DeleteDateColumn` usage detected     | Don't offer option      |
| **Bulk Operations**   | SOLID packages with bulk support       | Standard CRUD only      |

### Docker Compose Templates

The CLI will generate Docker configurations optimized for SOLID NestJS applications:

#### PostgreSQL Development Setup

```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  app:
    build:
      context: .
      dockerfile: docker/Dockerfile.dev
    ports:
      - '${APP_PORT:-3000}:3000'
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_DATABASE=${DB_DATABASE:-solid_dev}
      - DB_USERNAME=${DB_USERNAME:-postgres}
      - DB_PASSWORD=${DB_PASSWORD:-password}
    depends_on:
      postgres:
        condition: service_healthy
    command: npm run start:dev

  postgres:
    image: postgres:15-alpine
    ports:
      - '${DB_PORT:-5432}:5432'
    environment:
      POSTGRES_DB: ${DB_DATABASE:-solid_dev}
      POSTGRES_USER: ${DB_USERNAME:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-password}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./docker/init-db.sql:/docker-entrypoint-initdb.d/init-db.sql
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U ${DB_USERNAME:-postgres}']
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

#### Multi-Database Support Template

```yaml
# docker-compose.yml (Production-ready)
version: '3.8'
services:
  app:
    build:
      context: .
      dockerfile: docker/Dockerfile
    ports:
      - "${APP_PORT:-3000}:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST={{databaseHost}}
      - DB_PORT={{databasePort}}
      - DB_DATABASE=${DB_DATABASE}
      - DB_USERNAME=${DB_USERNAME}
      - DB_PASSWORD=${DB_PASSWORD}
    depends_on:
      {{#if usePostgres}}
      postgres:
        condition: service_healthy
      {{/if}}
      {{#if useMySQL}}
      mysql:
        condition: service_healthy
      {{/if}}
      {{#if useSQLServer}}
      sqlserver:
        condition: service_healthy
      {{/if}}
      {{#if useRedis}}
      redis:
        condition: service_healthy
      {{/if}}
    restart: unless-stopped

  {{#if usePostgres}}
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ${DB_DATABASE}
      POSTGRES_USER: ${DB_USERNAME}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USERNAME}"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped
  {{/if}}

  {{#if useMySQL}}
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: ${DB_DATABASE}
      MYSQL_USER: ${DB_USERNAME}
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped
  {{/if}}

  {{#if useSQLServer}}
  sqlserver:
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment:
      SA_PASSWORD: ${DB_SA_PASSWORD}
      ACCEPT_EULA: Y
      MSSQL_PID: Developer
    volumes:
      - sqlserver_data:/var/opt/mssql
    healthcheck:
      test: ["CMD-SHELL", "/opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P ${DB_SA_PASSWORD} -Q 'SELECT 1'"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped
  {{/if}}

  {{#if useRedis}}
  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped
  {{/if}}

  {{#if useNginx}}
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx.conf:/etc/nginx/nginx.conf
      - ./docker/ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped
  {{/if}}

volumes:
  {{#if usePostgres}}postgres_data:{{/if}}
  {{#if useMySQL}}mysql_data:{{/if}}
  {{#if useSQLServer}}sqlserver_data:{{/if}}
  {{#if useRedis}}redis_data:{{/if}}
```

#### Smart Docker Detection

The wizard will intelligently suggest Docker services based on:

```typescript
interface DockerContext {
  currentDatabase: 'sqlite' | 'postgres' | 'mysql' | 'mssql';
  hasRedis: boolean;
  hasGraphQLSubscriptions: boolean;
  isProduction: boolean;
  hasExistingDockerFiles: boolean;
}

class DockerGenerator {
  async generateDockerConfig(context: DockerContext): Promise<DockerFiles> {
    const services = this.determineServices(context);

    return {
      'docker-compose.yml': this.generateProdCompose(services),
      'docker-compose.dev.yml': this.generateDevCompose(services),
      Dockerfile: this.generateDockerfile(context),
      'Dockerfile.dev': this.generateDevDockerfile(),
      '.dockerignore': this.generateDockerIgnore(),
      '.env.docker': this.generateDockerEnv(services),
    };
  }

  private determineServices(context: DockerContext) {
    return {
      database: context.currentDatabase !== 'sqlite',
      redis: context.hasRedis || context.hasGraphQLSubscriptions,
      nginx: context.isProduction,
    };
  }
}
```

### Template System

Templates will use Handlebars with custom helpers:

```handlebars
{{#if useSolidDecorators}}
import { SolidEntity, SolidField, SolidId } from '@solid-nestjs/common';
{{else}}
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
{{/if}}

{{#if useSolidDecorators}}
@SolidEntity()
{{else}}
@Entity()
{{/if}}
export class {{pascalCase name}} {
  {{#each fields}}
  {{#if this.isPrimary}}
  {{#if ../useSolidDecorators}}
  @SolidId()
  {{else}}
  @PrimaryGeneratedColumn()
  {{/if}}
  {{else}}
  {{#if ../useSolidDecorators}}
  @SolidField({{json this.options}})
  {{else}}
  @Column({{json this.options}})
  {{/if}}
  {{/if}}
  {{this.name}}: {{this.type}};

  {{/each}}
}
```

### Module Update System

The CLI will automatically update module imports using TypeScript AST:

```typescript
export class ModuleUpdater {
  async addImportToModule(
    modulePath: string,
    importClass: string,
    importPath: string,
    arrayProperty: 'imports' | 'controllers' | 'providers',
  ): Promise<void> {
    const sourceFile = this.parseSourceFile(modulePath);
    const moduleDecorator = this.findModuleDecorator(sourceFile);
    const property = this.findOrCreateArrayProperty(
      moduleDecorator,
      arrayProperty,
    );
    this.addToArray(property, importClass);
    this.addImportStatement(sourceFile, importClass, importPath);
    await this.saveSourceFile(sourceFile, modulePath);
  }
}
```

## Implementation Plan - Version 0.3.0

**Target Release**: Q3 2025 (aligned with framework roadmap)  
**Total Duration**: 8 weeks

### Phase 1: Core Infrastructure (Week 1-2)

**Focus**: Foundation for code generation

- Create `packages-tools/cli` workspace in monorepo
- Update root package.json to include `packages-tools/*` in workspaces
- CLI package setup with version 0.3.0-alpha.1
- Command parsing system
- Template engine integration
- File system utilities
- Basic project scaffolding (`snest new`)

### Phase 2: Essential Generators (Week 3-4)

**Focus**: Core NestJS components with SOLID framework features

- Entity generator with SOLID decorators
- Service generator with CRUD operations
- REST Controller generator
- Module generator with auto-imports
- AST-based module updating system
- Version bump to 0.3.0-beta.1

### Phase 3: Advanced NestJS Generators (Week 5-6)

**Focus**: Complete SOLID framework capabilities

- DTO generator with Args helpers and entity-to-DTO generation
- GraphQL resolver generator
- Hybrid controller generator (REST + GraphQL)
- Resource generator (all-in-one: entity + service + controller + DTOs)
- Context-aware generation based on project dependencies
- Version bump to 0.3.0-rc.1

### Phase 4: Interactive Mode & Polish (Week 7)

**Focus**: Developer experience and usability

- Context-aware interactive wizard with dependency detection
- Configuration management (.snestrc)
- Enhanced error handling with suggestions
- Code formatting integration
- Performance optimization

### Phase 5: Testing & Documentation (Week 8)

**Focus**: Production readiness

- Comprehensive unit and integration tests
- CLI documentation and tutorials
- Example projects showcasing generated code
- Performance benchmarks and optimization
- Final release 0.3.0

## Future Enhancements (Post 0.3.0)

### Version 0.4.0 - Docker & DevOps Support

**Estimated Release**: Q1 2026 (aligned with framework roadmap)

- Docker Compose generation for different databases
- Dockerfile templates for development and production
- Database service configurations
- Nginx and Redis integration

### Version 0.5.0 - Advanced Features

**Estimated Release**: Q2 2026

- Custom template system
- Plugin architecture for extensions
- Migration tools for existing projects
- Advanced validation and linting integration

## Testing Strategy

### Unit Tests

- Test each generator in isolation
- Verify template rendering
- Validate file operations
- Test AST manipulations

### Integration Tests

- End-to-end CLI command testing
- Verify generated code compiles
- Test module updates
- Validate generated code works with framework

### Test Structure

```typescript
describe('EntityGenerator', () => {
  it('should generate entity with SOLID decorators', async () => {
    const result = await generator.generate('Product', {
      fields: 'name:string,price:number',
      withSolid: true,
    });

    expect(result).toContain('@SolidEntity()');
    expect(result).toContain('@SolidField()');
  });
});
```

## Success Criteria

1. **Functionality**: All specified commands work as documented
2. **Performance**: Generation completes in < 1 second for single files
3. **Code Quality**: Generated code passes linting and compilation
4. **Compatibility**: Works with all framework features and databases
5. **User Experience**: Intuitive commands with helpful error messages
6. **Documentation**: Complete CLI reference and tutorials
7. **Testing**: > 90% code coverage

## Future Enhancements

### Version 1.1

- Plugin system for custom generators
- Code migration tools
- Database schema synchronization
- GraphQL schema generation from entities

### Version 1.2

- AI-powered code suggestions
- Visual Studio Code extension
- Web-based generator UI
- Template marketplace

## Dependencies

### Required Packages

```json
{
  "dependencies": {
    "commander": "^11.0.0",
    "inquirer": "^9.0.0",
    "handlebars": "^4.7.0",
    "fs-extra": "^11.0.0",
    "chalk": "^5.0.0",
    "ora": "^6.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.0.0"
  }
}
```

## Risk Assessment

### Technical Risks

- **AST Manipulation Complexity**: Mitigate with robust testing
- **Template Maintenance**: Use versioned templates
- **Cross-platform Compatibility**: Test on Windows, macOS, Linux

### Adoption Risks

- **Learning Curve**: Provide comprehensive documentation
- **Migration Path**: Offer migration guides from NestJS CLI
- **Backward Compatibility**: Maintain support for manual code

## Approval

**Status**: Awaiting approval to proceed with implementation

---

_This specification is subject to revision based on feedback and technical discoveries during implementation._
