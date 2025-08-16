/**
 * Args Helper Mixins - Core Infrastructure
 * 
 * This module provides the shared infrastructure for creating helper functions
 * that reduce boilerplate in DTO creation. These utilities are used by the
 * package-specific implementations in rest-api, graphql, and rest-graphql packages.
 */

// Type inference utilities
export {
  inferFilterType,
  FilterTypeRegistry,
  setDefaultFilterTypes, // deprecated, use FilterTypeRegistry.register()
  isSupportedPrimitiveType,
  getReflectedPropertyType,
  isEnum,
  getEnumInfo,
  shouldTreatAsEnum,
  type FieldConfig,
  type ParsedFieldConfig
} from './type-inference.helper';

// Field configuration utilities
export {
  parseFieldConfig,
  parseOrderByConfig,
  parseGroupByConfig,
  parseClassOptions,
  validateFieldConfig,
  validateClassOptions,
  type WhereFieldsConfig,
  type OrderByFieldConfig,
  type OrderByFieldsConfig,
  type GroupByFieldConfig,
  type GroupByFieldsConfig,
  type ClassOptions,
  type ParsedClassOptions
} from './field-config.helper';

// Re-export class generation utilities from the common location
export {
  generateBaseClass,
  addPropertyToClass,
  getPropertyMetadata,
  setPropertyMetadata,
  getDefinedProperties,
  cloneClass,
  type ClassGeneratorOptions,
  type PropertyOptions
} from '../class-generation';

// Re-export decorator utilities from the common location
export {
  applyDecoratorToProperty,
  applyDecoratorsToProperty,
  applyDecoratorToClass,
  applyDecoratorsToClass
} from '../decorators';

// Decorator building utilities (args-helpers specific)
export {
  BaseDecoratorBuilder,
  DecoratorUtils,
  DecoratorBuilderRegistry,
  addLogicalOperators,
  type DecoratorConfig,
  type DecoratorBuilder,
  type DecoratorBuilderFactory
} from './decorator-builder.helper';

// GroupByArgsFrom mixin utilities
export {
  GroupByArgsFrom,
  extractFindArgsMetadata,
  getGroupByArgsMetadata,
  getGroupByFieldMetadata,
  isGroupByArgsFromClass,
  type GroupByArgsFromConfig,
  type FindArgsMetadata
} from './groupby-args-from.helper';