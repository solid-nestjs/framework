import { Type, mixin } from '@nestjs/common';
import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsBoolean } from 'class-validator';
import {
  GroupByArgsFrom as BaseGroupByArgsFrom,
  getGroupByArgsMetadata,
  getGroupByFieldMetadata,
  applyDecoratorToProperty,
  addPropertyToClass,
  generateBaseClass,
  type GroupByArgsFromConfig,
  type ClassOptions
} from '@solid-nestjs/common';

/**
 * Extended configuration for GraphQL GroupByArgsFrom that includes class options
 */
export interface GroupByArgsFromConfigWithOptions extends GroupByArgsFromConfig {
  options?: ClassOptions;
}

/**
 * Creates a GroupByArgsFrom mixin with GraphQL decorators.
 * This function extends the base GroupByArgsFrom functionality to include
 * proper GraphQL decorators.
 * 
 * @template T - The FindArgs type
 * @param config - Configuration with FindArgs type, fields, and optional class options
 * @returns A dynamically generated GroupBy class with GraphQL decorators
 * 
 * @example
 * ```typescript
 * import { GroupByArgsFrom } from '@solid-nestjs/graphql';
 * 
 * @ArgsType()
 * export class FindProductArgs extends FindArgsFrom({
 *   whereType: ProductWhere,
 *   orderByType: ProductOrderBy
 * }) {}
 * 
 * const ProductGroupByFromArgs = GroupByArgsFrom({
 *   findArgsType: FindProductArgs,
 *   groupByFields: ['category', 'supplier', 'status'],
 *   className: 'ProductGroupByFromFindArgs',
 *   options: {
 *     description: 'Group by fields for Product queries'
 *   }
 * });
 * ```
 */
export function GroupByArgsFrom<T>(config: GroupByArgsFromConfigWithOptions): Type<any> {
  // Create base class using common GroupByArgsFrom
  const BaseGroupByClass = BaseGroupByArgsFrom(config);
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
  const classDecorators = [
    InputType(metadata.className, {
      isAbstract: classOptions.isAbstract ?? true,
      description: classOptions.description || metadata.description
    }),
    ...(classOptions.decorators || [])
  ];

  for (const decorator of classDecorators) {
    decorator(EnhancedClass);
  }

  // Add fields with decorators
  config.groupByFields.forEach(fieldName => {
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

  return mixin(EnhancedClass);
}