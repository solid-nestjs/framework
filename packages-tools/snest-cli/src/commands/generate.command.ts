import { Command } from 'commander';
import chalk from 'chalk';
import { BaseCommand } from './base.command';
import { CommandResult, GenerationOptions } from '../types';
import { EntityGenerator } from '../generators/entity.generator';
import { ServiceGenerator } from '../generators/service.generator';
import { ControllerGenerator } from '../generators/controller.generator';
import { ModuleGenerator } from '../generators/module.generator';

interface GenerateCommandOptions {
  fields?: string;
  entityName?: string;
  serviceName?: string;
  relations?: string;
  entities?: string;
  services?: string;
  controllers?: string;
  path?: string;
  type?: 'rest' | 'graphql' | 'hybrid';
  withTests?: boolean;
  withSolid?: boolean;
  withValidation?: boolean;
  withArgsHelpers?: boolean;
  withBulkOperations?: boolean;
  withSoftDelete?: boolean;
  withGuards?: boolean;
  withExports?: boolean;
  skipModuleUpdate?: boolean;
  overwrite?: boolean;
  interactive?: boolean;
}

/**
 * Command to generate various SOLID NestJS components
 */
export class GenerateCommand extends BaseCommand {
  private entityGenerator: EntityGenerator;
  private serviceGenerator: ServiceGenerator;
  private controllerGenerator: ControllerGenerator;
  private moduleGenerator: ModuleGenerator;

  constructor(config: any) {
    super(config);
    this.entityGenerator = new EntityGenerator();
    this.serviceGenerator = new ServiceGenerator();
    this.controllerGenerator = new ControllerGenerator();
    this.moduleGenerator = new ModuleGenerator();
  }

  register(program: Command): void {
    const generateCmd = program
      .command('generate')
      .alias('g')
      .description('Generate SOLID NestJS components');

    // Entity subcommand
    generateCmd
      .command('entity <name>')
      .alias('e')
      .description('Generate an entity with SOLID decorators')
      .option('--fields <fields>', 'Entity fields (format: name:type:required,price:number)')
      .option('--path <path>', 'Custom output path')
      .option('--with-soft-delete', 'Enable soft deletion', false)
      .option('--with-solid', 'Use SOLID decorators (default: true)', true)
      .option('--skip-module-update', 'Skip automatic module updates', false)
      .option('--overwrite', 'Overwrite existing files', false)
      .action(async (name: string, options: GenerateCommandOptions) => {
        await this.handleExecution(() => this.generateEntity(name, options));
      });

    // Service subcommand
    generateCmd
      .command('service <name>')
      .alias('s')
      .description('Generate a service with CRUD operations')
      .option('--entity-name <entityName>', 'Entity name if different from service')
      .option('--relations <relations>', 'Relations (format: name:type:target,supplier:manyToOne:Supplier)')
      .option('--path <path>', 'Custom output path')
      .option('--with-solid', 'Use SOLID decorators (default: true)', true)
      .option('--with-args-helpers', 'Include Args helpers', false)
      .option('--with-bulk-operations', 'Enable bulk operations', false)
      .option('--with-soft-delete', 'Enable soft deletion support', false)
      .option('--skip-module-update', 'Skip automatic module updates', false)
      .option('--overwrite', 'Overwrite existing files', false)
      .action(async (name: string, options: GenerateCommandOptions) => {
        await this.handleExecution(() => this.generateService(name, options));
      });

    // Controller subcommand
    generateCmd
      .command('controller <name>')
      .alias('c')
      .description('Generate a REST API controller')
      .option('--entity-name <entityName>', 'Entity name if different from controller')
      .option('--service-name <serviceName>', 'Service name if different from default')
      .option('--path <path>', 'Custom output path')
      .option('--type <type>', 'API type (rest, graphql, hybrid)', 'rest')
      .option('--with-solid', 'Use SOLID decorators (default: true)', true)
      .option('--with-validation', 'Enable request validation (default: true)', true)
      .option('--with-args-helpers', 'Include Args helpers', false)
      .option('--with-bulk-operations', 'Enable bulk operations endpoints', false)
      .option('--with-soft-delete', 'Enable soft deletion endpoints', false)
      .option('--with-guards', 'Add authentication guards', false)
      .option('--skip-module-update', 'Skip automatic module updates', false)
      .option('--overwrite', 'Overwrite existing files', false)
      .action(async (name: string, options: GenerateCommandOptions) => {
        await this.handleExecution(() => this.generateController(name, options));
      });

    // Module subcommand
    generateCmd
      .command('module <name>')
      .alias('m')
      .description('Generate a NestJS module')
      .option('--entities <entities>', 'Entities to include (comma-separated)')
      .option('--services <services>', 'Services to include (comma-separated)')
      .option('--controllers <controllers>', 'Controllers to include (comma-separated)')
      .option('--path <path>', 'Custom output path')
      .option('--with-exports', 'Export services for other modules (default: true)', true)
      .option('--overwrite', 'Overwrite existing files', false)
      .action(async (name: string, options: GenerateCommandOptions) => {
        await this.handleExecution(() => this.generateModule(name, options));
      });

    // Interactive mode
    generateCmd
      .command('interactive')
      .alias('i')
      .description('Interactive generation mode')
      .action(async () => {
        await this.handleExecution(() => this.interactiveGeneration());
      });

    // Default generate command with --interactive flag
    generateCmd
      .option('-i, --interactive', 'Run in interactive mode')
      .action(async (options: GenerateCommandOptions) => {
        if (options.interactive) {
          await this.handleExecution(() => this.interactiveGeneration());
        } else {
          // Show help if no subcommand
          generateCmd.outputHelp();
        }
      });
  }

