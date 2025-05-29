import {
  ParseIntPipe,
  ParseBoolPipe,
  ParseUUIDPipe,
  Type,
  PipeTransform,
} from '@nestjs/common';
import { Constructor } from '../types';

type PipeTransformType = Type<PipeTransform> | undefined;
type ConstructorOrFunction = Function | Constructor;

const TypePipeMap = new Map<ConstructorOrFunction, PipeTransformType>([
  [Number, ParseIntPipe],
  [BigInt, ParseIntPipe],
  [String, undefined],
  [Boolean, ParseBoolPipe],
]);

/**
 * Retrieves the appropriate `PipeTransform` type for a given constructor or function type.
 *
 * @param type - The constructor or function to get the pipe transform for.
 * @returns The corresponding `PipeTransform` type if found; otherwise, `undefined`.
 *
 * @remarks
 * - Special handling is provided for UUID strings, returning `ParseUUIDPipe` if the type is `String` and matches a UUID type.
 * - Otherwise, the function looks up the type in the `TypePipeMap`.
 */
export function getPipeTransformForType(
  type: ConstructorOrFunction,
): Type<PipeTransform> | undefined {
  // Handle UUID strings
  if (type === String && isUUIDType(type)) {
    return ParseUUIDPipe;
  }

  return TypePipeMap.get(type);
}

function isUUIDType(type: ConstructorOrFunction): boolean {
  // You might want to implement your own logic to detect UUID types
  // For example, checking for decorators or metadata
  return false;
}
