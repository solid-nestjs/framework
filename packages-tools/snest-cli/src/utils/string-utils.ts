/**
 * Utility functions for string manipulation and case conversion
 */

/**
 * Convert string to PascalCase
 */
export function toPascalCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
    .replace(/^(.)/, (char) => char.toUpperCase());
}

/**
 * Convert string to camelCase
 */
export function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * Convert string to kebab-case
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Convert string to snake_case
 */
export function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

/**
 * Convert string to CONSTANT_CASE
 */
export function toConstantCase(str: string): string {
  return toSnakeCase(str).toUpperCase();
}

/**
 * Pluralize a word (basic implementation)
 */
export function pluralize(word: string): string {
  if (word.endsWith('y')) {
    return word.slice(0, -1) + 'ies';
  }
  if (word.endsWith('s') || word.endsWith('sh') || word.endsWith('ch') || word.endsWith('x') || word.endsWith('z')) {
    return word + 'es';
  }
  return word + 's';
}

/**
 * Singularize a word (basic implementation)
 */
export function singularize(word: string): string {
  if (word.endsWith('ies')) {
    return word.slice(0, -3) + 'y';
  }
  if (word.endsWith('es') && (word.endsWith('ses') || word.endsWith('shes') || word.endsWith('ches') || word.endsWith('xes') || word.endsWith('zes'))) {
    return word.slice(0, -2);
  }
  if (word.endsWith('s') && !word.endsWith('ss')) {
    return word.slice(0, -1);
  }
  return word;
}

/**
 * Check if a string is valid as TypeScript identifier
 */
export function isValidIdentifier(str: string): boolean {
  return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(str);
}

/**
 * Sanitize string to be a valid TypeScript identifier
 */
export function sanitizeIdentifier(str: string): string {
  // Remove invalid characters and ensure it starts with letter/underscore
  let sanitized = str.replace(/[^a-zA-Z0-9_$]/g, '');
  
  if (!/^[a-zA-Z_$]/.test(sanitized)) {
    sanitized = '_' + sanitized;
  }
  
  return sanitized;
}

/**
 * Create all case variations of a name
 */
export function createNameVariations(name: string) {
  const sanitized = sanitizeIdentifier(name);
  
  return {
    original: name,
    pascalCase: toPascalCase(sanitized),
    camelCase: toCamelCase(sanitized),
    kebabCase: toKebabCase(sanitized),
    snakeCase: toSnakeCase(sanitized),
    constantCase: toConstantCase(sanitized),
    plural: {
      pascalCase: toPascalCase(pluralize(sanitized)),
      camelCase: toCamelCase(pluralize(sanitized)),
      kebabCase: toKebabCase(pluralize(sanitized)),
      snakeCase: toSnakeCase(pluralize(sanitized)),
    },
    singular: {
      pascalCase: toPascalCase(singularize(sanitized)),
      camelCase: toCamelCase(singularize(sanitized)),
      kebabCase: toKebabCase(singularize(sanitized)),
      snakeCase: toSnakeCase(singularize(sanitized)),
    },
  };
}

/**
 * Get the correct SOLID bundle package name based on API type
 */
export function getSolidBundle(apiType?: 'rest' | 'graphql' | 'hybrid'): string {
  switch (apiType) {
    case 'rest':
      return '@solid-nestjs/typeorm-crud';
    case 'graphql':
      return '@solid-nestjs/typeorm-graphql-crud';
    case 'hybrid':
      return '@solid-nestjs/typeorm-hybrid-crud';
    default:
      return '@solid-nestjs/typeorm-hybrid-crud'; // default to hybrid
  }
}

/**
 * Convert an object to JavaScript object literal format (not JSON)
 * Removes quotes from property names and removes size specifications
 */
export function objectToJSFormat(obj: Record<string, any>): string | undefined {
  if (!obj || typeof obj !== 'object') {
    return undefined;
  }

  // Filter out size-related properties
  const filteredObj = Object.fromEntries(
    Object.entries(obj).filter(([key]) => 
      !['length', 'maxLength', 'minLength', 'size', 'precision', 'scale'].includes(key)
    )
  );

  if (Object.keys(filteredObj).length === 0) {
    return undefined; // Return undefined so template can handle it properly
  }

  const pairs = Object.entries(filteredObj).map(([key, value]) => {
    let formattedValue: string;
    
    if (typeof value === 'string') {
      formattedValue = `'${value}'`;
    } else if (typeof value === 'boolean') {
      formattedValue = value.toString();
    } else if (typeof value === 'number') {
      formattedValue = value.toString();
    } else if (Array.isArray(value)) {
      formattedValue = `[${value.map(v => typeof v === 'string' ? `'${v}'` : v).join(', ')}]`;
    } else if (value === null) {
      formattedValue = 'null';
    } else if (typeof value === 'object') {
      const nestedResult = objectToJSFormat(value);
      formattedValue = nestedResult || '{}';
    } else {
      formattedValue = JSON.stringify(value);
    }

    return `${key}: ${formattedValue}`;
  });

  return `{${pairs.join(', ')}}`;
}