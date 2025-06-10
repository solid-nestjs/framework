# Plugin System Guide

The SOLID NestJS framework features a powerful plugin system that allows you to extend services, controllers, and resolvers with custom functionality. This guide covers everything you need to know about creating and using plugins.

## Table of Contents

- [Overview](#overview)
- [Plugin Architecture](#plugin-architecture)
- [Plugin Types](#plugin-types)
- [Creating Plugins](#creating-plugins)
- [Using Plugins](#using-plugins)
- [Plugin Lifecycle](#plugin-lifecycle)
- [Plugin Examples](#plugin-examples)
- [Best Practices](#best-practices)
- [Advanced Topics](#advanced-topics)

## Overview

The plugin system in SOLID NestJS provides a way to extend the framework's core functionality without modifying the base classes. Plugins can:

- Add new methods and properties to services, controllers, and resolvers
- Modify the configuration and structure during initialization
- Apply decorators and middleware
- Inject additional dependencies
- Extend type definitions for enhanced IntelliSense

### Key Benefits

- **Modularity**: Keep functionality separated and reusable
- **Type Safety**: Full TypeScript support with enhanced type inference
- **Flexibility**: Apply plugins selectively to different components
- **Composability**: Combine multiple plugins for complex functionality
- **Non-invasive**: Extend functionality without modifying core classes

## Quick Start - See It In Action

The best way to understand the plugin system is to see it in action. Check out the **Hello World Plugin Example** in our sample application:

📁 **[Simple Hybrid CRUD App - Plugin Example](../apps-examples/simple-hybrid-crud-app/src/plugins/)**

This example demonstrates:

- **Service Plugin**: [`hello-world.service.plugin.ts`](../apps-examples/simple-hybrid-crud-app/src/plugins/hello-world.service.plugin.ts) - Adds custom methods to services
- **Controller Plugin**: [`hello-world.controller.plugin.ts`](../apps-examples/simple-hybrid-crud-app/src/plugins/hello-world.controller.plugin.ts) - Adds custom REST endpoints
- **Resolver Plugin**: [`hello-world.resolver.plugin.ts`](../apps-examples/simple-hybrid-crud-app/src/plugins/hello-world.resolver.plugin.ts) - Adds custom GraphQL operations
- **Plugin Usage**: [`suppliers.service.ts`](../apps-examples/simple-hybrid-crud-app/src/suppliers/suppliers.service.ts) - Shows how to apply plugins

The example includes a complete working plugin that adds "Hello World" functionality across all layers of the application.

## Plugin Architecture

The plugin system operates in two phases:

### Phase 1: Structure Modification

Plugins can modify the configuration structure before the class is created. This allows:

- Adding route configurations
- Modifying operation settings
- Injecting decorators
- Setting up middleware

### Phase 2: Class Enhancement

Plugins can extend the generated class after creation. This allows:

- Adding new methods and properties
- Modifying existing behavior
- Injecting additional dependencies
- Creating class mixins

```typescript
// Plugin execution flow
Structure Configuration → Plugin Structure Hooks → Class Creation → Plugin Class Hooks → Final Class
```

## Plugin Types

The framework supports three types of plugins:

### Service Plugins

Extend data services and CRUD services with additional functionality.

```typescript
interface ServicePlugin<
  IdType,
  EntityType,
  CreateType,
  UpdateType,
  FindArgsType,
  ContextType,
> {
  // Structure phase hooks
  applyDataServiceStructure?(structure: DataServiceStructure): void;
  applyCrudServiceStructure?(structure: CrudServiceStructure): void;

  // Class phase hooks
  applyDataServiceClass?(
    serviceClass: Constructor,
    structure: any,
  ): Constructor;
  applyCrudServiceClass?(
    serviceClass: Constructor,
    structure: any,
  ): Constructor;
}
```

### Controller Plugins

Extend REST API controllers with additional endpoints and functionality.

```typescript
interface ControllerPlugin<
  IdType,
  EntityType,
  CreateType,
  UpdateType,
  FindArgsType,
  ContextType,
> {
  // Structure phase hooks
  applyDataControllerStructure?(structure: DataControllerStructure): void;
  applyCrudControllerStructure?(structure: CrudControllerStructure): void;

  // Class phase hooks
  applyDataControllerClass?(
    controllerClass: Constructor,
    structure: any,
  ): Constructor;
  applyCrudControllerClass?(
    controllerClass: Constructor,
    structure: any,
  ): Constructor;
}
```

### Resolver Plugins

Extend GraphQL resolvers with additional queries, mutations, and subscriptions.

```typescript
interface ResolverPlugin<
  IdType,
  EntityType,
  CreateType,
  UpdateType,
  FindArgsType,
  ContextType,
> {
  // Structure phase hooks
  applyDataResolverStructure?(structure: DataResolverStructure): void;
  applyCrudResolverStructure?(structure: CrudResolverStructure): void;

  // Class phase hooks
  applyDataResolverClass?(
    resolverClass: Constructor,
    structure: any,
  ): Constructor;
  applyCrudResolverClass?(
    resolverClass: Constructor,
    structure: any,
  ): Constructor;
}
```

## Creating Plugins

### Basic Plugin Structure

```typescript
import { ServicePlugin } from '@solid-nestjs/common';

export function createMyPlugin<T extends Entity>(
  options: MyPluginOptions,
): ServicePlugin<string, T> {
  return {
    // Structure phase - modify configuration
    applyDataServiceStructure(structure) {
      // Add configuration to the service structure
      structure.customOption = options.customValue;
    },

    // Class phase - extend the service class
    applyDataServiceClass(serviceClass, structure) {
      class ExtendedService extends serviceClass {
        // Add new methods
        async customMethod(context: Context, data: any) {
          console.log('Plugin method called');
          return this.customLogic(data);
        }

        private customLogic(data: any) {
          // Plugin-specific logic
          return data;
        }
      }

      return ExtendedService;
    },
  };
}
```

### Plugin with Configuration

```typescript
interface AuditPluginOptions {
  events: ('create' | 'update' | 'delete')[];
  auditService?: string;
}

export function auditPlugin<T extends Entity>(
  options: AuditPluginOptions,
): ServicePlugin<string, T> {
  return {
    applyCrudServiceStructure(structure) {
      // Store plugin options in structure
      structure.auditEvents = options.events;
      structure.auditService = options.auditService || 'AuditService';
    },

    applyCrudServiceClass(serviceClass, structure) {
      class AuditedService extends serviceClass {
        @Inject(structure.auditService)
        private readonly auditService!: AuditService;

        async create(context: Context, input: any) {
          const result = await super.create(context, input);

          if (structure.auditEvents.includes('create')) {
            await this.auditService.log('CREATE', result.id, context.userId);
          }

          return result;
        }

        async update(context: Context, id: string, input: any) {
          const result = await super.update(context, id, input);

          if (structure.auditEvents.includes('update')) {
            await this.auditService.log('UPDATE', id, context.userId);
          }

          return result;
        }
      }

      return AuditedService;
    },
  };
}
```

### Cross-Layer Plugin

Plugins can work across multiple layers (service, controller, resolver):

```typescript
export function createCachingPlugin<T extends Entity>(
  options: CachingOptions,
): {
  service: ServicePlugin<string, T>;
  controller: ControllerPlugin<string, T>;
  resolver: ResolverPlugin<string, T>;
} {
  return {
    service: {
      applyDataServiceStructure(structure) {
        structure.cacheEnabled = true;
        structure.cacheTtl = options.ttl;
      },

      applyDataServiceClass(serviceClass, structure) {
        class CachedService extends serviceClass {
          @Inject('CACHE_MANAGER')
          private readonly cache!: CacheManager;

          async findOne(context: Context, id: string) {
            const cacheKey = `${this.entityName}:${id}`;
            const cached = await this.cache.get(cacheKey);

            if (cached) return cached;

            const result = await super.findOne(context, id);
            await this.cache.set(cacheKey, result, structure.cacheTtl);

            return result;
          }
        }

        return CachedService;
      },
    },

    controller: {
      applyDataControllerStructure(structure) {
        // Add cache headers to operations
        structure.operations.findOne = {
          ...structure.operations?.findOne,
          decorators: [
            ...(structure.operations?.findOne?.decorators || []),
            () => Header('Cache-Control', `max-age=${options.ttl}`),
          ],
        };
      },
    },

    resolver: {
      applyDataResolverStructure(structure) {
        // Similar caching configuration for GraphQL
        structure.enableCaching = true;
      },
    },
  };
}
```

## Using Plugins

### Service Usage

```typescript
// Create service structure with plugins
const userServiceStructure = CrudServiceStructureEx({
  entityType: User,
  createInputType: CreateUserDto,
  updateInputType: UpdateUserDto,
  plugins: [
    auditPlugin({ events: ['create', 'update', 'delete'] }),
    validationPlugin({ strict: true }),
    cachingPlugin.service,
  ],

  // Plugin options are merged and type-safe
  auditEvents: ['create', 'update'], // from auditPlugin
  validationRules: ['email', 'required'], // from validationPlugin
  cacheTtl: 300, // from cachingPlugin
});

// Create service class
export class UserService extends CrudServiceExFrom(userServiceStructure) {
  // Service now has all plugin functionality
}
```

### Controller Usage

```typescript
// Create controller structure with plugins
const userControllerStructure = CrudControllerStructureEx({
  entityType: User,
  serviceType: UserService,
  createInputType: CreateUserDto,
  updateInputType: UpdateUserDto,
  plugins: [
    authPlugin({ requireAuth: true }),
    rateLimitPlugin({ max: 100, windowMs: 60000 }),
    cachingPlugin.controller,
  ],

  // Plugin-specific options
  requireAuth: true,
  rateLimit: { max: 100 },
  cacheHeaders: true,
});

@Controller('users')
export class UserController extends CrudControllerExFrom(
  userControllerStructure,
) {
  // Controller has all plugin functionality
}
```

### Resolver Usage

```typescript
// Create resolver structure with plugins
const userResolverStructure = CrudResolverStructureEx({
  entityType: User,
  serviceType: UserService,
  createInputType: CreateUserInput,
  updateInputType: UpdateUserInput,
  plugins: [
    subscriptionPlugin({ enableRealtime: true }),
    authPlugin({ requireAuth: true }),
    cachingPlugin.resolver,
  ],

  // Plugin options
  enableSubscriptions: true,
  requireAuth: true,
  cacheTtl: 300,
});

@Resolver(() => User)
export class UserResolver extends CrudResolverExFrom(userResolverStructure) {
  // Resolver has all plugin functionality
}
```

## Plugin Lifecycle

### 1. Plugin Registration

Plugins are registered in the structure configuration:

```typescript
const structure = CrudServiceStructureEx({
  // ... base configuration
  plugins: [plugin1, plugin2, plugin3],
});
```

### 2. Structure Phase Execution

Each plugin's structure hooks are called in order:

```typescript
plugins.forEach(plugin => {
  if (plugin.applyDataServiceStructure) {
    plugin.applyDataServiceStructure(structure);
  }
});
```

### 3. Base Class Creation

The base service/controller/resolver class is created using the modified structure.

### 4. Class Phase Execution

Each plugin's class hooks are called in order:

```typescript
let finalClass = baseClass;
plugins.forEach(plugin => {
  if (plugin.applyDataServiceClass) {
    finalClass = plugin.applyDataServiceClass(finalClass, structure);
  }
});
```

### 5. Final Class Return

The enhanced class with all plugin functionality is returned.

## Plugin Examples

### Complete Working Example

For a complete working example of the plugin system in action, see the **Hello World Plugin** in our sample application:

📁 **[Hello World Plugin Example](../apps-examples/simple-hybrid-crud-app/src/plugins/)**

This example includes:

- A service plugin that adds custom greeting methods
- A controller plugin that adds REST endpoints like `/suppliers/say/good-day`
- A resolver plugin that adds GraphQL operations
- Complete type safety and plugin option merging
- Usage across services, controllers, and resolvers

The example is fully functional and demonstrates real-world plugin patterns you can use as a starting point for your own plugins.

### Authentication Plugin

```typescript
interface AuthPluginOptions {
  requireAuth?: boolean;
  roles?: string[];
  guardType?: Type<CanActivate>;
}

export function authPlugin<T extends Entity>(
  options: AuthPluginOptions = {},
): {
  controller: ControllerPlugin<string, T>;
  resolver: ResolverPlugin<string, T>;
} {
  const guardDecorator = options.guardType
    ? () => UseGuards(options.guardType!)
    : () => UseGuards(AuthGuard);

  return {
    controller: {
      applyCrudControllerStructure(structure) {
        if (options.requireAuth) {
          // Add auth guards to all operations
          Object.keys(structure.operations || {}).forEach(key => {
            const operation = structure.operations[key];
            if (operation && typeof operation === 'object') {
              operation.decorators = [
                ...(operation.decorators || []),
                guardDecorator,
              ];
            }
          });
        }
      },
    },

    resolver: {
      applyCrudResolverStructure(structure) {
        if (options.requireAuth) {
          // Add auth guards to GraphQL operations
          ['findMany', 'findById', 'create', 'update', 'remove'].forEach(op => {
            const operation = structure[op];
            if (operation && typeof operation === 'object') {
              operation.decorators = [
                ...(operation.decorators || []),
                guardDecorator,
              ];
            }
          });
        }
      },
    },
  };
}
```

### Validation Plugin

```typescript
interface ValidationPluginOptions {
  strict?: boolean;
  customValidators?: Record<string, any>;
}

export function validationPlugin<T extends Entity>(
  options: ValidationPluginOptions = {},
): ServicePlugin<string, T> {
  return {
    applyCrudServiceStructure(structure) {
      structure.validationEnabled = true;
      structure.strictValidation = options.strict || false;
    },

    applyCrudServiceClass(serviceClass, structure) {
      class ValidatedService extends serviceClass {
        async create(context: Context, input: any) {
          await this.validateInput(input, 'create');
          return super.create(context, input);
        }

        async update(context: Context, id: string, input: any) {
          await this.validateInput(input, 'update');
          return super.update(context, id, input);
        }

        private async validateInput(input: any, operation: string) {
          // Custom validation logic
          if (structure.strictValidation) {
            // Perform strict validation
            await this.performStrictValidation(input);
          }

          // Apply custom validators
          if (options.customValidators) {
            await this.applyCustomValidators(input, operation);
          }
        }

        private async performStrictValidation(input: any) {
          // Implementation
        }

        private async applyCustomValidators(input: any, operation: string) {
          // Implementation
        }
      }

      return ValidatedService;
    },
  };
}
```

### Subscription Plugin (GraphQL)

```typescript
interface SubscriptionPluginOptions {
  enableRealtime?: boolean;
  subscriptionTopics?: string[];
  pubSubToken?: string;
}

export function subscriptionPlugin<T extends Entity>(
  options: SubscriptionPluginOptions = {},
): ResolverPlugin<string, T> {
  return {
    applyCrudResolverStructure(structure) {
      structure.enableSubscriptions = options.enableRealtime;
      structure.subscriptionTopics = options.subscriptionTopics || [];
    },

    applyCrudResolverClass(resolverClass, structure) {
      if (!options.enableRealtime) return resolverClass;

      class SubscriptionResolver extends resolverClass {
        @Inject(options.pubSubToken || 'PUB_SUB')
        private readonly pubSub!: PubSub;

        async create(context: Context, input: any) {
          const result = await super.create(context, input);

          // Publish subscription event
          await this.pubSub.publish(`${this.entityName}_CREATED`, {
            [`${this.entityName}Created`]: result,
          });

          return result;
        }

        @Subscription(() => structure.entityType, {
          name: `${structure.entityType.name.toLowerCase()}Created`,
        })
        entityCreated() {
          return this.pubSub.asyncIterator(`${this.entityName}_CREATED`);
        }

        @Subscription(() => structure.entityType, {
          name: `${structure.entityType.name.toLowerCase()}Updated`,
        })
        entityUpdated() {
          return this.pubSub.asyncIterator(`${this.entityName}_UPDATED`);
        }
      }

      return SubscriptionResolver;
    },
  };
}
```

## Best Practices

### 1. Plugin Design Principles

**Single Responsibility**: Each plugin should have a focused purpose.

```typescript
// Good: Focused caching plugin
export function cachingPlugin(options: CachingOptions) {
  /* ... */
}

// Avoid: Plugin that does too many things
export function everythingPlugin(options: MegaOptions) {
  /* ... */
}
```

**Composability**: Design plugins to work well together.

```typescript
// Good: Plugins that can be combined
const structure = CrudServiceStructureEx({
  // ...
  plugins: [
    auditPlugin({ events: ['create', 'update'] }),
    validationPlugin({ strict: true }),
    cachingPlugin({ ttl: 300 }),
  ],
});
```

**Configuration**: Use type-safe configuration options.

```typescript
interface MyPluginOptions {
  enabled?: boolean;
  timeout?: number;
  callbacks?: {
    onSuccess?: (data: any) => void;
    onError?: (error: Error) => void;
  };
}

export function myPlugin<T extends Entity>(
  options: MyPluginOptions = {},
): ServicePlugin<string, T> {
  // Plugin implementation
}
```

### 2. Type Safety

**Generic Constraints**: Use proper generic constraints for type safety.

```typescript
export function genericPlugin<
  IdType extends IdTypeFrom<EntityType>,
  EntityType extends Entity<unknown>,
>(options: PluginOptions): ServicePlugin<IdType, EntityType> {
  // Type-safe plugin implementation
}
```

**Option Merging**: Use utility types for option merging.

```typescript
// Plugin provides additional options to structure
interface MyPluginAddOns {
  customOption: string;
  advancedConfig?: Record<string, any>;
}

export function myPlugin(): ServicePlugin<string, any, {}, {}, MyPluginAddOns> {
  // Plugin with typed add-ons
}
```

### 3. Error Handling

**Graceful Degradation**: Handle errors gracefully.

```typescript
export function robustPlugin<T extends Entity>(): ServicePlugin<string, T> {
  return {
    applyDataServiceClass(serviceClass, structure) {
      class RobustService extends serviceClass {
        async findOne(context: Context, id: string) {
          try {
            return await super.findOne(context, id);
          } catch (error) {
            // Log error and provide fallback
            console.error('Service error:', error);
            throw new NotFoundException(`Entity with id ${id} not found`);
          }
        }
      }

      return RobustService;
    },
  };
}
```

### 4. Testing

**Unit Testing**: Test plugins in isolation.

```typescript
describe('AuditPlugin', () => {
  let plugin: ServicePlugin<string, TestEntity>;
  let mockStructure: any;

  beforeEach(() => {
    plugin = auditPlugin({ events: ['create', 'update'] });
    mockStructure = { entityType: TestEntity };
  });

  it('should add audit configuration to structure', () => {
    plugin.applyCrudServiceStructure!(mockStructure);

    expect(mockStructure.auditEvents).toEqual(['create', 'update']);
  });

  it('should extend service class with audit functionality', () => {
    const BaseService = class {};
    const ExtendedService = plugin.applyCrudServiceClass!(
      BaseService,
      mockStructure,
    );

    expect(ExtendedService.prototype).toHaveProperty('create');
  });
});
```

**Integration Testing**: Test plugin combinations.

```typescript
describe('Plugin Integration', () => {
  it('should work with multiple plugins', async () => {
    const structure = CrudServiceStructureEx({
      entityType: TestEntity,
      plugins: [
        auditPlugin({ events: ['create'] }),
        validationPlugin({ strict: true }),
        cachingPlugin({ ttl: 300 }),
      ],
    });

    const ServiceClass = CrudServiceExFrom(structure);
    const service = new ServiceClass();

    // Test that all plugin functionality works together
    expect(service).toBeDefined();
    expect(typeof service.create).toBe('function');
  });
});
```

## Advanced Topics

### Custom Plugin Hooks

You can create custom plugin hooks by extending the base plugin interfaces:

```typescript
interface ExtendedServicePlugin<T> extends ServicePlugin<string, T> {
  onEntityCreated?(entity: T): Promise<void>;
  onEntityUpdated?(oldEntity: T, newEntity: T): Promise<void>;
  onEntityDeleted?(entity: T): Promise<void>;
}

export function createExtendedPlugin<
  T extends Entity,
>(): ExtendedServicePlugin<T> {
  return {
    applyCrudServiceClass(serviceClass, structure) {
      class ExtendedService extends serviceClass {
        async create(context: Context, input: any) {
          const result = await super.create(context, input);

          // Call custom hook
          if (this.plugin?.onEntityCreated) {
            await this.plugin.onEntityCreated(result);
          }

          return result;
        }
      }

      return ExtendedService;
    },

    // Custom hooks
    async onEntityCreated(entity: T) {
      console.log('Entity created:', entity);
    },
  };
}
```

### Plugin Factories

Create plugin factories for reusable plugin patterns:

```typescript
interface BasePluginConfig {
  enabled?: boolean;
  debug?: boolean;
}

export function createPluginFactory<TConfig extends BasePluginConfig>(
  pluginName: string,
  defaultConfig: TConfig,
) {
  return function <T extends Entity>(
    config: Partial<TConfig> = {},
  ): ServicePlugin<string, T> {
    const finalConfig = { ...defaultConfig, ...config };

    return {
      applyDataServiceStructure(structure) {
        structure[`${pluginName}Config`] = finalConfig;
        structure[`${pluginName}Enabled`] = finalConfig.enabled;
      },

      applyDataServiceClass(serviceClass, structure) {
        if (!finalConfig.enabled) return serviceClass;

        class FactoryEnhancedService extends serviceClass {
          // Add factory-generated functionality
        }

        return FactoryEnhancedService;
      },
    };
  };
}

// Usage
const myPlugin = createPluginFactory('myFeature', {
  enabled: true,
  debug: false,
  customOption: 'default',
});

const userServiceStructure = CrudServiceStructureEx({
  entityType: User,
  plugins: [myPlugin({ debug: true, customOption: 'custom' })],
});
```

This comprehensive guide should help you understand and effectively use the plugin system in SOLID NestJS. The plugin architecture provides a powerful way to extend functionality while maintaining clean, modular, and type-safe code.
