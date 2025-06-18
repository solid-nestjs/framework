import { Constructor } from '../types';

/**
 * Returns the name of a type, given either a string or a constructor function.
 *
 * @param type - The type to get the name of. Can be a string or a constructor function.
 * @returns The name of the type as a string.
 * @throws {Error} If the provided type is neither a string nor a constructor function.
 */
export function getTypeName(type: string | Function): string {
  if (typeof type === 'string') {
    return type;
  }

  // Handle constructor functions/classes
  if (typeof type === 'function') {
    return type.name;
  }

  throw new Error('Type must be a string or a constructor function');
}

/**
 * Returns the constructor function if the provided type is a function (class or constructor),
 * or `undefined` if the type is a string. Throws an error if the input is neither a string nor a function.
 *
 * @param type - The type to evaluate, which can be a string or a constructor function.
 * @returns The constructor function if `type` is a function, otherwise `undefined`.
 * @throws {Error} If `type` is neither a string nor a constructor function.
 */
export function getTypeClass(type: string | Function): Constructor | undefined {
  if (typeof type === 'string') {
    return undefined;
  }

  // Handle constructor functions/classes
  if (typeof type === 'function') {
    return type as Constructor;
  }

  throw new Error('Type must be a string or a constructor function');
}

/**
 * Retrieves the design type metadata of a specified property from a class constructor.
 *
 * @param constructor - The class constructor from which to retrieve the property type.
 * @param field - The name of the property whose type metadata is to be retrieved.
 * @returns The type metadata of the specified property, or `undefined` if not found.
 *
 * @remarks
 * This function relies on TypeScript's "emitDecoratorMetadata" feature and the Reflect Metadata API.
 * Ensure that the "reflect-metadata" polyfill is imported and that "emitDecoratorMetadata" is enabled in your tsconfig.
 */
export function getPropertyType(constructor: Constructor, field: string) {
  return Reflect.getMetadata('design:type', constructor.prototype, field);
}