  async execute(): Promise<CommandResult> {
    return {
      success: true,
      message: 'Generate command executed',
    };
  }

  /**
   * Generate entity
   */
  async generateEntity(name: string, options: GenerateCommandOptions): Promise<CommandResult> {
    this.startSpinner(`Generating entity '${name}'...`);

    try {
      const fieldStrings = options.fields ? options.fields.split(',').map(f => f.trim()) : [];

      const generationOptions: GenerationOptions = {
        name,
        type: 'entity',
        fields: fieldStrings,
        path: options.path,
        withSoftDelete: options.withSoftDelete,
        withSolid: options.withSolid,
        skipModuleUpdate: options.skipModuleUpdate,
        overwrite: options.overwrite,
      };

      // Validate options
      const validationErrors = this.entityGenerator.validateOptions(generationOptions);
      if (validationErrors.length > 0) {
        this.failSpinner('Validation failed');
        return {
          success: false,
          message: 'Invalid options',
          errors: validationErrors,
        };
      }

      const result = await this.entityGenerator.generate(name, generationOptions);
      
      if (result.success) {
        this.succeedSpinner(`Entity '${name}' generated successfully`);
      } else {
        this.failSpinner('Failed to generate entity');
      }

      return result;
    } catch (error) {
      this.failSpinner('Failed to generate entity');
      throw error;
    }
  }

  /**
   * Generate service
   */
  async generateService(name: string, options: GenerateCommandOptions): Promise<CommandResult> {
    this.startSpinner(`Generating service '${name}'...`);

    try {
      const relationStrings = options.relations ? options.relations.split(',').map(r => r.trim()).filter(r => r) : [];

      const generationOptions: GenerationOptions = {
        name,
        type: 'service',
        entityName: options.entityName,
        relations: relationStrings,
        path: options.path,
        withSolid: options.withSolid,
        withArgsHelpers: options.withArgsHelpers,
        withBulkOperations: options.withBulkOperations,
        withSoftDelete: options.withSoftDelete,
        skipModuleUpdate: options.skipModuleUpdate,
        overwrite: options.overwrite,
      };

      // Validate options
      const validationErrors = this.serviceGenerator.validateOptions(generationOptions);
      if (validationErrors.length > 0) {
        this.failSpinner('Validation failed');
        return {
          success: false,
          message: 'Invalid options',
          errors: validationErrors,
        };
      }

      const result = await this.serviceGenerator.generate(name, generationOptions);
      
      if (result.success) {
        this.succeedSpinner(`Service '${name}' generated successfully`);
        
        // Show next steps if provided
        if (result.nextSteps && result.nextSteps.length > 0) {
          console.log('\n📋 Next steps:');
          result.nextSteps.forEach((step, index) => {
            console.log(`  ${index + 1}. ${step}`);
          });
        }
      } else {
        this.failSpinner('Failed to generate service');
      }

      return result;
    } catch (error) {
      this.failSpinner('Failed to generate service');
      throw error;
    }
  }

