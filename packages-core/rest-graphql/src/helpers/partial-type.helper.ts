import { Type } from '@nestjs/common';
import { PartialType as GraphQLPartialType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { DECORATORS } from '@nestjs/swagger/dist/constants';
import { ClassDecoratorFactory } from '@nestjs/graphql/dist/interfaces/class-decorator-factory.interface';
import { ModelPropertiesAccessor } from '@nestjs/swagger/dist/services/model-properties-accessor';

const modelPropertiesAccessor = new ModelPropertiesAccessor();

interface PartialTypeOptions {
  decorator?: ClassDecoratorFactory;
  omitDefaultValues?: boolean;
  skipNullProperties?: boolean;
}

export function PartialType<T>(
  classRef: Type<T>,
  optionsOrDecorator?: ClassDecoratorFactory | PartialTypeOptions,
): Type<Partial<T>> {
  const fields = modelPropertiesAccessor.getModelProperties(classRef.prototype);

  const PartialTypeClass = GraphQLPartialType(classRef, optionsOrDecorator);

  fields.forEach(key => {
    const metadata =
      Reflect.getMetadata(
        DECORATORS.API_MODEL_PROPERTIES,
        classRef.prototype,
        key,
      ) || {};

    const decoratorFactory = ApiProperty({
      ...metadata,
      required: false,
    });
    decoratorFactory(PartialTypeClass.prototype, key);
  });

  return PartialTypeClass;
}
