import { ValidationError } from '../../errors/domain.errors';

export class DescriptionValueObject {
  constructor(public readonly value?: string) {
    this.validate();
  }

  private validate(): void {
    if (this.value !== undefined && this.value !== null) {
      if (this.value.trim().length === 0) {
        throw new ValidationError(
          'DescriptionValueObject',
          'value',
          this.value,
          'Description cannot be empty string'
        );
      }
    }
  }

  get trimmedValue(): string | undefined {
    return this.value ? this.value.trim() : undefined;
  }

  equals(other: DescriptionValueObject): boolean {
    return this.trimmedValue === other.trimmedValue;
  }

  toString(): string {
    return this.trimmedValue || '';
  }

  static create(value?: string): DescriptionValueObject {
    return new DescriptionValueObject(value);
  }

  static empty(): DescriptionValueObject {
    return new DescriptionValueObject();
  }

  hasValue(): boolean {
    return this.value !== undefined && this.value !== null && this.value.trim().length > 0;
  }
}