  /**
   * Generate controller
   */
  async generateController(name: string, options: GenerateCommandOptions): Promise<CommandResult> {
    this.startSpinner(`Generating controller '${name}'...`);

    try {
      const generationOptions: GenerationOptions = {
        name,
        type: 'controller',
        entityName: options.entityName,
        serviceName: options.serviceName,
        apiType: options.type,
        path: options.path,
        withSolid: options.withSolid,
        withValidation: options.withValidation,
        withArgsHelpers: options.withArgsHelpers,
        withBulkOperations: options.withBulkOperations,
        withSoftDelete: options.withSoftDelete,
        withGuards: options.withGuards,
        skipModuleUpdate: options.skipModuleUpdate,
        overwrite: options.overwrite,
      };

      // Validate options
      const validationErrors = this.controllerGenerator.validateOptions(generationOptions);
      if (validationErrors.length > 0) {
        this.failSpinner('Validation failed');
        return {
          success: false,
          message: 'Invalid options',
          errors: validationErrors,
        };
      }

      const result = await this.controllerGenerator.generate(name, generationOptions);
      
      if (result.success) {
        this.succeedSpinner(`Controller '${name}' generated successfully`);
        
        // Show next steps if provided
        if (result.nextSteps && result.nextSteps.length > 0) {
          console.log('\n📋 Next steps:');
          result.nextSteps.forEach((step, index) => {
            console.log(`  ${index + 1}. ${step}`);
          });
        }
      } else {
        this.failSpinner('Failed to generate controller');
      }

      return result;
    } catch (error) {
      this.failSpinner('Failed to generate controller');
      throw error;
    }
  }

  /**
   * Generate module
   */
  async generateModule(name: string, options: GenerateCommandOptions): Promise<CommandResult> {
    this.startSpinner(`Generating module '${name}'...`);

    try {
      const generationOptions: GenerationOptions = {
        name,
        type: 'module',
        entities: options.entities,
        services: options.services,
        controllers: options.controllers,
        withExports: options.withExports,
        path: options.path,
        overwrite: options.overwrite,
      };

      // Validate options
      const validationErrors = this.moduleGenerator.validateOptions(generationOptions);
      if (validationErrors.length > 0) {
        this.failSpinner('Validation failed');
        return {
          success: false,
          message: 'Invalid options',
          errors: validationErrors,
        };
      }

      const result = await this.moduleGenerator.generate(name, generationOptions);
      
      if (result.success) {
        this.succeedSpinner(`Module '${name}' generated successfully`);
        
        // Show next steps if provided
        if (result.nextSteps && result.nextSteps.length > 0) {
          console.log('\n📋 Next steps:');
          result.nextSteps.forEach((step, index) => {
            console.log(`  ${index + 1}. ${step}`);
          });
        }
      } else {
        this.failSpinner('Failed to generate module');
      }

      return result;
    } catch (error) {
      this.failSpinner('Failed to generate module');
      throw error;
    }
  }

  /**
   * Interactive generation mode
   */
  async interactiveGeneration(): Promise<CommandResult> {
    try {
      const inquirer = await import('inquirer');

      console.log(chalk.blue('\n🔍 SOLID NestJS Interactive Generator\n'));

      const { componentType } = await inquirer.default.prompt([
        {
          type: 'list',
          name: 'componentType',
          message: 'What would you like to generate?',
          choices: [
            { name: 'Entity - Database entity with SOLID decorators', value: 'entity' },
            { name: 'Service - CRUD service with operations', value: 'service' },
            { name: 'Controller - REST API controller', value: 'controller' },
            { name: 'Module - NestJS module', value: 'module' },
            { name: 'Resource - Complete resource (Entity + Service + Controller)', value: 'resource', disabled: 'Coming soon' },
          ],
        },
      ]);

      switch (componentType) {
        case 'entity':
          return await this.entityGenerator.generateInteractive();
        
        case 'service':
          return await this.serviceGenerator.generateInteractive();
        
        case 'controller':
          return await this.controllerGenerator.generateInteractive();
        
        case 'module':
          return await this.moduleGenerator.generateInteractive();
        
        default:
          return {
            success: false,
            message: `Generator for ${componentType} is not implemented yet`,
          };
      }
    } catch (error) {
      return {
        success: false,
        message: `Interactive generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Show available generators
   */
  private showAvailableGenerators(): void {
    console.log(chalk.blue('\n📋 Available Generators:\n'));
    console.log('  ✅', chalk.green('entity'), '     - Database entity with SOLID decorators');
    console.log('  ✅', chalk.green('service'), '    - CRUD service with operations');
    console.log('  ✅', chalk.green('controller'), ' - REST API controller');
    console.log('  ✅', chalk.green('module'), '     - NestJS module');
    console.log('  🚧', chalk.yellow('resource'), '   - Complete resource (coming soon)');
    console.log('\n  Use', chalk.cyan('snest generate <type> <name>'), 'to generate components');
    console.log('  Use', chalk.cyan('snest generate --interactive'), 'for guided generation\n');
  }
}