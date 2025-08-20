# Task: Phase 2 - Basic Generators

## Task Information
- **Phase**: 2
- **Duration**: 2 weeks
- **Priority**: High
- **Dependencies**: Phase 1 completion
- **Status**: Pending

## Related Documents
- **Specification**: [202508192040 - CLI Tool Generator.md](../../specs/202508192040%20-%20CLI%20Tool%20Generator.md)
- **Previous Task**: [202508192100 - Phase 1 Core Infrastructure.md](202508192100%20-%20Phase%201%20Core%20Infrastructure.md)

## Objective
Implement basic code generators for entities, modules, services, and controllers that leverage SOLID NestJS framework features including SOLID decorators and service structures.

## Subtasks

### 2.1 Generate Command Infrastructure
- [ ] Create GenerateCommand base class
- [ ] Implement subcommand routing system
- [ ] Add alias support (g → generate)
- [ ] Create shared generator utilities
- [ ] Implement AST manipulation helpers
- [ ] Add module update system

### 2.2 Entity Generator
- [ ] Create EntityGenerator class
- [ ] Parse field definitions from CLI arguments
- [ ] Support TypeScript type mapping
- [ ] Generate entities with SOLID decorators
- [ ] Add TypeORM decorator support
- [ ] Implement soft delete option
- [ ] Support composite keys
- [ ] Add relation definitions
- [ ] Create entity templates with Handlebars
- [ ] Add validation for entity names

**Field Definition Parser:**
```typescript
interface FieldDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'Date' | 'relation';
  required: boolean;
  relationType?: 'oneToMany' | 'manyToOne' | 'oneToOne' | 'manyToMany';
  relationTarget?: string;
}
```

### 2.3 Module Generator
- [ ] Create ModuleGenerator class
- [ ] Generate basic module structure
- [ ] Auto-import TypeOrmModule.forFeature()
- [ ] Support controller and provider registration
- [ ] Implement module update for existing modules
- [ ] Add module to parent module imports
- [ ] Create module templates

### 2.4 Service Generator
- [ ] Create ServiceGenerator class
- [ ] Generate CRUD service structure
- [ ] Auto-detect associated entity
- [ ] Create service structure configuration
- [ ] Support bulk operations option
- [ ] Support soft delete operations
- [ ] Generate proper DTO imports
- [ ] Implement custom service option
- [ ] Create service templates
- [ ] Add lifecycle hooks scaffolding

**Service Structure Template:**
```typescript
export const {{camelCase name}}ServiceStructure = CrudServiceStructure({
  entityType: {{pascalCase entity}},
  createInputType: Create{{pascalCase entity}}Dto,
  updateInputType: Update{{pascalCase entity}}Dto,
  findArgsType: Find{{pascalCase entity}}Args,
  {{#if enableBulk}}
  enableBulkOperations: true,
  {{/if}}
  {{#if enableSoftDelete}}
  enableSoftDelete: true,
  {{/if}}
});
```

### 2.5 REST Controller Generator
- [ ] Create ControllerGenerator class
- [ ] Generate controller with CRUD operations
- [ ] Auto-detect associated service
- [ ] Add Swagger decorators support
- [ ] Implement operation selection
- [ ] Support custom decorators
- [ ] Add guards configuration
- [ ] Create controller templates
- [ ] Auto-register in module

**Controller Structure Template:**
```typescript
const controllerStructure = CrudControllerStructure({
  ...{{camelCase service}}ServiceStructure,
  serviceType: {{pascalCase service}}Service,
  path: '{{kebabCase name}}',
  apiTags: ['{{pascalCase name}}'],
  operations: {
    findAll: true,
    findOne: true,
    create: true,
    update: true,
    remove: true,
    {{#if enableBulk}}
    bulkCreate: true,
    bulkUpdate: true,
    bulkRemove: true,
    {{/if}}
  },
});
```

### 2.6 Module Update System
- [ ] Create ModuleUpdater class using TypeScript AST
- [ ] Parse existing module files
- [ ] Add imports to module decorator
- [ ] Add providers to module decorator
- [ ] Add controllers to module decorator
- [ ] Preserve existing code and formatting
- [ ] Handle import statements
- [ ] Support barrel exports

### 2.7 Path Resolution System
- [ ] Implement smart path detection
- [ ] Support custom paths via --path option
- [ ] Auto-detect module structure
- [ ] Create nested folder structures
- [ ] Handle naming conventions
- [ ] Validate path accessibility

### 2.8 Testing
- [ ] Unit tests for each generator
- [ ] Test field definition parser
- [ ] Test AST manipulation
- [ ] Integration tests for generated code
- [ ] Test module updates
- [ ] Verify generated code compiles
- [ ] Test with different options combinations

## Success Criteria
- [ ] `snest generate entity Product --fields "name:string,price:number"` creates valid entity
- [ ] `snest g mo products` creates module with proper imports
- [ ] `snest g s products --entity Product` creates service with structure
- [ ] `snest g co products --service ProductsService` creates REST controller
- [ ] Generated code follows SOLID NestJS patterns
- [ ] Module files are automatically updated with new components
- [ ] All generated code compiles without errors
- [ ] Generated code passes linting rules

## Templates Structure
```
templates/
├── entity/
│   ├── entity.hbs
│   └── entity-with-relations.hbs
├── module/
│   └── module.hbs
├── service/
│   ├── crud-service.hbs
│   └── custom-service.hbs
├── controller/
│   ├── rest-controller.hbs
│   └── custom-controller.hbs
└── shared/
    ├── imports.hbs
    └── decorators.hbs
```

## Code Generation Examples

### Entity Generation
```bash
snest g e Product --fields "name:string:required,price:number,category:relation:manyToOne:Category" --soft-delete
```

### Service Generation
```bash
snest g s products --entity Product --with-bulk --with-soft-delete
```

### Controller Generation
```bash
snest g co products --service ProductsService --type rest --with-swagger
```

## Notes
- Ensure generated code matches existing codebase style
- Use Prettier for formatting generated code
- Support both JavaScript and TypeScript projects
- Follow Angular-style naming conventions
- Maintain backward compatibility with manual code

## Blockers
- Requires Phase 1 completion
- Need to finalize template designs

## Completion Checklist
- [ ] All generators implemented and tested
- [ ] Templates created and optimized
- [ ] AST manipulation working correctly
- [ ] Documentation updated with examples
- [ ] Integration tests passing
- [ ] Generated code reviewed by team