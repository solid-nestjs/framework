import { SolidFieldOptions } from '../decorators/solid-field-options.interface';

export interface FieldMetadata {
  target: Function;
  propertyKey: string | symbol;
  type: any;
  options: SolidFieldOptions;
  isOptional: boolean;
  adapterOptions?: any;
}

export interface EntityMetadata {
  target: Function;
  options: SolidEntityOptions;
  type: 'entity' | 'input';
}

export interface SolidEntityOptions {
  name?: string;
  description?: string;
  tableName?: string;
  schema?: string;
  skip?: string[];
  adapters?: Record<string, any>;
}

export interface SolidInputOptions {
  name?: string;
  description?: string;
  skip?: string[];
  defaultSkip?: string[];
}