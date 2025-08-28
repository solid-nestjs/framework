import * as path from 'path';
import * as fs from 'fs-extra';
import { AstUtils, ModuleImport, ModuleArrayItem, TypeOrmEntity } from './ast-utils';
import { createNameVariations } from './string-utils';

/**
 * Component to register in module
 */
export interface ComponentRegistration {
  name: string;
  type: 'entity' | 'service' | 'controller';
  filePath: string;
  className: string;
}

/**
 * Module update result
 */
export interface ModuleUpdateResult {
  success: boolean;
  updatedFiles: string[];
  errors: string[];
  message: string;
}

/**
 * Automatic module updater for SOLID NestJS projects
 */
export class ModuleUpdater {
  
  /**
   * Update modules to include a new component
   */
  async updateModulesForComponent(
    component: ComponentRegistration,
    projectRoot: string = process.cwd()
  ): Promise<ModuleUpdateResult> {
    const result: ModuleUpdateResult = {
      success: true,
      updatedFiles: [],
      errors: [],
      message: 'No modules found to update'
    };

    try {
      // Find relevant module files
      const moduleFiles = await this.findRelevantModules(component, projectRoot);
      
      if (moduleFiles.length === 0) {
        result.message = `No relevant modules found for component ${component.name}`;
        return result;
      }

      // Update each module
      for (const moduleFile of moduleFiles) {
        try {
          const updated = await this.updateSingleModule(component, moduleFile);
          if (updated) {
            result.updatedFiles.push(moduleFile);
          }
        } catch (error) {
          result.errors.push(`Failed to update ${moduleFile}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          result.success = false;
        }
      }

      if (result.updatedFiles.length > 0) {
        result.message = `Successfully updated ${result.updatedFiles.length} module(s)`;
      } else if (result.errors.length === 0) {
        result.message = 'No modules needed updating (components already registered)';
      }

    } catch (error) {
      result.success = false;
      result.errors.push(`Failed to update modules: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.message = 'Module update failed';
    }

    return result;
  }

  /**
   * Find modules that should include this component
   */
  private async findRelevantModules(
    component: ComponentRegistration,
    projectRoot: string
  ): Promise<string[]> {
    const moduleFiles = await AstUtils.findModuleFiles(projectRoot);
    const relevantModules: string[] = [];

    for (const moduleFile of moduleFiles) {
      if (await this.isModuleRelevant(component, moduleFile)) {
        relevantModules.push(moduleFile);
      }
    }

    return relevantModules;
  }

  /**
   * Check if a module should include this component
   */
  private async isModuleRelevant(
    component: ComponentRegistration,
    moduleFilePath: string
  ): Promise<boolean> {
    try {
      const moduleDir = path.dirname(moduleFilePath);
      const componentDir = path.dirname(component.filePath);
      
      // Check if component is in the same directory structure
      const relativePath = path.relative(moduleDir, componentDir);
      
      // Include if component is in a subdirectory or same level
      // Exclude if component is in a completely different module tree
      return !relativePath.startsWith('..') || relativePath.split(path.sep).filter(p => p === '..').length <= 2;
    } catch {
      return false;
    }
  }

  /**
   * Update a single module file
   */
  private async updateSingleModule(
    component: ComponentRegistration,
    moduleFilePath: string
  ): Promise<boolean> {
    const sourceFile = AstUtils.parseFile(moduleFilePath);
    if (!sourceFile) {
      throw new Error(`Could not parse module file: ${moduleFilePath}`);
    }

    let content = fs.readFileSync(moduleFilePath, 'utf8');
    let hasUpdates = false;

    // Build import path relative to module
    const moduleDir = path.dirname(moduleFilePath);
    const componentPath = this.buildRelativeImportPath(
      moduleDir,
      component.filePath,
      component.type
    );

    // Add import
    const moduleImport: ModuleImport = {
      name: component.className,
      path: componentPath,
      isDefault: false
    };

    const updatedContent = AstUtils.addImport(sourceFile, moduleImport);
    if (updatedContent !== content) {
      content = updatedContent;
      hasUpdates = true;
    }

    // Re-parse with updated imports
    let updatedSourceFile = AstUtils.parseFromContent(content) || sourceFile;

    // Handle entity registration
    if (component.type === 'entity') {
      const entityContent = AstUtils.addTypeOrmEntity(updatedSourceFile, {
        name: component.className
      });
      if (entityContent !== content) {
        content = entityContent;
        hasUpdates = true;
        // Re-parse with updated entity
        updatedSourceFile = AstUtils.parseFromContent(content) || updatedSourceFile;
      }
    }

    // Handle service registration  
    if (component.type === 'service') {
      const serviceContent = AstUtils.addModuleArrayItem(updatedSourceFile, {
        name: component.className,
        arrayType: 'providers'
      });
      if (serviceContent !== content) {
        content = serviceContent;
        hasUpdates = true;
        // Re-parse with updated providers
        updatedSourceFile = AstUtils.parseFromContent(content) || updatedSourceFile;
      }

      // Also add to exports
      const exportContent = AstUtils.addModuleArrayItem(updatedSourceFile, {
        name: component.className,
        arrayType: 'exports'
      });
      if (exportContent !== content) {
        content = exportContent;
        hasUpdates = true;
      }
    }

    // Handle controller registration
    if (component.type === 'controller') {
      const controllerContent = AstUtils.addModuleArrayItem(updatedSourceFile, {
        name: component.className,
        arrayType: 'controllers'
      });
      if (controllerContent !== content) {
        content = controllerContent;
        hasUpdates = true;
      }
    }

    // Write updated content if changes were made
    if (hasUpdates) {
      AstUtils.writeFile(moduleFilePath, content);
      return true;
    }

    return false;
  }

  /**
   * Build relative import path for component
   */
  private buildRelativeImportPath(
    moduleDir: string,
    componentFilePath: string,
    componentType: 'entity' | 'service' | 'controller'
  ): string {
    const componentDir = path.dirname(componentFilePath);
    const componentName = path.basename(componentFilePath, '.ts');
    
    // Build relative path
    let relativePath = path.relative(moduleDir, componentDir);
    
    // Ensure it starts with ./
    if (!relativePath.startsWith('.')) {
      relativePath = `./${relativePath}`;
    }
    
    // Convert Windows paths to Unix-style for imports
    relativePath = relativePath.replace(/\\/g, '/');
    
    // Add component file name
    return `${relativePath}/${componentName}`;
  }

  /**
   * Update module for multiple components at once
   */
  async updateModulesForComponents(
    components: ComponentRegistration[],
    projectRoot: string = process.cwd()
  ): Promise<ModuleUpdateResult> {
    const result: ModuleUpdateResult = {
      success: true,
      updatedFiles: [],
      errors: [],
      message: ''
    };

    for (const component of components) {
      const componentResult = await this.updateModulesForComponent(component, projectRoot);
      
      // Merge results
      result.updatedFiles.push(...componentResult.updatedFiles);
      result.errors.push(...componentResult.errors);
      
      if (!componentResult.success) {
        result.success = false;
      }
    }

    // Remove duplicates
    result.updatedFiles = [...new Set(result.updatedFiles)];

    if (result.success) {
      result.message = `Successfully updated ${result.updatedFiles.length} module(s) for ${components.length} component(s)`;
    } else {
      result.message = `Module update completed with ${result.errors.length} error(s)`;
    }

    return result;
  }

  /**
   * Create component registration from generation options
   */
  static createComponentRegistration(
    name: string,
    type: 'entity' | 'service' | 'controller',
    generatedFilePath: string
  ): ComponentRegistration {
    const nameVariations = createNameVariations(name);
    let className: string;

    switch (type) {
      case 'entity':
        className = nameVariations.pascalCase;
        break;
      case 'service':
        className = `${nameVariations.pascalCase}Service`;
        break;
      case 'controller':
        className = `${nameVariations.pascalCase}Controller`;
        break;
    }

    return {
      name,
      type,
      filePath: generatedFilePath,
      className
    };
  }

  /**
   * Check if module updating is enabled in project
   */
  static isModuleUpdatingEnabled(projectRoot: string = process.cwd()): boolean {
    try {
      // Check for a temporary flag to disable module updating during resource generation
      if (process.env.SKIP_MODULE_UPDATE === 'true') {
        return false;
      }
      
      // Check for a configuration flag or just return true for now
      // This could be extended to read from package.json, .snestrc, etc.
      return true;
    } catch {
      return false;
    }
  }
}