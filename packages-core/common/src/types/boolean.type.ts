/**
 * Represents a boolean type, restricted to `true` or `false`.
 */
export type BooleanType = true | false;

/**
 * Conditionally makes a type nullable based on a boolean type.
 *
 * @typeParam TBool - A boolean type (`true` or `false`). Defaults to `false`.
 * @typeParam TType - The type to conditionally make nullable. Defaults to `any`.
 * @returns `TType` if `TBool` is `true`, otherwise `TType | null`.
 */
export type NotNullableIf<
  TBool extends BooleanType = false,
  TType = any,
> = TBool extends true ? TType : TType | null;

/**
 * Conditional type that selects between two types based on a boolean type.
 *
 * @typeParam TBool - A boolean type (`true` or `false`). Defaults to `false`.
 * @typeParam TType1 - The type to use if `TBool` is `true`. Defaults to `any`.
 * @typeParam TType2 - The type to use if `TBool` is `false`. Defaults to `any`.
 * @returns `TType1` if `TBool` is `true`, otherwise `TType2`.
 */
export type If<
  TBool extends BooleanType = false,
  TType1 = any,
  TType2 = any,
> = TBool extends true ? TType1 : TType2;
