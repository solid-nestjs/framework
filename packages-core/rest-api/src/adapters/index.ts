import { DecoratorRegistry } from '@solid-nestjs/common';
import { SwaggerDecoratorAdapter } from './swagger.adapter';

// Auto-register when imported
const adapter = new SwaggerDecoratorAdapter();
if (adapter.isAvailable()) {
  DecoratorRegistry.registerAdapter('swagger', adapter);
}

export { SwaggerDecoratorAdapter };