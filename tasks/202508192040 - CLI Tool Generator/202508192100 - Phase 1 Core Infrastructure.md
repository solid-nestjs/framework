# Task: Phase 1 - Core Infrastructure

## Task Information
- **Phase**: 1
- **Duration**: 2 weeks
- **Priority**: High
- **Dependencies**: None
- **Status**: Pending

## Related Documents
- **Specification**: [202508192040 - CLI Tool Generator.md](../../specs/202508192040%20-%20CLI%20Tool%20Generator.md)

## Objective
Set up the foundational infrastructure for the SNEST CLI tool, including package structure, command parsing system, and basic project scaffolding capability.

## Subtasks

### 1.1 Package Setup and Configuration
- [ ] Create new package `@solid-nestjs/snest-cli`
- [ ] Configure TypeScript with strict mode
- [ ] Set up build scripts and compilation
- [ ] Configure ESLint and Prettier
- [ ] Create package.json with proper bin configuration
- [ ] Set up Jest for testing

### 1.2 CLI Core Architecture
- [ ] Implement main CLI entry point (`src/cli.ts`)
- [ ] Create binary executable (`bin/snest.js`)
- [ ] Set up Commander.js for command parsing
- [ ] Implement version and help commands
- [ ] Create base command abstract class
- [ ] Set up error handling and logging with chalk

### 1.3 File System Utilities
- [ ] Create FileManager class for file operations
- [ ] Implement template path resolver
- [ ] Create directory structure generator
- [ ] Implement file content replacer
- [ ] Add path validation utilities
- [ ] Create backup/rollback mechanism

### 1.4 Template Engine Setup
- [ ] Integrate Handlebars as template engine
- [ ] Create custom Handlebars helpers (pascalCase, camelCase, etc.)
- [ ] Set up template loading system
- [ ] Create template cache mechanism
- [ ] Implement variable injection system

### 1.5 Configuration Management
- [ ] Create ConfigManager class
- [ ] Implement `.snestrc` file support
- [ ] Add environment variable support
- [ ] Create default configuration
- [ ] Implement config validation

### 1.6 Basic "new" Command Implementation
- [ ] Create NewCommand class extending base command
- [ ] Implement project name validation
- [ ] Create project structure generator
- [ ] Add package.json generation with dependencies
- [ ] Generate tsconfig.json
- [ ] Create basic app.module.ts and main.ts
- [ ] Add .env.example generation
- [ ] Implement git initialization option
- [ ] Add dependency installation (npm/yarn/pnpm)

### 1.7 Testing Infrastructure
- [ ] Set up unit tests for FileManager
- [ ] Create tests for template engine
- [ ] Test command parsing
- [ ] Create integration test for "new" command
- [ ] Add CI/CD pipeline configuration

## Success Criteria
- [ ] CLI can be installed globally via `npm install -g @solid-nestjs/snest-cli`
- [ ] `snest --version` displays version correctly
- [ ] `snest --help` shows available commands
- [ ] `snest new my-project` creates a functional SOLID NestJS project
- [ ] Generated project can run with `npm run start:dev`
- [ ] All unit tests pass with >80% coverage

## Technical Decisions

### Package Dependencies
```json
{
  "dependencies": {
    "commander": "^11.0.0",
    "chalk": "^5.3.0",
    "fs-extra": "^11.2.0",
    "handlebars": "^4.7.8",
    "inquirer": "^9.2.0",
    "ora": "^6.3.0",
    "validate-npm-package-name": "^5.0.0"
  },
  "devDependencies": {
    "@types/fs-extra": "^11.0.0",
    "@types/inquirer": "^9.0.0",
    "@types/node": "^20.0.0",
    "jest": "^29.0.0",
    "ts-jest": "^29.0.0",
    "typescript": "^5.0.0"
  }
}
```

### File Structure
```
@solid-nestjs/snest-cli/
├── bin/
│   └── snest.js
├── src/
│   ├── commands/
│   │   ├── base.command.ts
│   │   └── new/
│   │       ├── new.command.ts
│   │       └── new.options.ts
│   ├── utils/
│   │   ├── file-manager.ts
│   │   ├── template-engine.ts
│   │   ├── string-utils.ts
│   │   └── validators.ts
│   ├── config/
│   │   ├── config-manager.ts
│   │   └── defaults.ts
│   ├── templates/
│   │   └── new-project/
│   │       ├── src/
│   │       ├── package.json.hbs
│   │       ├── tsconfig.json.hbs
│   │       └── .env.example.hbs
│   └── cli.ts
├── test/
│   ├── unit/
│   └── integration/
├── package.json
├── tsconfig.json
└── README.md
```

## Notes
- Use semantic versioning starting at 0.1.0
- Ensure Windows, macOS, and Linux compatibility
- Follow NestJS CLI patterns for familiarity
- All user-facing messages should be clear and helpful

## Blockers
- None identified

## Completion Checklist
- [ ] All subtasks completed
- [ ] Code reviewed and tested
- [ ] Documentation written
- [ ] Package published to npm registry
- [ ] Integration with main framework tested