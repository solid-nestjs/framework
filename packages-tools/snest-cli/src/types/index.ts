/**
 * Configuration for CLI operations
 */
export interface CliConfig {
  defaultPackageManager: 'npm' | 'yarn' | 'pnpm';
  defaultDatabase: 'sqlite' | 'postgres' | 'mysql' | 'mssql';
  defaultApiType: 'rest' | 'graphql' | 'hybrid';
  generateTests: boolean;
  testFramework: 'jest' | 'vitest';
  useStrictMode: boolean;
  formatting: {
    prettier: boolean;
    eslint: boolean;
  };
  paths: {
    entities: string;
    services: string;
    controllers: string;
    modules: string;
    dto: string;
  };
  templates?: {
    customPath?: string;
  };
}

/**
 * Project context detected from analysis
 */
export interface ProjectContext {
  // Framework detection
  hasSolidNestjs: boolean;
  solidVersion: string;
  
  // API capabilities
  hasGraphQL: boolean;
  hasSwagger: boolean;
  hasTypeORM: boolean;
  
  // Database configuration
  databaseType: 'sqlite' | 'postgres' | 'mysql' | 'mssql';
  
  // Existing project structure
  existingEntities: string[];
  existingServices: string[];
  existingControllers: string[];
  existingModules: string[];
  
  // SOLID framework features
  hasSolidDecorators: boolean;
  hasArgsHelpers: boolean;
  hasEntityGeneration: boolean;
  
  // Project info
  projectRoot: string;
  packageJson: any;
  
  // Path configuration
  paths?: {
    entities: string;
    services: string;
    controllers: string;
    modules: string;
    dto: string;
  };
}

/**
 * Generation options for templates
 */
export interface GenerationOptions {
  name: string;
  type: 'entity' | 'service' | 'controller' | 'module' | 'dto' | 'resource';
  apiType?: 'rest' | 'graphql' | 'hybrid';
  fields?: FieldDefinition[] | string[];
  entityName?: string;
  serviceName?: string;
  relations?: string[];
  customMethods?: CustomMethodDefinition[];
  customEndpoints?: any[];
  // Module-specific options
  entities?: string[] | string;
  services?: string[] | string;
  controllers?: string[] | string;
  customProviders?: any[];
  moduleImports?: any[];
  customExports?: any[];
  withExports?: boolean;
  path?: string;
  withTests?: boolean;
  withSolid?: boolean;
  withValidation?: boolean;
  withArgsHelpers?: boolean;
  withBulkOperations?: boolean;
  withSoftDelete?: boolean;
  withGuards?: boolean;
  guards?: any[];
  skipModuleUpdate?: boolean;
  overwrite?: boolean;
}

/**
 * Field definition for entities
 */
export interface FieldDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'Date' | 'relation';
  required: boolean;
  nullable?: boolean;
  relationType?: 'oneToMany' | 'manyToOne' | 'oneToOne' | 'manyToMany';
  relationTarget?: string;
  options?: Record<string, any>;
}

/**
 * Relation definition for services
 */
export interface RelationDefinition {
  name: string;
  type: 'oneToMany' | 'manyToOne' | 'oneToOne' | 'manyToMany';
  target: string;
  eager?: boolean;
  cascade?: boolean;
  options?: Record<string, any>;
}

/**
 * Custom method definition for services
 */
export interface CustomMethodDefinition {
  name: string;
  description: string;
  parameters: Array<{ name: string; type: string }>;
  returnType: string;
}

/**
 * Template data for Handlebars
 */
export interface TemplateData {
  name: string;
  pascalCase: string;
  camelCase: string;
  kebabCase: string;
  snakeCase: string;
  fields?: FieldDefinition[];
  imports?: string[];
  hasRelations?: boolean;
  useSolidDecorators?: boolean;
  useArgsHelpers?: boolean;
  apiType?: 'rest' | 'graphql' | 'hybrid';
  databaseType?: string;
  [key: string]: any;
}

/**
 * Command execution result
 */
export interface CommandResult {
  success: boolean;
  message: string;
  generatedFiles?: string[];
  errors?: string[];
  nextSteps?: string[];
}

/**
 * File operation result
 */
export interface FileOperationResult {
  path: string;
  content: string;
  operation: 'create' | 'update' | 'skip';
  success: boolean;
  error?: string;
}