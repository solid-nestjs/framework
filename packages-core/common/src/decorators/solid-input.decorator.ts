import { SolidInputOptions, EntityMetadata } from '../interfaces';
import { MetadataStorage } from '../metadata';
import { DecoratorRegistry } from '../decorator-registry';

/**
 * Class decorator for DTOs/Input types (skips database decorators by default)
 */
export function SolidInput(options?: SolidInputOptions): ClassDecorator {
  return function (target: Function) {
    // Default skip list for input types (typically skip database decorators)
    const defaultSkip = options?.defaultSkip || [];
    const skipList = [
      ...defaultSkip,
      ...(options?.skip || [])
    ];
    
    // Remove duplicates
    const uniqueSkipList = [...new Set(skipList)];
    
    const enhancedOptions = {
      ...options,
      skip: uniqueSkipList
    };
    
    // Create entity metadata
    const metadata: EntityMetadata = {
      target,
      options: enhancedOptions,
      type: 'input'
    };
    
    // Store entity metadata
    MetadataStorage.addEntityMetadata(metadata);
    
    // Apply class-level decorators from all registered adapters (excluding skipped ones)
    DecoratorRegistry.applyClassDecorators(target, 'input', enhancedOptions);
  };
}