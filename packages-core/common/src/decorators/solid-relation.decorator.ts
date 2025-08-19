import { SolidFieldOptions } from '../interfaces';
import { SolidField } from './solid-field.decorator';
import { RelationAdapterRegistry } from '../registry';

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
        // Generate adapter options for all registered adapters
        ...RelationAdapterRegistry.getRegisteredAdapters().reduce((acc, adapterName) => {
          acc[adapterName] = {
            ...RelationAdapterRegistry.getAdapterOptions(adapterName, type, targetFn, inverseSide, options),
            ...restOptions.adapters?.[adapterName]
          };
          return acc;
        }, {} as any)
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