import * as path from 'path';
import { GenerationOptions, CommandResult, ProjectContext } from '../types';
import { createNameVariations } from '../utils/string-utils';
import { EntityGenerator } from './entity.generator';
import { ServiceGenerator } from './service.generator';
import { ControllerGenerator } from './controller.generator';
import { ModuleGenerator } from './module.generator';
import { ModuleUpdater } from '../utils/module-updater';
import { AstUtils } from '../utils/ast-utils';

/**
 * Resource generation result
 */
interface ResourceResult {
  entity?: CommandResult;
  service?: CommandResult;
  controller?: CommandResult;
  module?: CommandResult;
}

/**
 * Generator for complete resources (entity + service + controller + module)
 * Similar to NestJS CLI's "nest generate resource" but with SOLID framework features
 */
export class ResourceGenerator {
  private entityGenerator: EntityGenerator;
  private serviceGenerator: ServiceGenerator;
  private controllerGenerator: ControllerGenerator;
  private moduleGenerator: ModuleGenerator;

  constructor() {
    this.entityGenerator = new EntityGenerator();
    this.serviceGenerator = new ServiceGenerator();
    this.controllerGenerator = new ControllerGenerator();
    this.moduleGenerator = new ModuleGenerator();
  }

  /**
   * Generate a complete resource with all components
   */
  async generate(
    name: string,
    options: GenerationOptions,
    context?: ProjectContext
  ): Promise<CommandResult> {
    // Temporarily disable automatic module updating during resource generation
    const originalSkipFlag = process.env.SKIP_MODULE_UPDATE;
    process.env.SKIP_MODULE_UPDATE = 'true';
    
    try {

      const nameVariations = createNameVariations(name);
      const results: ResourceResult = {};
      const generatedFiles: string[] = [];
      const errors: string[] = [];
      let allNextSteps: string[] = [];

      // Determine what to generate
      const generateEntity = options.skipEntity !== true;
      const generateService = options.skipService !== true;
      const generateController = options.skipController !== true;
      const generateModule = options.generateModule !== false; // Default to true
      
      // Determine module path structure
      const moduleBasePath = this.buildModulePath(name, options.modulePath);
      const moduleContext = this.buildModuleContext(context, moduleBasePath, options);

      console.log(`\n🚀 Generating resource '${nameVariations.pascalCase}'...`);

      // 1. Generate Entity
      if (generateEntity) {
        console.log(`📋 Generating entity '${nameVariations.pascalCase}'...`);
        const entityOptions: GenerationOptions = {
          ...options,
          name: nameVariations.pascalCase,
          type: 'entity',
          path: path.join(moduleBasePath, 'entities'),
          skipModuleUpdate: true, // We'll handle module updates at the resource level
        };
        
        results.entity = await this.entityGenerator.generate(
          nameVariations.pascalCase, 
          entityOptions, 
          moduleContext
        );
        
        if (results.entity.success) {
          generatedFiles.push(...(results.entity.generatedFiles || []));
          console.log(`✅ Entity '${nameVariations.pascalCase}' generated`);
        } else {
          errors.push(`Entity generation failed: ${results.entity.message}`);
        }
      }

      // 2. Generate Service (depends on entity for DTOs)
      if (generateService && (!generateEntity || results.entity?.success)) {
        console.log(`⚙️ Generating service '${nameVariations.pascalCase}s'...`);
        const serviceOptions: GenerationOptions = {
          ...options,
          name: `${nameVariations.pascalCase}s`,
          entityName: nameVariations.pascalCase,
          type: 'service',
          path: path.join(moduleBasePath, 'services'),
          skipModuleUpdate: true, // We'll handle module updates at the resource level
        };
        
        results.service = await this.serviceGenerator.generate(
          `${nameVariations.pascalCase}s`,
          serviceOptions,
          moduleContext
        );
        
        if (results.service.success) {
          generatedFiles.push(...(results.service.generatedFiles || []));
          console.log(`✅ Service '${nameVariations.pascalCase}sService' generated`);
        } else {
          errors.push(`Service generation failed: ${results.service.message}`);
        }
      }

      // 3. Generate Controller (depends on service)
      if (generateController && (!generateService || results.service?.success)) {
        console.log(`🎮 Generating controller '${nameVariations.pascalCase}s'...`);
        const controllerOptions: GenerationOptions = {
          ...options,
          name: `${nameVariations.pascalCase}s`,
          entityName: nameVariations.pascalCase,
          serviceName: `${nameVariations.pascalCase}s`,
          type: 'controller',
          path: path.join(moduleBasePath, 'controllers'),
          skipModuleUpdate: true, // We'll handle module updates at the resource level
        };
        
        results.controller = await this.controllerGenerator.generate(
          `${nameVariations.pascalCase}s`,
          controllerOptions,
          moduleContext
        );
        
        if (results.controller.success) {
          generatedFiles.push(...(results.controller.generatedFiles || []));
          console.log(`✅ Controller '${nameVariations.pascalCase}sController' generated`);
        } else {
          errors.push(`Controller generation failed: ${results.controller.message}`);
        }
      }

      // 4. Generate Module (ties everything together)
      if (generateModule && errors.length === 0) {
        console.log(`📦 Generating module '${nameVariations.pascalCase}'...`);
        const moduleOptions: GenerationOptions = {
          ...options,
          name: nameVariations.pascalCase,
          type: 'module',
          path: moduleBasePath,
          entities: generateEntity ? [nameVariations.pascalCase] : [],
          services: generateService ? [`${nameVariations.pascalCase}s`] : [],
          controllers: generateController ? [`${nameVariations.pascalCase}s`] : [],
          withExports: false,
        };
        
        results.module = await this.moduleGenerator.generate(
          nameVariations.pascalCase,
          moduleOptions,
          moduleContext
        );
        
        if (results.module.success) {
          generatedFiles.push(...(results.module.generatedFiles || []));
          console.log(`✅ Module '${nameVariations.pascalCase}Module' generated`);
        } else {
          errors.push(`Module generation failed: ${results.module.message}`);
        }
      }

      // Collect next steps
      if (results.module?.nextSteps) {
        allNextSteps.push(...results.module.nextSteps);
      } else {
        allNextSteps.push(
          'Import the generated module in your app.module.ts or parent module',
          'Verify database connection is configured properly',
          'Test the generated API endpoints'
        );
      }

      // Add module-specific next steps
      if (generateModule && moduleBasePath !== 'src') {
        allNextSteps.unshift(
          `📦 Add module import: import { ${nameVariations.pascalCase}Module } from './${path.posix.relative('src', moduleBasePath)}/${nameVariations.kebabCase}.module';`
        );
      }

      if (errors.length > 0) {
        return {
          success: false,
          message: `Resource generation partially failed: ${errors.join(', ')}`,
          generatedFiles,
          errors,
        };
      }

      // 5. Update app.module.ts to import the generated module
      if (generateModule && results.module?.success) {
        try {
          await this.updateAppModule(nameVariations.pascalCase, moduleBasePath);
          console.log(`✅ Updated app.module.ts with ${nameVariations.pascalCase}Module import`);
          allNextSteps = allNextSteps.filter(step => !step.includes('Import this module in your app.module.ts'));
        } catch (error) {
          // Don't fail the generation if app.module.ts update fails
          console.log(`⚠️ Could not auto-update app.module.ts: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      return {
        success: true,
        message: `Resource '${nameVariations.pascalCase}' generated successfully`,
        generatedFiles,
        nextSteps: allNextSteps,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to generate resource: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    } finally {
      // Restore original SKIP_MODULE_UPDATE flag
      if (originalSkipFlag !== undefined) {
        process.env.SKIP_MODULE_UPDATE = originalSkipFlag;
      } else {
        delete process.env.SKIP_MODULE_UPDATE;
      }
    }
  }

  /**
   * Build module path based on options
   */
  private buildModulePath(name: string, modulePath?: string): string {
    if (modulePath) {
      // Support nested modules like "users/profile" or "e-commerce/products"
      const normalizedPath = modulePath.replace(/\\/g, '/');
      return path.join('src', 'modules', normalizedPath);
    }
    
    // Default single module
    const nameVariations = createNameVariations(name);
    return path.join('src', 'modules', nameVariations.kebabCase);
  }

  /**
   * Build context for module-based generation
   */
  private buildModuleContext(
    baseContext: ProjectContext | undefined, 
    moduleBasePath: string,
    options: GenerationOptions
  ): ProjectContext {
    const defaultContext: ProjectContext = {
      hasSolidNestjs: true,
      solidVersion: '1.0.0',
      hasGraphQL: false,
      hasSwagger: true,
      hasTypeORM: true,
      databaseType: 'sqlite',
      existingEntities: [],
      existingServices: [],
      existingControllers: [],
      existingModules: [],
      hasSolidDecorators: true,
      hasArgsHelpers: false,
      hasEntityGeneration: true,
      useSolidDecorators: true,
      useGenerateDtoFromEntity: true,
      projectRoot: process.cwd(),
      packageJson: {},
    };

    return {
      ...defaultContext,
      ...baseContext,
      isModularStructure: true,
      moduleBasePath,
      paths: {
        entities: path.join(moduleBasePath, 'entities'),
        services: path.join(moduleBasePath, 'services'),
        controllers: path.join(moduleBasePath, 'controllers'),
        modules: moduleBasePath,
        dto: {
          inputs: path.join(moduleBasePath, 'dto', 'inputs'),
          args: path.join(moduleBasePath, 'dto', 'args'),
        },
      },
    };
  }

  /**
   * Generate resource from interactive input
   */
  async generateInteractive(): Promise<CommandResult> {
    const inquirer = await import('inquirer');
    
    const answers = await inquirer.default.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Resource name (singular, e.g., "Product", "User"):',
        validate: (input: string) => {
          if (!input.trim()) {
            return 'Resource name is required';
          }
          return true;
        },
      },
      {
        type: 'input',
        name: 'fields',
        message: 'Entity fields (e.g., "name:string,price:number,active:boolean"):',
        default: '',
      },
      {
        type: 'confirm',
        name: 'generateModule',
        message: 'Generate as a separate module?',
        default: true,
      },
      {
        type: 'input',
        name: 'modulePath',
        message: 'Module path (e.g., "users/profile" for nested modules, leave empty for single module):',
        default: '',
        when: (answers) => answers.generateModule,
      },
      {
        type: 'checkbox',
        name: 'skip',
        message: 'Skip generation of:',
        choices: [
          { name: 'Entity', value: 'entity' },
          { name: 'Service', value: 'service' },
          { name: 'Controller', value: 'controller' },
        ],
        default: [],
      },
      {
        type: 'confirm',
        name: 'withSoftDelete',
        message: 'Enable soft deletion?',
        default: false,
      },
      {
        type: 'confirm',
        name: 'withBulkOperations',
        message: 'Enable bulk operations?',
        default: false,
      },
      {
        type: 'input',
        name: 'path',
        message: 'Custom output path (leave empty for default):',
        default: '',
        when: (answers) => !answers.generateModule,
      },
    ]);

    const options: GenerationOptions = {
      name: answers.name,
      type: 'resource',
      fields: answers.fields ? answers.fields.split(',').map((f: string) => f.trim()) : [],
      generateModule: answers.generateModule,
      modulePath: answers.modulePath || undefined,
      skipEntity: answers.skip.includes('entity'),
      skipService: answers.skip.includes('service'),
      skipController: answers.skip.includes('controller'),
      withSoftDelete: answers.withSoftDelete,
      withBulkOperations: answers.withBulkOperations,
      path: answers.path || undefined,
    };

    return this.generate(answers.name, options);
  }

  /**
   * Validate resource generation options
   */
  validateOptions(options: GenerationOptions): string[] {
    const errors: string[] = [];

    if (!options.name || !options.name.trim()) {
      errors.push('Resource name is required');
    }

    // Validate resource name format
    if (options.name && !/^[A-Za-z][A-Za-z0-9]*$/.test(options.name)) {
      errors.push('Resource name must be a valid identifier (letters and numbers only, starting with a letter)');
    }

    // Validate module path if provided
    if (options.modulePath && !/^[A-Za-z0-9\-_/]+$/.test(options.modulePath)) {
      errors.push('Module path must contain only letters, numbers, hyphens, underscores, and forward slashes');
    }

    return errors;
  }

  /**
   * Quick resource generation with sensible defaults
   */
  async generateQuick(
    name: string,
    fields: string[] = [],
    modulePath?: string
  ): Promise<CommandResult> {
    const options: GenerationOptions = {
      name,
      type: 'resource',
      fields,
      generateModule: true,
      modulePath,
      withSoftDelete: false,
      withBulkOperations: false,
    };

    return this.generate(name, options);
  }

  /**
   * Update app.module.ts to import the generated module
   */
  private async updateAppModule(moduleName: string, moduleBasePath: string): Promise<void> {
    const fs = await import('fs-extra');
    const appModulePath = path.join(process.cwd(), 'src', 'app.module.ts');
    
    // Build relative import path from src to module
    const srcDir = path.join(process.cwd(), 'src');
    const relativePath = path.relative(srcDir, moduleBasePath).replace(/\\/g, '/');
    const moduleFileName = createNameVariations(moduleName).kebabCase;
    const importPath = `./${relativePath}/${moduleFileName}.module`;
    const moduleClassName = `${moduleName}Module`;

    // Parse the existing app.module.ts file
    const sourceFile = AstUtils.parseFile(appModulePath);
    if (!sourceFile) {
      throw new Error(`Could not parse ${appModulePath}`);
    }

    // Add import statement
    const moduleImport = {
      name: moduleClassName,
      path: importPath,
    };

    let updatedContent = AstUtils.addImport(sourceFile, moduleImport);

    // Parse the updated content to add to imports array
    const updatedSourceFile = AstUtils.parseFromContent(updatedContent, 'app.module.ts');
    if (!updatedSourceFile) {
      throw new Error('Could not parse updated content');
    }

    // Add to imports array in @Module decorator
    const moduleArrayItem = {
      name: moduleClassName,
      arrayType: 'imports' as const,
    };

    updatedContent = AstUtils.addModuleArrayItem(updatedSourceFile, moduleArrayItem);

    // Write the updated content back to the file
    AstUtils.writeFile(appModulePath, updatedContent);
  }
}