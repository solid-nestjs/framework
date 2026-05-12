# Plugin System

SOLID NestJS ships with a plugin architecture to extend services, controllers, and resolvers without modifying framework source. Plugins hook into two phases: **structure modification** (before class creation) and **class enhancement** (after class creation).

## Architecture Overview

```
Structure Config → Plugin Structure Hooks → Class Creation → Plugin Class Hooks → Final Class
```

Three plugin variants exist:

| Package | Plugin Interface | Export from |
|---|---|---|
| `@solid-nestjs/common` | `ServicePlugin` | `@solid-nestjs/common` |
| `@solid-nestjs/rest-api` | `ControllerPlugin` | `@solid-nestjs/rest-api` |
| `@solid-nestjs/graphql` | `ResolverPlugin` | `@solid-nestjs/graphql` |

## ServicePlugin Interface

```typescript
interface ServicePlugin<
  IdType, EntityType, CreateInputType, UpdateInputType,
  FindArgsType, ContextType,
  TDataOptions, TCrudOptions, TDataAddOns, TCrudAddOns,
> {
  applyDataServiceStructure?(structure: DataServiceStructure & TDataOptions): void;
  applyCrudServiceStructure?(structure: CrudServiceStructure & TDataOptions & TCrudOptions): void;
  applyDataServiceClass?(serviceClass: Constructable<DataService>, structure: DataServiceStructure & TDataOptions): Type<DataService & TDataAddOns>;
  applyCrudServiceClass?(serviceClass: Constructable<CrudService>, structure: CrudServiceStructure & TDataOptions & TCrudOptions): Type<CrudService & TDataAddOns & TCrudAddOns>;
}
```

The generic parameters `TDataOptions`, `TCrudOptions`, `TDataAddOns`, `TCrudAddOns` carry type information through the plugin chain for full TypeScript inference.

### ControllerPlugin (rest-api)

```typescript
interface ControllerPlugin<IdType, EntityType, ...> {
  applyDataControllerStructure?(structure: DataControllerStructure & TDataOptions): void;
  applyCrudControllerStructure?(structure: CrudControllerStructure & TDataOptions & TCrudOptions): void;
  applyDataControllerClass?(ctrlClass, structure): Type<DataController & TDataAddOns>;
  applyCrudControllerClass?(ctrlClass, structure): Type<CrudController & TDataAddOns & TCrudAddOns>;
}
```

### ResolverPlugin (graphql)

```typescript
interface ResolverPlugin<IdType, EntityType, ...> {
  applyDataResolverStructure?(structure: DataResolverStructure & TDataOptions): void;
  applyCrudResolverStructure?(structure: CrudResolverStructure & TDataOptions & TCrudOptions): void;
  applyDataResolverClass?(resolverClass, structure): Type<DataResolver & TDataAddOns>;
  applyCrudResolverClass?(resolverClass, structure): Type<CrudResolver & TDataAddOns & TCrudAddOns>;
}
```

## Plugin Lifecycle

1. **Registration** — Plugins are passed to the extended structure builder (e.g. `CrudServiceStructureEx`).
2. **Structure Phase** — Each plugin's structure hooks fire in registration order, modifying config.
3. **Base Class Creation** — The mixin factory creates the base class from the (potentially modified) structure.
4. **Class Phase** — Each plugin's class hooks fire in order, each receiving the previous step's class and returning a further-extended class.
5. **Final Class Return** — The fully composed class is returned.

## Utility Types

| Type | Purpose |
|---|---|
| `ExtractDataAddOnsFromServicePluginArray<P[]>` | Merged methods/properties for data service |
| `ExtractCrudAddOnsFromServicePluginArray<P[]>` | Merged methods/properties for CRUD service |
| `ExtractDataOptionsFromServicePluginArray<P[]>` | Merged structure options for data service |
| `ExtractCrudOptionsFromServicePluginArray<P[]>` | Merged structure options for CRUD service |
| `ExtractAddOnsFromServicePluginArray<P[]>` | All add-ons combined |
| `ExtractOptionsFromServicePluginArray<P[]>` | All options combined |

Analogous `Extract*FromControllerPluginArray` and `Extract*FromResolverPluginArray` types exist in their respective packages.

## Example: Logging Plugin

```typescript
import { ServicePlugin } from '@solid-nestjs/common';

interface LogOptions { level?: 'info' | 'debug'; }

export function loggingPlugin<T extends Entity<unknown>>(
  opts: LogOptions = {},
): ServicePlugin<string, T, any, any, any, any, LogOptions, LogOptions> {
  return {
    applyDataServiceStructure(structure) {
      structure.logLevel = opts.level ?? 'info';
    },
    applyCrudServiceStructure(structure) {
      structure.logLevel = opts.level ?? 'info';
    },
    applyDataServiceClass(serviceClass) {
      class LoggedService extends serviceClass {
        async findAll(context: any, args: any) {
          console.log(`[DATA] findAll called`);
          return super.findAll(context, args);
        }
      }
      return LoggedService;
    },
    applyCrudServiceClass(serviceClass) {
      class LoggedCrudService extends serviceClass {
        async create(context: any, input: any) {
          console.log(`[CRUD] create called`);
          const result = await super.create(context, input);
          console.log(`[CRUD] created ${(result as any).id}`);
          return result;
        }
      }
      return LoggedCrudService;
    },
  };
}
```

## Using Extended Structures with Plugins

Plugins are consumed via the `Ex` variants of structure builders and mixins:

```typescript
// @solid-nestjs/typeorm
import { CrudServiceStructureEx, CrudServiceExFrom } from '@solid-nestjs/typeorm';

const structure = CrudServiceStructureEx({
  entityType: Product,
  createInputType: CreateProductDto,
  updateInputType: UpdateProductDto,
  findArgsType: FindProductArgs,
  plugins: [loggingPlugin({ level: 'debug' })],
});

export class ProductsService extends CrudServiceExFrom(structure) {}
```

Same pattern for controllers (`CrudControllerStructureEx`, `CrudControllerExFrom`) and resolvers (`CrudResolverStructureEx`, `CrudResolverExFrom`).

## Cross-Layer Plugins

A single factory can return plugins for multiple layers:

```typescript
function cachingPlugin() {
  return {
    service: { /* ServicePlugin */ },
    controller: { /* ControllerPlugin */ },
    resolver: { /* ResolverPlugin */ },
  };
}
```

## Best Practices

1. **Single responsibility** — One focused concern per plugin (logging, caching, auth).
2. **Composability** — Design plugins to stack: `plugins: [auditPlugin(), validationPlugin(), cachingPlugin()]`.
3. **Type safety** — Use the generic slots `TDataAddOns`, `TCrudAddOns`, `TDataOptions`, `TCrudOptions` so TypeScript tracks added methods and options.
4. **Graceful degradation** — Wrap risky logic in try/catch; don't let a plugin break the entire service.
5. **Test in isolation** — Unit-test structure hooks and class hooks separately.
6. **Order matters** — The last plugin in the array gets the final say in class extension.
