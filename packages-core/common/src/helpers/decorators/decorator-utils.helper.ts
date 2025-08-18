import { Type } from '@nestjs/common';

/**
 * Applies a decorator to a class property.
 * This is a utility function for applying decorators dynamically.
 * 
 * @param decorator - The decorator function to apply
 * @param targetClass - The class containing the property
 * @param propertyName - The name of the property to decorate
 * 
 * @example
 * ```typescript
 * import { IsOptional } from 'class-validator';
 * 
 * applyDecoratorToProperty(
 *   IsOptional(),
 *   MyClass,
 *   'name'
 * );
 * ```
 */
export function applyDecoratorToProperty(
  decorator: PropertyDecorator,
  targetClass: Type<any>,
  propertyName: string
): void {
  decorator(targetClass.prototype, propertyName);
}

/**
 * Applies multiple decorators to a class property.
 * 
 * @param decorators - Array of decorators to apply
 * @param targetClass - The class containing the property
 * @param propertyName - The name of the property to decorate
 * 
 * @example
 * ```typescript
 * import { IsOptional, IsString } from 'class-validator';
 * 
 * applyDecoratorsToProperty(
 *   [IsOptional(), IsString()],
 *   MyClass,
 *   'name'
 * );
 * ```
 */
export function applyDecoratorsToProperty(
  decorators: PropertyDecorator[],
  targetClass: Type<any>,
  propertyName: string
): void {
  for (const decorator of decorators) {
    applyDecoratorToProperty(decorator, targetClass, propertyName);
  }
}

/**
 * Applies a decorator to a class.
 * 
 * @param decorator - The class decorator to apply
 * @param targetClass - The class to decorate
 * 
 * @example
 * ```typescript
 * import { Injectable } from '@nestjs/common';
 * 
 * applyDecoratorToClass(
 *   Injectable(),
 *   MyClass
 * );
 * ```
 */
export function applyDecoratorToClass(
  decorator: ClassDecorator,
  targetClass: Type<any>
): void {
  decorator(targetClass);
}

/**
 * Applies multiple decorators to a class.
 * 
 * @param decorators - Array of class decorators to apply
 * @param targetClass - The class to decorate
 * 
 * @example
 * ```typescript
 * import { Injectable, Controller } from '@nestjs/common';
 * 
 * applyDecoratorsToClass(
 *   [Injectable(), Controller()],
 *   MyClass
 * );
 * ```
 */
export function applyDecoratorsToClass(
  decorators: ClassDecorator[],
  targetClass: Type<any>
): void {
  for (const decorator of decorators) {
    applyDecoratorToClass(decorator, targetClass);
  }
}

