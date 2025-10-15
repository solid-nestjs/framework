import { ValidationError } from '../../../domain/errors/domain.errors';

export class IdValueObject {
  constructor(public readonly value: string) {
    this.validate();
  }

  private validate(): void {
    if (!this.value || this.value.trim().length === 0) {
      throw new ValidationError('IdValueObject', 'value', this.value, 'ID cannot be empty');
    }
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(this.value)) {
      throw new ValidationError('IdValueObject', 'value', this.value, 'Invalid UUID format');
    }
  }

  equals(other: IdValueObject): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  static create(value: string): IdValueObject {
    return new IdValueObject(value);
  }
}
