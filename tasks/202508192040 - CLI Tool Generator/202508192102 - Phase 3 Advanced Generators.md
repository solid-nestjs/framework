# Task: Phase 3 - Advanced NestJS Generators

## Task Information
- **Phase**: 3
- **Duration**: 2 weeks
- **Priority**: High
- **Dependencies**: Phase 2 completion
- **Status**: Pending

## Related Documents
- **Specification**: [202508192040 - CLI Tool Generator.md](../../specs/202508192040%20-%20CLI%20Tool%20Generator.md)
- **Previous Task**: [202508192101 - Phase 2 Basic Generators.md](202508192101%20-%20Phase%202%20Basic%20Generators.md)

## Objective
Complete the SOLID framework capabilities by implementing advanced generators for DTOs with Args helpers, GraphQL resolvers, hybrid controllers, and complete resource generation. Focus on core NestJS functionality integration.

## Subtasks

### 3.1 DTO Generator with Args Helpers
- [ ] Create DtoGenerator class
- [ ] Parse entity to extract field information
- [ ] Generate CreateDto with validation
- [ ] Generate UpdateDto with partial fields
- [ ] Generate FindArgs with filtering
- [ ] Integrate Args helpers for filtering
- [ ] Support automatic validation inference
- [ ] Use GenerateDtoFromEntity helper
- [ ] Create DTO folder structure
- [ ] Add custom field support

**DTO Generation Features:**
```typescript
// Using Args Helpers
export class FindProductArgs extends GroupByArgsFrom(Product) {
  where = createWhereFields(Product, ['name', 'price', 'category']);
  orderBy = createOrderByFields(Product, ['name', 'price', 'createdAt']);
  groupBy = createGroupByFields(Product);
}

// Using Entity-to-DTO Generation
export class CreateProductDto extends GenerateDtoFromEntity(Product, [
  'name',
  'price',
  'description'
]) {}
```

### 3.2 GraphQL Resolver Generator
- [ ] Create ResolverGenerator class
- [ ] Generate resolver with CRUD operations
- [ ] Support Query operations
- [ ] Support Mutation operations
- [ ] Add Subscription support scaffolding
- [ ] Integrate with service structure
- [ ] Add GraphQL-specific decorators
- [ ] Support custom scalars
- [ ] Generate GraphQL DTOs
- [ ] Add DataLoader integration points

**Resolver Template:**
```typescript
@Resolver(() => {{pascalCase name}})
export class {{pascalCase name}}Resolver extends CrudResolverFrom(resolverStructure) {
  @Query(() => [{{pascalCase name}}])
  async {{camelCase name}}s(@Args() args: Find{{pascalCase name}}Args) {
    return this.findAll(args);
  }

  @Mutation(() => {{pascalCase name}})
  async create{{pascalCase name}}(@Args('input') input: Create{{pascalCase name}}Input) {
    return this.create(input);
  }
}
```

### 3.3 Hybrid Controller Generator
- [ ] Create HybridControllerGenerator class
- [ ] Generate controller with REST and GraphQL
- [ ] Merge REST endpoints and GraphQL resolvers
- [ ] Support unified DTOs
- [ ] Add protocol-specific decorators
- [ ] Handle operation routing
- [ ] Create hybrid templates
- [ ] Support operation overrides

**Hybrid Controller Structure:**
```typescript
const hybridStructure = CrudHybridStructure({
  ...serviceStructure,
  serviceType: {{pascalCase name}}Service,
  restConfig: {
    path: '{{kebabCase name}}',
    apiTags: ['{{pascalCase name}}'],
  },
  graphqlConfig: {
    resolverName: '{{pascalCase name}}Resolver',
  },
  operations: {
    findAll: { rest: true, graphql: true },
    create: { rest: true, graphql: true },
    // ... other operations
  },
});
```

### 3.4 Resource Generator (All-in-One)
- [ ] Create ResourceGenerator orchestrator
- [ ] Implement interactive mode with Inquirer
- [ ] Generate entity with fields
- [ ] Generate all DTOs automatically
- [ ] Generate service with structure
- [ ] Generate controller/resolver
- [ ] Create and update module
- [ ] Add test file generation
- [ ] Support transaction management
- [ ] Implement rollback on failure

