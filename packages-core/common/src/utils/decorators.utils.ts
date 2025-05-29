import { applyDecorators } from '@nestjs/common';
/**
 * Applies an array of method decorators to a target method.
 *
 * @param decorators - An array of functions that return a `MethodDecorator`.
 * If the array is falsy, no decorators are applied.
 * @returns A composite decorator that applies all provided method decorators.
 */
export function applyMethodDecorators(decorators: (() => MethodDecorator)[]) {
  if (!decorators) return applyDecorators();

  return applyDecorators(...decorators?.map(decorator => decorator()));
}

/**
 * Conditionally applies an array of method decorators based on a boolean value or a function returning a boolean.
 *
 * @param condition - A boolean or a function returning a boolean that determines whether the decorators should be applied.
 * @param decorators - An array of functions that return method decorators to be applied if the condition is true.
 * @returns The result of applying the decorators if the condition is true; otherwise, returns an empty decorator.
 */
export function applyMethodDecoratorsIf(
  condition: boolean | (() => boolean),
  decorators: (() => MethodDecorator)[],
) {
  condition = typeof condition === 'function' ? condition() : condition;

  if (!condition) return applyDecorators();

  return applyMethodDecorators(decorators);
}

/**
 * Applies an array of class decorators to a target class.
 *
 * @param decorators - An array of functions that return a `ClassDecorator`.
 * If the array is falsy, no decorators are applied.
 * @returns A composite decorator that applies all provided class decorators.
 */
export function applyClassDecorators(decorators: (() => ClassDecorator)[]) {
  if (!decorators) return applyDecorators();

  return applyDecorators(...decorators?.map(decorator => decorator()));
}

/**
 * Conditionally applies an array of class decorators based on a boolean value or a function returning a boolean.
 *
 * @param condition - A boolean or a function returning a boolean that determines whether the decorators should be applied.
 * @param decorators - An array of functions, each returning a `ClassDecorator`, to be applied if the condition is true.
 * @returns The result of applying the decorators if the condition is true; otherwise, returns the result of `applyDecorators()`.
 */
export function applyClassDecoratorsIf(
  condition: boolean | (() => boolean),
  decorators: (() => ClassDecorator)[],
) {
  condition = typeof condition === 'function' ? condition() : condition;

  if (!condition) return applyDecorators();

  return applyClassDecorators(decorators);
}
