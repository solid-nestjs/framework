import { Type } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsBoolean, ValidateNested } from 'class-validator';
import { Type as TransformType } from 'class-transformer';
import {
  GroupByArgsFrom as BaseGroupByArgsFrom,
  getGroupByArgsMetadata,
  getGroupByFieldMetadata,
  applyDecoratorToProperty,
  applyDecoratorToClass,
  addPropertyToClass,
  generateBaseClass,
  type GroupByArgsFromConfig,
  type ClassOptions
} from '@solid-nestjs/common';

/**
 * Extended configuration for REST-GraphQL GroupByArgsFrom that includes class options
 */
export interface GroupByArgsFromConfigWithOptions extends Omit<GroupByArgsFromConfig, 'groupByFields'> {
  groupByFields?: string[] | Type<any>;
  groupByFieldsType?: Type<any>;
  options?: ClassOptions;
}

/**
 * Creates a GroupByArgsFrom mixin with both REST and GraphQL decorators.
 * This function extends the base GroupByArgsFrom functionality to include
 * proper decorators for both Swagger and GraphQL.
 * 
 * @template T - The FindArgs type
 * @param config - Configuration with FindArgs type, fields, and optional class options
 * @returns A dynamically generated GroupBy class with REST and GraphQL decorators
 * 
 * @example
 * ```typescript
 * import { GroupByArgsFrom } from '@solid-nestjs/rest-graphql';
 * 
 * export class FindProductArgs extends FindArgsFrom({
 *   whereType: ProductWhere,
 *   orderByType: ProductOrderBy
 * }) {}
 * 
 * // Using field names
 * const ProductGroupByFromArgs = GroupByArgsFrom({
 *   findArgsType: FindProductArgs,
 *   groupByFields: ['category', 'supplier', 'status'],
 *   className: 'ProductGroupByFromFindArgs',
 *   options: {
 *     description: 'Group by fields for Product queries'
 *   }
 * });
 * 
 * // Using generated fields class
 * const ProductGroupByFields = createGroupByFields(Product, {...});
 * const ProductGroupByFromArgs = GroupByArgsFrom({
 *   findArgsType: FindProductArgs,
 *   groupByFieldsType: ProductGroupByFields,
 *   options: {
 *     description: 'Group by fields for Product queries'
 *   }
 * });
 * ```
 */
export function GroupByArgsFrom<T>(config: GroupByArgsFromConfigWithOptions): Type<any> {
  // Determine the fields type to use
  const fieldsType = config.groupByFieldsType || config.groupByFields;
  
  // If a class type is provided, use it directly
  if (fieldsType && typeof fieldsType === 'function') {
    // Get the FindArgs class
    const FindArgsClass = config.findArgsType;
    
    // Create the GroupByArgs class that extends FindArgs and includes the groupBy field
    const className = config.options?.name || `${FindArgsClass.name}GroupBy`;
    
    // Create dynamic class that extends FindArgs
    const GroupByArgsClass = class extends FindArgsClass {
      groupBy!: any;
    };
    
    // Set class name
    Object.defineProperty(GroupByArgsClass, 'name', {
      value: className,
      configurable: true
    });
    
    // Add the groupBy property with the fields type
    addPropertyToClass(GroupByArgsClass, 'groupBy', {
      type: fieldsType,
      isOptional: false,
      description: config.options?.description || 'GroupBy configuration'
    });
    
    // Apply Swagger decorator
    applyDecoratorToProperty(
      ApiProperty({
        type: fieldsType,
        required: true,
        description: config.options?.description || 'GroupBy configuration'
      }),
      GroupByArgsClass,
      'groupBy'
    );
    
    // Apply GraphQL decorator
    applyDecoratorToProperty(
      Field(() => fieldsType, {
        description: config.options?.description || 'GroupBy configuration'
      }),
      GroupByArgsClass,
      'groupBy'
    );
    
    // Apply validation decorators
    applyDecoratorToProperty(ValidateNested(), GroupByArgsClass, 'groupBy');
    applyDecoratorToProperty(TransformType(() => fieldsType), GroupByArgsClass, 'groupBy');
    
    return GroupByArgsClass;
  }
  
  // Fall back to original implementation for string array
  const baseConfig = {
    ...config,
    groupByFields: config.groupByFields as string[]
  };
  
  // Create base class using common GroupByArgsFrom
  const BaseGroupByClass = BaseGroupByArgsFrom(baseConfig);
  const metadata = getGroupByArgsMetadata(BaseGroupByClass);
  
  if (!metadata) {
    throw new Error('Failed to extract metadata from base GroupBy class');
  }

  // Generate enhanced class with decorators
  const EnhancedClass = generateBaseClass({
    className: metadata.className,
    metadata: metadata
  });

  // Apply class-level decorators
  const classOptions = config.options || {};
  const classDecorators: ClassDecorator[] = [
    InputType(metadata.className, {
      isAbstract: classOptions.isAbstract ?? true,
      description: classOptions.description || metadata.description
    }),
    ...(classOptions.decorators || [])
  ];

  for (const decorator of classDecorators) {
    applyDecoratorToClass(decorator, EnhancedClass);
  }

  // Add fields with decorators
  (config.groupByFields as string[]).forEach(fieldName => {
    const fieldMetadata = getGroupByFieldMetadata(BaseGroupByClass, fieldName);
    
    // Add property to class
    addPropertyToClass(EnhancedClass, fieldName, {
      type: Boolean,
      isOptional: true,
      description: fieldMetadata?.description,
    });

    // Apply Swagger decorator
    applyDecoratorToProperty(
      ApiProperty({
        type: Boolean,
        required: false,
        description: fieldMetadata?.description || `Group by ${fieldName}`,
        example: true
      }),
      EnhancedClass,
      fieldName
    );

    // Apply GraphQL decorator
    applyDecoratorToProperty(
      Field(() => Boolean, {
        nullable: true,
        description: fieldMetadata?.description || `Group by ${fieldName}`
      }),
      EnhancedClass,
      fieldName
    );

    // Apply validation decorators
    applyDecoratorToProperty(IsOptional(), EnhancedClass, fieldName);
    applyDecoratorToProperty(IsBoolean(), EnhancedClass, fieldName);
  });

  return EnhancedClass;
}