import { DecoratorRegistry } from '@solid-nestjs/common';
import { TypeOrmDecoratorAdapter } from './typeorm.adapter';

// Auto-register when imported
const adapter = new TypeOrmDecoratorAdapter();
if (adapter.isAvailable()) {
  DecoratorRegistry.registerAdapter('typeorm', adapter);
}

export { TypeOrmDecoratorAdapter };