import { Type } from '@nestjs/common';
import { applyDecoratorToProperty as applyPropertyDecorator } from '../decorators';
import 'reflect-metadata';

/**
 * Common decorator configuration interface
 */
export interface DecoratorConfig {
  description?: string;
  required?: boolean;
  example?: any;
  deprecated?: boolean;
}

/**
 * Interface for decorator builders that create property decorators
 */
export interface DecoratorBuilder {
  /**
   * Creates validation decorators for a property
   */
  createValidationDecorators(config: DecoratorConfig): PropertyDecorator[];
  
  /**
   * Creates type transformation decorators
   */
  createTransformDecorators(type: Type<any>, config: DecoratorConfig): PropertyDecorator[];
  
  /**
   * Creates documentation decorators (Swagger/GraphQL)
   */
  createDocumentationDecorators(type: Type<any>, config: DecoratorConfig): PropertyDecorator[];
  
  /**
   * Creates all decorators for a property and applies them to the target class
   */
  applyAllDecorators(
    targetClass: Type<any>,
    propertyName: string,
    type: Type<any>,
    config: DecoratorConfig
  ): void;
}

/**
 * Base decorator builder with common validation decorators
 */
export abstract class BaseDecoratorBuilder implements DecoratorBuilder {
  
  abstract createValidationDecorators(config: DecoratorConfig): PropertyDecorator[];
  abstract createTransformDecorators(type: Type<any>, config: DecoratorConfig): PropertyDecorator[];
  abstract createDocumentationDecorators(type: Type<any>, config: DecoratorConfig): PropertyDecorator[];
  
  /**
   * Creates all decorators for a property and applies them to the target class
   * 
   * @param targetClass - The class to apply decorators to
   * @param propertyName - The property name
   * @param type - The property type
   * @param config - Decorator configuration
   */
  applyAllDecorators(
    targetClass: Type<any>,
    propertyName: string,
    type: Type<any>,
    config: DecoratorConfig
  ): void {
    const decorators = [
      ...this.createValidationDecorators(config),
      ...this.createTransformDecorators(type, config),
      ...this.createDocumentationDecorators(type, config)
    ];
    
    for (const decorator of decorators) {
      applyPropertyDecorator(decorator, targetClass, propertyName);
    }
  }
  
  /**
   * Creates common validation decorators that are used across all packages
   * 
   * @param config - Configuration for the decorators
   * @returns Array of common validation decorators
   */
  protected createCommonValidationDecorators(config: DecoratorConfig): PropertyDecorator[] {
    const decorators: PropertyDecorator[] = [];
    
    // These will be imported from class-validator in the specific implementations
    // For now, we'll return an empty array and let the package-specific implementations handle this
    
    return decorators;
  }
  
  /**
   * Creates common transformation decorators
   * 
   * @param type - The property type
   * @param config - Configuration for the decorators
   * @returns Array of transformation decorators
   */
  protected createCommonTransformDecorators(type: Type<any>, config: DecoratorConfig): PropertyDecorator[] {
    const decorators: PropertyDecorator[] = [];
    
    // Type transformation decorators will be handled by package-specific implementations
    
    return decorators;
  }
}

/**
 * Utility functions for working with decorators
 */
export class DecoratorUtils {
  
  /**
   * Checks if a decorator has already been applied to a property
   * 
   * @param targetClass - The class to check
   * @param propertyName - The property name
   * @param decoratorKey - The metadata key to look for
   * @returns True if the decorator has been applied
   */
  static hasDecorator(
    targetClass: Type<any>,
    propertyName: string,
    decoratorKey: string
  ): boolean {
    return Reflect.hasMetadata(decoratorKey, targetClass.prototype, propertyName);
  }
  
