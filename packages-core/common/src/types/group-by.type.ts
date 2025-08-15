/**
 * Infers the appropriate grouping type for a given field type `T`.
 *
 * - If `T` is a `string`, the type is `boolean` (can be grouped).
 * - If `T` is a `number`, the type is `boolean` (can be grouped).
 * - If `T` is a `Date`, the type is `boolean` (can be grouped).
 * - If `T` is a `boolean`, the type is `boolean` (can be grouped).
 * - For array fields (e.g., `InvoiceDetail[]`), extracts the element type and applies `GroupBy<ElementType>`.
 * - Otherwise, falls back to `GroupBy<T>`, allowing for nested grouping.
 *
 * @template T - The type of the field to determine the group-by type for.
 */
type GroupByField<T> = T extends string
  ? boolean
  : T extends number
    ? boolean
    : T extends Date
      ? boolean
      : T extends boolean
        ? boolean
        : T extends (infer U)[]
          ? GroupBy<U>  // For arrays, extract element type and apply GroupBy to it
          : GroupBy<T>;

/**
 * Represents an object for specifying grouping fields for each property of type `T`.
 * Each key of `T` can be optionally assigned a `GroupByField` value to indicate if it should be grouped.
 *
 * @template T - The type whose properties can be used for grouping.
 * 
 * @example
 * ```typescript
 * interface Product {
 *   id: number;
 *   name: string;
 *   category: string;
 *   supplier: Supplier;
 * }
 * 
 * const groupBy: GroupBy<Product> = {
 *   category: true,
 *   supplier: {
 *     name: true
 *   }
 * };
 * ```
 */
export type GroupBy<T> = {
  [K in keyof T]?: GroupByField<T[K]>;
};