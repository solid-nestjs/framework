import * as path from 'path';
import { TemplateEngine } from '../utils/template-engine';
import { GenerationOptions, CommandResult, ProjectContext } from '../types';
import { writeFile, ensureDirectory } from '../utils/file-utils';
import { createNameVariations } from '../utils/string-utils';
import { ModuleUpdater } from '../utils/module-updater';
import { AstUtils } from '../utils/ast-utils';
import { readSnestConfig } from '../utils/config-reader';

/**
 * Module component reference
 */
interface ModuleComponent {
  name: string;
  className: string;
  path: string;
  type: 'entity' | 'service' | 'controller' | 'resolver' | 'provider';
}

/**
 * Module import reference
 */
interface ModuleImport {
  name: string;
  path?: string;
}

/**
 * Generator for NestJS modules with automatic imports
 */
export class ModuleGenerator {
  private templateEngine: TemplateEngine;

  constructor() {
    this.templateEngine = new TemplateEngine();
  }

  /**
   * Generate module file
   */
  async generate(
    name: string,
    options: GenerationOptions,
    context?: ProjectContext,
  ): Promise<CommandResult> {
    try {
      // Handle nested module names like "accounting/invoice"
      const isNestedModule = name.includes('/');
      let actualModuleName: string;
      let parentPath: string | undefined;

      if (isNestedModule) {
        const pathParts = name.split('/');
        actualModuleName = pathParts[pathParts.length - 1]; // "invoice"
        parentPath = pathParts.slice(0, -1).join('/'); // "accounting"
      } else {
        actualModuleName = name;
      }

      const nameVariations = createNameVariations(actualModuleName);

      // Parse components from options
      const entities = this.parseComponents(
        options.entities || [],
        'entity',
        context,
      );
      const services = this.parseComponents(
        options.services || [],
        'service',
        context,
      );
      const controllers = this.parseComponents(
        options.controllers || [],
        'controller',
        context,
      );
      const resolvers = this.parseComponents(
        options.resolvers || [],
        'resolver',
        context,
      );

      // Determine if this is an empty module (no components)
      const isEmptyModule =
        entities.length === 0 &&
        services.length === 0 &&
        controllers.length === 0 &&
        resolvers.length === 0;

      // For empty modules, don't include TypeORM/GraphQL unless explicitly needed
      const hasTypeORM = isEmptyModule ? false : (context?.hasTypeORM ?? true);
      const hasGraphQL = isEmptyModule ? false : (context?.hasGraphQL ?? false);
      const withExports = options.withExports ?? true;

      const customProviders = options.customProviders || [];
      const moduleImports = options.moduleImports || [];
      const customExports = options.customExports || [];

      // Build import statements
      const entityImports = entities.map(e => ({
        className: e.className,
        path: e.path,
      }));
      const serviceImports = services.map(s => ({
        className: s.className,
        path: s.path,
      }));
      const controllerImports = controllers.map(c => ({
        className: c.className,
        path: c.path,
      }));
      const resolverImports = resolvers.map(r => ({
        className: r.className,
        path: r.path,
      }));
      const customImports = this.buildCustomImports(
        customProviders,
        moduleImports,
        customExports,
      );

      // Build template data - use actualModuleName for nested modules
      const templateName = isNestedModule ? actualModuleName : name;
      const templateData = TemplateEngine.createTemplateData(templateName, {
        hasTypeORM,
        hasGraphQL,
        isEmptyModule,
        entities,
        services,
        controllers,
        resolvers,
        customProviders,
        moduleImports,
        customExports,
        exports: withExports,
        entityImports,
        serviceImports,
        controllerImports,
        resolverImports,
        customImports,
      });

      // Generate module content
      const moduleContent = await this.templateEngine.render(
        'module/module',
        templateData,
      );

      // Determine output path and create folder structure
      let outputDir = options.path || context?.paths?.modules || 'src/modules';
      const projectRoot = context?.projectRoot || process.cwd();

      // For nested modules, adjust the output directory
      if (isNestedModule && parentPath) {
        // Read the configured module folder from snest.config.json
        const config = readSnestConfig();
        const configuredModulePath =
          config?.generators?.defaultModulePath || 'src/modules';
        const moduleFolder = path.basename(configuredModulePath); // Extract folder name from "src/features" -> "features"

        outputDir = path.join('src', moduleFolder, parentPath);
      }

      // Check if outputDir already includes the module name (from resource generator)
      const outputDirParts = outputDir.split(/[/\\]/);
      const lastPart = outputDirParts[outputDirParts.length - 1];
      const isModulePathIncluded = lastPart === nameVariations.kebabCase;

      let modulePath: string;
      let outputPath: string;

      if (isModulePathIncluded) {
        // outputDir already includes module name, use it directly
        modulePath = path.join(projectRoot, outputDir);
        await ensureDirectory(modulePath);
        outputPath = path.join(
          modulePath,
          `${nameVariations.kebabCase}.module.ts`,
        );
      } else {
        // Create the module folder structure (like resource generator does)
        modulePath = path.join(
          projectRoot,
          outputDir,
          nameVariations.kebabCase,
        );
        await ensureDirectory(modulePath);
        outputPath = path.join(
          modulePath,
          `${nameVariations.kebabCase}.module.ts`,
        );
      }

      // Write file
      const result = await writeFile(
        outputPath,
        moduleContent,
        options.overwrite,
      );

      if (!result.success) {
        return {
          success: false,
          message: `Failed to create module: ${result.error}`,
        };
      }

      // Update parent module or app.module.ts to import the generated module
      if (ModuleUpdater.isModuleUpdatingEnabled()) {
        try {
          if (isNestedModule && parentPath) {
            // For nested modules like "accounting/invoice", we need to handle parent-child relationship
            const parentInfo = this.getParentModuleInfoForNestedModule(
              parentPath,
              nameVariations.pascalCase,
              modulePath,
            );

            if (parentInfo) {
              // Create parent module if it doesn't exist and update it
              await this.ensureParentModule(
                parentInfo,
                nameVariations.pascalCase,
                modulePath,
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
              // Fallback to direct app.module.ts import
              await this.updateAppModule(nameVariations.pascalCase, modulePath);
              console.log(
                `✅ Updated app.module.ts with ${nameVariations.pascalCase}Module import`,
              );
            }
          } else {
            // Check for parent module info from the module path (for auto-detected nesting)
            const modulePathForParent = this.extractModulePathFromOutputPath(
              outputDir,
              nameVariations.kebabCase,
              projectRoot,
            );
            const parentInfo = this.getParentModuleInfo(modulePathForParent);

            if (parentInfo) {
              // Create parent module if it doesn't exist and update it
              await this.ensureParentModule(
                parentInfo,
                nameVariations.pascalCase,
                modulePath,
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
              await this.updateAppModule(nameVariations.pascalCase, modulePath);
              console.log(
                `✅ Updated app.module.ts with ${nameVariations.pascalCase}Module import`,
              );
            }
          }
        } catch (error) {
          // Don't fail the generation if module update fails
          console.log(
            `⚠️ Could not auto-update modules: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
        }
      }

      return {
        success: true,
        message: `Module '${nameVariations.pascalCase}Module' generated successfully`,
        generatedFiles: [result.path],
        nextSteps: [
          'Import this module in your app.module.ts or parent module',
          'Verify all imported entities, services, and controllers exist',
          'Add any missing custom providers or imports',
          'Configure module-specific settings if needed',
        ],
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to generate module: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Parse component definitions from strings
   * Format: "Product,Order,Invoice" or ["Product", "Order", "Invoice"]
   */
  private parseComponents(
    componentDefinitions: string[] | string,
    type: 'entity' | 'service' | 'controller' | 'resolver' | 'provider',
    context?: ProjectContext,
  ): ModuleComponent[] {
    const components: ModuleComponent[] = [];
    const basePath = this.getBasePath(type, context);

    // Convert string to array if needed
    const definitions =
      typeof componentDefinitions === 'string'
        ? componentDefinitions.split(',').map(d => d.trim())
        : componentDefinitions;

    for (const definition of definitions) {
      if (definition.trim()) {
        const nameVariations = createNameVariations(definition.trim());
        const className = this.buildClassName(nameVariations.pascalCase, type);
        const filePath = this.buildFilePath(
          nameVariations.kebabCase,
          type,
          basePath,
        );

        components.push({
          name: definition.trim(),
          className,
          path: filePath,
          type,
        });
      }
    }

    return components;
  }

  /**
   * Build class name based on type
   */
  private buildClassName(
    baseName: string,
    type: 'entity' | 'service' | 'controller' | 'resolver' | 'provider',
  ): string {
    switch (type) {
      case 'entity':
        return baseName;
      case 'service':
        return `${baseName}Service`;
      case 'controller':
        return `${baseName}Controller`;
      case 'resolver':
        return `${baseName}Resolver`;
      case 'provider':
        return baseName;
      default:
        return baseName;
    }
  }

  /**
   * Build file path based on type
   */
  private buildFilePath(
    baseName: string,
    type: 'entity' | 'service' | 'controller' | 'resolver' | 'provider',
    basePath: string,
  ): string {
    const suffix = type === 'entity' ? 'entity' : type;
    const fileName = `${baseName}.${suffix}`;

    // Handle relative paths properly for module imports
    if (basePath.startsWith('./')) {
      return `${basePath}/${fileName}`;
    }

    return path.posix.join(basePath, fileName);
  }

  /**
   * Get base path for component type
   */
  private getBasePath(
    type: 'entity' | 'service' | 'controller' | 'resolver' | 'provider',
    context?: ProjectContext,
  ): string {
    // For modular structure, components are in the same module directory
    if (context?.isModularStructure) {
      switch (type) {
        case 'entity':
          return './entities';
        case 'service':
          return './services';
        case 'controller':
          return './controllers';
        case 'resolver':
          return './resolvers';
        case 'provider':
          return './providers';
        default:
          return '.';
      }
    }

    // For classic structure, components are in separate directories
    switch (type) {
      case 'entity':
        return '../entities';
      case 'service':
        return '../services';
      case 'controller':
        return '../controllers';
      case 'resolver':
        return '../resolvers';
      case 'provider':
        return '../providers';
      default:
        return '..';
    }
  }

  /**
   * Build custom imports from providers and modules
   */
  private buildCustomImports(
    customProviders: any[] = [],
    moduleImports: any[] = [],
    customExports: any[] = [],
  ): Array<{ className: string; path: string }> {
    const imports: Array<{ className: string; path: string }> = [];
    const seen = new Set<string>();

    // Process custom providers
    for (const provider of customProviders) {
      if (
        typeof provider === 'object' &&
        provider.name &&
        provider.path &&
        !seen.has(provider.name)
      ) {
        imports.push({ className: provider.name, path: provider.path });
        seen.add(provider.name);
      }
    }

    // Process module imports
    for (const moduleImport of moduleImports) {
      if (
        typeof moduleImport === 'object' &&
        moduleImport.name &&
        moduleImport.path &&
        !seen.has(moduleImport.name)
      ) {
        imports.push({ className: moduleImport.name, path: moduleImport.path });
        seen.add(moduleImport.name);
      }
    }

    // Process custom exports
    for (const customExport of customExports) {
      if (
        typeof customExport === 'object' &&
        customExport.name &&
        customExport.path &&
        !seen.has(customExport.name)
      ) {
        imports.push({ className: customExport.name, path: customExport.path });
        seen.add(customExport.name);
      }
    }

    return imports;
  }

  /**
   * Generate module from interactive input
   */
  async generateInteractive(): Promise<CommandResult> {
    const inquirer = await import('inquirer');

    const answers = await inquirer.default.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Module name:',
        validate: (input: string) => {
          if (!input.trim()) {
            return 'Module name is required';
          }
          return true;
        },
      },
      {
        type: 'input',
        name: 'entities',
        message:
          'Entities to include (comma-separated, e.g., "Product,Order"):',
        default: '',
      },
      {
        type: 'input',
        name: 'services',
        message:
          'Services to include (comma-separated, e.g., "Products,Orders"):',
        default: '',
      },
      {
        type: 'input',
        name: 'controllers',
        message:
          'Controllers to include (comma-separated, e.g., "Products,Orders"):',
        default: '',
      },
      {
        type: 'confirm',
        name: 'withExports',
        message: 'Export services for use in other modules?',
        default: true,
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
      type: 'module',
      entities: answers.entities
        ? answers.entities.split(',').map((e: string) => e.trim())
        : [],
      services: answers.services
        ? answers.services.split(',').map((s: string) => s.trim())
        : [],
      controllers: answers.controllers
        ? answers.controllers.split(',').map((c: string) => c.trim())
        : [],
      withExports: answers.withExports,
      path: answers.path || undefined,
    };

    return this.generate(answers.name, options);
  }

  /**
   * Validate module generation options
   */
  validateOptions(options: GenerationOptions): string[] {
    const errors: string[] = [];

    if (!options.name || !options.name.trim()) {
      errors.push('Module name is required');
    }

    // Validate module name format (allow nested paths with "/")
    if (options.name) {
      const nameParts = options.name.split('/');
      for (const part of nameParts) {
        if (!/^[A-Za-z][A-Za-z0-9]*$/.test(part.trim())) {
          errors.push(
            'Module name parts must be valid identifiers (letters and numbers only, starting with a letter)',
          );
          break;
        }
      }
    }

    return errors;
  }

  /**
   * Generate module for a resource (entity + service + controller)
   */
  async generateForResource(
    resourceName: string,
    options: Partial<GenerationOptions> = {},
  ): Promise<CommandResult> {
    const nameVariations = createNameVariations(resourceName);

    const moduleOptions: GenerationOptions = {
      name: options.name || nameVariations.pascalCase,
      type: 'module',
      entities: [nameVariations.pascalCase],
      services: [nameVariations.pascalCase],
      controllers: [nameVariations.pascalCase],
      withExports: options.withExports ?? true,
      path: options.path,
      overwrite: options.overwrite,
    };

    return this.generate(moduleOptions.name, moduleOptions);
  }

  /**
   * Extract module path from output path for parent module detection
   */
  private extractModulePathFromOutputPath(
    outputDir: string,
    moduleName: string,
    projectRoot: string,
  ): string | undefined {
    // Read the configured module folder from snest.config.json
    const config = readSnestConfig();
    const configuredModulePath =
      config?.generators?.defaultModulePath || 'src/modules';
    const moduleFolder = path.basename(configuredModulePath); // Extract folder name from "src/features" -> "features"

    // Convert outputDir to relative path from project root
    const relativeOutputDir = path
      .relative(projectRoot, outputDir)
      .replace(/\\/g, '/');

    // Check if we're inside src/[configuredFolder]/...
    if (relativeOutputDir.startsWith(`src/${moduleFolder}/`)) {
      // Extract the module path part
      const modulePath =
        relativeOutputDir.replace(`src/${moduleFolder}/`, '') +
        '/' +
        moduleName;

      if (modulePath) {
        return modulePath;
      }
    }

    return undefined;
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
   * Get parent module information for explicitly nested modules (like "accounting/invoice")
   */
  private getParentModuleInfoForNestedModule(
    parentPath: string,
    childModuleName: string,
    childModuleBasePath: string,
  ): {
    moduleName: string;
    moduleClassName: string;
    moduleBasePath: string;
    childPath: string;
  } | null {
    // Read the configured module folder from snest.config.json
    const config = readSnestConfig();
    const configuredModulePath =
      config?.generators?.defaultModulePath || 'src/modules';
    const moduleFolder = path.basename(configuredModulePath); // Extract folder name from "src/features" -> "features"

    const parentVariations = createNameVariations(parentPath);

    return {
      moduleName: `${parentVariations.pascalCase}Module`,
      moduleClassName: `${parentVariations.pascalCase}Module`,
      moduleBasePath: path.join('src', moduleFolder, parentPath),
      childPath: createNameVariations(childModuleName).kebabCase,
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

  /**
   * Update app.module.ts to import the generated module
   */
  private async updateAppModule(
    moduleName: string,
    moduleBasePath: string,
  ): Promise<void> {
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
      throw new Error('Could not parse updated app module content');
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
}
