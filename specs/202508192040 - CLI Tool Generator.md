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
- `--skip-install` - Skip dependency installation
- `--skip-git` - Skip git initialization

**Generated Structure:**
```
project-name/
├── src/
│   ├── app.module.ts
│   ├── main.ts
│   └── config/
│       └── database.config.ts
├── test/
├── .env.example
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
import { Entity, PrimaryGeneratedColumn, Column, DeleteDateColumn } from 'typeorm';

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
import { CrudControllerStructure, CrudControllerFrom } from '@solid-nestjs/rest-api';
import { ProductsService, productServiceStructure } from '../services/products.service';

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
export class ProductsController extends CrudControllerFrom(controllerStructure) {}
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
import { GroupByArgsFrom, createWhereFields, createOrderByFields } from '@solid-nestjs/graphql';
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

### Interactive Mode

```bash
snest generate --interactive
snest g -i  # Alias
```

Provides step-by-step wizard for generation with prompts:
1. What would you like to generate?
2. What is the name?
3. Select features to include
4. Configure options
5. Review and confirm

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

### Package Structure
```
@solid-nestjs/snest-cli/
├── src/
│   ├── commands/
│   │   ├── new.command.ts
│   │   ├── generate.command.ts
│   │   └── config.command.ts
│   ├── generators/
│   │   ├── entity.generator.ts
│   │   ├── service.generator.ts
│   │   ├── controller.generator.ts
│   │   ├── module.generator.ts
│   │   └── dto.generator.ts
│   ├── templates/
│   │   ├── entity/
│   │   ├── service/
│   │   ├── controller/
│   │   └── ...
│   ├── utils/
│   │   ├── file.utils.ts
│   │   ├── string.utils.ts
│   │   └── ast.utils.ts
│   ├── config/
│   │   └── cli.config.ts
│   └── cli.ts
├── bin/
│   └── snest.js
├── package.json
└── README.md
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
    arrayProperty: 'imports' | 'controllers' | 'providers'
  ): Promise<void> {
    const sourceFile = this.parseSourceFile(modulePath);
    const moduleDecorator = this.findModuleDecorator(sourceFile);
    const property = this.findOrCreateArrayProperty(moduleDecorator, arrayProperty);
    this.addToArray(property, importClass);
    this.addImportStatement(sourceFile, importClass, importPath);
    await this.saveSourceFile(sourceFile, modulePath);
  }
}
```

## Implementation Plan

### Phase 1: Core Infrastructure (Week 1-2)
- CLI package setup and configuration
- Command parsing system
- Template engine integration
- File system utilities
- Basic project scaffolding (`snest new`)

### Phase 2: Basic Generators (Week 3-4)
- Entity generator with SOLID decorators
- Module generator
- Service generator (basic CRUD)
- Controller generator (REST)

### Phase 3: Advanced Generators (Week 5-6)
- DTO generator with Args helpers
- GraphQL resolver generator
- Hybrid controller generator
- Resource generator (all-in-one)

### Phase 4: Interactive Mode & Polish (Week 7)
- Interactive wizard implementation
- Configuration management
- Code formatting integration
- Error handling and validation

### Phase 5: Testing & Documentation (Week 8)
- Unit tests for all generators
- Integration tests
- CLI documentation
- Example projects and tutorials

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
      withSolid: true
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

*This specification is subject to revision based on feedback and technical discoveries during implementation.*