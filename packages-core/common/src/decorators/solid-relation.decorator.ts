import { SolidFieldOptions } from '../interfaces';
import { SolidField } from './solid-field.decorator';

export type RelationType = 'one-to-many' | 'many-to-one' | 'one-to-one' | 'many-to-many';

export interface SolidRelationOptions extends Omit<SolidFieldOptions, 'relation' | 'target' | 'inverseSide'> {
  type: RelationType;
  target: () => Function; // Target entity class
  inverseSide?: string | ((object: any) => any); // Inverse side property or function
  onDelete?: 'RESTRICT' | 'CASCADE' | 'SET NULL';
  onUpdate?: 'RESTRICT' | 'CASCADE' | 'SET NULL';
  orphanedRowAction?: 'nullify' | 'delete' | 'soft-delete' | 'disable';
}

/**
 * Decorator for entity relations with automatic TypeORM, GraphQL, and REST API mappings
 */
export function SolidRelation(options: SolidRelationOptions): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol) {
    const { type, target: targetFn, inverseSide, ...restOptions } = options;
    
    // Build enhanced options for SolidField
    const enhancedOptions: SolidFieldOptions = {
      ...restOptions,
      relation: type,
      target: targetFn,
      inverseSide: typeof inverseSide === 'string' ? 
        (obj: any) => obj[inverseSide] : 
        inverseSide,
      adapters: {
        ...restOptions.adapters,
        typeorm: {
          relation: type,
          target: targetFn,
          inverseSide,
          cascade: options.cascade,
          eager: options.eager,
          lazy: options.lazy,
          onDelete: options.onDelete,
          onUpdate: options.onUpdate,
          orphanedRowAction: options.orphanedRowAction,
          ...restOptions.adapters?.typeorm
        },
        graphql: {
          type: type === 'one-to-many' || type === 'many-to-many' ? [targetFn] : targetFn,
          nullable: type === 'one-to-many' || type === 'many-to-many' ? true : options.nullable,
          ...restOptions.adapters?.graphql
        },
        swagger: {
          type: () => {
            const targetClass = targetFn();
            // For array relations, return array type
            if (type === 'one-to-many' || type === 'many-to-many') {
              return [targetClass];
            }
            // For single relations, return single type
            return targetClass;
          },
          description: options.description || `Related ${targetFn().name} entities`,
          ...restOptions.adapters?.swagger
        }
      }
    };
    
    // Apply the enhanced SolidField decorator
    return SolidField(enhancedOptions)(target, propertyKey);
  };
}

// Convenience decorators for specific relation types
export const SolidOneToMany = (
  target: () => Function, 
  inverseSide: string | ((object: any) => any),
  options?: Omit<SolidRelationOptions, 'type' | 'target' | 'inverseSide'>
) => 
  SolidRelation({ 
    ...options, 
    type: 'one-to-many', 
    target, 
    inverseSide 
  });

export const SolidManyToOne = (
  target: () => Function, 
  inverseSide?: string | ((object: any) => any),
  options?: Omit<SolidRelationOptions, 'type' | 'target' | 'inverseSide'>
) => 
  SolidRelation({ 
    ...options, 
    type: 'many-to-one', 
    target, 
    inverseSide 
  });

export const SolidOneToOne = (
  target: () => Function, 
  inverseSide?: string | ((object: any) => any),
  options?: Omit<SolidRelationOptions, 'type' | 'target' | 'inverseSide'>
) => 
  SolidRelation({ 
    ...options, 
    type: 'one-to-one', 
    target, 
    inverseSide 
  });

export const SolidManyToMany = (
  target: () => Function, 
  inverseSide?: string | ((object: any) => any),
  options?: Omit<SolidRelationOptions, 'type' | 'target' | 'inverseSide'>
) => 
  SolidRelation({ 
    ...options, 
    type: 'many-to-many', 
    target, 
    inverseSide 
  });