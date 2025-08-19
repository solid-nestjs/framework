import { DecoratorRegistry } from '@solid-nestjs/common';
import { GraphQLDecoratorAdapter } from './graphql.adapter';

// Auto-register when imported
const adapter = new GraphQLDecoratorAdapter();
if (adapter.isAvailable()) {
  DecoratorRegistry.registerAdapter('graphql', adapter);
}

export { GraphQLDecoratorAdapter };