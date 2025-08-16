import { Type } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsEnum, ValidateNested } from 'class-validator';
import { Type as TransformerType } from 'class-transformer';
import { OrderBy, OrderByTypes } from '@solid-nestjs/common';
import {
  parseOrderByConfig,
  parseClassOptions,
  validateClassOptions,
  generateBaseClass,
  addPropertyToClass,
  applyDecoratorToProperty,
  applyDecoratorToClass,
  isRelationType,
  type OrderByFieldsConfig,
  type ClassOptions
} from '@solid-nestjs/common';

/**
 * Creates an OrderByFields class for sorting entities with both REST and GraphQL decorators.
 * This function generates a dynamic class with proper decorators for both Swagger and GraphQL.
 * 
 * @template T - The entity type
 * @param entity - The entity class constructor
 * @param config - Field configuration object
 * @param options - Optional class-level configuration
 * @returns A dynamically generated OrderBy class with REST and GraphQL decorators
 * 
 * @example
 * ```typescript
 * const ProductOrderBy = createOrderByFields(Product, {
 *   name: true,
 *   price: true,
 *   createdAt: {
 *     description: "Sort by creation date"
 *   }
 * });
 * 
 * // Use in FindArgs
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
  const classDecorators: ClassDecorator[] = [
    InputType(classOptions.name, {
      isAbstract: classOptions.isAbstract,
      description: classOptions.description
    }),
    ...classOptions.decorators
  ];

  for (const decorator of classDecorators) {
    applyDecoratorToClass(decorator, BaseClass);
  }

  // Add fields dynamically
  for (const [fieldName, fieldConfig] of Object.entries(config) as Array<[string, any]>) {
    try {
      const parsedConfig = parseOrderByConfig(fieldConfig as any);

      // Check if this is a relation type
      const isRelation = parsedConfig.type && isRelationType(parsedConfig.type);

      if (isRelation) {
        // Handle relation fields
        const relationType = parsedConfig.type!;
        
        // Add property to class
        addPropertyToClass(BaseClass, fieldName, {
          type: relationType,
          isOptional: true,
          description: parsedConfig.description,
        });

        // Apply Swagger decorator
        applyDecoratorToProperty(
          ApiProperty({
            type: () => relationType,
            required: false,
            description: parsedConfig.description || `Order by ${fieldName}`,
          }),
          BaseClass,
          fieldName
        );

        // Apply GraphQL decorator
        applyDecoratorToProperty(
          Field(() => relationType, {
            nullable: true,
            description: parsedConfig.description || `Order by ${fieldName}`
          }),
          BaseClass,
          fieldName
        );

        // Apply validation decorators
        applyDecoratorToProperty(IsOptional(), BaseClass, fieldName);
        applyDecoratorToProperty(ValidateNested(), BaseClass, fieldName);
        applyDecoratorToProperty(TransformerType(() => relationType), BaseClass, fieldName);
      } else {
        // Handle primitive fields (existing logic)
        // Add property to class
        addPropertyToClass(BaseClass, fieldName, {
          type: String, // OrderByTypes is an enum, use String for reflection
          isOptional: true,
          description: parsedConfig.description,
        });

        // Apply Swagger decorator
        applyDecoratorToProperty(
          ApiProperty({
            enum: OrderByTypes,
            required: false,
            description: parsedConfig.description || `Order by ${fieldName}`,
            example: OrderByTypes.ASC
          }),
          BaseClass,
          fieldName
        );

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
      }

    } catch (error) {
      throw new Error(`Error processing field '${fieldName}': ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return BaseClass as Type<OrderBy<T>>;
}