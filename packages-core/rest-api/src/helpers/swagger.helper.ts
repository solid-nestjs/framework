import { SwaggerUiOptions } from '@nestjs/swagger/dist/interfaces/swagger-ui-options.interface';

/**
 * Recommended Swagger UI options for API documentation.
 *
 * @remarks
 * - `tagsSorter`: Sorts tags alphabetically in the Swagger UI.
 * - `operationsSorter`: Custom function to sort API operations by HTTP method order:
 *   GET, POST, PUT, PATCH, DELETE. Within each method, empty routes are shown first,
 *   followed by other routes in alphabetical order.
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
    var order = { get: '0', post: '1', put: '2', patch: '3', delete: '4' };
    var aMethod = a.get('method');
    var bMethod = b.get('method');
    var aOrder = order[aMethod] || '5';
    var bOrder = order[bMethod] || '5';

    // First, sort by HTTP method
    var methodComparison = aOrder.localeCompare(bOrder);
    if (methodComparison !== 0) {
      return methodComparison;
    }

    // If methods are the same, sort by path
    var aPath = a.get('path') || '';
    var bPath = b.get('path') || '';

    // Empty routes come first
    if (aPath === '' && bPath !== '') return -1;
    if (aPath !== '' && bPath === '') return 1;

    // Both empty or both non-empty, sort alphabetically
    return aPath.localeCompare(bPath);
  },
};
