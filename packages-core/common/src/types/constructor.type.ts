export type Constructor = new (...args: any[]) => any;

/**
 * Represents a type that can be constructed with the `new` keyword.
 *
 * @typeParam Type - The type of the instance that will be created. Defaults to `object`.
 *
 * @example
 * ```typescript
 * class MyClass {}
 * const ctor: Constructable<MyClass> = MyClass;
 * const instance = new ctor();
 * ```
 */
export type Constructable<Type = object> = new (...args: any[]) => Type;
