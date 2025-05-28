import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';


/**
 * A NestJS pipe that transforms query parameters by attempting to parse string values as JSON.
 * If parsing fails and the value is a numeric string, it converts it to a number.
 * Otherwise, the original value is retained.
 *
 * @implements {PipeTransform}
 *
 * @example
 * // Given a query: ?filter={"name":"John"}&limit="10"
 * // The pipe will transform:
 * // { filter: '{"name":"John"}', limit: "10" }
 * // into:
 * // { filter: { name: "John" }, limit: 10 }
 *
 * @param value - The incoming value to be transformed, typically an object of query parameters.
 * @param metadata - Metadata about the value being transformed.
 * @returns The transformed object with parsed values where possible.
 */
@Injectable()
export class QueryTransformPipe implements PipeTransform {
  
  transform(value: any, metadata: ArgumentMetadata) {
    if (!value) return value;

    const transformed = {};
    
    for (const [key, val] of Object.entries(value)) {
        try {
          transformed[key] = typeof val === 'string' ? JSON.parse(val) : val;
        } catch (e) {
          // Handle numeric strings
        if (typeof val === 'string' && !isNaN(Number(val))) {
            transformed[key] = Number(val);
          } else {
            transformed[key] = val;
          }
        }
    }
    return transformed;
  }
}