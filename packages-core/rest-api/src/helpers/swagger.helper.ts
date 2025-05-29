import { SwaggerUiOptions } from '@nestjs/swagger/dist/interfaces/swagger-ui-options.interface';

/**
 * Recommended Swagger UI options for API documentation.
 *
 * @remarks
 * - `tagsSorter`: Sorts tags alphabetically in the Swagger UI.
 * - `operationsSorter`: Custom function to sort API operations by HTTP method order:
 *   GET, POST, PUT, DELETE.
 *
 * @example
 * // Use with SwaggerModule.setup in NestJS
 * SwaggerModule.setup('api', app, document, swaggerRecomenedOptions);
 *
 * @see {@link https://swagger.io/docs/open-source-tools/swagger-ui/usage/configuration/}
 */
export const swaggerRecomenedOptions: SwaggerUiOptions = {
  tagsSorter: 'alpha',
  operationsSorter: function (a, b) {
    var order = { get: '0', post: '1', put: '2', delete: '3' };
    return order[a.get('method')].localeCompare(order[b.get('method')]);
  },
};
