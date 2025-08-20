# Task: Phase 4 - Interactive Mode and Polish

## Task Information
- **Phase**: 4
- **Duration**: 1 week
- **Priority**: Medium
- **Dependencies**: Phase 3 completion
- **Status**: Pending

## Related Documents
- **Specification**: [202508192040 - CLI Tool Generator.md](../../specs/202508192040%20-%20CLI%20Tool%20Generator.md)
- **Previous Task**: [202508192102 - Phase 3 Advanced Generators.md](202508192102%20-%20Phase%203%20Advanced%20Generators.md)

## Objective
Implement interactive wizard mode, configuration management, enhanced error handling, and polish the overall CLI user experience.

## Subtasks

### 4.1 Context-Aware Interactive Wizard System
- [ ] Create InteractiveMode class
- [ ] Implement ProjectAnalyzer for dependency detection
- [ ] Add package.json analysis system
- [ ] Create project structure scanner
- [ ] Implement database configuration detection
- [ ] Add existing code analysis (entities, services, controllers)
- [ ] Create context-aware prompt filtering
- [ ] Implement smart default selection based on context
- [ ] Add project capability detection
- [ ] Support multi-step wizards with context
- [ ] Add validation for each step
- [ ] Implement back navigation
- [ ] Add preview before generation
- [ ] Support wizard state persistence
- [ ] Create context-aware help text

**Context-Aware Flow Architecture:**
```typescript
interface WizardStep {
  name: string;
  prompt: PromptObject;
  validate?: (input: any) => boolean | string;
  transform?: (input: any) => any;
  when?: (answers: any, context: ProjectContext) => boolean;
  contextFilter?: (context: ProjectContext) => PromptChoice[];
}

interface ProjectContext {
  hasSolidNestjs: boolean;
  solidVersion: string;
  hasGraphQL: boolean;
  hasSwagger: boolean;
  hasTypeORM: boolean;
  databaseType: 'sqlite' | 'postgres' | 'mysql' | 'mssql';
  existingEntities: string[];
  existingServices: string[];
  existingControllers: string[];
  hasSolidDecorators: boolean;
  hasArgsHelpers: boolean;
  hasEntityGeneration: boolean;
}

class ContextAwareWizard {
  private steps: WizardStep[];
  private context: ProjectContext;
  
  async run(): Promise<GenerationOptions> {
    // 1. Analyze project context
    this.context = await this.analyzer.analyzeProject(process.cwd());
    
    // 2. Filter prompts based on context
    const contextualSteps = this.filterStepsByContext(this.steps, this.context);
    
    // 3. Pre-select defaults based on detected capabilities
    const preselectedAnswers = this.getContextDefaults(this.context);
    
    // 4. Run wizard with context awareness
    return await this.runWizardWithContext(contextualSteps, preselectedAnswers);
  }
}
```

### 4.2 Configuration Management
- [ ] Create config command implementation
- [ ] Implement .snestrc file support
- [ ] Add global configuration storage
- [ ] Support project-level configuration
- [ ] Create configuration schema validation
- [ ] Add configuration migration system
- [ ] Implement config inheritance
- [ ] Add environment variable overrides

**Configuration Structure:**
```json
{
  "defaultPackageManager": "npm",
  "defaultDatabase": "postgres",
  "defaultApiType": "hybrid",
  "generateTests": true,
  "testFramework": "jest",
  "useStrictMode": true,
  "formatting": {
    "prettier": true,
    "eslint": true
  },
  "paths": {
    "entities": "src/entities",
    "services": "src/services",
    "controllers": "src/controllers",
    "modules": "src/modules"
  },
  "templates": {
    "customPath": "./custom-templates"
  }
}
```

### 4.3 Enhanced Error Handling
- [ ] Create custom error classes
- [ ] Implement error recovery suggestions
- [ ] Add detailed error messages
- [ ] Create error logging system
- [ ] Add stack trace formatting
- [ ] Implement graceful degradation
- [ ] Add rollback on generation failure
- [ ] Create error reporting mechanism

**Error Types:**
```typescript
class SnestError extends Error {
  constructor(
    message: string,
    public code: string,
    public suggestions: string[],
    public context?: any
  ) {
    super(message);
  }
}

class FileSystemError extends SnestError {}
class ValidationError extends SnestError {}
class GenerationError extends SnestError {}
class ConfigurationError extends SnestError {}
```

### 4.4 User Experience Enhancements
- [ ] Add colorful output with chalk
- [ ] Implement progress indicators with ora
- [ ] Add success/failure animations
- [ ] Create helpful command suggestions
- [ ] Implement did-you-mean functionality
- [ ] Add command aliases
- [ ] Create verbose mode
- [ ] Add quiet mode
- [ ] Implement dry-run option

### 4.5 Validation System
- [ ] Create comprehensive validators
- [ ] Validate project names
- [ ] Check file name conflicts
- [ ] Validate TypeScript identifiers
- [ ] Check module dependencies
- [ ] Validate configuration options
- [ ] Add custom validation rules
- [ ] Create validation error messages

