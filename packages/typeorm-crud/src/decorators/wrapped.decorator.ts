async function wrap<T extends (...args: any[]) => any>(
    options:any,
    fn: T,
    wrapper: (obj:any, next: (...args:any[]) => Promise<ReturnType<T>>, args: Parameters<T>) => Promise<ReturnType<T>>,
): Promise<(...args: Parameters<T>) => Promise<ReturnType<T>>> {
return async (...args: Parameters<T>) => {
    return wrapper(options,() => Promise.resolve(fn(...args)), args);
};
}

export function Wrapped(
    wrapper: (obj:any, next: (...args:any[]) => Promise<any>, args: any[]) => Promise<any>,
    options?:any
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
