import { SolidFieldOptions } from '../interfaces';
import { SolidField } from './solid-field.decorator';

export interface SolidIdOptions extends Omit<SolidFieldOptions, 'isPrimaryKey' | 'required' | 'nullable'> {
  generated?: 'uuid' | 'increment' | boolean;
}

/**
 * Specialized decorator for primary key fields
 */
export function SolidId(options?: SolidIdOptions): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol) {
    // Enhance options with primary key specific settings
    const enhancedOptions: SolidFieldOptions = {
      ...options,
      isPrimaryKey: true,
      unique: true,
      required: true,
      nullable: false,
      generated: options?.generated ?? 'uuid',
      adapters: {
        ...options?.adapters,
        typeorm: {
          primary: true,
          generated: options?.generated ?? 'uuid',
          ...options?.adapters?.typeorm
        },
        graphql: {
          type: 'ID',
          ...options?.adapters?.graphql
        },
        swagger: {
          description: options?.description || 'Unique identifier',
          readOnly: true,
          ...options?.adapters?.swagger
        },
        validation: {
          skip: true, // Primary keys typically don't need validation on input
          ...options?.adapters?.validation
        }
      }
    };
    
    // Apply the enhanced SolidField decorator
    return SolidField(enhancedOptions)(target, propertyKey);
  };
}