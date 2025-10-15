import { ValidationError } from '../../errors/domain.errors';

export class StringValueObject {
  constructor(public readonly value: string) {
    this.validate();
  }

  private validate(): void {
    if (!this.value || this.value.trim().length === 0) {
      throw new ValidationError('StringValueObject', 'value', this.value, 'String cannot be empty');
    }
  }

  get trimmedValue(): string {
    return this.value.trim();
  }

  static create(value: string): StringValueObject {
    return new StringValueObject(value);
  }

  equals(other: StringValueObject): boolean {
    return this.trimmedValue === other.trimmedValue;
  }

  toString(): string {
    return this.trimmedValue;
  }
}
