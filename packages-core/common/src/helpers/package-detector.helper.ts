/**
 * Cache for package availability checks to avoid repeated require.resolve calls
 */
const packageCache = new Map<string, boolean>();

/**
 * Cached results for availability checks
 */
let typeormAvailable: boolean | undefined;
let swaggerAvailable: boolean | undefined;
let graphqlAvailable: boolean | undefined;
let classValidatorAvailable: boolean | undefined;
let classTransformerAvailable: boolean | undefined;

/**
 * Generic function to check if a package is available
 */
function isPackageAvailable(packageName: string): boolean {
  if (packageCache.has(packageName)) {
    return packageCache.get(packageName)!;
  }

  try {
    require.resolve(packageName);
    packageCache.set(packageName, true);
    return true;
  } catch {
    packageCache.set(packageName, false);
    return false;
  }
}

/**
 * Checks if TypeORM packages are available
 */
export function isTypeOrmAvailable(): boolean {
  if (typeormAvailable === undefined) {
    typeormAvailable = isPackageAvailable('typeorm') && 
                      isPackageAvailable('@nestjs/typeorm');
  }
  return typeormAvailable;
}

/**
 * Checks if Swagger package is available
 */
export function isSwaggerAvailable(): boolean {
  if (swaggerAvailable === undefined) {
    swaggerAvailable = isPackageAvailable('@nestjs/swagger');
  }
  return swaggerAvailable;
}

/**
 * Checks if GraphQL packages are available
 */
export function isGraphQLAvailable(): boolean {
  if (graphqlAvailable === undefined) {
    graphqlAvailable = isPackageAvailable('@nestjs/graphql') && 
                      isPackageAvailable('graphql');
  }
  return graphqlAvailable;
}

/**
 * Checks if class-validator package is available
 */
export function isClassValidatorAvailable(): boolean {
  if (classValidatorAvailable === undefined) {
    classValidatorAvailable = isPackageAvailable('class-validator');
  }
  return classValidatorAvailable;
}

/**
 * Checks if class-transformer package is available
 */
export function isClassTransformerAvailable(): boolean {
  if (classTransformerAvailable === undefined) {
    classTransformerAvailable = isPackageAvailable('class-transformer');
  }
  return classTransformerAvailable;
}

/**
 * Checks if validation packages (class-validator + class-transformer) are available
 */
export function isValidationAvailable(): boolean {
  return isClassValidatorAvailable() && isClassTransformerAvailable();
}

/**
 * Checks multiple packages at once
 */
export function arePackagesAvailable(packageNames: string[]): boolean {
  return packageNames.every(pkg => isPackageAvailable(pkg));
}

/**
 * Gets information about all checked packages
 */
export function getPackageAvailability(): {
  typeorm: boolean;
  swagger: boolean;
  graphql: boolean;
  classValidator: boolean;
  classTransformer: boolean;
  validation: boolean;
} {
  return {
    typeorm: isTypeOrmAvailable(),
    swagger: isSwaggerAvailable(),
    graphql: isGraphQLAvailable(),
    classValidator: isClassValidatorAvailable(),
    classTransformer: isClassTransformerAvailable(),
    validation: isValidationAvailable(),
  };
}

/**
 * Gets a list of available adapters based on package availability
 */
export function getAvailableAdapters(): string[] {
  const adapters: string[] = [];
  
  if (isValidationAvailable()) {
    adapters.push('validation');
  }
  
  if (isTypeOrmAvailable()) {
    adapters.push('typeorm');
  }
  
  if (isSwaggerAvailable()) {
    adapters.push('swagger');
  }
  
  if (isGraphQLAvailable()) {
    adapters.push('graphql');
  }
  
  return adapters;
}

/**
 * Gets a list of missing packages for specific functionality
 */
