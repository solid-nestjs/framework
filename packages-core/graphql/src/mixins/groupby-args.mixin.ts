import { Type } from '@nestjs/common';
import { Field, InputType, ArgsType } from '@nestjs/graphql';
import { IsOptional, IsBoolean, ValidateNested } from 'class-validator';
import { Type as TransformType } from 'class-transformer';
import { AggregateFieldInput } from '../classes/inputs';
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
 * Extended configuration for GraphQL GroupByArgsFrom that includes class options
 */
export interface GroupByArgsFromConfigWithOptions extends Omit<GroupByArgsFromConfig, 'groupByFields'> {
  groupByFields?: string[] | Type<any>;
  groupByFieldsType?: Type<any>;
  options?: ClassOptions & {
    /**
     * Custom name for the GroupBy input type in GraphQL schema
     * @example 'ProductGroupByInput' instead of default 'GroupedProductArgsRequest'
     */
    groupByInputTypeName?: string;
  };
}

/**
 * Creates a GroupByArgsFrom mixin with GraphQL decorators.
 * This function extends the base GroupByArgsFrom functionality to include
 * proper GraphQL decorators.
 * 
 * @template T - The entity type (optional, for type inference)
 * @param config - Configuration with FindArgs type, fields, and optional class options
 * @returns A dynamically generated GroupBy class with GraphQL decorators
 * 
 * @example
 * ```typescript
 * import { GroupByArgsFrom } from '@solid-nestjs/graphql';
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
  
  // If a class type is provided, use static class decoration pattern (like FindArgsFrom)
  if (fieldsType && typeof fieldsType === 'function') {
    // Get the FindArgs class
    const FindArgsClass = config.findArgsType;
    const className = config.options?.name || `${FindArgsClass.name}GroupBy`;
    
    // Use custom GraphQL type name if provided, otherwise use default pattern
    const groupByInputTypeName = config.options?.groupByInputTypeName || `${className}Request`;
    
    // Create a GroupByRequest class using static decoration
    @InputType(groupByInputTypeName, {
      description: 'GroupBy request with fields and aggregates'
    })
    class GroupByRequestClass {
      @Field(() => fieldsType, {
        nullable: true,
        description: 'Fields to group by'
      })
      @IsOptional()
      @ValidateNested()
      @TransformType(() => fieldsType)
      fields?: any;
      
      @Field(() => [AggregateFieldInput], {
        nullable: true,
        description: 'Aggregate functions to apply'
      })
      @IsOptional()
      @ValidateNested({ each: true })
      @TransformType(() => AggregateFieldInput)
      aggregates?: AggregateFieldInput[];
    }
    
    // Create the main GroupByArgs class using static decoration AND ArgsType
    @ArgsType()
    class GroupByArgsClass extends FindArgsClass {
      @Field(() => GroupByRequestClass, {
        description: config.options?.description || 'GroupBy configuration'
      })
      @ValidateNested()
      @TransformType(() => GroupByRequestClass)
      groupBy!: any;
    }
    
    // Set class name
    Object.defineProperty(GroupByArgsClass, 'name', {
      value: className,
      configurable: true
    });
    
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