  /**
   * Gets decorator metadata for a property
   * 
   * @param targetClass - The class to get metadata from
   * @param propertyName - The property name
   * @param decoratorKey - The metadata key
   * @returns The decorator metadata
   */
  static getDecoratorMetadata(
    targetClass: Type<any>,
    propertyName: string,
    decoratorKey: string
  ): any {
    return Reflect.getMetadata(decoratorKey, targetClass.prototype, propertyName);
  }
  
  /**
   * Sets decorator metadata for a property
   * 
   * @param targetClass - The class to set metadata on
   * @param propertyName - The property name
   * @param decoratorKey - The metadata key
   * @param metadata - The metadata to set
   */
  static setDecoratorMetadata(
    targetClass: Type<any>,
    propertyName: string,
    decoratorKey: string,
    metadata: any
  ): void {
    Reflect.defineMetadata(decoratorKey, metadata, targetClass.prototype, propertyName);
  }
  
  /**
   * Merges decorator metadata with existing metadata
   * 
   * @param targetClass - The class to merge metadata on
   * @param propertyName - The property name
   * @param decoratorKey - The metadata key
   * @param newMetadata - The new metadata to merge
   */
  static mergeDecoratorMetadata(
    targetClass: Type<any>,
    propertyName: string,
    decoratorKey: string,
    newMetadata: any
  ): void {
    const existing = this.getDecoratorMetadata(targetClass, propertyName, decoratorKey) || {};
    const merged = { ...existing, ...newMetadata };
    this.setDecoratorMetadata(targetClass, propertyName, decoratorKey, merged);
  }
}

/**
 * Factory function for creating decorator builders
 * This will be implemented by each package (rest-api, graphql, rest-graphql)
 */
export interface DecoratorBuilderFactory {
  /**
   * Creates a decorator builder for WhereFields
   */
  createWhereFieldsDecoratorBuilder(): DecoratorBuilder;
  
  /**
   * Creates a decorator builder for OrderByFields
   */
  createOrderByFieldsDecoratorBuilder(): DecoratorBuilder;
  
  /**
   * Creates a decorator builder for GroupByFields
   */
  createGroupByFieldsDecoratorBuilder(): DecoratorBuilder;
}

/**
 * Registry for decorator builder factories
 * Each package will register its factory here
 */
export class DecoratorBuilderRegistry {
  private static factories = new Map<string, DecoratorBuilderFactory>();
  
  /**
   * Registers a decorator builder factory for a package
   * 
   * @param packageName - Name of the package (e.g., 'rest-api', 'graphql', 'rest-graphql')
   * @param factory - The factory instance
   */
  static registerFactory(packageName: string, factory: DecoratorBuilderFactory): void {
    this.factories.set(packageName, factory);
  }
  
  /**
   * Gets a decorator builder factory for a package
   * 
   * @param packageName - Name of the package
   * @returns The factory instance or undefined if not found
   */
  static getFactory(packageName: string): DecoratorBuilderFactory | undefined {
    return this.factories.get(packageName);
  }
  
  /**
   * Gets all registered package names
   * 
   * @returns Array of registered package names
   */
  static getRegisteredPackages(): string[] {
    return Array.from(this.factories.keys());
  }
}

/**
 * Applies logical operator fields (_and, _or) to a WhereFields class
 * This is common functionality used across all packages
 * 
 * @param targetClass - The WhereFields class to add operators to
 * @param decoratorBuilder - The decorator builder to use
 * @param className - The class name for nested types
 */
export function addLogicalOperators(
  targetClass: Type<any>,
  decoratorBuilder: DecoratorBuilder,
  className: string
): void {
  // Add _and field (array of same type)
  decoratorBuilder.applyAllDecorators(
    targetClass,
    '_and',
    Array,
    {
      description: `Logical AND conditions for ${className}`,
      required: false
    }
  );
  
  // Add _or field (array of same type)
  decoratorBuilder.applyAllDecorators(
    targetClass,
    '_or',
    Array,
    {
      description: `Logical OR conditions for ${className}`,
      required: false
    }
  );
}