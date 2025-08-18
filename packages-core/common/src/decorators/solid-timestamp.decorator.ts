import { SolidFieldOptions } from '../interfaces';
import { SolidField } from './solid-field.decorator';

export type TimestampType = 'created' | 'updated' | 'deleted';

export interface SolidTimestampOptions extends Omit<SolidFieldOptions, 'nullable' | 'createdAt' | 'updatedAt' | 'deletedAt'> {
  type?: TimestampType;
}

/**
 * Decorator for timestamp fields (created, updated, deleted)
 */
export function SolidTimestamp(
  type: TimestampType = 'created',
  options?: SolidTimestampOptions
): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol) {
    // Configuration for different timestamp types
    const timestampConfig = {
      created: {
        description: 'Creation timestamp',
        createdAt: true,
        nullable: false,
      },
      updated: {
        description: 'Last update timestamp',
        updatedAt: true,
        nullable: false,
      },
      deleted: {
        description: 'Deletion timestamp (soft delete)',
        deletedAt: true,
        nullable: true,
      }
    };
    
    const config = timestampConfig[type];
    
    const enhancedOptions: SolidFieldOptions = {
      ...options,
      ...config,
      skip: ['validation'], // Timestamps don't need validation
      adapters: {
        ...options?.adapters,
        typeorm: {
          [type + 'At']: true,
          ...options?.adapters?.typeorm
        },
        graphql: {
          type: () => Date,
          ...options?.adapters?.graphql
        },
        swagger: {
          type: 'string',
          format: 'date-time',
          readOnly: true,
          ...options?.adapters?.swagger
        }
      }
    };
    
    return SolidField(enhancedOptions)(target, propertyKey);
  };
}

// Convenience decorators
export const SolidCreatedAt = (options?: Omit<SolidTimestampOptions, 'type'>) => 
  SolidTimestamp('created', options);
  
export const SolidUpdatedAt = (options?: Omit<SolidTimestampOptions, 'type'>) => 
  SolidTimestamp('updated', options);
  
export const SolidDeletedAt = (options?: Omit<SolidTimestampOptions, 'type'>) => 
  SolidTimestamp('deleted', options);