**Resource Generation Flow:**
1. Parse resource name and options
2. Generate entity with decorators
3. Create DTOs using Args helpers
4. Generate service with CRUD operations
5. Create controller/resolver based on type
6. Update module with all components
7. Generate test files
8. Format all generated code

### 3.5 Advanced DTO Features
- [ ] Support nested DTOs
- [ ] Add relation field handling
- [ ] Implement filter type inference
- [ ] Support GROUP BY DTOs
- [ ] Add aggregation DTOs
- [ ] Create validation groups
- [ ] Support custom validators
- [ ] Add transformation pipes

### 3.6 Test File Generator
- [ ] Create TestGenerator class
- [ ] Generate unit tests for services
- [ ] Generate E2E tests for controllers
- [ ] Create test fixtures
- [ ] Add mock data generators
- [ ] Support different test frameworks
- [ ] Create test utilities
- [ ] Generate test module setup

### 3.7 Import Management System
- [ ] Create ImportManager class
- [ ] Auto-detect required imports
- [ ] Resolve import paths
- [ ] Handle circular dependencies
- [ ] Support barrel exports
- [ ] Optimize import statements
- [ ] Handle relative vs absolute imports

### 3.8 Code Formatting System
- [ ] Integrate Prettier API
- [ ] Load project's prettier config
- [ ] Format generated code
- [ ] Preserve existing code style
- [ ] Handle different file types
- [ ] Support ESLint auto-fix

## Success Criteria
- [ ] `snest g d Product --from-entity --with-args-helpers` generates complete DTOs
- [ ] `snest g resolver products` creates GraphQL resolver
- [ ] `snest g co products --type hybrid` creates hybrid controller
- [ ] `snest g res Product --fields "..." --crud` generates complete resource
- [ ] Generated DTOs use Args helpers and validation
- [ ] GraphQL resolvers integrate with services
- [ ] Hybrid controllers work with both REST and GraphQL
- [ ] All generated code is properly formatted

## Interactive Mode Example
```bash
$ snest generate resource --interactive

? What is the resource name? Product
? Select API type: (Use arrow keys)
  REST API
  GraphQL API
❯ Hybrid (REST + GraphQL)
? Define entity fields: (Press enter when done)
  Field 1: name:string:required
  Field 2: price:number
  Field 3: category:relation:manyToOne:Category
  Field 4: 
? Enable soft deletion? Yes
? Enable bulk operations? Yes
? Generate test files? Yes
? Select test framework: Jest
✓ Generating entity...
✓ Creating DTOs...
✓ Generating service...
✓ Creating controller...
✓ Updating module...
✓ Generating tests...
✓ Formatting code...
✅ Resource "Product" generated successfully!
```

## Templates Structure (Advanced)
```
templates/
├── dto/
│   ├── create-dto.hbs
│   ├── update-dto.hbs
│   ├── find-args.hbs
│   ├── find-args-with-helpers.hbs
│   └── dto-from-entity.hbs
├── graphql/
│   ├── resolver.hbs
│   ├── graphql-dto.hbs
│   └── subscription.hbs
├── hybrid/
│   ├── hybrid-controller.hbs
│   └── hybrid-structure.hbs
├── test/
│   ├── service.spec.hbs
│   ├── controller.spec.hbs
│   └── e2e.spec.hbs
└── resource/
    └── complete-resource.hbs
```

## Notes
- Ensure Args helpers are properly imported
- Support both class-validator and Joi validation
- GraphQL resolvers should support subscriptions
- Resource generator should be atomic (all or nothing)
- Consider adding dry-run option

## Blockers
- Requires Phase 2 completion
- Args helpers must be finalized in framework

## Completion Checklist
- [ ] DTO generator with Args helpers working
- [ ] GraphQL resolver generator complete
- [ ] Hybrid controller generator functional
- [ ] Resource generator orchestrating all components
- [ ] Interactive mode implemented
- [ ] Test file generation working
- [ ] All templates created and tested
- [ ] Documentation updated with examples