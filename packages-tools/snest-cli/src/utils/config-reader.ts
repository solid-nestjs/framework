import * as fs from 'fs';
import * as path from 'path';
import { ProjectContext } from '../types';

/**
 * Configuration interface for snest.config.json
 */
export interface SnestConfig {
  $schema?: string;
  version: string;
  project: {
    type: 'rest' | 'graphql' | 'hybrid';
    database: 'sqlite' | 'postgres' | 'mysql' | 'mssql';
    features: {
      hasSwagger: boolean;
      hasGraphQL: boolean;
      hasTypeORM: boolean;
      hasSolidDecorators: boolean;
      useSolidDecorators?: boolean;
      useGenerateDtoFromEntity?: boolean;
    };
    bundle: string;
  };
  generators: {
    defaultEntityPath: string;
    defaultServicePath: string;
    defaultControllerPath: string;
    defaultModulePath: string;
    autoUpdateModules: boolean;
    useSolidDecorators?: boolean;
    useGenerateDtoFromEntity?: boolean;
  };
}

/**
 * Read and parse snest.config.json from the current working directory
 */
export function readSnestConfig(): SnestConfig | null {
  try {
    const configPath = path.join(process.cwd(), 'snest.config.json');
    
    if (!fs.existsSync(configPath)) {
      return null;
    }

    const configContent = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(configContent) as SnestConfig;
  } catch (error) {
    console.warn('Warning: Could not read snest.config.json:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

/**
 * Create ProjectContext from SnestConfig
 */
export function createProjectContextFromConfig(config: SnestConfig): ProjectContext {
  return {
    // Framework detection
    hasSolidNestjs: true,
    solidVersion: '0.2.9', // Default version
    
    // API capabilities
    apiType: config.project.type,
    hasGraphQL: config.project.features.hasGraphQL,
    hasSwagger: config.project.features.hasSwagger,
    hasTypeORM: config.project.features.hasTypeORM,
    
    // Database configuration
    databaseType: config.project.database,
    
    // Existing project structure (would need to be scanned)
    existingEntities: [],
    existingServices: [],
    existingControllers: [],
    existingModules: [],
    
    // SOLID framework features
    hasSolidDecorators: config.project.features.hasSolidDecorators,
    hasArgsHelpers: false, // Default
    hasEntityGeneration: true,
    useSolidDecorators: config.project.features.useSolidDecorators ?? config.generators.useSolidDecorators ?? true,
    useGenerateDtoFromEntity: config.project.features.useGenerateDtoFromEntity ?? config.generators.useGenerateDtoFromEntity ?? false,
    
    // Project info
    projectRoot: process.cwd(),
    packageJson: {}, // Would need to be loaded
    
    // Path configuration
    paths: {
      entities: config.generators.defaultEntityPath,
      services: config.generators.defaultServicePath,
      controllers: config.generators.defaultControllerPath,
      modules: config.generators.defaultModulePath,
      dto: 'src/dto', // Default DTO path
    },
  };
}

/**
 * Get ProjectContext for the current directory
 * Falls back to defaults if no config file is found
 */
export function getProjectContext(): ProjectContext {
  const config = readSnestConfig();
  
  if (config) {
    return createProjectContextFromConfig(config);
  }
  
  // Fallback defaults
  return {
    hasSolidNestjs: true,
    solidVersion: '0.2.9',
    apiType: 'hybrid',
    hasGraphQL: true,
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
    useGenerateDtoFromEntity: false,
    projectRoot: process.cwd(),
    packageJson: {},
    paths: {
      entities: 'src/entities',
      services: 'src/services',
      controllers: 'src/controllers',
      modules: 'src',
      dto: 'src/dto',
    },
  };
}