/**
 * Cache for package availability checks to avoid repeated require.resolve calls
 */
const packageCache = new Map<string, boolean>();

/**
 * Cached results for availability checks
 */
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
 * Generic function to check multiple packages at once
 */
export function arePackagesAvailable(packages: string[]): boolean {
  return packages.every(pkg => isPackageAvailable(pkg));
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
 * Checks if validation packages are available
 */
export function isValidationAvailable(): boolean {
  return isClassValidatorAvailable() || isClassTransformerAvailable();
}

/**
 * Clears all package availability caches
 */
export function clearPackageCache(): void {
  packageCache.clear();
  classValidatorAvailable = undefined;
  classTransformerAvailable = undefined;
}

/**
 * Preloads package availability checks for commonly used packages
 */
export function preloadCommonPackages(): void {
  // Only preload packages that are actually used by the common package
  isClassValidatorAvailable();
  isClassTransformerAvailable();
}

/**
 * Export the generic isPackageAvailable function for use by other packages
 */
export { isPackageAvailable };