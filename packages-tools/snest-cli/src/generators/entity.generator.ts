import * as path from 'path';
import { TemplateEngine } from '../utils/template-engine';
import { FieldDefinition, GenerationOptions, CommandResult, ProjectContext } from '../types';
import { writeFile } from '../utils/file-utils';
import { createNameVariations } from '../utils/string-utils';
import { ModuleUpdater } from '../utils/module-updater';

/**
 * Generator for TypeORM entities with SOLID decorators
 */
export class EntityGenerator {
  private templateEngine: TemplateEngine;

  constructor() {
    this.templateEngine = new TemplateEngine();
  }

  /**
   * Generate entity file
   */
  async generate(
    name: string, 
    options: GenerationOptions,
    context?: ProjectContext
  ): Promise<CommandResult> {
    try {
      const nameVariations = createNameVariations(name);
      
      // Parse fields if provided
      const fields = this.parseFields(options.fields || []);
      
      // Determine features based on context
      const useSolidDecorators = options.withSolid ?? context?.hasSolidDecorators ?? true;
      const hasSwagger = context?.hasSwagger ?? false;
      const hasGraphQL = context?.hasGraphQL ?? false;
      const withSoftDelete = options.withSoftDelete ?? false;
      
      // Build template data
      const templateData = TemplateEngine.createTemplateData(name, {
        fields,
        hasRelations: fields.some(f => f.type === 'relation'),
        useSolidDecorators,
        hasSwagger: hasSwagger && !useSolidDecorators, // SOLID decorators handle Swagger
        hasGraphQL: hasGraphQL && !useSolidDecorators, // SOLID decorators handle GraphQL
        withSoftDelete,
        withTimestamps: true, // Always include timestamps
        relationImports: this.buildRelationImports(fields),
      });

      // Generate entity content
      const entityContent = await this.templateEngine.render('entity/entity', templateData);
      
      // Determine output path
      const outputDir = options.path || (context?.paths?.entities || 'src/entities');
      const outputPath = path.join(process.cwd(), outputDir, `${nameVariations.kebabCase}.entity.ts`);
      
      // Write file
      const result = await writeFile(outputPath, entityContent, options.overwrite);
      
      if (!result.success) {
        return {
          success: false,
          message: `Failed to create entity: ${result.error}`,
        };
      }

      // Update modules if enabled
      const nextSteps = ['Add the entity to your module\'s TypeORM forFeature array'];
      
      if (ModuleUpdater.isModuleUpdatingEnabled() && !options.skipModuleUpdate) {
        const moduleUpdater = new ModuleUpdater();
        const componentRegistration = ModuleUpdater.createComponentRegistration(
          name,
          'entity',
          result.path
        );
        
        try {
          const updateResult = await moduleUpdater.updateModulesForComponent(componentRegistration);
          if (updateResult.success && updateResult.updatedFiles.length > 0) {
            nextSteps.unshift(`✅ Automatically updated ${updateResult.updatedFiles.length} module(s)`);
          } else if (updateResult.errors.length > 0) {
            nextSteps.unshift(`⚠️  Module auto-update had issues: ${updateResult.errors.join(', ')}`);
          }
        } catch (error) {
          // Don't fail the generation if module update fails
          nextSteps.unshift(`⚠️  Could not auto-update modules: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      return {
        success: true,
        message: `Entity '${nameVariations.pascalCase}' generated successfully`,
        generatedFiles: [result.path],
        nextSteps,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to generate entity: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Parse field definitions from string format
   * Format: "name:type:required,price:number,description:string:optional"
   */
  private parseFields(fieldDefinitions: FieldDefinition[] | string[]): FieldDefinition[] {
    if (!fieldDefinitions || fieldDefinitions.length === 0) {
      return [];
    }

    // If already parsed, return as is
    if (typeof fieldDefinitions[0] === 'object') {
      return fieldDefinitions as FieldDefinition[];
    }

    const fields: FieldDefinition[] = [];
    
    for (const fieldDef of fieldDefinitions as string[]) {
      const parsed = this.parseFieldDefinition(fieldDef);
      if (parsed) {
        fields.push(parsed);
      }
    }

    return fields;
  }

  /**
   * Parse a single field definition string
   * Formats:
   * - "name:string" (required by default)
   * - "name:string:required"
   * - "name:string:optional"
   * - "supplier:relation:manyToOne:Supplier"
   */
  private parseFieldDefinition(fieldDef: string): FieldDefinition | null {
    const parts = fieldDef.split(':');
    
    if (parts.length < 2) {
      console.warn(`Invalid field definition: ${fieldDef}`);
      return null;
    }

    const [name, type, ...modifiers] = parts;
    
    const field: FieldDefinition = {
      name: name.trim(),
      type: type.trim() as any,
      required: !modifiers.includes('optional'),
      nullable: modifiers.includes('optional'),
    };

    // Handle relation type
    if (field.type === 'relation') {
      if (modifiers.length >= 2) {
        field.relationType = modifiers[0] as any;
        field.relationTarget = modifiers[1];
        
        // Build relation options
        field.options = this.buildRelationOptions(field);
      } else {
        console.warn(`Incomplete relation definition: ${fieldDef}`);
        return null;
      }
    } else {
      // Build column options for regular fields
      field.options = this.buildColumnOptions(field);
    }

    return field;
  }

  /**
   * Build TypeORM column options
   */
  private buildColumnOptions(field: FieldDefinition): any {
    const options: any = {};

    // Set nullable
    if (field.nullable || !field.required) {
      options.nullable = true;
    }

    // Set type-specific options
    switch (field.type) {
      case 'string':
        options.type = 'varchar';
        if (field.name.toLowerCase().includes('email')) {
          options.length = 255;
        }
        break;
      
      case 'number':
        options.type = 'integer';
        break;
      
      case 'boolean':
        options.type = 'boolean';
        options.default = false;
        break;
      
      case 'Date':
        options.type = 'timestamp';
        break;
    }

    return Object.keys(options).length > 0 ? options : undefined;
  }

  /**
   * Build TypeORM relation options
   */
  private buildRelationOptions(field: FieldDefinition): any {
    const options: any = {};

    switch (field.relationType) {
      case 'manyToOne':
        options.eager = false;
        if (field.nullable) {
          options.nullable = true;
        }
        break;
        
      case 'oneToMany':
        options.cascade = true;
        break;
        
      case 'oneToOne':
        options.cascade = true;
        if (field.nullable) {
          options.nullable = true;
        }
        break;
        
      case 'manyToMany':
        options.cascade = true;
        break;
    }

    return options;
  }

  /**
   * Build import statements for relations
   */
  private buildRelationImports(fields: FieldDefinition[]): Array<{ className: string; path: string }> {
    const imports: Array<{ className: string; path: string }> = [];
    const seen = new Set<string>();

    for (const field of fields) {
      if (field.type === 'relation' && field.relationTarget && !seen.has(field.relationTarget)) {
        seen.add(field.relationTarget);
        
        // Generate relative import path (assuming entities are in the same directory)
        const importPath = `./${createNameVariations(field.relationTarget).kebabCase}.entity`;
        
        imports.push({
          className: field.relationTarget,
          path: importPath,
        });
      }
    }

    return imports;
  }

  /**
   * Generate entity from interactive input
   */
  async generateInteractive(): Promise<CommandResult> {
    const inquirer = await import('inquirer');
    
    const answers = await inquirer.default.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Entity name:',
        validate: (input: string) => {
          if (!input.trim()) {
            return 'Entity name is required';
          }
          return true;
        },
      },
      {
        type: 'input',
        name: 'fields',
        message: 'Entity fields (format: name:type:required, e.g., "name:string,price:number"):',
        default: '',
      },
      {
        type: 'confirm',
        name: 'withSoftDelete',
        message: 'Enable soft deletion?',
        default: false,
      },
      {
        type: 'input',
        name: 'path',
        message: 'Output path (leave empty for default):',
        default: '',
      },
    ]);

    const fieldStrings = answers.fields ? answers.fields.split(',').map((f: string) => f.trim()) : [];

    const options: GenerationOptions = {
      name: answers.name,
      type: 'entity',
      fields: fieldStrings,
      withSoftDelete: answers.withSoftDelete,
      path: answers.path || undefined,
      withSolid: true, // Default to SOLID decorators
    };

    return this.generate(answers.name, options);
  }

  /**
   * Validate entity generation options
   */
  validateOptions(options: GenerationOptions): string[] {
    const errors: string[] = [];

    if (!options.name || !options.name.trim()) {
      errors.push('Entity name is required');
    }

    // Validate field definitions
    if (options.fields) {
      for (const field of options.fields) {
        if (typeof field === 'string') {
          const parsed = this.parseFieldDefinition(field);
          if (!parsed) {
            errors.push(`Invalid field definition: ${field}`);
          }
        }
      }
    }

    return errors;
  }
}