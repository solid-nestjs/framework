# SNEST CLI Changelog

All notable changes to the SNEST CLI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0-alpha.1] - 2024-12-20

### Added

#### Core Infrastructure
- ✨ Complete CLI infrastructure with Commander.js
- ✨ TypeScript configuration and build system
- ✨ Monorepo workspace integration (`packages-tools/snest-cli`)
- ✨ Professional CLI interface with colored output and spinners

#### Project Generation (`snest new`)
- ✨ Complete SOLID NestJS project scaffolding
- ✨ Multi-database support (SQLite, PostgreSQL, MySQL, SQL Server)
- ✨ API type selection (REST, GraphQL, Hybrid)
- ✨ Package manager selection (npm, yarn, pnpm)
- ✨ Automatic dependency installation and git initialization
- ✨ Docker Compose configuration for development databases

#### Entity Generator (`snest generate entity`)
- ✨ SOLID decorators (`@SolidEntity`, `@SolidId`, `@SolidField`)
- ✨ Field definition with types and modifiers (`name:string:optional`)
- ✨ Automatic soft deletion support with `@DeleteDateColumn()`
- ✨ Timestamp fields (createdAt, updatedAt, deletedAt)
- ✨ TypeScript type mapping for database columns
- ✨ Custom output paths and file overwrite protection

#### Service Generator (`snest generate service`)
- ✨ CRUD service structure with SOLID patterns
- ✨ `CrudServiceStructure` configuration objects
- ✨ Bulk operations support (bulkInsert, bulkUpdate, bulkRemove)
- ✨ Soft deletion operations (recover, hardRemove)
- ✨ Entity relations configuration
- ✨ Args helpers for advanced querying
- ✨ Automatic DTO imports (CreateDto, UpdateDto, FindArgs)

#### Controller Generator (`snest generate controller`)
- ✨ REST API controller with SOLID patterns
- ✨ `CrudControllerStructure` configuration objects
- ✨ Automatic CRUD endpoints (GET, POST, PATCH, DELETE)
- ✨ Bulk operation endpoints
- ✨ Soft deletion endpoints (recover, hard delete)
- ✨ Request validation with class-validator
- ✨ Swagger/OpenAPI integration
- ✨ Authentication guard placeholders

#### Module Generator (`snest generate module`)
- ✨ Complete NestJS module generation
- ✨ Automatic imports (TypeORM, entities, services, controllers)
- ✨ TypeORM.forFeature configuration for entities
- ✨ Provider and controller array management
- ✨ Export configuration for service reuse
- ✨ Documentation with component descriptions

#### Template System
- ✨ Handlebars template engine with custom helpers
- ✨ String manipulation helpers (pascalCase, camelCase, kebabCase, snakeCase)
- ✨ TypeScript type conversion helpers
- ✨ JSON serialization helpers for configuration objects
- ✨ Pluralization support
- ✨ Conditional rendering based on options

#### AST-based Module Updates
- ✨ TypeScript AST manipulation for automatic module updates
- ✨ Intelligent module detection and relevance checking
- ✨ Automatic import statement insertion
- ✨ Module array updates (providers, controllers, exports)
- ✨ TypeORM.forFeature entity registration
- ✨ Duplicate prevention and conflict resolution
- ✨ Code format preservation

#### Interactive Mode
- ✨ Step-by-step component generation wizard
- ✨ Input validation and smart defaults
- ✨ Component type selection menu
- ✨ Option configuration with real-time feedback
- ✨ Preview and confirmation before generation

#### CLI Features
- ✨ Comprehensive help system with examples
- ✨ Command aliases for faster usage (`g` for `generate`, `e` for `entity`)
- ✨ Option validation and error handling
- ✨ Progress indicators with Ora spinners
- ✨ Colored output with Chalk for better UX
- ✨ Debug mode support with detailed logging

### Technical Implementation

#### Dependencies
- 🔧 **Commander.js** - CLI framework and command parsing
- 🔧 **Handlebars** - Template rendering engine
- 🔧 **TypeScript** - AST manipulation and code generation
- 🔧 **Inquirer.js** - Interactive prompts and forms
- 🔧 **Chalk** - Terminal colors and styling
- 🔧 **Ora** - Loading spinners and progress indicators
- 🔧 **fs-extra** - Enhanced file system operations
- 🔧 **validate-npm-package-name** - Package name validation

#### Architecture
- 📁 **Command Pattern** - Structured command organization
- 📁 **Template Strategy** - Flexible template system
- 📁 **AST Visitor Pattern** - Safe code modification
- 📁 **Builder Pattern** - Configuration object construction
- 📁 **Factory Pattern** - Component generation

#### Code Quality
- ✅ **TypeScript** - Full type safety and IntelliSense
- ✅ **ESLint** - Code style and quality enforcement
- ✅ **Prettier** - Consistent code formatting
- ✅ **Jest** - Unit testing framework setup
- ✅ **Error Handling** - Comprehensive error management

### Generated Code Features

#### Entities
- 🎯 SOLID decorators for automatic CRUD generation
- 🎯 TypeORM column type mapping
- 🎯 Soft deletion support with deletedAt columns
- 🎯 Automatic timestamp management
- 🎯 Nullable field support
- 🎯 Custom field options configuration

