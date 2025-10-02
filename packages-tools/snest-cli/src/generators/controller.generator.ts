import * as path from 'path';
import { TemplateEngine } from '../utils/template-engine';
import { GenerationOptions, CommandResult, ProjectContext } from '../types';
import { writeFile } from '../utils/file-utils';
import { createNameVariations, getSolidBundle } from '../utils/string-utils';
import { ModuleUpdater } from '../utils/module-updater';

/**
 * Controller operation configuration
 */
interface ControllerOperation {
  name: string;
  enabled: boolean;
  config?: Record<string, any>;
}

/**
 * Custom endpoint configuration
 */
interface CustomEndpoint {
  name: string;
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  parameters: Array<{ name: string; type: string; decorator: string }>;
  returnType: string;
  decorators: string[];
  swagger?: Array<{ decorator: string; config?: any }>;
}

/**
 * Generator for REST API controllers with SOLID decorators
 */
export class ControllerGenerator {
  private templateEngine: TemplateEngine;

  constructor() {
    this.templateEngine = new TemplateEngine();
  }

  /**
   * Generate controller file
   */
  async generate(
    name: string,
    options: GenerationOptions,
    context?: ProjectContext,
  ): Promise<CommandResult> {
    try {
      const nameVariations = createNameVariations(name);

      // Determine entity and service names (with auto-singularization)
      const entityName = options.entityName || this.detectEntityName(name);
      const serviceName = options.serviceName || name; // Service name is usually plural (Users, Products)
      const entityVariations = createNameVariations(entityName);
      const serviceVariations = createNameVariations(serviceName);

      // Always use SOLID decorators and determine features
      const useSolidDecorators = true; // Always use SOLID framework mixins
      const hasSwagger = context?.hasSwagger ?? true; // Default to true for REST APIs
      const hasGraphQL = context?.hasGraphQL ?? false;
      const hasValidation = options.withValidation ?? true;
      const hasArgsHelpers =
        options.withArgsHelpers ?? context?.hasArgsHelpers ?? false;
      const apiType = options.apiType || 'rest';

      // Configure operations
      const operations = this.configureOperations(options);

      // Configure custom endpoints
      const customEndpoints = options.customEndpoints || [];

      // Build template data
      const templateData = TemplateEngine.createTemplateData(name, {
        entityName: entityVariations.pascalCase,
        serviceName: serviceVariations.pascalCase.replace(/Service$/, ''), // Remove Service suffix if present
        useSolidDecorators,
        hasSwagger: hasSwagger, // SOLID decorators provide Swagger integration
        hasGraphQL,
        hasValidation,
        hasArgsHelpers,
        hasCreateDto: true, // Assume DTOs exist
        hasUpdateDto: true,
        hasFindArgs: hasArgsHelpers,
        operations,
        customEndpoints,
        hasCustomEndpoints: customEndpoints.length > 0,
        withGuards: options.withGuards || false,
        guards: options.guards || [],
        apiType,
        solidBundle: getSolidBundle(context?.apiType),
      });

      // Generate controller content
      const controllerContent = await this.templateEngine.render(
        'controller/rest-controller',
        templateData,
      );

      // Determine output path
      const outputDir =
        options.path || context?.paths?.controllers || 'src/controllers';
      const projectRoot = context?.projectRoot || process.cwd();
      const outputPath = path.join(
        projectRoot,
        outputDir,
        `${nameVariations.kebabCase}.controller.ts`,
      );

      // Write file
      const result = await writeFile(
        outputPath,
        controllerContent,
        options.overwrite,
      );

      if (!result.success) {
        return {
          success: false,
          message: `Failed to create controller: ${result.error}`,
        };
      }

      // Prepare next steps
      const nextSteps = [
        'Register the controller in your module controllers array',
        'Register the associated service in your module providers',
        'Add authentication guards if needed',
        'Test the API endpoints with your preferred tool',
      ];

      // Update modules if enabled
      if (
        ModuleUpdater.isModuleUpdatingEnabled() &&
        !options.skipModuleUpdate
      ) {
        const moduleUpdater = new ModuleUpdater();
        const componentRegistration = ModuleUpdater.createComponentRegistration(
          name,
          'controller',
          result.path,
        );

        try {
          const updateResult = await moduleUpdater.updateModulesForComponent(
            componentRegistration,
          );
          if (updateResult.success && updateResult.updatedFiles.length > 0) {
            nextSteps.unshift(
              `✅ Automatically updated ${updateResult.updatedFiles.length} module(s)`,
            );
          } else if (updateResult.errors.length > 0) {
            nextSteps.unshift(
              `⚠️  Module auto-update had issues: ${updateResult.errors.join(', ')}`,
            );
          }
        } catch (error) {
          nextSteps.unshift(
            `⚠️  Could not auto-update modules: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
        }
      }

      return {
        success: true,
        message: `Controller '${nameVariations.pascalCase}Controller' generated successfully`,
        generatedFiles: [result.path],
        nextSteps,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to generate controller: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Configure default CRUD operations
   */
  private configureOperations(
    options: GenerationOptions,
  ): ControllerOperation[] {
    const defaultOperations: ControllerOperation[] = [
      { name: 'findAll', enabled: true },
      { name: 'findOne', enabled: true },
      { name: 'create', enabled: true },
      { name: 'update', enabled: true },
      { name: 'remove', enabled: true },
    ];

    return defaultOperations;
  }

  /**
   * Generate controller from interactive input
   */
  async generateInteractive(): Promise<CommandResult> {
    const inquirer = await import('inquirer');

    const answers = await inquirer.default.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Controller name:',
        validate: (input: string) => {
          if (!input.trim()) {
            return 'Controller name is required';
          }
          return true;
        },
      },
      {
        type: 'input',
        name: 'entityName',
        message: 'Entity name (leave empty if same as controller):',
        default: '',
      },
      {
        type: 'input',
        name: 'serviceName',
        message: 'Service name (leave empty for auto-generated):',
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
        name: 'withValidation',
        message: 'Enable request validation?',
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
        message: 'Enable bulk operations endpoints?',
        default: false,
      },
      {
        type: 'confirm',
        name: 'withSoftDelete',
        message: 'Enable soft deletion endpoints?',
        default: false,
      },
      {
        type: 'confirm',
        name: 'withGuards',
        message: 'Add authentication/authorization guards?',
        default: false,
      },
      {
        type: 'input',
        name: 'path',
        message: 'Output path (leave empty for default):',
        default: '',
      },
    ]);

    const options: GenerationOptions = {
      name: answers.name,
      type: 'controller',
      entityName: answers.entityName || answers.name,
      serviceName:
        answers.serviceName || `${answers.entityName || answers.name}s`,
      withSolid: answers.withSolid,
      withValidation: answers.withValidation,
      withArgsHelpers: answers.withArgsHelpers,
      withBulkOperations: answers.withBulkOperations,
      withSoftDelete: answers.withSoftDelete,
      withGuards: answers.withGuards,
      path: answers.path || undefined,
    };

    return this.generate(answers.name, options);
  }

  /**
   * Validate controller generation options
   */
  validateOptions(options: GenerationOptions): string[] {
    const errors: string[] = [];

    if (!options.name || !options.name.trim()) {
      errors.push('Controller name is required');
    }

    // Validate controller name format
    if (options.name && !/^[A-Za-z][A-Za-z0-9]*$/.test(options.name)) {
      errors.push(
        'Controller name must be a valid identifier (letters and numbers only, starting with a letter)',
      );
    }

    // Validate API type if specified
    if (
      options.apiType &&
      !['rest', 'graphql', 'hybrid'].includes(options.apiType)
    ) {
      errors.push('API type must be one of: rest, graphql, hybrid');
    }

    return errors;
  }

  /**
   * Generate controller with entity and service references
   */
  async generateForEntity(
    entityName: string,
    serviceName?: string,
    options: Partial<GenerationOptions> = {},
  ): Promise<CommandResult> {
    const controllerOptions: GenerationOptions = {
      name: options.name || entityName,
      type: 'controller',
      entityName,
      serviceName: serviceName || `${entityName}s`,
      apiType: options.apiType || 'rest',
      withSolid: options.withSolid ?? true,
      withValidation: options.withValidation ?? true,
      withArgsHelpers: options.withArgsHelpers ?? false,
      withBulkOperations: options.withBulkOperations ?? false,
      withSoftDelete: options.withSoftDelete ?? false,
      withGuards: options.withGuards ?? false,
      path: options.path,
      overwrite: options.overwrite,
    };

    return this.generate(controllerOptions.name, controllerOptions);
  }

  /**
   * Detect entity name from service name (singularize if needed)
   */
  private detectEntityName(serviceName: string): string {
    // Convert service name to singular for entity
    // Common patterns: Users -> User, Products -> Product, etc.
    const pluralize = require('pluralize');
    return pluralize.singular(serviceName);
  }
}
