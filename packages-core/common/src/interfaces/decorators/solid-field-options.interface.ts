export interface SolidFieldOptions {
  // Common options
  description?: string;
  defaultValue?: any;
  transform?: boolean;

  // Adapter control
  skip?: string[];
  adapters?: {
    [adapterName: string]: any;
  };

  // Field characteristics
  required?: boolean;
  nullable?: boolean;
  unique?: boolean;
  index?: boolean;
  isPrimaryKey?: boolean;

  // Validation options
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  url?: boolean;
  uuid?: boolean;
  json?: boolean;
  integer?: boolean;
  float?: boolean;
  positive?: boolean;
  negative?: boolean;
  array?: boolean;
  enum?: object;
  enumName?: string;

  // Database options
  columnType?: string;
  length?: number;
  precision?: number;
  scale?: number;
  generated?: 'uuid' | 'increment' | boolean;

  // Relationship options
  relation?: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';
  target?: () => Function;
  inverseSide?: (object: any) => any;
  cascade?: boolean | ('insert' | 'update' | 'remove' | 'soft-remove' | 'recover')[];
  eager?: boolean;
  lazy?: boolean;

  // Timestamp options
  createdAt?: boolean;
  updatedAt?: boolean;
  deletedAt?: boolean;

  // API options
  example?: any;
  deprecated?: boolean | string;
  hidden?: boolean;
  readOnly?: boolean;
  writeOnly?: boolean;
  responseOnly?: boolean;

  // Special validation flags
  skipValidation?: boolean;

  // Size constraints for arrays
  minSize?: number;
  maxSize?: number;
}