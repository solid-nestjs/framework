/**
 * Generic domain errors that can be reused across all contexts
 * These errors are context-agnostic and provide consistent error types
 */

export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}

export class EntityNotFoundError extends DomainError {
  constructor(entityType: string, identifier: string) {
    super(`${entityType} with identifier '${identifier}' not found`);
    this.name = 'EntityNotFoundError';
  }
}

export class EntityAlreadyExistsError extends DomainError {
  constructor(entityType: string, identifier: string) {
    super(`${entityType} with identifier '${identifier}' already exists`);
    this.name = 'EntityAlreadyExistsError';
  }
}

export class DuplicateValueError extends DomainError {
  constructor(entityType: string, field: string, value: string) {
    super(`${entityType} with ${field} '${value}' already exists`);
    this.name = 'DuplicateValueError';
  }
}

export class ValidationError extends DomainError {
  constructor(entityType: string, field: string, value: any, reason: string) {
    super(
      `Validation error in ${entityType} for field '${field}' with value '${value}': ${reason}`
    );
    this.name = 'ValidationError';
  }
}

export class InvalidOperationError extends DomainError {
  constructor(entityType: string, operation: string, reason: string) {
    super(`Invalid operation '${operation}' on ${entityType}: ${reason}`);
    this.name = 'InvalidOperationError';
  }
}

export class BusinessRuleViolationError extends DomainError {
  constructor(entityType: string, rule: string, reason: string) {
    super(`Business rule violation in ${entityType} - ${rule}: ${reason}`);
    this.name = 'BusinessRuleViolationError';
  }
}

export class AssociationAlreadyExistsError extends DomainError {
  constructor(parentEntity: string, childEntity: string, parentId: string, childId: string) {
    super(
      `Association between ${parentEntity} '${parentId}' and ${childEntity} '${childId}' already exists`
    );
    this.name = 'AssociationAlreadyExistsError';
  }
}

export class AssociationNotFoundError extends DomainError {
  constructor(parentEntity: string, parentId: string) {
    super(`No associations found for ${parentEntity} with id '${parentId}'`);
    this.name = 'AssociationNotFoundError';
  }
}
