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
  type ClassOptions,
  type GroupByArgs,
  type FindArgs
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
 * @template T - The entity type (optional, for type inference)
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
export function GroupByArgsFrom<T = any>(config: GroupByArgsFromConfigWithOptions): Type<GroupByArgs<T> & FindArgs<T>> {
  // Determine the fields type to use
  const fieldsType = config.groupByFieldsType || config.groupByFields;
  
  // If a class type is provided, use it to create a proper GroupByRequest structure
  if (fieldsType && typeof fieldsType === 'function') {
    // Get the FindArgs class
    const FindArgsClass = config.findArgsType;
    
    // Create the GroupByArgs class that extends FindArgs and includes the groupBy field
    const className = config.options?.name || `${FindArgsClass.name}GroupBy`;
    
    // First, create a GroupByRequest class that has fields and aggregates
    const GroupByRequestClass = generateBaseClass({
      className: `${className}Request`,
      metadata: {
        className: `${className}Request`,
        description: 'GroupBy request with fields and aggregates',
        fields: []
      }
    });
    
    // Add fields property (using the fieldsType class)
    addPropertyToClass(GroupByRequestClass, 'fields', {
      type: fieldsType,
      isOptional: true,
      description: 'Fields to group by'
    });
    
    // Apply decorators for fields property
    applyDecoratorToProperty(
      ApiProperty({
        type: fieldsType,
        required: false,
        description: 'Fields to group by'
      }),
      GroupByRequestClass,
      'fields'
    );
    
    applyDecoratorToProperty(
      Field(() => fieldsType, {
        nullable: true,
        description: 'Fields to group by'
      }),
      GroupByRequestClass,
      'fields'
    );
    
    applyDecoratorToProperty(IsOptional(), GroupByRequestClass, 'fields');
    applyDecoratorToProperty(ValidateNested(), GroupByRequestClass, 'fields');
    applyDecoratorToProperty(TransformType(() => fieldsType), GroupByRequestClass, 'fields');
    
    // Add aggregates property (array of aggregate functions)
    addPropertyToClass(GroupByRequestClass, 'aggregates', {
      type: Array,
      isOptional: true,
      description: 'Aggregate functions to apply'
    });
    
    // Apply decorators for aggregates property
    applyDecoratorToProperty(
      ApiProperty({
        type: [Object],
        required: false,
        description: 'Aggregate functions to apply',
        example: [{ field: 'price', function: 'AVG', alias: 'avgPrice' }]
      }),
      GroupByRequestClass,
      'aggregates'
    );
    
    applyDecoratorToProperty(
      Field(() => [Object], {
        nullable: true,
        description: 'Aggregate functions to apply'
      }),
      GroupByRequestClass,
      'aggregates'
    );
    
    applyDecoratorToProperty(IsOptional(), GroupByRequestClass, 'aggregates');
    
    // Apply class-level InputType decorator to GroupByRequest
    applyDecoratorToClass(
      InputType(`${className}Request`, {
        description: 'GroupBy request with fields and aggregates'
      }),
      GroupByRequestClass
    );
    
    // Now create the main GroupByArgs class that extends FindArgs
    const GroupByArgsClass = class extends FindArgsClass {
      groupBy!: any;
    };
    
    // Set class name
    Object.defineProperty(GroupByArgsClass, 'name', {
      value: className,
      configurable: true
    });
    
    // Add the groupBy property with the GroupByRequest type
    addPropertyToClass(GroupByArgsClass, 'groupBy', {
      type: GroupByRequestClass,
      isOptional: false,
      description: config.options?.description || 'GroupBy configuration'
    });
    
    // Apply Swagger decorator
    applyDecoratorToProperty(
      ApiProperty({
        type: GroupByRequestClass,
        required: true,
        description: config.options?.description || 'GroupBy configuration'
      }),
      GroupByArgsClass,
      'groupBy'
    );
    
    // Apply GraphQL decorator
    applyDecoratorToProperty(
      Field(() => GroupByRequestClass, {
        description: config.options?.description || 'GroupBy configuration'
      }),
      GroupByArgsClass,
      'groupBy'
    );
    
    // Apply validation decorators
    applyDecoratorToProperty(ValidateNested(), GroupByArgsClass, 'groupBy');
    applyDecoratorToProperty(TransformType(() => GroupByRequestClass), GroupByArgsClass, 'groupBy');
    
    return GroupByArgsClass as Type<GroupByArgs<T> & FindArgs<T>>;
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

  return EnhancedClass as Type<GroupByArgs<T> & FindArgs<T>>;
}