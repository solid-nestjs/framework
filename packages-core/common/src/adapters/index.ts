import { DecoratorRegistry } from '../decorator-registry';
import { ValidationDecoratorAdapter } from './validation.adapter';

// Singleton instance to prevent multiple registrations
let validationAdapterInstance: ValidationDecoratorAdapter | null = null;

/**
 * Registers the validation adapter (singleton pattern)
 */
export function registerValidationAdapter(): void {
  if (!validationAdapterInstance) {
    validationAdapterInstance = new ValidationDecoratorAdapter();
    if (validationAdapterInstance.isAvailable()) {
      DecoratorRegistry.registerAdapter('validation', validationAdapterInstance);
    }
  }
}

// Auto-register on import
registerValidationAdapter();

export { ValidationDecoratorAdapter };