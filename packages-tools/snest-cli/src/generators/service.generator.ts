import * as path from 'path';
import { TemplateEngine } from '../utils/template-engine';
import { GenerationOptions, CommandResult, ProjectContext, RelationDefinition, FieldDefinition } from '../types';
import { writeFile, ensureDirectory } from '../utils/file-utils';
import { createNameVariations, getSolidBundle } from '../utils/string-utils';
import { ModuleUpdater } from '../utils/module-updater';
import { DTOGenerator } from './dto.generator';

/**
 * Generator for SOLID NestJS services with CRUD operations
 */
export class ServiceGenerator {
  private templateEngine: TemplateEngine;

  constructor() {
    this.templateEngine = new TemplateEngine();
  }

  /**
   * Generate service file
   */
  async generate(
    name: string,
    options: GenerationOptions,
    context?: ProjectContext
  ): Promise<CommandResult> {
    try {
      const nameVariations = createNameVariations(name);
      
      // Determine entity name (default to singular form of service name)
      const entityName = options.entityName || this.singularize(name);
      const entityVariations = createNameVariations(entityName);
      
      // Always use SOLID decorators and GenerateDtoFromEntity
      const hasArgsHelpers = options.withArgsHelpers ?? context?.hasArgsHelpers ?? false;
      const withSoftDelete = options.withSoftDelete ?? false;
      const withBulkOperations = options.withBulkOperations ?? false;
      const databaseType = context?.databaseType || 'typeorm-hybrid-crud';
      
      // Parse relations if provided
      const relations = this.parseRelations(options.relations || []);
      
      // Get basic fields for entity (for GenerateDtoFromEntity)
      const entityFields = this.getBasicFields(entityName);
      
      // Build template data
      const templateData = TemplateEngine.createTemplateData(name, {
        entityName: entityVariations.pascalCase,
        hasArgsHelpers,
        databaseType,
        hasCreateDto: true, // Assume DTOs exist for SOLID apps
        hasUpdateDto: true,
        hasFindArgs: hasArgsHelpers,
        hasRelations: relations.length > 0,
        relations,
        withSoftDelete,
        withBulkOperations,
        hasCustomMethods: options.customMethods && options.customMethods.length > 0,
        customMethods: options.customMethods || [],
        solidBundle: getSolidBundle(context?.apiType),
        hasSwagger: context?.hasSwagger ?? false,
        hasGraphQL: context?.hasGraphQL ?? false,
        hasValidation: true, // Always include validation for DTOs
        fields: entityFields, // Add fields for template use
      });

      // Generate service content
      const serviceContent = await this.templateEngine.render('service/service', templateData);
      
      // Determine output path
      const outputDir = options.path || (context?.paths?.services || 'src/services');
      const projectRoot = context?.projectRoot || process.cwd();
      const outputPath = path.join(projectRoot, outputDir, `${nameVariations.kebabCase}.service.ts`);
      
      // Generate DTOs automatically using templates
      const generatedFiles: string[] = [];
      
      try {
        // Determine DTO paths from context or use defaults
        const dtoInputsPath = typeof context?.paths?.dto === 'string' 
          ? path.join(context.paths.dto, 'inputs')
          : context?.paths?.dto?.inputs || 'src/dto/inputs';
          
        // Ensure DTO directories exist
        await ensureDirectory(path.join(projectRoot, dtoInputsPath));
        
        // Generate create DTO
        const createDtoContent = await this.templateEngine.render('dto/create-dto', templateData);
        const createDtoPath = path.join(projectRoot, dtoInputsPath, `create-${entityVariations.kebabCase}.dto.ts`);
        const createResult = await writeFile(createDtoPath, createDtoContent);
        if (createResult.success) {
          generatedFiles.push(createResult.path);
        }
        
        // Generate update DTO
        const updateDtoContent = await this.templateEngine.render('dto/update-dto', templateData);
        const updateDtoPath = path.join(projectRoot, dtoInputsPath, `update-${entityVariations.kebabCase}.dto.ts`);
        const updateResult = await writeFile(updateDtoPath, updateDtoContent);
        if (updateResult.success) {
          generatedFiles.push(updateResult.path);
        }
      } catch (error) {
        console.warn('Could not generate DTOs automatically:', error);
      }

      // Write service file
      const result = await writeFile(outputPath, serviceContent, options.overwrite);
      
      if (!result.success) {
        return {
          success: false,
          message: `Failed to create service: ${result.error}`,
        };
      }
      
      generatedFiles.push(result.path);

      // Prepare next steps
      const nextSteps = [
        'Register the service in your module providers',
        `Import the ${entityVariations.pascalCase} entity in your TypeORM module`,
        'Add validation DTOs if not already present',
      ];

      // Update modules if enabled
      if (ModuleUpdater.isModuleUpdatingEnabled() && !options.skipModuleUpdate) {
        const moduleUpdater = new ModuleUpdater();
        const componentRegistration = ModuleUpdater.createComponentRegistration(
          name,
          'service',
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
          nextSteps.unshift(`⚠️  Could not auto-update modules: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      return {
        success: true,
        message: `Service '${nameVariations.pascalCase}' generated successfully`,
        generatedFiles: generatedFiles.map(file => path.relative(process.cwd(), file)),
        nextSteps,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to generate service: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Parse relation definitions from string format
   * Format: "supplier:manyToOne:eager,products:oneToMany"
   */
  private parseRelations(relationDefinitions: string[]): RelationDefinition[] {
    const relations: RelationDefinition[] = [];
    
    for (const relationDef of relationDefinitions) {
      const parts = relationDef.split(':');
      
      if (parts.length >= 2) {
        const relation: RelationDefinition = {
          name: parts[0].trim(),
          type: parts[1].trim() as any,
          target: parts[2] ? parts[2].trim() : createNameVariations(parts[0]).pascalCase,
          eager: parts.includes('eager'),
          cascade: parts.includes('cascade'),
        };
        
        relations.push(relation);
      }
    }
    
    return relations;
  }

  /**
   * Generate service from interactive input
   */
  async generateInteractive(): Promise<CommandResult> {
    const inquirer = await import('inquirer');
    
    const answers = await inquirer.default.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Service name:',
        validate: (input: string) => {
          if (!input.trim()) {
            return 'Service name is required';
          }
          return true;
        },
      },
      {
        type: 'input',
        name: 'entityName',
        message: 'Entity name (leave empty if same as service):',
        default: '',
      },
      {
        type: 'confirm',
        name: 'withSolid',
        message: 'Use SOLID decorators and mixins?',
        default: true,
      },
      {
        type: 'confirm',
        name: 'withArgsHelpers',
        message: 'Include Args helpers for advanced querying?',
        default: false,
      },
      {
        type: 'confirm',
        name: 'withBulkOperations',
        message: 'Enable bulk operations?',
        default: false,
      },
      {
        type: 'confirm',
        name: 'withSoftDelete',
        message: 'Enable soft deletion support?',
        default: false,
      },
      {
        type: 'input',
        name: 'relations',
        message: 'Relations (format: name:type:target, e.g., "supplier:manyToOne:Supplier"):',
        default: '',
      },
      {
        type: 'input',
        name: 'path',
        message: 'Output path (leave empty for default):',
        default: '',
      },
    ]);

    const relationStrings = answers.relations ? answers.relations.split(',').map((r: string) => r.trim()).filter((r: string) => r) : [];

    const options: GenerationOptions = {
      name: answers.name,
      type: 'service',
      entityName: answers.entityName || answers.name,
      withSolid: answers.withSolid,
      withArgsHelpers: answers.withArgsHelpers,
      withBulkOperations: answers.withBulkOperations,
      withSoftDelete: answers.withSoftDelete,
      relations: relationStrings,
      path: answers.path || undefined,
    };

    return this.generate(answers.name, options);
  }

  /**
   * Validate service generation options
   */
  validateOptions(options: GenerationOptions): string[] {
    const errors: string[] = [];

    if (!options.name || !options.name.trim()) {
      errors.push('Service name is required');
    }

    // Validate service name format
    if (options.name && !/^[A-Za-z][A-Za-z0-9]*$/.test(options.name)) {
      errors.push('Service name must be a valid identifier (letters and numbers only, starting with a letter)');
    }

    // Validate relations format
    if (options.relations) {
      for (const relation of options.relations) {
        if (typeof relation === 'string') {
          const parts = relation.split(':');
          if (parts.length < 2) {
            errors.push(`Invalid relation definition: ${relation}. Expected format: name:type or name:type:target`);
          }
          
          const relationType = parts[1];
          if (!['oneToOne', 'oneToMany', 'manyToOne', 'manyToMany'].includes(relationType)) {
            errors.push(`Invalid relation type: ${relationType}. Must be oneToOne, oneToMany, manyToOne, or manyToMany`);
          }
        }
      }
    }

    return errors;
  }

  /**
   * Generate service with entity reference
   */
  async generateForEntity(entityName: string, options: Partial<GenerationOptions> = {}): Promise<CommandResult> {
    const serviceOptions: GenerationOptions = {
      name: options.name || `${entityName}s`,
      type: 'service',
      entityName,
      withSolid: options.withSolid ?? true,
      withArgsHelpers: options.withArgsHelpers ?? false,
      withBulkOperations: options.withBulkOperations ?? false,
      withSoftDelete: options.withSoftDelete ?? false,
      relations: options.relations || [],
      path: options.path,
      overwrite: options.overwrite,
    };

    return this.generate(serviceOptions.name, serviceOptions);
  }

  /**
   * Simple singularization method for common English patterns
   */
  private singularize(word: string): string {
    const singular = word.toLowerCase();
    
    // Common patterns
    if (singular.endsWith('ies')) {
      return word.slice(0, -3) + 'y'; // Companies -> Company
    } else if (singular.endsWith('ves')) {
      return word.slice(0, -3) + 'f'; // Lives -> Life
    } else if (singular.endsWith('es') && singular.length > 3) {
      return word.slice(0, -2); // Classes -> Class
    } else if (singular.endsWith('s') && singular.length > 1) {
      return word.slice(0, -1); // Users -> User
    }
    
    return word; // Return as-is if no pattern matches
  }

  /**
   * Get basic fields for common entities to generate DTOs
   */
  private getBasicFields(entityName: string): FieldDefinition[] {
    const entityLower = entityName.toLowerCase();
    
    // Common field patterns based on entity name
    const commonFields: FieldDefinition[] = [];
    
    if (entityLower.includes('user')) {
      commonFields.push(
        { name: 'email', type: 'string', required: true, nullable: false },
        { name: 'name', type: 'string', required: true, nullable: false },
        { name: 'password', type: 'string', required: true, nullable: false }
      );
    } else if (entityLower.includes('product')) {
      commonFields.push(
        { name: 'name', type: 'string', required: true, nullable: false },
        { name: 'price', type: 'number', required: true, nullable: false },
        { name: 'category', type: 'string', required: true, nullable: false }
      );
    } else {
      // Default fields for unknown entities
      commonFields.push(
        { name: 'name', type: 'string', required: true, nullable: false }
      );
    }
    
    return commonFields;
  }
}