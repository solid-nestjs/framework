import { Type } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  ValidateNested,
  IsArray,
  IsString,
  IsNumber,
  IsDate,
  IsBoolean,
} from 'class-validator';
import { Type as TransformerType } from 'class-transformer';
import { Where } from '@solid-nestjs/common';
import {
  inferFilterType,
  inferPlainType,
  FilterTypeRegistry,
  parseFieldConfig,
  parseClassOptions,
  validateFieldConfig,
  validateClassOptions,
  generateBaseClass,
  addPropertyToClass,
  applyDecoratorToProperty,
  applyDecoratorToClass,
  shouldTreatAsEnum,
  getEnumInfo,
  type WhereFieldsConfig,
  type ClassOptions
} from '@solid-nestjs/common';
import { 
  StringFilter, 
  NumberFilter, 
  DateFilter 
} from '../../classes/inputs';

// Initialize the filter types for type inference
FilterTypeRegistry.register({
  StringFilter,
  NumberFilter,
  DateFilter
});

/**
 * Creates a WhereFields class for filtering entities with REST API decorators.
 * This function generates a dynamic class with Swagger decorators for REST APIs.
 * 
 * @template T - The entity type
 * @param entity - The entity class constructor
 * @param config - Field configuration object
 * @param options - Optional class-level configuration
 * @returns A dynamically generated Where class with REST decorators
 * 
 * @example
 * ```typescript
 * import { createWhereFields } from '@solid-nestjs/rest-api';
 * 
 * const ProductWhere = createWhereFields(Product, {
 *   name: true,          // Auto-infers StringFilter
 *   price: NumberFilter, // Explicit type
 *   description: {       // Full configuration
 *     type: StringFilter,
 *     description: "Filter by description"
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
export function createWhereFields<T>(
  entity: Type<T>,
  config: WhereFieldsConfig<T>,
  options?: ClassOptions
): Type<Where<T>> {
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
  const classOptions = parseClassOptions(entity.name, 'WhereFields', options);
  
  // Generate base class
  const BaseClass = generateBaseClass({
    className: classOptions.name,
    metadata: classOptions.metadata
  });

  // Add fields dynamically
  for (const [fieldName, fieldConfig] of Object.entries(config) as Array<
    [string, any]
  >) {
    try {
      validateFieldConfig(fieldConfig, fieldName);
      const parsedConfig = parseFieldConfig(fieldConfig as any);

      // Determine if this is a plain field or a filter field
      const isPlainField = parsedConfig.isPlain === true;

      if (isPlainField) {
        // CASE 1: Plain types (String, Number, Date, Boolean)
        const plainType =
          parsedConfig.type || inferPlainType(entity, fieldName);

        // Add property to class
        addPropertyToClass(BaseClass, fieldName, {
          type: plainType,
          isOptional: true,
          description: parsedConfig.description,
          example: parsedConfig.example,
          deprecated: parsedConfig.deprecated,
        });

        // Apply Swagger decorator
        applyDecoratorToProperty(
          ApiProperty({
            type: () => plainType,
            required: false,
            description: parsedConfig.description || `Filter by ${fieldName}`,
            example: parsedConfig.example,
            deprecated: parsedConfig.deprecated,
          }),
          BaseClass,
          fieldName,
        );

        // Apply validation decorators for plain types
        applyDecoratorToProperty(IsOptional(), BaseClass, fieldName);

        if (plainType === String) {
          applyDecoratorToProperty(IsString(), BaseClass, fieldName);
        } else if (plainType === Number) {
          applyDecoratorToProperty(IsNumber(), BaseClass, fieldName);
        } else if (plainType === Date) {
          applyDecoratorToProperty(IsDate(), BaseClass, fieldName);
        } else if (plainType === Boolean) {
          applyDecoratorToProperty(IsBoolean(), BaseClass, fieldName);
        }
      } else {
        // CASE 2: Filter types (StringFilter, NumberFilter, DateFilter) - existing logic
        const filterType = inferFilterType(entity, fieldName, parsedConfig);

        // Check if field should be treated as enum
        const isEnumField = shouldTreatAsEnum(entity, fieldName, parsedConfig);
        let enumObject = parsedConfig.enum;
        let enumInfo;

        if (isEnumField && enumObject) {
          enumInfo = getEnumInfo(enumObject);
        }

        // If a specific type is provided, use it for API decorators, otherwise use the inferred filter type
        const apiType = parsedConfig.type || filterType;

        // Add property to class
        addPropertyToClass(BaseClass, fieldName, {
          type: filterType,
          isOptional: true,
          description: parsedConfig.description,
          example: parsedConfig.example || enumInfo?.example,
          deprecated: parsedConfig.deprecated,
        });

        // Apply Swagger decorator
        const swaggerOptions: any = {
          type: () => apiType,
          required: false,
          description:
            parsedConfig.description ||
            `Filter by ${fieldName}` +
              (enumInfo ? ` (${enumInfo.description})` : ''),
          example: parsedConfig.example || enumInfo?.example,
          deprecated: parsedConfig.deprecated,
        };

        // Add enum information for Swagger if applicable
        if (isEnumField && enumObject) {
          swaggerOptions.enum = enumInfo?.values;
        }

        applyDecoratorToProperty(
          ApiProperty(swaggerOptions),
          BaseClass,
          fieldName,
        );

        // Apply validation decorators for filter types
        applyDecoratorToProperty(IsOptional(), BaseClass, fieldName);
        applyDecoratorToProperty(ValidateNested(), BaseClass, fieldName);
        applyDecoratorToProperty(
          TransformerType(() => filterType),
          BaseClass,
          fieldName,
        );
      }

    } catch (error) {
      throw new Error(`Error processing field '${fieldName}': ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Add logical operators (_and, _or) for complex queries
  addLogicalOperators(BaseClass, classOptions.name);

  return BaseClass as Type<Where<T>>;
}

/**
 * Adds logical operators (_and, _or) to the WhereFields class for complex queries
 * 
 * @param targetClass - The class to add logical operators to
 * @param className - The class name for nested types
 */
