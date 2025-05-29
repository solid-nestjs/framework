/**
 * Recursively makes all properties of a type optional, including nested objects, arrays, maps, and sets.
 *
 * - For objects, all properties become optional and are recursively made DeepPartial.
 * - For arrays, the element type is recursively made DeepPartial.
 * - For maps, both keys and values are recursively made DeepPartial.
 * - For sets, the element type is recursively made DeepPartial.
 * - For primitive types, the type itself is returned.
 *
 * @template T The type to make deeply partial.
 */
export type DeepPartial<T> =
  | T
  | (T extends Array<infer U>
      ? DeepPartial<U>[]
      : T extends Map<infer K, infer V>
        ? Map<DeepPartial<K>, DeepPartial<V>>
        : T extends Set<infer M>
          ? Set<DeepPartial<M>>
          : T extends object
            ? {
                [K in keyof T]?: DeepPartial<T[K]>;
              }
            : T);
