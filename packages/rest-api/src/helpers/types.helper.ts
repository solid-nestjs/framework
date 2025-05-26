import { Constructor } from "../types";

export function getTypeName(type: string | Function): string {
    if (typeof type === 'string') {
      return type;
    }
    
    // Handle constructor functions/classes
    if (typeof type === 'function') {
      return type.name;
    }
    
    throw new Error('Type must be a string or a constructor function');
  }

export function getPropertyType(constructor:Constructor, field:string)
{
  return Reflect.getMetadata('design:type', constructor.prototype, field);
}