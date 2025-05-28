import { applyDecorators } from "@nestjs/common";
/**
 * Applies an array of method decorators to a target method.
 *
 * @param decorators - An array of functions that return a `MethodDecorator`.
 * If the array is falsy, no decorators are applied.
 * @returns A composite decorator that applies all provided method decorators.
 */
export function applyMethodDecorators(decorators:(() => MethodDecorator)[])
{
    if(!decorators)
        return applyDecorators();

    return applyDecorators(...(decorators?.map((decorator) => decorator())));
}

/**
 * Applies an array of class decorators to a target class.
 *
 * @param decorators - An array of functions that return a `ClassDecorator`.
 * If the array is falsy, no decorators are applied.
 * @returns A composite decorator that applies all provided class decorators.
 */
export function applyClassDecorators(decorators:(() => ClassDecorator)[])
{
    if(!decorators)
        return applyDecorators();

    return applyDecorators(...(decorators?.map((decorator) => decorator())));
}