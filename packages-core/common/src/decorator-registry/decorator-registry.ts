import { DecoratorAdapter, FieldMetadata } from '../interfaces';

export class DecoratorRegistry {
  private static adapters = new Map<string, DecoratorAdapter>();
  private static isDebugMode = process.env.NODE_ENV === 'development' || process.env.SOLID_DEBUG === 'true';

  /**
   * Registers a decorator adapter
   */
  static registerAdapter(name: string, adapter: DecoratorAdapter): void {
    // Prevent duplicate registration
    if (this.adapters.has(name)) {
      if (this.isDebugMode) {
        console.debug(`[SolidNestJS] Adapter '${name}' already registered, skipping`);
      }
      return;
    }

    // Only register if adapter is available
    if (adapter.isAvailable()) {
      this.adapters.set(name, adapter);
      if (this.isDebugMode) {
        console.debug(`[SolidNestJS] Registered adapter: ${name}`);
      }
    } else {
      if (this.isDebugMode) {
        console.debug(`[SolidNestJS] Adapter '${name}' not available, skipping registration`);
      }
    }
  }

  /**
   * Applies decorators from all registered adapters to a property
   */
  static applyDecorators(
    target: any,
    propertyKey: string | symbol,
    metadata: FieldMetadata
  ): void {
    const skipAdapters = metadata.options?.skip || [];

    this.adapters.forEach((adapter, name) => {
      // Skip if adapter is in skip list
      if (skipAdapters.includes(name)) {
        if (this.isDebugMode) {
          console.debug(`[SolidNestJS] Skipping adapter '${name}' for ${target.constructor.name}.${String(propertyKey)}`);
        }
        return;
      }

      try {
        // Apply decorator with adapter-specific options if provided
        const adapterOptions = metadata.options?.adapters?.[name];
        const enhancedMetadata: FieldMetadata = {
          ...metadata,
          adapterOptions
        };

        adapter.apply(target, propertyKey, enhancedMetadata);

        if (this.isDebugMode) {
          console.debug(`[SolidNestJS] Applied adapter '${name}' to ${target.constructor.name}.${String(propertyKey)}`);
        }
      } catch (error) {
        console.error(`[SolidNestJS] Error applying adapter '${name}' to ${target.constructor.name}.${String(propertyKey)}:`, error);
        // Continue with other adapters even if one fails
      }
    });
  }

  /**
   * Applies class-level decorators from all registered adapters
   */
  static applyClassDecorators(
    target: Function,
    type: 'entity' | 'input',
    options: any
  ): void {
    const skipAdapters = options?.skip || [];

    this.adapters.forEach((adapter, name) => {
      // Skip if adapter is in skip list
      if (skipAdapters.includes(name)) {
        if (this.isDebugMode) {
          console.debug(`[SolidNestJS] Skipping class adapter '${name}' for ${target.name}`);
        }
        return;
      }

      try {
        // Apply class decorator if adapter supports it
        if (adapter.applyClassDecorator) {
          adapter.applyClassDecorator(target, type, options);

          if (this.isDebugMode) {
            console.debug(`[SolidNestJS] Applied class adapter '${name}' to ${target.name}`);
          }
        }
      } catch (error) {
        console.error(`[SolidNestJS] Error applying class adapter '${name}' to ${target.name}:`, error);
        // Continue with other adapters even if one fails
      }
    });
  }

  /**
   * Gets a specific adapter by name
   */
  static getAdapter(name: string): DecoratorAdapter | undefined {
    return this.adapters.get(name);
  }

  /**
   * Gets all registered adapter names
   */
  static getRegisteredAdapters(): string[] {
    return Array.from(this.adapters.keys());
  }

  /**
   * Gets all registered adapters
   */
  static getAllAdapters(): Map<string, DecoratorAdapter> {
    return new Map(this.adapters);
  }

  /**
   * Checks if an adapter is registered
   */
  static hasAdapter(name: string): boolean {
    return this.adapters.has(name);
  }

  /**
   * Unregisters an adapter
   */
  static unregisterAdapter(name: string): boolean {
    const removed = this.adapters.delete(name);
    if (removed && this.isDebugMode) {
      console.debug(`[SolidNestJS] Unregistered adapter: ${name}`);
    }
    return removed;
  }

  /**
   * Clears all registered adapters (useful for testing)
   */
  static clearAdapters(): void {
    this.adapters.clear();
    if (this.isDebugMode) {
      console.debug('[SolidNestJS] Cleared all adapters');
    }
  }

  /**
   * Gets statistics about registered adapters
   */
  static getStats(): {
    totalAdapters: number;
    availableAdapters: string[];
    unavailableAdapters: string[];
  } {
    const availableAdapters: string[] = [];
    const unavailableAdapters: string[] = [];

    this.adapters.forEach((adapter, name) => {
      if (adapter.isAvailable()) {
        availableAdapters.push(name);
      } else {
        unavailableAdapters.push(name);
      }
    });

    return {
      totalAdapters: this.adapters.size,
      availableAdapters,
      unavailableAdapters,
    };
  }

  /**
   * Enables or disables debug mode
   */
  static setDebugMode(enabled: boolean): void {
    this.isDebugMode = enabled;
  }
}