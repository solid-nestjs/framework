import { Type } from '@nestjs/common';
import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsBoolean, ValidateNested } from 'class-validator';
import { Type as TransformerType } from 'class-transformer';
import { GroupBy } from '@solid-nestjs/common';
import {
  parseGroupByConfig,
  parseClassOptions,
  validateClassOptions,
  generateBaseClass,
  addPropertyToClass,
  applyDecoratorToProperty,
  applyDecoratorToClass,
  type GroupByFieldsConfig,
  type ClassOptions
} from '@solid-nestjs/common';

/**
 * Creates a GroupByFields class for grouping entities with GraphQL decorators.
 * This function generates a dynamic class with GraphQL decorators for GraphQL APIs.
 * 
 * @template T - The entity type
 * @param entity - The entity class constructor
 * @param config - Field configuration object
 * @param options - Optional class-level configuration
 * @returns A dynamically generated GroupBy class with GraphQL decorators
 * 
 * @example
 * ```typescript
 * import { createGroupByFields } from '@solid-nestjs/graphql';
 * 
 * const ProductGroupBy = createGroupByFields(Product, {
 *   category: true,
 *   supplier: true,
 *   status: {
 *     description: "Group by product status"
 *   }
 * });
 * 
 * // Use in FindArgs
 * @ArgsType()
 * export class FindProductArgs extends FindArgsFrom({
 *   whereType: ProductWhere,
 *   orderByType: ProductOrderBy,
 *   groupByType: ProductGroupBy
 * }) {}
 * ```
 */
export function createGroupByFields<T>(
  entity: Type<T>,
  config: GroupByFieldsConfig<T>,
  options?: ClassOptions
): Type<GroupBy<T>> {
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
  const classOptions = parseClassOptions(entity.name, 'GroupByFields', options);
  
  // Generate base class
  const BaseClass = generateBaseClass({
    className: classOptions.name,
    metadata: classOptions.metadata
  });

  // Apply class-level decorators
  const classDecorators: ClassDecorator[] = [
    InputType(classOptions.name, {
      isAbstract: classOptions.isAbstract ?? false,
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
      const parsedConfig = parseGroupByConfig(fieldConfig as any);
      const fieldType = parsedConfig.type || Boolean;

      // Add property to class
      addPropertyToClass(BaseClass, fieldName, {
        type: fieldType,
        isOptional: true,
        description: parsedConfig.description,
      });

      // Apply GraphQL decorator
      applyDecoratorToProperty(
        Field(() => fieldType, {
          nullable: true,
          description: parsedConfig.description || `Group by ${fieldName}`
        }),
        BaseClass,
        fieldName
      );

      // Apply validation decorators
      applyDecoratorToProperty(IsOptional(), BaseClass, fieldName);
      
      // Apply Type decorator for ALL fields for class-transformer to work
      applyDecoratorToProperty(TransformerType(() => fieldType), BaseClass, fieldName);
      
      // Apply appropriate validators based on field type
      if (fieldType === Boolean) {
        // For boolean fields, apply IsBoolean validator
        applyDecoratorToProperty(IsBoolean(), BaseClass, fieldName);
      } else {
        // For nested objects (relations), apply ValidateNested
        applyDecoratorToProperty(ValidateNested(), BaseClass, fieldName);
      }

    } catch (error) {
      throw new Error(`Error processing field '${fieldName}': ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return BaseClass as Type<GroupBy<T>>;
}