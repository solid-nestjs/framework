import { Type, mixin } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
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
 * Extended configuration for REST API GroupByArgsFrom that includes class options
 */
export interface GroupByArgsFromConfigWithOptions extends GroupByArgsFromConfig {
  options?: ClassOptions;
}

/**
 * Creates a GroupByArgsFrom mixin with REST API decorators.
 * This function extends the base GroupByArgsFrom functionality to include
 * proper Swagger decorators for REST APIs.
 * 
 * @template T - The FindArgs type
 * @param config - Configuration with FindArgs type, fields, and optional class options
 * @returns A dynamically generated GroupBy class with REST API decorators
 * 
 * @example
 * ```typescript
 * import { GroupByArgsFrom } from '@solid-nestjs/rest-api';
 * 
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

  // Add fields with decorators
  config.groupByFields.forEach(fieldName => {
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

    // Apply validation decorators
    applyDecoratorToProperty(IsOptional(), EnhancedClass, fieldName);
    applyDecoratorToProperty(IsBoolean(), EnhancedClass, fieldName);
  });

  return mixin(EnhancedClass);
}