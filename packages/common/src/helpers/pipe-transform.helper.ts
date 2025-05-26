import { ParseIntPipe, ParseBoolPipe, ParseUUIDPipe, Type, PipeTransform } from '@nestjs/common';
import { Constructor } from '../types';

type PipeTransformType = Type<PipeTransform> | undefined;
type ConstructorOrFunction = Function | Constructor;

const TypePipeMap = new Map<ConstructorOrFunction, PipeTransformType>([
    [Number, ParseIntPipe],
    [BigInt, ParseIntPipe],
    [String, undefined],
    [Boolean, ParseBoolPipe],
]);

export function getPipeTransformForType(type: ConstructorOrFunction): Type<PipeTransform> | undefined {
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