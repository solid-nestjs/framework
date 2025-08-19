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
        ...options?.adapters
        // Individual adapters will handle ID-specific logic internally
      }
    };
    
    // Apply the enhanced SolidField decorator
    return SolidField(enhancedOptions)(target, propertyKey);
  };
}