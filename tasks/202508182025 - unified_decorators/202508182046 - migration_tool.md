# Task: Migration Tool Implementation

**Created:** 2025-08-18 20:46  
**Status:** Pending  
**Priority:** Medium  
**Estimated Time:** 6 hours  
**Package:** @solid-nestjs/common

## Objective

Create a CLI tool that helps developers migrate from manual decorators to unified decorators, with analysis, suggestions, and optional auto-migration capabilities.

## Dependencies

- Requires: All decorator implementations
- Requires: Testing Suite

## Implementation Details

### 1. Migration CLI Tool

**File:** `packages-core/common/src/cli/migrate-decorators.ts`

```typescript
#!/usr/bin/env node
import { Command } from 'commander';
import * as ts from 'typescript';
import * as fs from 'fs-extra';
import * as path from 'path';
import { glob } from 'glob';
import chalk from 'chalk';

interface MigrationOptions {
  path: string;
  pattern?: string;
  dryRun?: boolean;
  interactive?: boolean;
  backup?: boolean;
  verbose?: boolean;
}

class DecoratorMigrationTool {
  private program: ts.Program;
  private checker: ts.TypeChecker;
  private printer: ts.Printer;
  
  constructor(private options: MigrationOptions) {
    this.initializeTypeScript();
  }
  
  async migrate(): Promise<void> {
    const files = await this.findFiles();
    const analysisResults = await this.analyzeFiles(files);
    
    if (this.options.dryRun) {
      this.reportAnalysis(analysisResults);
      return;
    }
    
    if (this.options.interactive) {
      await this.interactiveMigration(analysisResults);
    } else {
      await this.autoMigrate(analysisResults);
    }
  }
  
  private async findFiles(): Promise<string[]> {
    const pattern = this.options.pattern || '**/*.{entity,dto}.ts';
    return glob(path.join(this.options.path, pattern));
  }
  
  private async analyzeFiles(files: string[]): Promise<AnalysisResult[]> {
    const results: AnalysisResult[] = [];
    
    for (const file of files) {
      const sourceFile = this.program.getSourceFile(file);
      if (!sourceFile) continue;
      
      const analysis = this.analyzeSourceFile(sourceFile);
      if (analysis.suggestions.length > 0) {
        results.push(analysis);
      }
    }
    
    return results;
  }
  
  private analyzeSourceFile(sourceFile: ts.SourceFile): AnalysisResult {
    const suggestions: MigrationSuggestion[] = [];
    const visitor = (node: ts.Node) => {
      if (ts.isClassDeclaration(node)) {
        this.analyzeClass(node, suggestions);
      }
      ts.forEachChild(node, visitor);
    };
    
    ts.forEachChild(sourceFile, visitor);
    
    return {
      filePath: sourceFile.fileName,
      suggestions,
      hasBreakingChanges: this.hasBreakingChanges(suggestions)
    };
  }
  
  private analyzeClass(node: ts.ClassDeclaration, suggestions: MigrationSuggestion[]) {
    const decorators = ts.getDecorators(node);
    const classType = this.detectClassType(decorators);
    
    if (classType) {
      suggestions.push({
        type: 'class',
        original: this.getDecoratorNames(decorators),
        suggested: classType === 'entity' ? '@SolidEntity()' : '@SolidInput()',
        node
      });
    }
    
    node.members.forEach(member => {
      if (ts.isPropertyDeclaration(member)) {
        this.analyzeProperty(member, suggestions);
      }
    });
  }
  
  private analyzeProperty(node: ts.PropertyDeclaration, suggestions: MigrationSuggestion[]) {
    const decorators = ts.getDecorators(node);
    if (!decorators || decorators.length === 0) return;
    
    const analysis = this.analyzeDecorators(decorators);
    const solidDecorator = this.generateSolidDecorator(analysis);
    
    if (solidDecorator) {
      suggestions.push({
        type: 'property',
        propertyName: node.name.getText(),
        original: this.getDecoratorNames(decorators),
        suggested: solidDecorator,
        node
      });
    }
  }
  
  private analyzeDecorators(decorators: readonly ts.Decorator[]): DecoratorAnalysis {
    const analysis: DecoratorAnalysis = {
      isPrimaryKey: false,
      isRelation: false,
      isTimestamp: false,
      columnOptions: {},
      validationRules: [],
      apiOptions: {}
    };
    
    decorators.forEach(decorator => {
      const name = this.getDecoratorName(decorator);
      
      // TypeORM decorators
      if (name === 'PrimaryGeneratedColumn') {
        analysis.isPrimaryKey = true;
        analysis.columnOptions.generated = 'uuid';
      } else if (name === 'Column') {
        analysis.columnOptions = { ...analysis.columnOptions, ...this.extractColumnOptions(decorator) };
      } else if (['ManyToOne', 'OneToMany', 'ManyToMany', 'OneToOne'].includes(name)) {
        analysis.isRelation = true;
        analysis.relationType = name;
      } else if (['CreateDateColumn', 'UpdateDateColumn', 'DeleteDateColumn'].includes(name)) {
        analysis.isTimestamp = true;
        analysis.timestampType = name;
      }
      
      // Validation decorators
      else if (['IsString', 'IsNumber', 'IsEmail', 'IsOptional', 'Min', 'Max'].includes(name)) {
        analysis.validationRules.push({ name, options: this.extractDecoratorOptions(decorator) });
      }
      
      // API decorators
      else if (name === 'ApiProperty') {
        analysis.apiOptions.swagger = this.extractDecoratorOptions(decorator);
      } else if (name === 'Field') {
        analysis.apiOptions.graphql = this.extractDecoratorOptions(decorator);
      }
    });
    
    return analysis;
  }
  
  private generateSolidDecorator(analysis: DecoratorAnalysis): string {
    if (analysis.isPrimaryKey) {
      return '@SolidId()';
    }
    
    if (analysis.isTimestamp) {
      const type = analysis.timestampType?.replace('Column', '').toLowerCase();
      return `@SolidTimestamp('${type}')`;
    }
    
    if (analysis.isRelation) {
      const relationType = this.mapRelationType(analysis.relationType);
      return `@SolidRelation({ type: '${relationType}', /* TODO: Add target and inverseSide */ })`;
    }
    
    // Generate @SolidField with options
    const options = this.buildSolidFieldOptions(analysis);
    if (Object.keys(options).length === 0) {
      return '@SolidField()';
    }
    
    return `@SolidField(${this.stringifyOptions(options)})`;
  }
  
  private buildSolidFieldOptions(analysis: DecoratorAnalysis): any {
    const options: any = {};
    
    // Map column options
    if (analysis.columnOptions.nullable) options.nullable = true;
    if (analysis.columnOptions.unique) options.unique = true;
    if (analysis.columnOptions.length) options.maxLength = analysis.columnOptions.length;
    if (analysis.columnOptions.default) options.defaultValue = analysis.columnOptions.default;
    
    // Map validation rules
    analysis.validationRules.forEach(rule => {
      if (rule.name === 'Min') options.min = rule.options?.value;
      if (rule.name === 'Max') options.max = rule.options?.value;
      if (rule.name === 'IsEmail') options.email = true;
    });
    
    // Map API options
    if (analysis.apiOptions.swagger?.description || analysis.apiOptions.graphql?.description) {
      options.description = analysis.apiOptions.swagger?.description || analysis.apiOptions.graphql?.description;
    }
    
    return options;
  }
  
  private async autoMigrate(results: AnalysisResult[]): Promise<void> {
    for (const result of results) {
      if (this.options.backup) {
        await this.backupFile(result.filePath);
      }
      
      const migrated = await this.migrateFile(result);
      await fs.writeFile(result.filePath, migrated);
      
      console.log(chalk.green(`✓ Migrated ${result.filePath}`));
    }
  }
  
  private async migrateFile(result: AnalysisResult): Promise<string> {
    const sourceFile = this.program.getSourceFile(result.filePath);
    if (!sourceFile) throw new Error(`Could not read ${result.filePath}`);
    
    const transformer = this.createTransformer(result.suggestions);
    const transformed = ts.transform(sourceFile, [transformer]);
    
    return this.printer.printFile(transformed.transformed[0] as ts.SourceFile);
  }
  
  private createTransformer(suggestions: MigrationSuggestion[]): ts.TransformerFactory<ts.SourceFile> {
    return (context: ts.TransformationContext) => {
      return (sourceFile: ts.SourceFile) => {
        const visitor: ts.Visitor = (node: ts.Node) => {
          const suggestion = suggestions.find(s => s.node === node);
          if (suggestion) {
            return this.transformNode(node, suggestion, context);
          }
          return ts.visitEachChild(node, visitor, context);
        };
        return ts.visitNode(sourceFile, visitor) as ts.SourceFile;
      };
    };
  }
}

// CLI Setup
const program = new Command();

program
  .name('migrate-decorators')
  .description('Migrate from manual decorators to unified SOLID decorators')
  .version('1.0.0')
  .option('-p, --path <path>', 'Path to scan for files', process.cwd())
  .option('-g, --pattern <pattern>', 'Glob pattern for files', '**/*.{entity,dto}.ts')
  .option('-d, --dry-run', 'Analyze without making changes', false)
  .option('-i, --interactive', 'Interactive migration mode', false)
  .option('-b, --backup', 'Create backup files', true)
  .option('-v, --verbose', 'Verbose output', false)
  .action(async (options: MigrationOptions) => {
    const tool = new DecoratorMigrationTool(options);
    try {
      await tool.migrate();
      console.log(chalk.green('Migration completed successfully!'));
    } catch (error) {
      console.error(chalk.red('Migration failed:'), error);
      process.exit(1);
    }
  });

program.parse();
```

