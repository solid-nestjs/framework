import { Transform } from 'class-transformer';

/**
 * Property decorator that transforms a JSON string property into its parsed object form
 * when deserializing (i.e., converting plain objects to class instances).
 *
 * If the property value is a valid JSON string, it will be parsed using `JSON.parse`.
 * If parsing fails, the original value is returned.
 *
 * @returns A property decorator to be used with class-transformer.
 *
 * @example
 * ```typescript
 * class ExampleDto {
 *   @TransformFromJson()
 *   public data: any;
 * }
 * ```
 */
export const TransformFromJson = () =>
  Transform(
    ({ value }) => {
      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    },
    { toClassOnly: true },
  );
