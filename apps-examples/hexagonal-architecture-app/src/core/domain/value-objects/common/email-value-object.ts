import { ValidationError } from '../../errors/domain.errors';

export class EmailValueObject {
  constructor(public readonly value: string) {
    this.validate();
  }

  private validate(): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.value)) {
      throw new ValidationError('EmailValueObject', 'value', this.value, 'Invalid email format');
    }
  }

  static create(value: string): EmailValueObject {
    return new EmailValueObject(value.toLowerCase().trim());
  }

  get domain(): string {
    return this.value.split('@')[1];
  }

  get username(): string {
    return this.value.split('@')[0];
  }

  equals(other: EmailValueObject): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
