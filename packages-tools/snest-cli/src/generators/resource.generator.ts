import * as path from 'path';
import { GenerationOptions, CommandResult, ProjectContext } from '../types';
import { createNameVariations } from '../utils/string-utils';
import { EntityGenerator } from './entity.generator';
import { ServiceGenerator } from './service.generator';
import { ControllerGenerator } from './controller.generator';
import { ResolverGenerator } from './resolver.generator';
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
  resolver?: CommandResult;
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
  private resolverGenerator: ResolverGenerator;
  private moduleGenerator: ModuleGenerator;

  constructor() {
    this.entityGenerator = new EntityGenerator();
    this.serviceGenerator = new ServiceGenerator();
    this.controllerGenerator = new ControllerGenerator();
    this.resolverGenerator = new ResolverGenerator();
    this.moduleGenerator = new ModuleGenerator();
  }

  /**
   * Generate a complete resource with all components
   */
  async generate(
    name: string,
    options: GenerationOptions,
    context?: ProjectContext,
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
      const moduleContext = this.buildModuleContext(
        context,
        moduleBasePath,
        options,
      );

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
          moduleContext,
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
          moduleContext,
        );

        if (results.service.success) {
          generatedFiles.push(...(results.service.generatedFiles || []));
          console.log(
            `✅ Service '${nameVariations.pascalCase}sService' generated`,
          );
        } else {
          errors.push(`Service generation failed: ${results.service.message}`);
        }
      }

      // 3. Generate Controller/Resolver (depends on service)
      if (
        generateController &&
        (!generateService || results.service?.success)
      ) {
        // Determine API type from context
        const apiType = context?.apiType || 'rest';

        if (apiType === 'hybrid') {
          // Generate both REST controller and GraphQL resolver for hybrid projects
          console.log(
            `🎮 Generating REST controller '${nameVariations.pascalCase}s'...`,
          );
          const controllerOptions: GenerationOptions = {
            ...options,
            name: `${nameVariations.pascalCase}s`,
            entityName: nameVariations.pascalCase,
            serviceName: `${nameVariations.pascalCase}s`,
            apiType: 'rest',
            type: 'controller',
            path: path.join(moduleBasePath, 'controllers'),
            skipModuleUpdate: true, // We'll handle module updates at the resource level
          };

          results.controller = await this.controllerGenerator.generate(
            `${nameVariations.pascalCase}s`,
            controllerOptions,
            moduleContext,
          );

          if (results.controller.success) {
            generatedFiles.push(...(results.controller.generatedFiles || []));
            console.log(
              `✅ REST Controller '${nameVariations.pascalCase}sController' generated`,
            );
          } else {
            errors.push(
              `REST Controller generation failed: ${results.controller.message}`,
            );
          }

          // Generate GraphQL resolver
          console.log(
            `🔍 Generating GraphQL resolver '${nameVariations.pascalCase}s'...`,
          );
          const resolverOptions: GenerationOptions = {
            ...options,
            name: `${nameVariations.pascalCase}s`,
            entityName: nameVariations.pascalCase,
            serviceName: `${nameVariations.pascalCase}s`,
            apiType: 'graphql',
            type: 'resolver',
            path: path.join(moduleBasePath, 'resolvers'),
            skipModuleUpdate: true, // We'll handle module updates at the resource level
          };

          results.resolver = await this.resolverGenerator.generate(
            `${nameVariations.pascalCase}s`,
            resolverOptions,
            moduleContext,
          );

          if (results.resolver.success) {
            generatedFiles.push(...(results.resolver.generatedFiles || []));
            console.log(
              `✅ GraphQL Resolver '${nameVariations.pascalCase}sResolver' generated`,
            );
          } else {
            errors.push(
              `GraphQL Resolver generation failed: ${results.resolver.message}`,
            );
          }
        } else {
          // Generate single controller for REST or GraphQL only projects
          const componentType =
            apiType === 'graphql' ? 'resolver' : 'controller';
          const componentName =
            apiType === 'graphql' ? 'resolver' : 'controller';

          console.log(
            `🎮 Generating ${componentName} '${nameVariations.pascalCase}s'...`,
          );
          const componentOptions: GenerationOptions = {
            ...options,
            name: `${nameVariations.pascalCase}s`,
            entityName: nameVariations.pascalCase,
            serviceName: `${nameVariations.pascalCase}s`,
            apiType,
            type: componentType as any,
            path: path.join(
              moduleBasePath,
              apiType === 'graphql' ? 'resolvers' : 'controllers',
            ),
            skipModuleUpdate: true, // We'll handle module updates at the resource level
          };

          if (apiType === 'graphql') {
            results.resolver = await this.resolverGenerator.generate(
              `${nameVariations.pascalCase}s`,
              componentOptions,
              moduleContext,
            );

            if (results.resolver.success) {
              generatedFiles.push(...(results.resolver.generatedFiles || []));
              console.log(
                `✅ GraphQL Resolver '${nameVariations.pascalCase}sResolver' generated`,
              );
            } else {
              errors.push(
                `GraphQL Resolver generation failed: ${results.resolver.message}`,
              );
            }
          } else {
            results.controller = await this.controllerGenerator.generate(
              `${nameVariations.pascalCase}s`,
              componentOptions,
              moduleContext,
            );

            if (results.controller.success) {
              generatedFiles.push(...(results.controller.generatedFiles || []));
              console.log(
                `✅ REST Controller '${nameVariations.pascalCase}sController' generated`,
              );
            } else {
              errors.push(
                `REST Controller generation failed: ${results.controller.message}`,
              );
            }
          }
        }
      }

      // 4. Generate Module (ties everything together)
      if (generateModule && errors.length === 0) {
        console.log(`📦 Generating module '${nameVariations.pascalCase}'...`);
        // Determine what components to include in the module
        const apiType = context?.apiType || 'rest';
        let controllers: string[] = [];
        let resolvers: string[] = [];

        if (generateController) {
          if (apiType === 'hybrid') {
            controllers = [`${nameVariations.pascalCase}s`];
            resolvers = [`${nameVariations.pascalCase}s`];
          } else if (apiType === 'graphql') {
            resolvers = [`${nameVariations.pascalCase}s`];
          } else {
            controllers = [`${nameVariations.pascalCase}s`];
          }
        }

        const moduleOptions: GenerationOptions = {
          ...options,
          name: nameVariations.pascalCase,
          type: 'module',
          path: moduleBasePath,
          entities: generateEntity ? [nameVariations.pascalCase] : [],
          services: generateService ? [`${nameVariations.pascalCase}s`] : [],
          controllers,
          resolvers,
          withExports: false,
        };

        results.module = await this.moduleGenerator.generate(
          nameVariations.pascalCase,
          moduleOptions,
          moduleContext,
        );

        if (results.module.success) {
          generatedFiles.push(...(results.module.generatedFiles || []));
          console.log(
            `✅ Module '${nameVariations.pascalCase}Module' generated`,
          );
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
          'Test the generated API endpoints',
        );
      }

      // Add module-specific next steps
      if (generateModule && moduleBasePath !== 'src') {
        allNextSteps.unshift(
          `📦 Add module import: import { ${nameVariations.pascalCase}Module } from './${path.posix.relative('src', moduleBasePath)}/${nameVariations.kebabCase}.module';`,
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

      // 5. Update parent module or app.module.ts to import the generated module
      if (generateModule && results.module?.success) {
        try {
          // Check for parent module info from either explicit modulePath or detected moduleBasePath
          const modulePathForParent =
            options.modulePath ||
            this.extractModulePathFromBasePath(moduleBasePath);
          const parentInfo = this.getParentModuleInfo(modulePathForParent);
          if (parentInfo) {
            // Create parent module if it doesn't exist and update it
            await this.ensureParentModule(
              parentInfo,
              nameVariations.pascalCase,
              moduleBasePath,
            );
            console.log(
              `✅ Updated ${parentInfo.moduleName} with ${nameVariations.pascalCase}Module import`,
            );
            // Ensure parent module is imported in app.module.ts
            await this.ensureParentInAppModule(parentInfo);
            console.log(
              `✅ Ensured ${parentInfo.moduleName} is imported in app.module.ts`,
            );
          } else {
            // No parent module, import directly in app.module.ts
            await this.updateAppModule(
              nameVariations.pascalCase,
              moduleBasePath,
            );
            console.log(
              `✅ Updated app.module.ts with ${nameVariations.pascalCase}Module import`,
            );
          }
          allNextSteps = allNextSteps.filter(
            step => !step.includes('Import this module in your app.module.ts'),
          );
        } catch (error) {
          // Don't fail the generation if module update fails
          console.log(
            `⚠️ Could not auto-update modules: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
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
   * Build module path based on options or current directory context
   */
  private buildModulePath(name: string, modulePath?: string): string {
    if (modulePath) {
      // Explicit module path provided
      const normalizedPath = modulePath.replace(/\\/g, '/');
      return path.join('src', 'modules', normalizedPath);
    }

    // Auto-detect module path from current directory
    const autoDetectedPath = this.detectModulePathFromCurrentDirectory(name);
    if (autoDetectedPath) {
      const fullPath = path.join('src', 'modules', autoDetectedPath);
      console.log(`🔍 Auto-detected module path: ${fullPath}`);
      return fullPath;
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
    options: GenerationOptions,
  ): ProjectContext {
    const detectedProjectRoot =
      this.findProjectRoot(process.cwd()) || process.cwd();

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
      projectRoot: detectedProjectRoot,
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
        message:
          'Entity fields (e.g., "name:string,price:number,active:boolean"):',
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
        message:
          'Module path (e.g., "users/profile" for nested modules, leave empty for single module):',
        default: '',
        when: answers => answers.generateModule,
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
        when: answers => !answers.generateModule,
      },
    ]);

    const options: GenerationOptions = {
      name: answers.name,
      type: 'resource',
      fields: answers.fields
        ? answers.fields.split(',').map((f: string) => f.trim())
        : [],
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
      errors.push(
        'Resource name must be a valid identifier (letters and numbers only, starting with a letter)',
      );
    }

    // Validate module path if provided
    if (options.modulePath && !/^[A-Za-z0-9\-_/]+$/.test(options.modulePath)) {
      errors.push(
        'Module path must contain only letters, numbers, hyphens, underscores, and forward slashes',
      );
    }

    return errors;
  }

  /**
   * Quick resource generation with sensible defaults
   */
  async generateQuick(
    name: string,
    fields: string[] = [],
    modulePath?: string,
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
  private async updateAppModule(
    moduleName: string,
    moduleBasePath: string,
  ): Promise<void> {
    const fs = await import('fs-extra');

    // Find the project root from current directory
    const projectRoot = this.findProjectRoot(process.cwd());
    if (!projectRoot) {
      throw new Error(
        'Could not find project root. Make sure you are in a NestJS project directory.',
      );
    }

    const appModulePath = path.join(projectRoot, 'src', 'app.module.ts');

    // Build relative import path from src to module
    const srcDir = path.join(projectRoot, 'src');
    const relativePath = path
      .relative(srcDir, moduleBasePath)
      .replace(/\\/g, '/');
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
    const updatedSourceFile = AstUtils.parseFromContent(
      updatedContent,
      'app.module.ts',
    );
    if (!updatedSourceFile) {
      throw new Error('Could not parse updated content');
    }

    // Add to imports array in @Module decorator
    const moduleArrayItem = {
      name: moduleClassName,
      arrayType: 'imports' as const,
    };

    updatedContent = AstUtils.addModuleArrayItem(
      updatedSourceFile,
      moduleArrayItem,
    );

    // Write the updated content back to the file
    AstUtils.writeFile(appModulePath, updatedContent);
  }

  /**
   * Detect module path from current working directory
   */
  private detectModulePathFromCurrentDirectory(
    resourceName: string,
  ): string | null {
    const currentDir = process.cwd();
    const projectRoot = this.findProjectRoot(currentDir);

    if (!projectRoot) {
      return null; // Not in a project
    }

    // Get relative path from project root to current directory
    const relativePath = path
      .relative(projectRoot, currentDir)
      .replace(/\\/g, '/');

    // Check if we're inside src/modules/...
    if (relativePath.startsWith('src/modules/')) {
      // Extract the module path part
      const modulePath = relativePath.replace('src/modules/', '');

      if (modulePath) {
        // We're inside a module directory
        const nameVariations = createNameVariations(resourceName);

        // Check if we're in a directory that matches the resource name (single module)
        // or in a parent directory that should contain multiple submodules
        if (
          modulePath.toLowerCase() === nameVariations.kebabCase.toLowerCase()
        ) {
          // We're in a directory named exactly like the resource, use just the parent
          return modulePath;
        } else {
          // We're in a parent directory, create nested path
          const fullModulePath = `${modulePath}/${nameVariations.kebabCase}`;
          return fullModulePath;
        }
      }
    }

    // Check if we're in project root and modules directory exists
    if (relativePath === '' || relativePath === '.') {
      const modulesDir = path.join(projectRoot, 'src', 'modules');
      try {
        const fs = require('fs');
        if (fs.existsSync(modulesDir)) {
          // We're in project root and modules exist, use default behavior
          return null;
        }
      } catch {
        // If fs check fails, continue with default behavior
      }
    }

    return null; // No auto-detection possible
  }

  /**
   * Find the project root by looking for package.json or nest-cli.json
   */
  private findProjectRoot(startPath: string): string | null {
    let currentPath = startPath;
    const fs = require('fs');

    while (currentPath !== path.dirname(currentPath)) {
      // Check for project markers
      if (
        fs.existsSync(path.join(currentPath, 'package.json')) ||
        fs.existsSync(path.join(currentPath, 'nest-cli.json')) ||
        fs.existsSync(path.join(currentPath, 'snest.config.json'))
      ) {
        return currentPath;
      }

      currentPath = path.dirname(currentPath);
    }

    return null; // No project root found
  }

  /**
   * Extract module path from base path for parent module detection
   */
  private extractModulePathFromBasePath(
    moduleBasePath: string,
  ): string | undefined {
    // Convert "src/modules/ecommerce/products" to "ecommerce/products"
    const normalizedPath = moduleBasePath.replace(/\\/g, '/');
    const match = normalizedPath.match(/^src\/modules\/(.+)$/);
    return match ? match[1] : undefined;
  }

  /**
   * Get parent module information from module path
   */
  private getParentModuleInfo(modulePath?: string): {
    moduleName: string;
    moduleClassName: string;
    moduleBasePath: string;
    childPath: string;
  } | null {
    if (!modulePath) return null;

    const pathParts = modulePath.split('/').filter(p => p.length > 0);
    if (pathParts.length < 2) return null; // No parent if only one level

    // For "contabilidad/facturas" -> parent is "contabilidad"
    const parentPath = pathParts.slice(0, -1).join('/');
    const parentName = pathParts[pathParts.length - 2]; // "contabilidad"
    const parentVariations = createNameVariations(parentName);

    return {
      moduleName: `${parentVariations.pascalCase}Module`,
      moduleClassName: `${parentVariations.pascalCase}Module`,
      moduleBasePath: path.join('src', 'modules', parentPath),
      childPath: pathParts[pathParts.length - 1], // "facturas"
    };
  }

  /**
   * Ensure parent module exists and update it with child module
   */
  private async ensureParentModule(
    parentInfo: {
      moduleName: string;
      moduleClassName: string;
      moduleBasePath: string;
      childPath: string;
    },
    childModuleName: string,
    childModuleBasePath: string,
  ): Promise<void> {
    const projectRoot = this.findProjectRoot(process.cwd());
    if (!projectRoot) {
      throw new Error(
        'Could not find project root. Make sure you are in a NestJS project directory.',
      );
    }

    const parentModulePath = path.join(
      projectRoot,
      parentInfo.moduleBasePath,
      `${createNameVariations(parentInfo.moduleName.replace('Module', '')).kebabCase}.module.ts`,
    );

    // Check if parent module exists
    const fs = await import('fs-extra');
    if (!(await fs.pathExists(parentModulePath))) {
      // Create parent module
      await this.createParentModule(parentInfo, parentModulePath);
      console.log(`✅ Created parent module ${parentInfo.moduleName}`);
    }

    // Update parent module to import child module
    await this.updateParentModule(
      parentModulePath,
      childModuleName,
      childModuleBasePath,
      parentInfo.moduleBasePath,
    );
  }

  /**
   * Create parent module file
   */
  private async createParentModule(
    parentInfo: {
      moduleName: string;
      moduleClassName: string;
      moduleBasePath: string;
      childPath: string;
    },
    parentModulePath: string,
  ): Promise<void> {
    const fs = await import('fs-extra');
    const parentName = parentInfo.moduleName.replace('Module', '');

    // Ensure directory exists
    await fs.ensureDir(path.dirname(parentModulePath));

    const content = `import { Module } from '@nestjs/common';

/**
 * ${parentName} Module
 * 
 * This module encapsulates all ${parentName.toLowerCase()}-related functionality
 */
@Module({
  imports: [],
  controllers: [],
  providers: [],
})
export class ${parentInfo.moduleClassName} {}
`;

    await fs.writeFile(parentModulePath, content, 'utf-8');
  }

  /**
   * Update parent module to import child module
   */
  private async updateParentModule(
    parentModulePath: string,
    childModuleName: string,
    childModuleBasePath: string,
    parentModuleBasePath: string,
  ): Promise<void> {
    // Build relative import path from parent to child
    const relativePath = path
      .relative(parentModuleBasePath, childModuleBasePath)
      .replace(/\\/g, '/');
    const childFileName = createNameVariations(childModuleName).kebabCase;
    const importPath = `./${relativePath}/${childFileName}.module`;
    const childModuleClassName = `${childModuleName}Module`;

    // Parse the existing parent module file
    const sourceFile = AstUtils.parseFile(parentModulePath);
    if (!sourceFile) {
      throw new Error(`Could not parse ${parentModulePath}`);
    }

    // Add import statement
    const moduleImport = {
      name: childModuleClassName,
      path: importPath,
    };

    let updatedContent = AstUtils.addImport(sourceFile, moduleImport);

    // Parse the updated content to add to imports array
    const updatedSourceFile = AstUtils.parseFromContent(
      updatedContent,
      path.basename(parentModulePath),
    );
    if (!updatedSourceFile) {
      throw new Error('Could not parse updated parent module content');
    }

    // Add to imports array in @Module decorator
    const moduleArrayItem = {
      name: childModuleClassName,
      arrayType: 'imports' as const,
    };

    updatedContent = AstUtils.addModuleArrayItem(
      updatedSourceFile,
      moduleArrayItem,
    );

    // Write the updated content back to the file
    AstUtils.writeFile(parentModulePath, updatedContent);
  }

  /**
   * Ensure parent module is imported in app.module.ts
   */
  private async ensureParentInAppModule(parentInfo: {
    moduleName: string;
    moduleClassName: string;
    moduleBasePath: string;
    childPath: string;
  }): Promise<void> {
    const projectRoot = this.findProjectRoot(process.cwd());
    if (!projectRoot) {
      throw new Error(
        'Could not find project root. Make sure you are in a NestJS project directory.',
      );
    }

    const appModulePath = path.join(projectRoot, 'src', 'app.module.ts');

    // Build relative import path from src to parent module
    const srcDir = path.join(projectRoot, 'src');
    const relativePath = path
      .relative(srcDir, parentInfo.moduleBasePath)
      .replace(/\\/g, '/');
    const moduleFileName = createNameVariations(
      parentInfo.moduleName.replace('Module', ''),
    ).kebabCase;
    const importPath = `./${relativePath}/${moduleFileName}.module`;

    // Parse the existing app.module.ts file
    const sourceFile = AstUtils.parseFile(appModulePath);
    if (!sourceFile) {
      throw new Error(`Could not parse ${appModulePath}`);
    }

    // Check if parent module is already imported
    if (AstUtils.hasImport(sourceFile, parentInfo.moduleClassName)) {
      return; // Already imported, nothing to do
    }

    // Add import statement
    const moduleImport = {
      name: parentInfo.moduleClassName,
      path: importPath,
    };

    let updatedContent = AstUtils.addImport(sourceFile, moduleImport);

    // Parse the updated content to add to imports array
    const updatedSourceFile = AstUtils.parseFromContent(
      updatedContent,
      'app.module.ts',
    );
    if (!updatedSourceFile) {
      throw new Error('Could not parse updated app module content');
    }

    // Add to imports array in @Module decorator
    const moduleArrayItem = {
      name: parentInfo.moduleClassName,
      arrayType: 'imports' as const,
    };

    updatedContent = AstUtils.addModuleArrayItem(
      updatedSourceFile,
      moduleArrayItem,
    );

    // Write the updated content back to the file
    AstUtils.writeFile(appModulePath, updatedContent);
  }
}
