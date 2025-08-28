import * as path from 'path';
import { TemplateEngine } from '../utils/template-engine';
import { GenerationOptions, CommandResult, ProjectContext } from '../types';
import { writeFile } from '../utils/file-utils';
import { createNameVariations } from '../utils/string-utils';

/**
 * Module component reference
 */
interface ModuleComponent {
  name: string;
  className: string;
  path: string;
  type: 'entity' | 'service' | 'controller' | 'provider';
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
    context?: ProjectContext
  ): Promise<CommandResult> {
    try {
      const nameVariations = createNameVariations(name);
      
      // Determine features based on context and options
      const hasTypeORM = context?.hasTypeORM ?? true;
      const hasGraphQL = context?.hasGraphQL ?? false;
      const withExports = options.withExports ?? true;
      
      // Parse components from options
      const entities = this.parseComponents(options.entities || [], 'entity', context);
      const services = this.parseComponents(options.services || [], 'service', context);
      const controllers = this.parseComponents(options.controllers || [], 'controller', context);
      const customProviders = options.customProviders || [];
      const moduleImports = options.moduleImports || [];
      const customExports = options.customExports || [];
      
      // Build import statements
      const entityImports = entities.map(e => ({ className: e.className, path: e.path }));
      const serviceImports = services.map(s => ({ className: s.className, path: s.path }));
      const controllerImports = controllers.map(c => ({ className: c.className, path: c.path }));
      const customImports = this.buildCustomImports(customProviders, moduleImports, customExports);
      
      // Build template data
      const templateData = TemplateEngine.createTemplateData(name, {
        hasTypeORM,
        hasGraphQL,
        entities,
        services,
        controllers,
        customProviders,
        moduleImports,
        customExports,
        exports: withExports,
        entityImports,
        serviceImports,
        controllerImports,
        customImports,
      });

      // Generate module content
      const moduleContent = await this.templateEngine.render('module/module', templateData);
      
      // Determine output path
      const outputDir = options.path || (context?.paths?.modules || 'src/modules');
      const projectRoot = context?.projectRoot || process.cwd();
      const outputPath = path.join(projectRoot, outputDir, `${nameVariations.kebabCase}.module.ts`);
      
      // Write file
      const result = await writeFile(outputPath, moduleContent, options.overwrite);
      
      if (!result.success) {
        return {
          success: false,
          message: `Failed to create module: ${result.error}`,
        };
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
    type: 'entity' | 'service' | 'controller' | 'provider',
    context?: ProjectContext
  ): ModuleComponent[] {
    const components: ModuleComponent[] = [];
    const basePath = this.getBasePath(type, context);
    
    // Convert string to array if needed
    const definitions = typeof componentDefinitions === 'string' 
      ? componentDefinitions.split(',').map(d => d.trim())
      : componentDefinitions;
    
    for (const definition of definitions) {
      if (definition.trim()) {
        const nameVariations = createNameVariations(definition.trim());
        const className = this.buildClassName(nameVariations.pascalCase, type);
        const filePath = this.buildFilePath(nameVariations.kebabCase, type, basePath);
        
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
  private buildClassName(baseName: string, type: 'entity' | 'service' | 'controller' | 'provider'): string {
    switch (type) {
      case 'entity':
        return baseName;
      case 'service':
        return `${baseName}Service`;
      case 'controller':
        return `${baseName}Controller`;
      case 'provider':
        return baseName;
      default:
        return baseName;
    }
  }

  /**
   * Build file path based on type
   */
  private buildFilePath(baseName: string, type: 'entity' | 'service' | 'controller' | 'provider', basePath: string): string {
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
  private getBasePath(type: 'entity' | 'service' | 'controller' | 'provider', context?: ProjectContext): string {
    // For modular structure, components are in the same module directory
    if (context?.isModularStructure) {
      switch (type) {
        case 'entity':
          return './entities';
        case 'service':
          return './services';
        case 'controller':
          return './controllers';
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
    customExports: any[] = []
  ): Array<{ className: string; path: string }> {
    const imports: Array<{ className: string; path: string }> = [];
    const seen = new Set<string>();

    // Process custom providers
    for (const provider of customProviders) {
      if (typeof provider === 'object' && provider.name && provider.path && !seen.has(provider.name)) {
        imports.push({ className: provider.name, path: provider.path });
        seen.add(provider.name);
      }
    }

    // Process module imports
    for (const moduleImport of moduleImports) {
      if (typeof moduleImport === 'object' && moduleImport.name && moduleImport.path && !seen.has(moduleImport.name)) {
        imports.push({ className: moduleImport.name, path: moduleImport.path });
        seen.add(moduleImport.name);
      }
    }

    // Process custom exports
    for (const customExport of customExports) {
      if (typeof customExport === 'object' && customExport.name && customExport.path && !seen.has(customExport.name)) {
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
        message: 'Entities to include (comma-separated, e.g., "Product,Order"):',
        default: '',
      },
      {
        type: 'input',
        name: 'services',
        message: 'Services to include (comma-separated, e.g., "Products,Orders"):',
        default: '',
      },
      {
        type: 'input',
        name: 'controllers',
        message: 'Controllers to include (comma-separated, e.g., "Products,Orders"):',
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
      entities: answers.entities ? answers.entities.split(',').map((e: string) => e.trim()) : [],
      services: answers.services ? answers.services.split(',').map((s: string) => s.trim()) : [],
      controllers: answers.controllers ? answers.controllers.split(',').map((c: string) => c.trim()) : [],
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

    // Validate module name format
    if (options.name && !/^[A-Za-z][A-Za-z0-9]*$/.test(options.name)) {
      errors.push('Module name must be a valid identifier (letters and numbers only, starting with a letter)');
    }

    return errors;
  }

  /**
   * Generate module for a resource (entity + service + controller)
   */
  async generateForResource(
    resourceName: string,
    options: Partial<GenerationOptions> = {}
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
}