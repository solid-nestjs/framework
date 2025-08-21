import * as Handlebars from 'handlebars';
import * as path from 'path';
import * as fs from 'fs-extra';
import { TemplateData } from '../types';
import { toPascalCase, toCamelCase, toKebabCase, toSnakeCase, pluralize, singularize } from './string-utils';

/**
 * Template engine using Handlebars
 */
export class TemplateEngine {
  private handlebars: typeof Handlebars;
  private templateCache: Map<string, HandlebarsTemplateDelegate> = new Map();
  private templatesPath: string;

  constructor(templatesPath?: string) {
    this.handlebars = Handlebars.create();
    this.templatesPath = templatesPath || path.join(__dirname, '..', 'templates');
    this.registerHelpers();
  }

  /**
   * Register custom Handlebars helpers
   */
  private registerHelpers(): void {
    // String transformation helpers
    this.handlebars.registerHelper('pascalCase', (str: any) => str ? toPascalCase(str.toString()) : '');
    this.handlebars.registerHelper('camelCase', (str: any) => str ? toCamelCase(str.toString()) : '');
    this.handlebars.registerHelper('kebabCase', (str: any) => str ? toKebabCase(str.toString()) : '');
    this.handlebars.registerHelper('snakeCase', (str: any) => str ? toSnakeCase(str.toString()) : '');
    this.handlebars.registerHelper('pluralize', (str: any) => str ? pluralize(str.toString()) : '');
    this.handlebars.registerHelper('singularize', (str: any) => str ? singularize(str.toString()) : '');

    // Uppercase first letter
    this.handlebars.registerHelper('capitalize', (str: any) => {
      if (!str) return '';
      const s = str.toString();
      return s.charAt(0).toUpperCase() + s.slice(1);
    });

    // Conditional helpers
    this.handlebars.registerHelper('eq', (a: any, b: any) => a === b);
    this.handlebars.registerHelper('ne', (a: any, b: any) => a !== b);
    this.handlebars.registerHelper('or', (a: any, b: any) => a || b);
    this.handlebars.registerHelper('and', (a: any, b: any) => a && b);

    // Array helpers
    this.handlebars.registerHelper('length', (arr: any[]) => arr ? arr.length : 0);
    this.handlebars.registerHelper('first', (arr: any[]) => arr && arr.length > 0 ? arr[0] : null);
    this.handlebars.registerHelper('last', (arr: any[]) => arr && arr.length > 0 ? arr[arr.length - 1] : null);

    // JSON helper for complex objects
    this.handlebars.registerHelper('json', (obj: any) => {
      if (!obj) return '';
      return JSON.stringify(obj);
    });

    // Safe JSON helper for template options
    this.handlebars.registerHelper('jsonOptions', (obj: any) => {
      if (!obj || Object.keys(obj).length === 0) return '';
      return new this.handlebars.SafeString(JSON.stringify(obj));
    });

    // Date helpers
    this.handlebars.registerHelper('now', () => new Date().toISOString());
    this.handlebars.registerHelper('year', () => new Date().getFullYear());

    // Import helpers
    this.handlebars.registerHelper('importPath', (from: string, to: string) => {
      const relativePath = path.relative(path.dirname(from), to);
      return relativePath.startsWith('.') ? relativePath : `./${relativePath}`;
    });

    // Type mapping helper
    this.handlebars.registerHelper('typeScriptType', (type: string) => {
      switch (type) {
        case 'string': return 'string';
        case 'number': return 'number';
        case 'boolean': return 'boolean';
        case 'Date': return 'Date';
        case 'relation': return 'any'; // Will be replaced with actual relation type
        default: return 'any';
      }
    });

    // Validation decorator helper
    this.handlebars.registerHelper('validationDecorator', (type: string, required: boolean) => {
      const decorators: string[] = [];
      
      if (!required) {
        decorators.push('@IsOptional()');
      }

      switch (type) {
        case 'string':
          decorators.push('@IsString()');
          if (required) decorators.push('@IsNotEmpty()');
          break;
        case 'number':
          decorators.push('@IsNumber()');
          break;
        case 'boolean':
          decorators.push('@IsBoolean()');
          break;
        case 'Date':
          decorators.push('@IsDate()');
          break;
      }

      return decorators.join('\n  ');
    });

    // Database column type helper
    this.handlebars.registerHelper('columnType', (type: string, databaseType: string = 'postgres') => {
      switch (type) {
        case 'string':
          return 'varchar';
        case 'number':
          return databaseType === 'postgres' ? 'integer' : 'int';
        case 'boolean':
          return 'boolean';
        case 'Date':
          return databaseType === 'postgres' ? 'timestamp' : 'datetime';
        default:
          return 'varchar';
      }
    });

    // Block helper for loops with index
    this.handlebars.registerHelper('eachWithIndex', function(this: any, context: any[], options: any) {
      let ret = '';
      for (let i = 0; i < context.length; i++) {
        ret += options.fn({ ...context[i], index: i, first: i === 0, last: i === context.length - 1 });
      }
      return ret;
    });
  }