export function getMissingPackages(): {
  typeorm: string[];
  swagger: string[];
  graphql: string[];
  validation: string[];
} {
  const missing = {
    typeorm: [] as string[],
    swagger: [] as string[],
    graphql: [] as string[],
    validation: [] as string[],
  };

  // Check TypeORM packages
  if (!isPackageAvailable('typeorm')) {
    missing.typeorm.push('typeorm');
  }
  if (!isPackageAvailable('@nestjs/typeorm')) {
    missing.typeorm.push('@nestjs/typeorm');
  }

  // Check Swagger packages
  if (!isPackageAvailable('@nestjs/swagger')) {
    missing.swagger.push('@nestjs/swagger');
  }

  // Check GraphQL packages
  if (!isPackageAvailable('@nestjs/graphql')) {
    missing.graphql.push('@nestjs/graphql');
  }
  if (!isPackageAvailable('graphql')) {
    missing.graphql.push('graphql');
  }

  // Check validation packages
  if (!isPackageAvailable('class-validator')) {
    missing.validation.push('class-validator');
  }
  if (!isPackageAvailable('class-transformer')) {
    missing.validation.push('class-transformer');
  }

  return missing;
}

/**
 * Generates installation commands for missing packages
 */
export function generateInstallCommands(): {
  npm: string[];
  yarn: string[];
  pnpm: string[];
} {
  const missing = getMissingPackages();
  const allMissing = [
    ...missing.typeorm,
    ...missing.swagger,
    ...missing.graphql,
    ...missing.validation,
  ];

  if (allMissing.length === 0) {
    return { npm: [], yarn: [], pnpm: [] };
  }

  const packageList = allMissing.join(' ');
  
  return {
    npm: [`npm install ${packageList}`],
    yarn: [`yarn add ${packageList}`],
    pnpm: [`pnpm add ${packageList}`],
  };
}

/**
 * Clears the package availability cache (useful for testing)
 */
export function clearPackageCache(): void {
  packageCache.clear();
  typeormAvailable = undefined;
  swaggerAvailable = undefined;
  graphqlAvailable = undefined;
  classValidatorAvailable = undefined;
  classTransformerAvailable = undefined;
}

/**
 * Forces re-checking of package availability
 */
export function refreshPackageAvailability(): void {
  clearPackageCache();
  // Trigger re-check by calling the functions
  isTypeOrmAvailable();
  isSwaggerAvailable();
  isGraphQLAvailable();
  isClassValidatorAvailable();
  isClassTransformerAvailable();
}

/**
 * Diagnostic function to log package availability
 */
export function logPackageAvailability(): void {
  const availability = getPackageAvailability();
  const missing = getMissingPackages();
  
  console.log('[SolidNestJS] Package Availability Report:');
  console.log('✅ Available:', Object.entries(availability)
    .filter(([, available]) => available)
    .map(([name]) => name)
    .join(', ') || 'None');
    
  console.log('❌ Missing:', Object.entries(missing)
    .filter(([, packages]) => packages.length > 0)
    .map(([feature, packages]) => `${feature}: ${packages.join(', ')}`)
    .join('; ') || 'None');

  const commands = generateInstallCommands();
  if (commands.npm.length > 0) {
    console.log('📦 Install missing packages:');
    console.log('  npm:', commands.npm[0]);
    console.log('  yarn:', commands.yarn[0]);
    console.log('  pnpm:', commands.pnpm[0]);
  }
}

/**
 * Check if the minimum required packages for unified decorators are available
 */
export function checkMinimumRequirements(): {
  met: boolean;
  missing: string[];
  recommendations: string[];
} {
  const required = ['class-validator', 'class-transformer'];
  const recommended = ['typeorm', '@nestjs/typeorm', '@nestjs/swagger'];
  
  const missing = required.filter(pkg => !isPackageAvailable(pkg));
  const missingRecommended = recommended.filter(pkg => !isPackageAvailable(pkg));
  
  return {
    met: missing.length === 0,
    missing,
    recommendations: missingRecommended,
  };
}