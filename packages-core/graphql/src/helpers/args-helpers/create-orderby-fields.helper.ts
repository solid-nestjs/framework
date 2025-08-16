import { Type } from '@nestjs/common';
import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsEnum } from 'class-validator';
import { OrderBy, OrderByTypes } from '@solid-nestjs/common';
import {
  parseOrderByConfig,
  parseClassOptions,
  validateClassOptions,
  generateBaseClass,
  addPropertyToClass,
  applyDecoratorToProperty,
  type OrderByFieldsConfig,
  type ClassOptions
} from '@solid-nestjs/common';

/**
 * Creates an OrderByFields class for sorting entities with GraphQL decorators.
 * This function generates a dynamic class with GraphQL decorators for GraphQL APIs.
 * 
 * @template T - The entity type
 * @param entity - The entity class constructor
 * @param config - Field configuration object
 * @param options - Optional class-level configuration
 * @returns A dynamically generated OrderBy class with GraphQL decorators
 * 
 * @example
 * ```typescript
 * import { createOrderByFields } from '@solid-nestjs/graphql';
 * 
 * const ProductOrderBy = createOrderByFields(Product, {
 *   name: true,
 *   price: true,
 *   createdAt: {
 *     description: "Sort by creation date"
 *   }
 * });
 * 
 * // Use in FindArgs
 * @ArgsType()
 * export class FindProductArgs extends FindArgsFrom({
 *   whereType: ProductWhere,
 *   orderByType: ProductOrderBy
 * }) {}
 * ```
 */
export function createOrderByFields<T>(
  entity: Type<T>,
  config: OrderByFieldsConfig<T>,
  options?: ClassOptions
): Type<OrderBy<T>> {
  // Validate inputs
  if (!entity) {
    throw new Error('Entity class is required');
  }
  if (!config || Object.keys(config).length === 0) {
    throw new Error('Field configuration is required and cannot be empty');
  }
  if (options) {
    validateClassOptions(options);
  }

  // Parse class options
  const classOptions = parseClassOptions(entity.name, 'OrderByFields', options);
  
  // Generate base class
  const BaseClass = generateBaseClass({
    className: classOptions.name,
    metadata: classOptions.metadata
  });

  // Apply class-level decorators
  const classDecorators = [
    InputType(classOptions.name, {
      isAbstract: classOptions.isAbstract,
      description: classOptions.description
    }),
    ...classOptions.decorators
  ];

  for (const decorator of classDecorators) {
    decorator(BaseClass);
  }

  // Add fields dynamically
  for (const [fieldName, fieldConfig] of Object.entries(config) as Array<[string, any]>) {
    try {
      const parsedConfig = parseOrderByConfig(fieldConfig as any);

      // Add property to class
      addPropertyToClass(BaseClass, fieldName, {
        type: String, // OrderByTypes is an enum, use String for reflection
        isOptional: true,
        description: parsedConfig.description,
      });

      // Apply GraphQL decorator
      applyDecoratorToProperty(
        Field(() => OrderByTypes, {
          nullable: true,
          description: parsedConfig.description || `Order by ${fieldName}`
        }),
        BaseClass,
        fieldName
      );

      // Apply validation decorators
      applyDecoratorToProperty(IsOptional(), BaseClass, fieldName);
      applyDecoratorToProperty(IsEnum(OrderByTypes), BaseClass, fieldName);

    } catch (error) {
      throw new Error(`Error processing field '${fieldName}': ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return BaseClass as Type<OrderBy<T>>;
}