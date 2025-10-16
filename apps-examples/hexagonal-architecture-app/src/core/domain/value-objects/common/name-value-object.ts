import { StringValueObject } from '../primitives/string-value-object';
import { ValidationError } from '../../errors/domain.errors';

export class NameValueObject extends StringValueObject {
  constructor(value: string) {
    super(value);
    this.validateName();
  }

  private validateName(): void {
    if (this.trimmedValue.length < 2) {
      throw new ValidationError(
        'NameValueObject',
        'value',
        this.value,
        'Name must have at least 2 characters'
      );
    }
    if (this.trimmedValue.length > 500) {
      throw new ValidationError(
        'NameValueObject',
        'value',
        this.value,
        'Name cannot exceed 500 characters'
      );
    }
  }

  static create(value: string): NameValueObject {
    return new NameValueObject(value);
  }
}