### 2. Migration Report Generator

**File:** `packages-core/common/src/cli/migration-report.ts`

```typescript
export class MigrationReporter {
  generateReport(results: AnalysisResult[]): MigrationReport {
    return {
      totalFiles: results.length,
      totalSuggestions: results.reduce((sum, r) => sum + r.suggestions.length, 0),
      breakdown: this.generateBreakdown(results),
      estimatedSavings: this.calculateSavings(results),
      riskAssessment: this.assessRisk(results)
    };
  }
  
  generateMarkdownReport(report: MigrationReport): string {
    return `
# Decorator Migration Report

## Summary
- **Files to migrate:** ${report.totalFiles}
- **Total changes:** ${report.totalSuggestions}
- **Estimated line reduction:** ${report.estimatedSavings.lines} lines (${report.estimatedSavings.percentage}%)

## Risk Assessment
- **Risk Level:** ${report.riskAssessment.level}
- **Breaking Changes:** ${report.riskAssessment.breakingChanges}
- **Manual Review Required:** ${report.riskAssessment.requiresReview}

## Breakdown by Type
${this.formatBreakdown(report.breakdown)}

## Recommendations
${this.generateRecommendations(report)}
    `;
  }
}
```

## Success Criteria

- [ ] CLI tool implemented and functional
- [ ] Accurate decorator analysis
- [ ] Safe transformation logic
- [ ] Backup mechanism working
- [ ] Interactive mode functional
- [ ] Comprehensive reporting
- [ ] Error handling robust
- [ ] Documentation complete

## Notes

- Use TypeScript Compiler API for analysis
- Preserve comments and formatting
- Handle edge cases gracefully
- Provide rollback capability
- Support incremental migration