### 4.6 Help System
- [ ] Create detailed help for each command
- [ ] Add examples to help output
- [ ] Implement contextual help
- [ ] Create man pages
- [ ] Add online documentation links
- [ ] Implement help search
- [ ] Create troubleshooting guide
- [ ] Add FAQ section

### 4.7 Performance Optimization
- [ ] Implement template caching
- [ ] Add lazy loading for commands
- [ ] Optimize file operations
- [ ] Add parallel generation support
- [ ] Implement incremental generation
- [ ] Cache dependency resolution
- [ ] Optimize AST operations
- [ ] Add performance metrics

### 4.8 Telemetry and Analytics (Optional)
- [ ] Create opt-in telemetry system
- [ ] Track command usage
- [ ] Monitor error rates
- [ ] Collect performance metrics
- [ ] Add crash reporting
- [ ] Create usage analytics
- [ ] Implement feedback collection
- [ ] Add update notifications

## Interactive Mode Examples

### Context-Aware Interactive Flow Example
```bash
$ snest generate --interactive

🔍 Analyzing project context...
✓ Found SOLID NestJS v0.2.9
✓ GraphQL support detected (@nestjs/graphql)
✓ Swagger support detected (@nestjs/swagger)
✓ SOLID decorators available (@solid-nestjs/common)
✓ Args helpers available (@solid-nestjs/rest-graphql)
✓ Entity generation available
✓ Database: PostgreSQL (detected from .env)
✓ Found 3 existing entities: User, Category, Supplier

? What would you like to generate? (Smart: Options filtered by capabilities)
❯ Complete Resource (Entity + Service + Controller + DTOs)
  Entity
  Service (for existing entity)
  REST Controller               ← Available: Swagger detected
  GraphQL Resolver             ← Available: GraphQL detected  
  Hybrid Controller            ← Available: Both REST + GraphQL
  Module
  DTO (with Args helpers)      ← Smart: Args helpers available

? Resource name: Product

? Choose API type:
  REST API
❯ GraphQL API  
  Hybrid (REST + GraphQL)

? Add entity fields (format: name:type:options)
? Field (leave empty to finish): name:string:required
? Field (leave empty to finish): price:number
? Field (leave empty to finish): 

? Additional options: (Press <space> to select)
❯◉ Soft deletion support
 ◉ Bulk operations
 ◯ Custom validation
 ◉ Generate tests
 
? Review your configuration:
  Resource: Product
  API Type: GraphQL
  Fields: 
    - name: string (required)
    - price: number
  Options:
    - Soft deletion
    - Bulk operations
    - Tests
    
? Proceed with generation? (Y/n) Y

✓ Creating entity...
✓ Generating DTOs...
✓ Creating service...
✓ Generating resolver...
✓ Updating module...
✓ Generating tests...
✨ Successfully generated Product resource!
```

### Configuration Management Flow
```bash
$ snest config set defaultApiType hybrid
✓ Configuration updated: defaultApiType = hybrid

$ snest config list
Current configuration:
┌─────────────────────┬─────────┐
│ Setting             │ Value   │
├─────────────────────┼─────────┤
│ defaultApiType      │ hybrid  │
│ defaultDatabase     │ sqlite  │
│ generateTests       │ true    │
│ defaultPackageManager│ npm     │
└─────────────────────┴─────────┘

$ snest config get defaultDatabase
sqlite
```

## Success Criteria
- [ ] Interactive mode guides users through generation
- [ ] Configuration persists across sessions
- [ ] Errors provide helpful recovery suggestions
- [ ] CLI provides excellent user experience
- [ ] Help system is comprehensive and searchable
- [ ] Performance is optimized (<1s for most operations)
- [ ] Validation prevents invalid generation
- [ ] Dry-run mode shows what would be generated

## UI/UX Guidelines
- Use consistent color scheme
- Provide immediate feedback
- Show progress for long operations
- Use clear, concise language
- Provide examples in help text
- Support keyboard shortcuts
- Allow operation cancellation
- Show completion summaries

## Error Message Examples
```
✖ Error: Entity "Product" already exists

  The file "src/entities/product.entity.ts" already exists.
  
  Suggestions:
  • Use a different name for your entity
  • Delete the existing file if you want to regenerate
  • Use --force flag to overwrite (use with caution)
  
  Run 'snest generate entity --help' for more information
```

## Notes
- Interactive mode should remember previous choices
- Configuration should support team sharing
- Error messages should be actionable
- Performance metrics help identify bottlenecks
- Telemetry should be strictly opt-in

## Blockers
- Requires Phase 3 completion
- UX design decisions needed

## Completion Checklist
- [ ] Interactive wizard fully functional
- [ ] Configuration management complete
- [ ] Error handling comprehensive
- [ ] User experience polished
- [ ] Help system implemented
- [ ] Performance optimized
- [ ] All prompts validated
- [ ] Documentation reflects all features