function addLogicalOperators(targetClass: Type<any>, className: string): void {
  const logicalOperatorDescription = `Logical conditions for ${className}`;

  // Add _and field (array of same type)
  addPropertyToClass(targetClass, '_and', {
    type: Array,
    isOptional: true,
    description: `AND ${logicalOperatorDescription}`
  });

  // Apply decorators for _and
  applyDecoratorToProperty(
    ApiProperty({
      type: () => [targetClass],
      required: false,
      description: `AND ${logicalOperatorDescription}`,
      example: []
    }),
    targetClass,
    '_and'
  );

  applyDecoratorToProperty(IsOptional(), targetClass, '_and');
  applyDecoratorToProperty(IsArray(), targetClass, '_and');
  applyDecoratorToProperty(ValidateNested(), targetClass, '_and');
  applyDecoratorToProperty(TransformerType(() => targetClass), targetClass, '_and');

  // Add _or field (array of same type)
  addPropertyToClass(targetClass, '_or', {
    type: Array,
    isOptional: true,
    description: `OR ${logicalOperatorDescription}`
  });

  // Apply decorators for _or
  applyDecoratorToProperty(
    ApiProperty({
      type: () => [targetClass],
      required: false,
      description: `OR ${logicalOperatorDescription}`,
      example: []
    }),
    targetClass,
    '_or'
  );

  applyDecoratorToProperty(IsOptional(), targetClass, '_or');
  applyDecoratorToProperty(IsArray(), targetClass, '_or');
  applyDecoratorToProperty(ValidateNested(), targetClass, '_or');
  applyDecoratorToProperty(TransformerType(() => targetClass), targetClass, '_or');
}