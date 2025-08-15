import { OrderByTypes } from '../enums';
import {
  StringFilter,
  NumberFilter,
  DateFilter,
} from './../interfaces/inputs/filters.interfaces';

/**
 * Represents a flexible filter type for a given field type `T` in query operations.
 *
 * - For `string` fields, allows a string, an array of strings, or a `StringFilter` object.
 * - For `number` fields, allows a number, an array of numbers, or a `NumberFilter` object.
 * - For `Date` fields, allows a `Date`, an array of `Date`s, or a `DateFilter` object.
 * - For `boolean` fields, allows a boolean value.
 * - For array fields (e.g., `InvoiceDetail[]`), extracts the element type and applies `Where<ElementType>`.
 * - For all other types, recursively applies the `Where<T>` type.
 *
 * This utility type is typically used to define the shape of "where" filter arguments in query builders or ORM-like APIs.
 *
 * @template T - The type of the field to generate a filter for.
 */
type WhereField<T> = T extends string
  ? string | string[] | StringFilter
  : T extends number
    ? number | number[] | NumberFilter
    : T extends Date
      ? Date | Date[] | DateFilter
      : T extends boolean
        ? boolean
        : T extends (infer U)[]
          ? Where<U>  // For arrays, extract element type and apply Where to it
          : Where<T>;

/**
 * Represents a flexible filter type for querying objects of type `T`.
 *
 * - Each property of `T` can be filtered using a corresponding `WhereField`.
 * - Supports logical composition with `_and` and `_or` operators, allowing for nested and/or conditions.
 *
 * @template T The type of the object to filter.
 * @property {WhereField<T[K]>} [K] Optional filter for each property of `T`.
 * @property {Where<T> | Where<T>[]} [_and] Optional logical AND composition of filters.
 * @property {Where<T> | Where<T>[]} [_or] Optional logical OR composition of filters.
 */
export type Where<T> = {
  [K in keyof T]?: WhereField<T[K]>;
} & {
  _and?: Where<T> | Where<T>[];
  _or?: Where<T> | Where<T>[];
};

/**
 * Infers the appropriate ordering type for a given field type `T`.
 *
 * - If `T` is a `string`, the type is `OrderByTypes`.
 * - If `T` is a `number`, the type is `OrderByTypes`.
 * - If `T` is a `Date`, the type is `OrderByTypes`.
 * - If `T` is a `boolean`, the type is `OrderByTypes`.
 * - For array fields (e.g., `InvoiceDetail[]`), extracts the element type and applies `OrderBy<ElementType>`.
 * - Otherwise, falls back to `OrderBy<T>`, allowing for nested ordering.
 *
 * @template T - The type of the field to determine the order-by type for.
 */
type OrderByField<T> = T extends string
  ? OrderByTypes
  : T extends number
    ? OrderByTypes
    : T extends Date
      ? OrderByTypes
      : T extends boolean
        ? OrderByTypes
        : T extends (infer U)[]
          ? OrderBy<U>  // For arrays, extract element type and apply OrderBy to it
          : OrderBy<T>;

/**
 * Represents an object for specifying sorting order for each property of type `T`.
 * Each key of `T` can be optionally assigned an `OrderByField` value to indicate the sort direction.
 *
 * @template T - The type whose properties can be used for ordering.
 */
export type OrderBy<T> = {
  [K in keyof T]?: OrderByField<T[K]>;
};
