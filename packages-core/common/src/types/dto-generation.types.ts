/**
 * Type utilities for DTO generation with better TypeScript inference
 */

/**
 * Primitive types that are safe to include in DTOs
 */
export type PrimitiveTypes = string | number | boolean | Date;

/**
 * Check if a type is primitive (flat type safe for DTOs)
 */
export type IsPrimitive<T> = T extends PrimitiveTypes ? true : false;

/**
 * Extract only primitive properties from an entity type
 */
export type PrimitivePropertiesOf<T> = {
  [K in keyof T]: IsPrimitive<T[K]> extends true ? T[K] : never;
};

/**
 * Get only the keys of primitive properties
 */
export type PrimitiveKeysOf<T> = {
  [K in keyof T]: IsPrimitive<T[K]> extends true ? K : never;
}[keyof T];

/**
 * Pick only primitive properties from an entity
 */
export type PickPrimitive<T> = Pick<T, PrimitiveKeysOf<T>>;

/**
 * For array format: Pick only the specified keys that are also primitive
 */
export type PickSelectedKeys<T, K extends keyof T> = Pick<T, K & PrimitiveKeysOf<T>>;

/**
 * For object format: Pick keys based on boolean configuration, but only primitive ones
 */
export type PickByConfig<T, Config extends Partial<Record<keyof T, boolean>>> = Pick<
  T,
  {
    [K in keyof Config]: Config[K] extends true 
      ? K extends PrimitiveKeysOf<T> 
        ? K 
        : never
      : never;
  }[keyof Config]
>;

/**
 * Property inclusion configuration type
 */
export type PropertyInclusionConfig<TEntity> = Partial<Record<keyof TEntity, boolean>>;

/**
 * Infer the correct return type based on the properties/config parameter
 */
export type InferDtoType<
  TEntity,
  TPropertiesOrConfig extends (keyof TEntity)[] | PropertyInclusionConfig<TEntity> | undefined
> = TPropertiesOrConfig extends (keyof TEntity)[]
  ? PickSelectedKeys<TEntity, TPropertiesOrConfig[number]> // Array format
  : TPropertiesOrConfig extends PropertyInclusionConfig<TEntity>
  ? PickByConfig<TEntity, TPropertiesOrConfig> // Object format
  : PickPrimitive<TEntity>; // Default format