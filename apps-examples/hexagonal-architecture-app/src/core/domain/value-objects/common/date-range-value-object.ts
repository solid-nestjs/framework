import { ValidationError } from '../../errors/domain.errors';

export class DateRangeValueObject {
  constructor(
    public readonly startDate: Date,
    public readonly endDate: Date
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.startDate) {
      throw new ValidationError(
        'DateRangeValueObject',
        'startDate',
        this.startDate,
        'Start date cannot be null or undefined'
      );
    }

    if (!this.endDate) {
      throw new ValidationError(
        'DateRangeValueObject',
        'endDate',
        this.endDate,
        'End date cannot be null or undefined'
      );
    }

    if (this.startDate >= this.endDate) {
      throw new ValidationError(
        'DateRangeValueObject',
        'dateRange',
        `${this.startDate.toISOString()} - ${this.endDate.toISOString()}`,
        'Start date must be before end date'
      );
    }
  }

  static create(startDate: Date, endDate: Date): DateRangeValueObject {
    return new DateRangeValueObject(startDate, endDate);
  }

  equals(other: DateRangeValueObject): boolean {
    return (
      this.startDate.getTime() === other.startDate.getTime() &&
      this.endDate.getTime() === other.endDate.getTime()
    );
  }

  contains(date: Date): boolean {
    return date >= this.startDate && date <= this.endDate;
  }

  getDurationInDays(): number {
    const diffTime = this.endDate.getTime() - this.startDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  toString(): string {
    return `${this.startDate.toISOString()} - ${this.endDate.toISOString()}`;
  }

  toObject(): { startDate: Date; endDate: Date } {
    return {
      startDate: this.startDate,
      endDate: this.endDate,
    };
  }

  withStartDate(newStartDate: Date): DateRangeValueObject {
    return new DateRangeValueObject(newStartDate, this.endDate);
  }

  withEndDate(newEndDate: Date): DateRangeValueObject {
    return new DateRangeValueObject(this.startDate, newEndDate);
  }
}
