
/**
 * Wraps a function with a custom asynchronous wrapper, allowing additional logic to be executed
 * before or after the original function call.
 *
 * @template T - The type of the function to wrap.
 * @param options - Arbitrary options to be passed to the wrapper.
 * @param fn - The original function to be wrapped.
 * @param wrapper - An asynchronous function that receives the options, a `next` function to invoke the original function,
 *   and the arguments for the original function. It should return a Promise of the original function's return type.
 * @returns A Promise that resolves to a new function. When invoked, this function calls the wrapper with the provided options,
 *   a `next` function to execute the original function, and the arguments.
 */
async function wrap<T extends (...args: any[]) => any>(
    options: any,
    fn: T,
    wrapper: (obj: any, next: (...args: any[]) => Promise<ReturnType<T>>, args: Parameters<T>) => Promise<ReturnType<T>>,
): Promise<(...args: Parameters<T>) => Promise<ReturnType<T>>> {
    return async (...args: Parameters<T>) => {
        return wrapper(options, () => Promise.resolve(fn(...args)), args);
    };
}

/**
 * Method decorator that wraps the target method with a custom asynchronous wrapper function.
 *
 * @param wrapper - An asynchronous function that receives the injectable object, 
 *   a `next` function to invoke the original method, and the method arguments. 
 *   It should return a Promise with the result.
 * @param options - Optional configuration object that will be merged with an `injectable` reference.
 * @returns A method decorator that replaces the original method with the wrapped version.
 *
 * @example
 * ```typescript
 * class ExampleService {
 *   @WrappedBy(async (obj, next, args) => {
 *     // Pre-processing
 *     const result = await next(...args);
 *     // Post-processing
 *     return result;
 *   })
 *   async myMethod(param: string) {
 *     // ...
 *   }
 * }
 * ```
 */
export function WrappedBy(
    wrapper: (obj: any, next: (...args: any[]) => Promise<any>, args: any[]) => Promise<any>,
    options?: any
): MethodDecorator {

    return function (target, propertyKey, descriptor: PropertyDescriptor) {

        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {

            const injectable = this;
            const newOptions = { ...options, injectable }

            const intercepted = await wrap(newOptions, originalMethod.bind(this), wrapper);
            return intercepted(...args);

        };
    };
}
