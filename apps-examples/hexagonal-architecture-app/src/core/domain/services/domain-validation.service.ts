import { ValidationError } from '../errors/domain.errors';

export class DomainValidationService {
  validateRequired<T>(
    value: T | null | undefined,
    fieldName: string,
    entityName: string,
    customMessage?: string
  ): void {
    if (value === null || value === undefined) {
      throw new ValidationError(
        entityName,
        fieldName,
        value,
        customMessage || `${entityName} must have a ${fieldName}`
      );
    }
  }

  validateStringNotEmpty(
    value: string | null | undefined,
    fieldName: string,
    entityName: string
  ): void {
    this.validateRequired(value, fieldName, entityName);
    if (value!.trim().length === 0) {
      throw new ValidationError(
        entityName,
        fieldName,
        value,
        `${entityName} ${fieldName} cannot be empty`
      );
    }
  }

  validateStringWithLength(
    value: string | null | undefined,
    fieldName: string,
    entityName: string,
    minLength?: number,
    maxLength?: number
  ): void {
    this.validateStringNotEmpty(value, fieldName, entityName);

    if (minLength && value!.trim().length < minLength) {
      throw new ValidationError(
        entityName,
        fieldName,
        value,
        `${entityName} ${fieldName} must have at least ${minLength} characters`
      );
    }

    if (maxLength && value!.trim().length > maxLength) {
      throw new ValidationError(
        entityName,
        fieldName,
        value,
        `${entityName} ${fieldName} cannot exceed ${maxLength} characters`
      );
    }
  }

  validateActiveState(isActive: boolean, operation: string, entityName: string): void {
    if (!isActive) {
      throw new ValidationError(
        entityName,
        'activeState',
        isActive,
        `Cannot ${operation} inactive ${entityName}`
      );
    }
  }

  validateDateRange(startDate: Date, endDate: Date, fieldName: string, entityName: string): void {
    if (startDate >= endDate) {
      throw new ValidationError(
        entityName,
        fieldName,
        `${startDate.toISOString()} - ${endDate.toISOString()}`,
        'Start date must be before end date'
      );
    }
  }

  validatePositiveNumber(value: number, fieldName: string, entityName: string): void {
    if (value <= 0) {
      throw new ValidationError(
        entityName,
        fieldName,
        value,
        `${entityName} ${fieldName} must be positive`
      );
    }
  }

  validateNonNegativeNumber(value: number, fieldName: string, entityName: string): void {
    if (value < 0) {
      throw new ValidationError(
        entityName,
        fieldName,
        value,
        `${entityName} ${fieldName} cannot be negative`
      );
    }
  }

  validateEnum<T>(value: T, validValues: T[], fieldName: string, entityName: string): void {
    if (!validValues.includes(value)) {
      throw new ValidationError(
        entityName,
        fieldName,
        value,
        `${entityName} ${fieldName} must be one of: ${validValues.join(', ')}`
      );
    }
  }

  validateEmail(email: string, fieldName: string, entityName: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError(
        entityName,
        fieldName,
        email,
        `${entityName} ${fieldName} must be a valid email address`
      );
    }
  }

  validateUrl(url: string, fieldName: string, entityName: string): void {
    try {
      new URL(url);
    } catch {
      throw new ValidationError(
        entityName,
        fieldName,
        url,
        `${entityName} ${fieldName} must be a valid URL`
      );
    }
  }

  validateUUID(uuid: string, fieldName: string, entityName: string): void {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(uuid)) {
      throw new ValidationError(
        entityName,
        fieldName,
        uuid,
        `${entityName} ${fieldName} must be a valid UUID`
      );
    }
  }
}