  /**
   * Register additional custom helper
   */
  registerHelper(name: string, helper: (...args: any[]) => any): void {
    this.handlebars.registerHelper(name, helper);
  }

  /**
   * Load and compile a template
   */
  private async loadTemplate(templateName: string): Promise<HandlebarsTemplateDelegate> {
    // Check cache first
    if (this.templateCache.has(templateName)) {
      return this.templateCache.get(templateName)!;
    }

    const templatePath = path.join(this.templatesPath, `${templateName}.hbs`);
    
    try {
      const templateContent = await fs.readFile(templatePath, 'utf8');
      const compiledTemplate = this.handlebars.compile(templateContent);
      
      // Cache the compiled template
      this.templateCache.set(templateName, compiledTemplate);
      
      return compiledTemplate;
    } catch (error) {
      throw new Error(`Failed to load template '${templateName}': ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Render a template with data
   */
  async render(templateName: string, data: TemplateData): Promise<string> {
    const template = await this.loadTemplate(templateName);
    return template(data);
  }

  /**
   * Render a template from string content
   */
  renderFromString(templateContent: string, data: TemplateData): string {
    const template = this.handlebars.compile(templateContent);
    return template(data);
  }

  /**
   * Register a partial template
   */
  async registerPartial(name: string, templateName: string): Promise<void> {
    const templatePath = path.join(this.templatesPath, 'partials', `${templateName}.hbs`);
    
    try {
      const templateContent = await fs.readFile(templatePath, 'utf8');
      this.handlebars.registerPartial(name, templateContent);
    } catch (error) {
      throw new Error(`Failed to register partial '${name}': ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Register multiple partials from a directory
   */
  async registerPartials(partialsDir: string = 'partials'): Promise<void> {
    const partialsPath = path.join(this.templatesPath, partialsDir);
    
    try {
      const files = await fs.readdir(partialsPath);
      
      for (const file of files) {
        if (file.endsWith('.hbs')) {
          const partialName = path.basename(file, '.hbs');
          const partialPath = path.join(partialsPath, file);
          const content = await fs.readFile(partialPath, 'utf8');
          
          this.handlebars.registerPartial(partialName, content);
        }
      }
    } catch (error) {
      // Silently ignore if partials directory doesn't exist
      if (error instanceof Error && 'code' in error && error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  /**
   * Clear template cache
   */
  clearCache(): void {
    this.templateCache.clear();
  }

  /**
   * Check if template exists
   */
  async templateExists(templateName: string): Promise<boolean> {
    const templatePath = path.join(this.templatesPath, `${templateName}.hbs`);
    return fs.pathExists(templatePath);
  }

  /**
   * Get available templates
   */
  async getAvailableTemplates(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.templatesPath);
      return files
        .filter(file => file.endsWith('.hbs'))
        .map(file => path.basename(file, '.hbs'));
    } catch {
      return [];
    }
  }

  /**
   * Create enhanced template data with all variations
   */
  static createTemplateData(name: string, additionalData: Partial<TemplateData> = {}): TemplateData {
    const pascalCase = toPascalCase(name);
    const camelCase = toCamelCase(name);
    const kebabCase = toKebabCase(name);
    const snakeCase = toSnakeCase(name);

    return {
      name,
      pascalCase,
      camelCase,
      kebabCase,
      snakeCase,
      ...additionalData,
    };
  }
}