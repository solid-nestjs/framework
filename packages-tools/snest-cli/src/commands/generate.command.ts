import { Command } from 'commander';
import chalk from 'chalk';
import { BaseCommand } from './base.command';
import { CommandResult, GenerationOptions } from '../types';
import { ModuleGenerator } from '../generators/module.generator';
import { ResourceGenerator } from '../generators/resource.generator';
import { getProjectContext } from '../utils/config-reader';

interface GenerateCommandOptions {
  fields?: string;
  entities?: string;
  services?: string;
  controllers?: string;
  path?: string;
  withExports?: boolean;
  overwrite?: boolean;
  interactive?: boolean;
  // Resource-specific options
  modulePath?: string;
  generateModule?: boolean;
  skipEntity?: boolean;
  skipService?: boolean;
  skipController?: boolean;
  withSoftDelete?: boolean;
  withBulkOperations?: boolean;
}

/**
 * Command to generate various SOLID NestJS components
 */
export class GenerateCommand extends BaseCommand {
  private moduleGenerator: ModuleGenerator;
  private resourceGenerator: ResourceGenerator;

  constructor(config: any) {
    super(config);
    this.moduleGenerator = new ModuleGenerator();
    this.resourceGenerator = new ResourceGenerator();
  }

  register(program: Command): void {
    const generateCmd = program
      .command('generate')
      .alias('g')
      .description('Generate SOLID NestJS components');

    // Module subcommand
    generateCmd
      .command('module <name>')
      .alias('m')
      .description('Generate a NestJS module')
      .option('--entities <entities>', 'Entities to include (comma-separated)')
      .option('--services <services>', 'Services to include (comma-separated)')
      .option(
        '--controllers <controllers>',
        'Controllers to include (comma-separated)',
      )
      .option('--path <path>', 'Custom output path')
      .option(
        '--with-exports',
        'Export services for other modules (default: true)',
        true,
      )
      .option('--overwrite', 'Overwrite existing files', false)
      .action(async (name: string, options: GenerateCommandOptions) => {
        await this.handleExecution(() => this.generateModule(name, options));
      });

    // Resource subcommand
    generateCmd
      .command('resource <name>')
      .alias('r')
      .description(
        'Generate a complete resource (entity + service + controller + module)',
      )
      .option(
        '--fields <fields>',
        'Entity fields (format: name:type:required,price:number)',
      )
      .option(
        '--module-path <modulePath>',
        'Module path for nested modules (e.g., "users/profile")',
      )
      .option('--skip-entity', 'Skip entity generation', false)
      .option('--skip-service', 'Skip service generation', false)
      .option('--skip-controller', 'Skip controller generation', false)
      .option('--no-module', 'Skip module generation')
      .option('--with-soft-delete', 'Enable soft deletion', false)
      .option('--with-bulk-operations', 'Enable bulk operations', false)
      .option(
        '--path <path>',
        'Custom output path (only when not using modules)',
      )
      .option('--overwrite', 'Overwrite existing files', false)
      .action(async (name: string, options: GenerateCommandOptions) => {
        await this.handleExecution(() => this.generateResource(name, options));
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
   * Generate module
   */
  async generateModule(
    name: string,
    options: GenerateCommandOptions,
  ): Promise<CommandResult> {
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
      const validationErrors =
        this.moduleGenerator.validateOptions(generationOptions);
      if (validationErrors.length > 0) {
        this.failSpinner('Validation failed');
        return {
          success: false,
          message: 'Invalid options',
          errors: validationErrors,
        };
      }

      const context = getProjectContext();
      const result = await this.moduleGenerator.generate(
        name,
        generationOptions,
        context,
      );

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
   * Generate complete resource
   */
  async generateResource(
    name: string,
    options: GenerateCommandOptions,
  ): Promise<CommandResult> {
    this.startSpinner(`Generating resource '${name}'...`);

    try {
      const fieldStrings = options.fields
        ? options.fields.split(',').map(f => f.trim())
        : [];

      const generationOptions: GenerationOptions = {
        name,
        type: 'resource',
        fields: fieldStrings,
        modulePath: options.modulePath,
        generateModule: options.generateModule !== false, // Default to true unless --no-module
        skipEntity: options.skipEntity,
        skipService: options.skipService,
        skipController: options.skipController,
        withSoftDelete: options.withSoftDelete,
        withBulkOperations: options.withBulkOperations,
        path: options.path,
        overwrite: options.overwrite,
      };

      // Validate options
      const validationErrors =
        this.resourceGenerator.validateOptions(generationOptions);
      if (validationErrors.length > 0) {
        this.failSpinner('Validation failed');
        return {
          success: false,
          message: 'Invalid options',
          errors: validationErrors,
        };
      }

      const context = getProjectContext();
      const result = await this.resourceGenerator.generate(
        name,
        generationOptions,
        context,
      );

      if (result.success) {
        this.succeedSpinner(`Resource '${name}' generated successfully`);

        // Show files generated
        if (result.generatedFiles && result.generatedFiles.length > 0) {
          console.log('\n📄 Generated files:');
          result.generatedFiles.forEach(file => {
            const relativePath = file
              .replace(process.cwd(), '')
              .replace(/\\/g, '/')
              .replace(/^\//, '');
            console.log(`  - ${relativePath}`);
          });
        }

        // Show next steps if provided
        if (result.nextSteps && result.nextSteps.length > 0) {
          console.log('\n📋 Next steps:');
          result.nextSteps.forEach((step, index) => {
            console.log(`  ${index + 1}. ${step}`);
          });
        }
      } else {
        this.failSpinner('Failed to generate resource');
      }

      return result;
    } catch (error) {
      this.failSpinner('Failed to generate resource');
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
            {
              name: 'Resource - Complete resource (Entity + Service + Controller/Resolver + Module)',
              value: 'resource',
            },
            { name: 'Module - NestJS module', value: 'module' },
          ],
        },
      ]);

      switch (componentType) {
        case 'resource':
          return await this.resourceGenerator.generateInteractive();

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
    console.log(
      '  ✅',
      chalk.green('resource'),
      '   - Complete resource (entity + service + controller/resolver + module)',
    );
    console.log('  ✅', chalk.green('module'), '     - NestJS module');
    console.log(
      '\n  Use',
      chalk.cyan('snest generate <type> <name>'),
      'to generate components',
    );
    console.log(
      '  Use',
      chalk.cyan('snest generate --interactive'),
      'for guided generation\n',
    );
  }
}