#### Services
- 🎯 SOLID CrudService mixins for automatic operations
- 🎯 Bulk operation methods (bulkInsert, bulkUpdate, bulkRemove)
- 🎯 Soft deletion methods (remove, recover, hardRemove)
- 🎯 Relation configuration and eager loading
- 🎯 Transaction support with context pattern
- 🎯 Type-safe CRUD operations

#### Controllers
- 🎯 SOLID CrudController mixins for automatic endpoints
- 🎯 REST API endpoints with proper HTTP methods
- 🎯 Request validation with DTOs
- 🎯 Swagger documentation integration
- 🎯 Error handling and HTTP status codes
- 🎯 Authentication guard integration points

#### Modules
- 🎯 Complete NestJS module configuration
- 🎯 TypeORM entity registration
- 🎯 Dependency injection setup
- 🎯 Service exports for inter-module usage
- 🎯 Clean import organization

### CLI Commands

#### Available Commands
```bash
# Project creation
snest new <project-name> [options]

# Component generation
snest generate entity <name> [options]
snest generate service <name> [options]  
snest generate controller <name> [options]
snest generate module <name> [options]

# Interactive mode
snest generate interactive
snest generate --interactive
```

#### Command Options
- 🎛️ **Database Selection** - SQLite, PostgreSQL, MySQL, SQL Server
- 🎛️ **API Type** - REST, GraphQL, Hybrid
- 🎛️ **Package Manager** - npm, yarn, pnpm
- 🎛️ **Feature Flags** - Soft deletion, bulk operations, validation
- 🎛️ **Path Customization** - Custom output directories
- 🎛️ **Module Updates** - Enable/disable automatic updates

### Documentation

#### Complete Documentation Suite
- 📖 **README.md** - Overview and quick start guide
- 📖 **getting-started.md** - Step-by-step tutorial
- 📖 **api-reference.md** - Complete command reference
- 📖 **examples.md** - Real-world application examples
- 📖 **CHANGELOG.md** - Version history and changes

#### Examples Included
- 🏪 **E-commerce API** - Complete online store backend
- 📝 **Blog Platform** - Content management system
- ✅ **Task Manager** - Project management tool
- 👥 **Social Media API** - Social networking backend

### Performance & Optimization

#### Generation Speed
- ⚡ Fast template rendering with Handlebars
- ⚡ Efficient file I/O operations
- ⚡ Parallel AST processing where possible
- ⚡ Smart caching of parsed templates

#### Code Quality
- 🏗️ Clean, readable generated code
- 🏗️ Consistent naming conventions
- 🏗️ Proper TypeScript types throughout
- 🏗️ SOLID principles implementation

### Developer Experience

#### User Interface
- 🎨 Beautiful CLI with colors and icons
- 🎨 Progress indicators for long operations
- 🎨 Clear error messages with suggestions
- 🎨 Helpful success messages with next steps

#### Error Handling
- 🛡️ Graceful failure handling
- 🛡️ File permission checks
- 🛡️ Input validation with helpful messages
- 🛡️ Recovery suggestions for common issues

### Future Roadmap Items (Not in this release)

#### Planned Features
- 🔮 **GraphQL Resolver Generation** - Complete GraphQL support
- 🔮 **DTO Generator** - Automatic DTO creation with validation
- 🔮 **Test Generator** - Unit and E2E test scaffolding
- 🔮 **Migration Generator** - Database migration scripts
- 🔮 **Seeder Generator** - Database seeding utilities
- 🔮 **Resource Generator** - Complete resource (Entity + Service + Controller + Module)
- 🔮 **Custom Template Support** - User-defined templates
- 🔮 **Plugin System** - Extensible architecture
- 🔮 **IDE Integration** - VS Code extension
- 🔮 **Docker Support** - Container generation

### Breaking Changes
- None (initial release)

### Migration Guide
- None (initial release)

### Known Issues
- AST module updates may fail with complex module structures (use `--skip-module-update`)
- Template copying required after build (automated in npm scripts)
- Interactive mode requires TTY support (not available in CI environments)

### Credits

#### Development Team
- **Core Team** - SOLID NestJS Framework maintainers
- **CLI Development** - Built with TypeScript and modern Node.js practices
- **Template Design** - Handlebars templates with SOLID patterns

#### Special Thanks
- NestJS community for inspiration
- TypeORM team for database integration patterns
- Commander.js and Inquirer.js for excellent CLI libraries

---

## Pre-release Versions

### [0.2.9] - Framework Version
- Framework core packages development
- Initial planning and specification phase

### [0.1.0] - Initial Concept
- Project inception and architecture design
- Technology stack selection
- Development environment setup

---

## Contributing

We welcome contributions! Please see our [Contributing Guide](../CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](../../LICENSE) file for details.

## Support

- 📖 **Documentation:** [SOLID NestJS Docs](https://solid-nestjs.com/docs)
- 🐛 **Bug Reports:** [GitHub Issues](https://github.com/solid-nestjs/framework/issues)
- 💬 **Community:** [Discord](https://discord.gg/solid-nestjs)
- 📧 **Email:** support@solid-nestjs.com