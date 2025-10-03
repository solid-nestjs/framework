import * as path from 'path';
import { TemplateEngine } from '../utils/template-engine';
import { GenerationOptions, CommandResult, ProjectContext } from '../types';
import { writeFile } from '../utils/file-utils';
import { createNameVariations, getSolidBundle } from '../utils/string-utils';
import { ModuleUpdater } from '../utils/module-updater';

/**
 * Generator for GraphQL resolvers with SOLID decorators
 */
export class ResolverGenerator {
  private templateEngine: TemplateEngine;

  constructor() {
    this.templateEngine = new TemplateEngine();
  }

  /**
   * Generate resolver file
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
      const hasGraphQL = true; // This is a GraphQL resolver
      const hasValidation = options.withValidation ?? true;
      const hasArgsHelpers =
        options.withArgsHelpers ?? context?.hasArgsHelpers ?? false;
      const apiType = 'graphql';

      // Configure operations
      const operations = this.configureOperations(options);

      // Configure custom endpoints
      const customEndpoints = options.customEndpoints || [];

      // Build template data
      const templateData = TemplateEngine.createTemplateData(name, {
        entityName: entityVariations.pascalCase,
        serviceName: serviceVariations.pascalCase.replace(/Service$/, ''), // Remove Service suffix if present
        useSolidDecorators,
        hasSwagger: false, // GraphQL resolvers don't use Swagger
        hasGraphQL,
        hasValidation,
        hasArgsHelpers,
        hasCreateDto: true, // Assume DTOs exist
        hasUpdateDto: true,
        hasFindArgs: hasArgsHelpers,
        hasGroupBy: options.generateGroupBy ?? false,
        operations,
        customEndpoints,
        hasCustomEndpoints: customEndpoints.length > 0,
        withGuards: options.withGuards || false,
        guards: options.guards || [],
        apiType,
        solidBundle: getSolidBundle(context?.apiType),
      });

      // Generate resolver content
      const resolverContent = await this.templateEngine.render(
        'resolver/graphql-resolver',
        templateData,
      );

      // Determine output path
      const outputDir =
        options.path || context?.paths?.controllers || 'src/resolvers';
      const projectRoot = context?.projectRoot || process.cwd();
      const outputPath = path.join(
        projectRoot,
        outputDir,
        `${nameVariations.kebabCase}.resolver.ts`,
      );

      // Write file
      const result = await writeFile(
        outputPath,
        resolverContent,
        options.overwrite,
      );

      if (!result.success) {
        return {
          success: false,
          message: `Failed to create resolver: ${result.error}`,
        };
      }

      // Prepare next steps
      const nextSteps = [
        'Register the resolver in your module providers array',
        'Register the associated service in your module providers',
        'Ensure GraphQLModule is configured in your app.module.ts',
        'Test the generated GraphQL queries and mutations',
      ];

      // Update modules if enabled
      if (
        ModuleUpdater.isModuleUpdatingEnabled() &&
        !options.skipModuleUpdate
      ) {
        const moduleUpdater = new ModuleUpdater();
        const componentRegistration = ModuleUpdater.createComponentRegistration(
          name,
          'resolver',
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
        message: `Resolver '${nameVariations.pascalCase}Resolver' generated successfully`,
        generatedFiles: [result.path],
        nextSteps,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to generate resolver: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Configure default CRUD operations
   */
  private configureOperations(options: GenerationOptions): any[] {
    const defaultOperations = [
      { name: 'findAll', enabled: true },
      { name: 'findOne', enabled: true },
      { name: 'create', enabled: true },
      { name: 'update', enabled: true },
      { name: 'remove', enabled: true },
    ];

    return defaultOperations;
  }

  /**
   * Generate resolver from interactive input
   */
  async generateInteractive(): Promise<CommandResult> {
    const inquirer = await import('inquirer');

    const answers = await inquirer.default.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Resolver name:',
        validate: (input: string) => {
          if (!input.trim()) {
            return 'Resolver name is required';
          }
          return true;
        },
      },
      {
        type: 'input',
        name: 'entityName',
        message: 'Entity name (leave empty if same as resolver):',
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
      type: 'resolver',
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
   * Validate resolver generation options
   */
  validateOptions(options: GenerationOptions): string[] {
    const errors: string[] = [];

    if (!options.name || !options.name.trim()) {
      errors.push('Resolver name is required');
    }

    // Validate resolver name format
    if (options.name && !/^[A-Za-z][A-Za-z0-9]*$/.test(options.name)) {
      errors.push(
        'Resolver name must be a valid identifier (letters and numbers only, starting with a letter)',
      );
    }

    return errors;
  }

  /**
   * Generate resolver with entity and service references
   */
  async generateForEntity(
    entityName: string,
    serviceName?: string,
    options: Partial<GenerationOptions> = {},
  ): Promise<CommandResult> {
    const resolverOptions: GenerationOptions = {
      name: options.name || entityName,
      type: 'resolver',
      entityName,
      serviceName: serviceName || `${entityName}s`,
      apiType: 'graphql',
      withSolid: options.withSolid ?? true,
      withValidation: options.withValidation ?? true,
      withArgsHelpers: options.withArgsHelpers ?? false,
      withBulkOperations: options.withBulkOperations ?? false,
      withSoftDelete: options.withSoftDelete ?? false,
      withGuards: options.withGuards ?? false,
      path: options.path,
      overwrite: options.overwrite,
    };

    return this.generate(resolverOptions.name, resolverOptions);
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
