import { SolidEntityOptions, EntityMetadata } from '../interfaces';
import { MetadataStorage } from '../metadata';
import { DecoratorRegistry } from '../decorator-registry';

/**
 * Class decorator for entities with automatic database and API mappings
 */
export function SolidEntity(options?: SolidEntityOptions): ClassDecorator {
  return function (target: Function) {
    // Create entity metadata
    const metadata: EntityMetadata = {
      target,
      options: options || {},
      type: 'entity'
    };
    
    // Store entity metadata
    MetadataStorage.addEntityMetadata(metadata);
    
    // Apply class-level decorators from all registered adapters
    DecoratorRegistry.applyClassDecorators(target, 'entity', options || {});
  };
}