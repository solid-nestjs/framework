/**
 * Class Generation Utilities
 * 
 * This module provides utilities for dynamically creating and manipulating classes.
 * These utilities can be used by any feature that needs to generate DTO classes
 * or manipulate class structures at runtime.
 */

export {
  generateBaseClass,
  addPropertyToClass,
  getPropertyMetadata,
  setPropertyMetadata,
  getDefinedProperties,
  cloneClass,
  type ClassGeneratorOptions,
  type PropertyOptions
} from './dynamic-class.helper';