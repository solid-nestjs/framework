import { FieldMetadata, EntityMetadata } from '../metadata/field-metadata.interface';

export interface DecoratorAdapter {
  name: string;
  apply(target: any, propertyKey: string | symbol, metadata: FieldMetadata): void;
  applyClassDecorator?(target: Function, type: 'entity' | 'input', options: any): void;
  isAvailable(): boolean;
}