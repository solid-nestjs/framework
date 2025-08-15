import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, registerDecorator, ValidationOptions } from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsFlexibleUUIDConstraint implements ValidatorConstraintInterface {
  validate(uuid: string, args: ValidationArguments) {
    if (typeof uuid !== 'string') {
      return false;
    }
    
    // Accept standard UUID format and SQL Server GUID format
    const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i;
    return uuidRegex.test(uuid);
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be a valid UUID`;
  }
}

export function IsFlexibleUUID(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsFlexibleUUIDConstraint,
    });
  };
}